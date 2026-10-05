/**
 * GitHub Service
 *
 * HTTP wrapper for all /api/github/* and /api/aip/git-configs endpoints.
 * Mirrors the structure of PipelineAgentService:
 *   - same buildHeaders / buildAxiosConfig pattern
 *   - adds X-GitHub-Token to every request via buildGitHubConfig()
 *   - same ServiceError / requestWithRetry pattern
 *
 * Supports: verify-token, repos, branches, pull, push, create-branch,
 *           create-pull-request, pull-request-status, git-configs CRUD
 */

import * as vscode from 'vscode';
import axios, { AxiosRequestConfig } from 'axios';
import * as http from 'http';
import * as https from 'https';
import { getBaseUrl, getApiEndpoints, getHTTPSAgent } from '../constants/api-config';
import { STORAGE_KEYS } from '../constants/extension-constants';
import { configureSSLEnvironment } from '../utils/ssl-config.util';
import { GITHUB_HEADERS } from '../constants/github-constants';
import { GitHubAuthService } from '../auth/services/github-auth.service';
import { KeycloakAuthService } from '../auth/services/keycloak-auth.service';
import { ProjectInfo, RoleInfo } from '../interfaces/pipeline-agent.interface';
import * as ExtensionUtils from '../utils/extension-utils';
import {
  GitHubRepository,
  GitHubInfoDTO,
  PushRequest,
  CreateBranchRequest,
  CreateBranchResponse,
  CreatePullRequestRequest,
  CreatePullRequestResponse,
  SessionBranchPrStatusResponse,
} from '../interfaces/github.interfaces';

const logger = ExtensionUtils.createLogger('GitHubService');

class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class GitHubService implements vscode.Disposable {
  private context: vscode.ExtensionContext;
  private authService?: KeycloakAuthService;
  private githubAuth: GitHubAuthService;
  private _token: string = '';
  private _project: ProjectInfo | undefined;
  private _role: RoleInfo | undefined;
  private organization: string = '';

  private static httpAgent = new http.Agent({ keepAlive: true, keepAliveMsecs: 30000, maxSockets: 20 });
  private static httpsAgent = new https.Agent({ keepAlive: true, keepAliveMsecs: 30000, maxSockets: 20 });

  private get API() { return getApiEndpoints(); }

  constructor(
    context: vscode.ExtensionContext,
    githubAuth: GitHubAuthService,
    authService?: KeycloakAuthService
  ) {
    this.context = context;
    this.githubAuth = githubAuth;
    this.authService = authService;
    this.refreshAuthData();
    configureSSLEnvironment(this.context);
  }

  refreshAuthData(): void {
    const state = this.context.globalState;
    this._token      = state.get<string>(STORAGE_KEYS.ACCESS_TOKEN) || '';
    this._project    = state.get<any>(STORAGE_KEYS.PROJECT);
    this._role       = state.get<any>(STORAGE_KEYS.ROLE);
    this.organization = state.get<string>(STORAGE_KEYS.ORGANIZATION) || '';
  }

  // ─── HTTP helpers ──────────────────────────────────────────────────────────

  private async buildHeaders(overrides: Record<string, string> = {}): Promise<Record<string, string>> {
    this.refreshAuthData();
    const projectId   = (this._project as any)?.id ?? (this._project as any)?.projectId ?? '';
    const projectName = (this._project as any)?.name ?? (this._project as any)?.projectname ?? this.organization ?? '';
    const roleId      = (this._role as any)?.id?.toString() ?? '';
    const roleName    = (this._role as any)?.name ?? '';

    return {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      priority: 'u=1, i',
      project: String(projectId || ''),
      projectname: String(projectName || ''),
      referer: `${getBaseUrl()}/`,
      roleid: String(roleId || ''),
      rolename: String(roleName || ''),
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'x-requested-with': 'Leap',
      ...(this._token ? { 'access-token': this._token, authorization: `Bearer ${this._token}` } : {}),
      ...overrides,
    };
  }

  private async buildAxiosConfig(
    params: Record<string, unknown> = {},
    overrides: Partial<AxiosRequestConfig> = {},
    signal?: AbortSignal
  ): Promise<AxiosRequestConfig> {
    configureSSLEnvironment(this.context);
    const headers = await this.buildHeaders((overrides.headers as Record<string, string>) || {});

    const cfg: AxiosRequestConfig = {
      timeout: 60000,
      httpsAgent: getHTTPSAgent(this.context),
      httpAgent: GitHubService.httpAgent,
      headers,
      params: { ...params, ...(overrides.params || {}) },
      maxRedirects: 5,
      validateStatus: (s) => s >= 200 && s < 300,
      ...overrides,
    };

    if (signal) {
      cfg.cancelToken = new axios.CancelToken((cancel) => {
        signal.addEventListener('abort', () => cancel('Request aborted'));
      });
    }

    return cfg;
  }

  /**
   * Extends buildAxiosConfig with the X-GitHub-Token header.
   * The token is never logged here.
   */
  private async buildGitHubConfig(
    params: Record<string, unknown> = {},
    overrides: Partial<AxiosRequestConfig> = {},
    signal?: AbortSignal
  ): Promise<AxiosRequestConfig> {
    const cfg = await this.buildAxiosConfig(params, overrides, signal);
    const token = await this.githubAuth.getToken(false);
    if (token) {
      (cfg.headers as Record<string, string>)[GITHUB_HEADERS.GITHUB_TOKEN] = token;
    }
    return cfg;
  }

  private async requestWithRetry<T>(
    fn: () => Promise<T>,
    retries = 2,
    delay = 500
  ): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastErr = err;
        const status = err?.response?.status;
        // Don't retry 4xx (client errors) except 429 (rate limit) or 408 (timeout)
        if (status && status >= 400 && status < 500 && status !== 429 && status !== 408) {
          break;
        }
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
        }
      }
    }
    throw lastErr;
  }

  private mapAxiosError(err: any, context: string): ServiceError {
    const status = err?.response?.status;
    const data   = err?.response?.data;
    const msg    = data?.message || data?.error || err?.message || 'Unknown error';
    logger.error(`${context} failed [${status}]:`, msg);
    return new ServiceError(`${context}: ${msg}`, 'GITHUB_API_ERROR', status, data);
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────

  /**
   * Verifies the current GitHub token against the backend.
   * POST /api/github/verify-token
   */
  async verifyToken(signal?: AbortSignal): Promise<boolean> {
    try {
      const cfg = await this.buildGitHubConfig({}, {}, signal);
      const res = await this.requestWithRetry(() =>
        axios.post(this.API.GITHUB_VERIFY_TOKEN, {}, cfg)
      );
      return res.status === 200;
    } catch (err) {
      logger.info('Token verification failed:', (err as any)?.response?.status);
      return false;
    }
  }

  // ─── Repositories & Branches ───────────────────────────────────────────────

  /**
   * Lists repositories accessible to the authenticated user.
   * GET /api/github/repos
   */
  async getRepositories(signal?: AbortSignal): Promise<GitHubRepository[]> {
    try {
      const cfg = await this.buildGitHubConfig({}, {}, signal);
      const res = await this.requestWithRetry(() => axios.get(this.API.GITHUB_REPOS, cfg));
      return (res.data as GitHubRepository[]) || [];
    } catch (err) {
      throw this.mapAxiosError(err, 'getRepositories');
    }
  }

  /**
   * Lists branches for a repository.
   * GET /api/github/branches?repo={repoName}
   */
  async getBranches(repoName: string, signal?: AbortSignal): Promise<string[]> {
    try {
      const cfg = await this.buildGitHubConfig({ repo: repoName }, {}, signal);
      const res = await this.requestWithRetry(() => axios.get(this.API.GITHUB_BRANCHES, cfg));
      const data = res.data;
      if (Array.isArray(data)) { return data as string[]; }
      if (Array.isArray(data?.branches)) { return data.branches as string[]; }
      return [];
    } catch (err) {
      throw this.mapAxiosError(err, 'getBranches');
    }
  }

  // ─── Pull (clone from GitHub) ──────────────────────────────────────────────

  /**
   * Pulls files from a GitHub repository branch.
   * POST /api/github/pull
   */
  async pull(
    repoUrl: string,
    branch: string,
    signal?: AbortSignal
  ): Promise<any> {
    try {
      const cfg = await this.buildGitHubConfig({}, {}, signal);
      const res = await this.requestWithRetry(() =>
        axios.post(this.API.GITHUB_PULL, { repoUrl, branch }, cfg)
      );
      return res.data;
    } catch (err) {
      throw this.mapAxiosError(err, 'pull');
    }
  }

  // ─── Push ─────────────────────────────────────────────────────────────────

  /**
   * Pushes files to a GitHub branch.
   * POST /api/github/push  (returns plain text — parse SHA with git-utils)
   */
  async push(request: PushRequest, signal?: AbortSignal): Promise<string> {
    try {
      const cfg = await this.buildGitHubConfig({}, { responseType: 'text' }, signal);
      const res = await this.requestWithRetry(() =>
        axios.post(this.API.GITHUB_PUSH, request, cfg)
      );
      return String(res.data || '');
    } catch (err) {
      throw this.mapAxiosError(err, 'push');
    }
  }

  // ─── Branch management ────────────────────────────────────────────────────

  /**
   * Creates a branch (idempotent — returns alreadyExisted:true if branch exists).
   * POST /api/github/create-branch
   */
  async createBranch(
    request: CreateBranchRequest,
    signal?: AbortSignal
  ): Promise<CreateBranchResponse> {
    try {
      const cfg = await this.buildGitHubConfig({}, {}, signal);
      const res = await this.requestWithRetry(() =>
        axios.post(this.API.GITHUB_CREATE_BRANCH, request, cfg)
      );
      return res.data as CreateBranchResponse;
    } catch (err) {
      throw this.mapAxiosError(err, 'createBranch');
    }
  }

  // ─── Pull Requests ────────────────────────────────────────────────────────

  /**
   * Creates a pull request.
   * POST /api/github/create-pull-request
   */
  async createPullRequest(
    request: CreatePullRequestRequest,
    signal?: AbortSignal
  ): Promise<CreatePullRequestResponse> {
    try {
      const cfg = await this.buildGitHubConfig({}, {}, signal);
      const res = await this.requestWithRetry(() =>
        axios.post(this.API.GITHUB_CREATE_PR, request, cfg)
      );
      return res.data as CreatePullRequestResponse;
    } catch (err) {
      throw this.mapAxiosError(err, 'createPullRequest');
    }
  }

  /**
   * Gets the current PR status for a session branch.
   * GET /api/github/pull-request-status
   */
  async getPullRequestStatus(
    repo: string,
    sourceBranch: string,
    targetBranch: string,
    signal?: AbortSignal
  ): Promise<SessionBranchPrStatusResponse> {
    try {
      const cfg = await this.buildGitHubConfig(
        { repo, sourceBranch, targetBranch },
        {},
        signal
      );
      const res = await this.requestWithRetry(() =>
        axios.get(this.API.GITHUB_PR_STATUS, cfg)
      );
      return res.data as SessionBranchPrStatusResponse;
    } catch (err) {
      // Return "none" on error so the session is not blocked
      logger.warn('getPullRequestStatus error (returning none):', (err as any)?.message);
      return { prStatus: 'none', pullRequestNumber: null };
    }
  }

  // ─── Git Configs ──────────────────────────────────────────────────────────

  /**
   * Retrieves the git config for an agent (cname + org).
   * GET /api/aip/git-configs?cname={cname}&org={org}
   */
  async getGitConfig(
    cname: string,
    org: string,
    signal?: AbortSignal
  ): Promise<GitHubInfoDTO | null> {
    try {
      const cfg = await this.buildAxiosConfig({ cname, org }, {}, signal);
      const res = await this.requestWithRetry(() =>
        axios.get(this.API.GIT_CONFIGS, cfg)
      );
      return (res.data as GitHubInfoDTO) || null;
    } catch (err: any) {
      if (err?.response?.status === 404) { return null; }
      logger.warn('getGitConfig error (returning null):', err?.message);
      return null;
    }
  }

  /**
   * Saves (upserts) the git config for an agent.
   * POST /api/aip/git-configs/save
   */
  async saveGitConfig(
    config: GitHubInfoDTO,
    signal?: AbortSignal
  ): Promise<GitHubInfoDTO> {
    try {
      const cfg = await this.buildAxiosConfig({}, {}, signal);
      const res = await this.requestWithRetry(() =>
        axios.post(this.API.GIT_CONFIGS_SAVE, config, cfg)
      );
      return res.data as GitHubInfoDTO;
    } catch (err) {
      throw this.mapAxiosError(err, 'saveGitConfig');
    }
  }

  dispose(): void {}
}
