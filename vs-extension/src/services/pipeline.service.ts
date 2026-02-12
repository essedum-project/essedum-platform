/**
 * Pipeline Service (VS Code Extension)
 *
 * Centralized, robust client for pipeline-related API operations.
 * - Stronger typing (non-breaking public signatures)
 * - Structured error handling
 * - Optional retries with backoff
 * - AbortSignal cancellation support
 * - Safer logging and DRY SSL setup
 */

import * as vscode from 'vscode';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpParams, ProjectInfo, RoleInfo } from '../interfaces/pipeline.interfaces';
import { getBaseUrl, getHTTPSAgent, getApiEndpoints } from '../constants/api-config';
import { STORAGE_KEYS } from '../constants/extension-constants';
import { configureSSLEnvironment, shouldBypassSSL } from '../utils/ssl-config.util';
import * as ExtensionUtils from '../utils/extension-utils';
import { KeycloakAuthService } from '../auth/services/keycloak-auth.service';

const logger = ExtensionUtils.createLogger('PipelineService');

/** Normalized service error */
export class ServiceError extends Error {
  public code?: string;
  public status?: number;
  public details?: unknown;

  constructor(message: string, opts?: { code?: string; status?: number; details?: unknown }) {
    super(message);
    this.name = 'ServiceError';
    this.code = opts?.code;
    this.status = opts?.status;
    this.details = opts?.details;
  }
}

/** Retry options */
type RetryOptions = {
  retries: number;              // total retry attempts
  baseDelayMs: number;          // exponential backoff base delay
  retryOnStatuses?: number[];   // defaults to [502, 503, 504]
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class PipelineService {
  private context: vscode.ExtensionContext;
  private authService?: KeycloakAuthService;
  private _token = '';
  private _project?: ProjectInfo;
  private _role?: RoleInfo;
  private organization = '';
  private debug = false;

  private get API() {
    return getApiEndpoints();
  }

  constructor(context: vscode.ExtensionContext, authService?: KeycloakAuthService) {
    this.context = context;
    this.authService = authService;
    this.refreshAuthData();

    // Initial SSL environment configuration (network-aware)
    configureSSLEnvironment(this.context);

    // Enable debug logging via user/workspace setting
    const cfg = vscode.workspace.getConfiguration('pipeline');
    this.debug = cfg.get<boolean>('debug', false);
  }

  /**
   * Refresh authentication data from VS Code storage.
   * Call this after login or whenever auth state changes.
   */
  refreshAuthData(): void {
    const state = this.context.globalState;

    this._token = state.get<string>(STORAGE_KEYS.ACCESS_TOKEN) || '';
    this._project = state.get<ProjectInfo>(STORAGE_KEYS.PROJECT);
    this._role = state.get<RoleInfo>(STORAGE_KEYS.ROLE);
    this.organization =
      state.get<string>(STORAGE_KEYS.ORGANIZATION) ||
      (typeof this._project === 'object'
        ? (this._project?.name || this._project?.projectname || '')
        : '');

    if (this.debug) {
      logger.info('[PipelineService] Auth refreshed:', {
        tokenPresent: !!this._token,
        projectId: this._project?.id ?? this._project?.projectId,
        projectName: this._project?.name ?? this._project?.projectname,
        roleId: this._role?.id ?? this._role?.roleId,
        roleName: this._role?.name ?? this._role?.rolename,
        organization: this.organization,
      });
    }
  }

  /**
   * Build request headers (sanitized for logging).
   */
  private async buildHeaders(overrides: Record<string, string> = {}): Promise<Record<string, string>> {
    // Ensure fresh token before building headers
    if (this.authService) {
      try {
        this._token = await this.authService.ensureFreshToken();
      } catch (error) {
        logger.warn('Failed to ensure fresh token:', error);
        // Fall back to stored token
      }
    }
    
    // Always refresh auth data before building headers to get latest project/role info
    const state = this.context.globalState;
    this._token = state.get<string>(STORAGE_KEYS.ACCESS_TOKEN) || this._token;
    this._project = state.get<ProjectInfo>(STORAGE_KEYS.PROJECT) || this._project;
    this._role = state.get<RoleInfo>(STORAGE_KEYS.ROLE) || this._role;
    const storedOrg = state.get<string>(STORAGE_KEYS.ORGANIZATION);
    if (storedOrg) {
      this.organization = storedOrg;
    } else if (typeof this._project === 'object') {
      this.organization = this._project?.name || this._project?.projectname || this.organization;
    }

    const projectId = this._project?.id ?? this._project?.projectId ?? '';
    const projectName = this._project?.name ?? this._project?.projectname ?? this.organization ?? '';
    const roleId = this._role?.id?.toString() ?? this._role?.roleId?.toString() ?? '';
    const roleName = this._role?.name ?? this._role?.rolename ?? '';

    const headers: Record<string, string> = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      priority: 'u=1, i',
      project: String(projectId || ''),
      projectname: String(projectName || ''),
      referer: `${getBaseUrl()}/`,
      roleid: String(roleId || ''),
      rolename: String(roleName || ''),
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
      'x-requested-with': 'Leap',
      ...(this._token ? {
        'access-token': this._token,
        authorization: `Bearer ${this._token}`
      } : {}),
      ...overrides,
    };

    if (this.debug) {
      logger.info('[PipelineService] Headers prepared:', {
        project: headers.project,
        projectname: headers.projectname,
        roleid: headers.roleid,
        rolename: headers.rolename,
        hasAuth: !!headers.authorization,
        referer: headers.referer,
      });
    }

    return headers;
  }

  /**
   * Build Axios config (centralized SSL & params).
   * Supports AbortSignal for cancellation.
   */
  private async buildAxiosConfig(
    params?: HttpParams,
    overrides: Partial<AxiosRequestConfig> = {},
    signal?: AbortSignal
  ): Promise<AxiosRequestConfig> {
    // Keep SSL configured per current network
    configureSSLEnvironment(this.context);

    const requestParams: Record<string, unknown> = params ? { ...params } : {};

    const baseHeaders = await this.buildHeaders();
    const overrideHeaders = overrides.headers as Record<string, string> | undefined;

    // Properly merge headers instead of replacing them
    const mergedHeaders = overrideHeaders
      ? { ...baseHeaders, ...overrideHeaders }
      : baseHeaders;

    // Properly merge params - if override params exist, use them (allows empty object to override)
    // Otherwise add project to base params
    const overrideParams = overrides.params as Record<string, unknown> | undefined;
    let mergedParams: Record<string, unknown>;

    if (overrideParams !== undefined) {
      // Override params explicitly provided - merge base with override (override wins)
      mergedParams = { ...requestParams, ...overrideParams };
    } else {
      // No override params - auto-add project to base params
      if (!requestParams.project) {
        requestParams.project = this.organization;
      }
      mergedParams = requestParams;
    }

    const base: AxiosRequestConfig = {
      httpsAgent: getHTTPSAgent(this.context),
      timeout: 30000,
      headers: mergedHeaders,
      params: mergedParams,
      withCredentials: true,
      signal,
    };

    // Spread overrides but exclude headers and params since we already merged them
    const { headers: _h, params: _p, ...restOverrides } = overrides;
    const config = { ...base, ...restOverrides };

    if (this.debug) {
      logger.info('[PipelineService] Axios config:', {
        timeout: config.timeout,
        hasHttpsAgent: !!config.httpsAgent,
        params: config.params,
        headers: Object.keys((config.headers ?? {}) as Record<string, string>),
      });
    }

    return config;
  }

  /**
   * Internal helper to perform requests with retry/backoff.
   */
  private async requestWithRetry<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    config: AxiosRequestConfig,
    body?: unknown,
    retryOpts: RetryOptions = { retries: 2, baseDelayMs: 400, retryOnStatuses: [502, 503, 504] }
  ): Promise<AxiosResponse<T>> {
    let attempt = 0;
    const { retries, baseDelayMs, retryOnStatuses } = retryOpts;

    while (true) {
      try {
        if (method === 'get' || method === 'delete') {
          return await axios[method]<T>(url, config);
        }
        return await axios[method]<T>(url, body, config);
      } catch (err: any) {
        const status = err?.response?.status as number | undefined;
        const code = err?.code as string | undefined;

        const isNetworkError =
          !status && (code === 'ECONNABORTED' || code === 'ENOTFOUND' || code === 'ECONNRESET');

        const shouldRetry =
          attempt < retries &&
          // eslint-disable-next-line eqeqeq
          (isNetworkError || (status != null && retryOnStatuses?.includes(status)));

        if (!shouldRetry) {
          if (this.debug) {
            console.error('[PipelineService] Request failed:', { url, method, status, code, message: err?.message });
          }
          throw new ServiceError(err?.message ?? 'Request failed', {
            code,
            status,
            details: err?.response?.data ?? err,
          });
        }

        attempt++;
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        if (this.debug) {
          console.warn(`[PipelineService] Retry #${attempt} in ${delay}ms`, { url, method, status, code });
        }
        await sleep(delay);
      }
    }
  }

  /** ---------- Public API Methods (non-breaking signatures) ---------- */

  async getPipelinesCount(params: HttpParams, signal?: AbortSignal): Promise<number> {
    this.refreshAuthData();

    if (this.debug) {
      logger.info('[PipelineService] getPipelinesCount', {
        sslBypass: shouldBypassSSL(this.context) ? 'DISABLED (Infosys)' : 'ENABLED (LFN)',
        endpoint: this.API.PIPELINES_COUNT,
        params,
        tokenPresent: !!this._token,
      });
    }

    const config = await this.buildAxiosConfig(params, {}, signal);
    const resp = await this.requestWithRetry<number>('get', this.API.PIPELINES_COUNT, config);
    const value = typeof resp.data === 'number' ? resp.data : (resp.data as any)?.count ?? 0;
    return value;
  }

  async getPipelinesCards(params: HttpParams, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const resp = await this.requestWithRetry<any>('get', this.API.PIPELINES_LIST, await this.buildAxiosConfig(params, {}, signal));
    return resp.data;
  }

  async getStreamingService(pipelineName: string, signal?: AbortSignal): Promise<AxiosResponse<any>> {
    this.refreshAuthData();

    const safeName = encodeURIComponent(pipelineName);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.STREAMING_SERVICES}/${safeName}/${safeOrg}`;

    return this.requestWithRetry<any>('get', url, await this.buildAxiosConfig(undefined, {}, signal));
  }

  async getStreamingServicesByName(name: string, org?: string, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const organization = org || this.organization;
    const safeName = encodeURIComponent(name);
    const safeOrg = encodeURIComponent(organization);
    const url = `${this.API.STREAMING_SERVICES}/${safeName}/${safeOrg}`;

    return this.requestWithRetry<any>('get', url, await this.buildAxiosConfig(undefined, {}, signal));
  }

  async updateStreamingService(payload: any, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const config = await this.buildAxiosConfig(undefined, {
      validateStatus: (status) => status >= 200 && status < 300,
    }, signal);

    return this.requestWithRetry<any>('put', this.API.STREAMING_SERVICES_UPDATE, config, payload);
  }

  async getPipelineByName(pipelineName: string, signal?: AbortSignal): Promise<AxiosResponse<any>> {
    this.refreshAuthData();

    const url = this.API.PIPELINES_BY_NAME;
    const config = await this.buildAxiosConfig(
      undefined,
      { params: { name: pipelineName, org: this.organization } },
      signal
    );

    return this.requestWithRetry<any>('get', url, config);
  }

  async readPipelineFile(pipelineName: string, fileName: string, signal?: AbortSignal): Promise<AxiosResponse<any>> {
    this.refreshAuthData();

    const safePipeline = encodeURIComponent(pipelineName);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.FILE_READ}/${safePipeline}/${safeOrg}`;

    const config = await this.buildAxiosConfig(
      undefined,
      { params: { file: fileName }, responseType: 'arraybuffer' },
      signal
    );

    return this.requestWithRetry<any>('get', url, config);
  }

  async uploadScript(pipelineName: string, fileName: string, formData: any, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const safePipeline = encodeURIComponent(pipelineName);
    const safeOrg = encodeURIComponent(this.organization);
    const safeFile = encodeURIComponent(fileName);
    const url = `${this.API.FILE_CREATE}/${safePipeline}/${safeOrg}/Python3?file=${safeFile}`;

    // Don't set content-type at all - let axios handle it for FormData with proper boundary
    const headersOverride: Record<string, string> = {
      'content-type': ''  // Empty string to remove default application/json
    };

    // Explicitly set params to empty object in overrides to prevent auto-adding project
    // (file parameter is already in URL, and project is in headers)
    const config = await this.buildAxiosConfig(
      undefined,
      {
        headers: headersOverride,
        params: {},  // Override params to be empty - no query parameters needed
        timeout: 30000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
      signal
    );

    // Remove the empty content-type header so axios can set the proper multipart/form-data boundary
    if (config.headers && 'content-type' in config.headers) {
      delete (config.headers as any)['content-type'];
    }

    return this.requestWithRetry<any>('post', url, config, formData);
  }

  async getJobRunTypes(signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const url = `${this.API.JOB_RUNTIME_TYPES}/${encodeURIComponent(this.organization)}`;
    return this.requestWithRetry<any>('get', url, await this.buildAxiosConfig(undefined, {}, signal));
  }

  async getAlternativeRunTypes(signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    return this.requestWithRetry<any>('get', this.API.DATASOURCES_RUNTIME, await this.buildAxiosConfig(undefined, {}, signal));
  }

  async getDatasourceByName(name: string, org?: string, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const organization = org || this.organization;

    return this.requestWithRetry<any>(
      'get',
      this.API.FETCH_DATASOURCE,
      await this.buildAxiosConfig(undefined, { params: { name, org: organization }, timeout: 30000 }, signal)
    );
  }

  async runNativeScriptPipeline(pipelineName: string, runtime: string, requestBody: any, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const safePipeline = encodeURIComponent(pipelineName);
    const safeOrg = encodeURIComponent(this.organization);
    const safeRuntime = encodeURIComponent(runtime);

    const url = `${this.API.PIPELINE_RUN}/NativeScript/${safePipeline}/${safeOrg}/${safeRuntime}`;

    return this.requestWithRetry<any>(
      'post',
      url,
      await this.buildAxiosConfig(undefined, { timeout: 60000 }, signal),
      requestBody
    );
  }

  async runPipeline(
    alias: string,
    cname: string,
    pipelineType: string,
    isLocal: string = 'REMOTE',
    datasource: string = '',
    params: string = '{}',
    workerlogId: string = 'undefined',
    signal?: AbortSignal
  ): Promise<any> {
    this.refreshAuthData();

    const offset = new Date().getTimezoneOffset();
    const queryParams = new URLSearchParams({
      offset: String(offset),
      param: params,
      alias,
      workerlogId: workerlogId || 'undefined',
    });
    if (datasource) { queryParams.append('datasource', datasource); }

    const safeType = encodeURIComponent(pipelineType);
    const safeCName = encodeURIComponent(cname);
    const safeOrg = encodeURIComponent(this.organization);
    const safeIsLocal = encodeURIComponent(isLocal);

    const url = `${this.API.PIPELINE_RUN}/${safeType}/${safeCName}/${safeOrg}/${safeIsLocal}?${queryParams.toString()}`;

    return this.requestWithRetry<any>('get', url, await this.buildAxiosConfig(undefined, { timeout: 60000, responseType: 'text' }, signal));
  }

  async triggerScriptEvent(eventType: string, payload: any, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const safeEvent = encodeURIComponent(eventType);
    const url = `${this.API.EVENTS_TRIGGER}/${safeEvent}`;

    return this.requestWithRetry<any>('post', url, await this.buildAxiosConfig(undefined, { timeout: 60000 }, signal), payload);
  }

  async getEventStatus(eventId: string, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const safeEventId = encodeURIComponent(eventId);
    const url = `${this.API.EVENTS_STATUS}/${safeEventId}`;

    return this.requestWithRetry<any>('get', url, await this.buildAxiosConfig(undefined, { timeout: 10000 }, signal));
  }

  async savePipelineJson(pipelineName: string, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const body = { name: pipelineName, organization: this.organization };
    return this.requestWithRetry<any>('post', this.API.PIPELINES_SAVE_JSON, await this.buildAxiosConfig(undefined, { timeout: 30000 }, signal), body);
  }
}

