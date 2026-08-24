/**
 * Pipeline Agent Service
 * 
 * Dedicated service for Pipeline Agent-specific API operations.
 * Uses interfacetype=pipeline-agent to fetch agent-specific data.
 * 
 * Production-grade features:
 * - Retry logic with exponential backoff
 * - AbortSignal cancellation support
 * - Structured error handling
 * - Auto-refresh auth data
 */
import * as vscode from 'vscode';
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import * as http from 'http';
import * as https from 'https';
import { AdkFile, HttpParams } from "../interfaces/pipeline.interfaces";
import { getBaseUrl, getApiEndpoints, getHTTPSAgent } from "../constants/api-config";
import { STORAGE_KEYS } from "../constants/extension-constants";
import { configureSSLEnvironment } from "../utils/ssl-config.util";
import { ProjectInfo, RoleInfo } from '../interfaces/pipeline-agent.interface';
import * as ExtensionUtils from '../utils/extension-utils';
import { KeycloakAuthService } from '../auth/services/keycloak-auth.service';

const logger = ExtensionUtils.createLogger('PipelineAgentService');

/**
 * Structured error for service operations
 */
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * Retry options
 */
type RetryOptions = {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
};

export class PipelineAgentService {
  private context: vscode.ExtensionContext;
  private authService?: KeycloakAuthService;
  private _token: string = '';
  private _project: ProjectInfo | undefined;
  private _role: RoleInfo | undefined;
  private organization: string = '';
  private debug: boolean = false;

  // Keep-alive agents for better connection handling
  private static httpAgent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000,
  });

  private static httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000,
  });

  // Get dynamic API endpoints
  private get API(): ReturnType<typeof getApiEndpoints> {
    return getApiEndpoints();
  }

  constructor(context: vscode.ExtensionContext, authService?: KeycloakAuthService, debug: boolean = false) {
    this.context = context;
    this.authService = authService;
    this.debug = debug;
    // Load auth data from storage
    this.refreshAuthData();

    // Configure SSL based on network selection
    configureSSLEnvironment(this.context);
  }

  /**
   * Refresh authentication data from VS Code storage
   * Call this method after login or when auth data changes
   */
  refreshAuthData(): void {
    // Log ALL available keys in storage
    const allKeys = this.context.globalState.keys();
    logger.info('PipelineAgentService: ALL storage keys:', allKeys);

    this._token = this.context.globalState.get<string>(STORAGE_KEYS.ACCESS_TOKEN) || '';
    this._project = this.context.globalState.get<any>(STORAGE_KEYS.PROJECT);
    this._role = this.context.globalState.get<any>(STORAGE_KEYS.ROLE);
    this.organization = this.context.globalState.get<string>(STORAGE_KEYS.ORGANIZATION) ||
      (typeof this._project === 'object' && this._project?.name ? this._project.name : '');

    // Try alternative keys if primary ones are empty
    if (!this._project) {
      logger.info('Primary PROJECT key is empty, trying alternatives...');
      this._project = this.context.globalState.get<any>(STORAGE_KEYS.CURRENT_PROJECT) ||
        this.context.globalState.get<any>(STORAGE_KEYS.SELECTED_PROJECT) ||
        this.context.globalState.get<any>('currentProject') ||
        this.context.globalState.get<any>('selectedProject');
    }

    logger.info('PipelineAgentService: Auth data refreshed from storage');
    logger.info('  - Token present:', !!this._token);
    logger.info('  - Project raw:', JSON.stringify(this._project));
    logger.info('  - Project.id:', this._project?.id);
    logger.info('  - Project.name:', this._project?.name);
    logger.info('  - Role raw:', JSON.stringify(this._role));
    logger.info('  - Role.id:', this._role?.id);
    logger.info('  - Role.name:', this._role?.name);
    logger.info('  - Organization:', this.organization);
  }

  /**
   * Build request headers with auto-refresh of auth data
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
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      priority: "u=1, i",
      project: String(projectId || ''),
      projectname: String(projectName || ''),
      referer: `${getBaseUrl()}/`,
      roleid: String(roleId || ''),
      rolename: String(roleName || ''),
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      "x-requested-with": "Leap",
      ...(this._token ? {
        'access-token': this._token,
        authorization: `Bearer ${this._token}`
      } : {}),
      ...overrides,
    };

    if (this.debug) {
      logger.info('[PipelineAgentService] Headers prepared:', {
        hasToken: !!this._token,
        project: headers.project,
        projectname: headers.projectname,
        roleid: headers.roleid,
        rolename: headers.rolename,
      });
    }

    return headers;
  }

  /**
   * Build Axios config with SSL, params merging, and AbortSignal support
   */
  private async buildAxiosConfig(
    params?: HttpParams | Record<string, any>,
    overrides: Partial<AxiosRequestConfig> = {},
    signal?: AbortSignal
  ): Promise<AxiosRequestConfig> {
    // Configure SSL based on network
    configureSSLEnvironment(this.context);

    const requestParams: Record<string, unknown> = params ? { ...params } : {};

    const baseHeaders = await this.buildHeaders();
    const overrideHeaders = overrides.headers as Record<string, string> | undefined;

    // Properly merge headers
    const mergedHeaders = overrideHeaders
      ? { ...baseHeaders, ...overrideHeaders }
      : baseHeaders;

    // Properly merge params - if override params exist, use them
    const overrideParams = overrides.params as Record<string, unknown> | undefined;
    let mergedParams: Record<string, unknown>;

    if (overrideParams !== undefined) {
      mergedParams = { ...requestParams, ...overrideParams };
    } else {
      // Auto-add project if not present
      if (!requestParams.project) {
        requestParams.project = this.organization;
      }
      mergedParams = requestParams;
    }

    // CRITICAL: Ensure interfacetype is set to 'pipeline-agent'
    if (!mergedParams.interfacetype) {
      mergedParams.interfacetype = 'pipeline-agent';
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
      logger.info('[PipelineAgentService] Axios config:', {
        timeout: config.timeout,
        hasHttpsAgent: !!config.httpsAgent,
        params: config.params,
        headers: Object.keys((config.headers ?? {}) as Record<string, string>),
      });
    }

    return config;
  }

  /**
   * Internal helper to perform requests with retry/backoff
   */
  private async requestWithRetry<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    config: AxiosRequestConfig,
    data?: any,
    options: RetryOptions = {}
  ): Promise<AxiosResponse<T>> {
    const { maxRetries = 2, baseDelay = 1000, maxDelay = 5000 } = options;
    let lastError: AxiosError | Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        let response: AxiosResponse<T>;

        if (method === 'get') {
          response = await axios.get<T>(url, config);
        } else if (method === 'post') {
          response = await axios.post<T>(url, data, config);
        } else if (method === 'put') {
          response = await axios.put<T>(url, data, config);
        } else if (method === 'patch') {
          response = await axios.patch<T>(url, data, config);
        } else {
          response = await axios.delete<T>(url, config);
        }

        return response;
      } catch (error: any) {
        lastError = error;

        // Check if we should retry
        const isRetryable =
          error.code === 'ECONNRESET' ||
          error.code === 'ECONNABORTED' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ENOTFOUND' ||
          error.code === 'ENETUNREACH' ||
          error.code === 'EAI_AGAIN' ||
          error.message?.includes('socket hang up') ||
          error.response?.status === 408 || // Request Timeout
          error.response?.status === 429 || // Too Many Requests
          error.response?.status === 502 ||
          error.response?.status === 503 ||
          error.response?.status === 504;

        const isLastAttempt = attempt === maxRetries;

        if (!isRetryable || isLastAttempt) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

        logger.info(
          `[PipelineAgentService] Network error (${error.code || 'unknown'}), retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Build structured error
    const axiosError = lastError as AxiosError;
    const responseData = axiosError.response?.data as any;
    throw new ServiceError(
      responseData?.message || axiosError.message || 'Request failed',
      axiosError.code || 'ERR_REQUEST_FAILED',
      axiosError.response?.status,
      responseData
    );
  }

  /**
   * Get Pipeline Agent count using the specific endpoint
   * @param params - Query parameters with interfacetype=pipeline-agent
   * @param signal - Optional AbortSignal for cancellation
   * @returns Total count of pipeline agents
   */
  async getPipelineAgentCount(params: HttpParams, signal?: AbortSignal): Promise<number> {
    this.refreshAuthData();

    const response = await this.requestWithRetry<number>(
      'get',
      this.API.PIPELINES_COUNT,
      await this.buildAxiosConfig(params, {}, signal)
    );

    return response.data ?? 0;
  }

  /**
   * Get Pipeline Agent cards using the training/list endpoint
   * @param params - Query parameters with interfacetype=pipeline-agent
   * @param signal - Optional AbortSignal for cancellation
   * @returns Array of pipeline agent cards
   */
  async getPipelineAgentCards(params: HttpParams, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    const response = await this.requestWithRetry<any>(
      'get',
      this.API.PIPELINES_LIST,
      await this.buildAxiosConfig(params, {}, signal)
    );

    return response.data;
  }

  /**
   * Get Pipeline Agent streaming service by name
   * Same as Pipeline but for Pipeline Agent context
   * @param pipelineName - Pipeline name
   * @param signal - Optional AbortSignal for cancellation
   * @returns Streaming service data with JSON content
   */
  async getStreamingService(pipelineName: string, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    if (!pipelineName) {
      throw new ServiceError('pipelineName is required', 'ERR_INVALID_PARAMS');
    }

    const safeName = encodeURIComponent(pipelineName);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.STREAMING_SERVICES}/${safeName}/${safeOrg}`;

    return this.requestWithRetry<any>('get', url, await this.buildAxiosConfig(undefined, {}, signal));
  }

  /**
   * Read pipeline file content
   * GET /api/aip/file/read/{pipelineId}/{org}?file={filename}
   * @param pipelineId - Pipeline ID or name
   * @param fileName - File name to read
   * @param signal - Optional AbortSignal for cancellation
   * @returns File content as ArrayBuffer
   */
  async readPipelineFile(pipelineId: string, fileName: string, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    if (!pipelineId || !fileName) {
      throw new ServiceError('pipelineId and fileName are required', 'ERR_INVALID_PARAMS');
    }

    const safeId = encodeURIComponent(pipelineId);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.FILE_READ}/${safeId}/${safeOrg}`;

    const config = await this.buildAxiosConfig(
      { file: fileName },
      { responseType: 'arraybuffer' },
      signal
    );

    return this.requestWithRetry<any>('get', url, config);
  }

  /**
   * Upload folder ZIP file to server
   * POST /api/aip/folder/upload/{pipelineId}/{org}?zipFile=null
   * @param pipelineId - Pipeline ID or name
   * @param zipBuffer - ZIP file as Buffer
   * @param zipFileName - Name of the ZIP file
   * @param signal - Optional AbortSignal for cancellation
   * @param isVibeStudio - Optional. When explicitly set (true/false), sent as the
   *   backend's `isvibestudio` form field, which skips pipeline-metadata
   *   validation when true (for AI-generated code with no metadata.json —
   *   mirrors the web app's Vibe Studio/AI-chat-coder persist flows).
   *   Left unset by existing callers so their request payload is unchanged.
   * @param type - Optional. The backend's `type` form field is REQUIRED
   *   server-side (`@RequestParam(required = true)` in ICIPFolderController)
   *   — omitting it fails with "missing parameter 'type'". Left unset by
   *   existing callers so their request payload is unchanged; new callers
   *   must pass it (e.g. 'App', matching what the web app's Vibe
   *   Studio/AI-chat-coder flows send for AI-generated code with isVibeStudio=true).
   * @returns Upload response
   */
  async uploadFolderZip(
    pipelineId: string,
    zipBuffer: Buffer,
    zipFileName: string,
    signal?: AbortSignal,
    isVibeStudio?: boolean,
    type?: string
  ): Promise<any> {
    this.refreshAuthData();

    if (!pipelineId || !zipBuffer) {
      throw new ServiceError('pipelineId and zipBuffer are required', 'ERR_INVALID_PARAMS');
    }

    const sizeMB = (zipBuffer.length / (1024 * 1024)).toFixed(2);
    logger.info(`[PipelineAgentService] Starting upload: ${zipFileName} (${sizeMB} MB)`);

    const safeId = encodeURIComponent(pipelineId);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.FOLDER_UPLOAD}/${safeId}/${safeOrg}`;

    logger.info(`[PipelineAgentService] Upload URL: ${url}`);

    // Create FormData
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('zipFile', zipBuffer, {
      filename: zipFileName,
      contentType: 'application/zip'
    });
    if (isVibeStudio !== undefined) {
      formData.append('isvibestudio', String(isVibeStudio));
    }
    // NOTE: 'type' must be a URL query param (not a form field) — mirrors web app: ?zipFile=null&type=Agent

    const baseHeaders = await this.buildHeaders();
    delete baseHeaders['content-type']; // FormData sets this

    // Determine which agent to use based on URL protocol
    const urlProtocol = url.toLowerCase().startsWith('https') ? 'https' : 'http';
    const uploadAgent = urlProtocol === 'https'
      ? PipelineAgentService.httpsAgent
      : PipelineAgentService.httpAgent;

    // Build query params: always include zipFile=null; add type when provided
    const queryParams: Record<string, string> = { zipFile: 'null' };
    if (type !== undefined) {
      queryParams.type = type;
    }

    const config = await this.buildAxiosConfig(
      queryParams,
      {
        timeout: 600000, // 10 minutes for large uploads
        httpAgent: PipelineAgentService.httpAgent,
        httpsAgent: uploadAgent,
        headers: {
          ...baseHeaders,
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
      signal
    );

    try {
      // Single attempt without retries to avoid delays
      const response = await this.requestWithRetry<any>('post', url, config, formData, { maxRetries: 0, baseDelay: 0, maxDelay: 0 });
      logger.info(`[PipelineAgentService] Upload successful: ${zipFileName}`);
      return response;
    } catch (error: any) {
      logger.error(`[PipelineAgentService] Upload failed: ${zipFileName}`, error);
      throw error;
    }
  }

  /**
   * List ADK files from folder
   * GET /api/aip/folder/list/{pipelineId}/{org}
   * @param pipelineId - Pipeline ID or name
   * @param signal - Optional AbortSignal for cancellation
   * @returns Array of ADK files with their content
   */
  async listAdkFiles(pipelineId: string, signal?: AbortSignal): Promise<AdkFile[]> {
    this.refreshAuthData();

    if (!pipelineId) {
      throw new ServiceError('pipelineId is required', 'ERR_INVALID_PARAMS');
    }

    const safeId = encodeURIComponent(pipelineId);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.FOLDER_LIST}/${safeId}/${safeOrg}`;

    const config = await this.buildAxiosConfig({}, {}, signal);

    try {
      const response = await this.requestWithRetry<AdkFile[]>('get', url, config);
      return response.data || [];
    } catch (error: any) {
      // Return empty array if no files found (404) instead of throwing
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Update ADK file content
   * POST /api/aip/folder/update/{pipelineId}/{org}
   * @param pipelineId - Pipeline ID or name
   * @param filePath - Relative file path
   * @param fileContent - New file content
   * @param fileId - File ID from database (required for update)
   * @param signal - Optional AbortSignal for cancellation
   * @returns Update response
   */
  async updateAdkFile(pipelineId: string, filePath: string, fileContent: string, fileId: number = 0, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    if (!pipelineId || !filePath) {
      throw new ServiceError('pipelineId and filePath are required', 'ERR_INVALID_PARAMS');
    }

    const safeId = encodeURIComponent(pipelineId);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.FOLDER_UPDATE}/${safeId}/${safeOrg}`;

    // Extract filename from path
    const filename = filePath.split(/[\\\\/]/).pop() || filePath;

    // API expects array of file objects with specific structure
    const payload = [{
      id: fileId,
      cname: pipelineId,
      organization: this.organization,
      filename: filename,
      filePath: filePath,
      filescript: fileContent
    }];

    const config = await this.buildAxiosConfig({}, {}, signal);
    return this.requestWithRetry<any>('post', url, config, payload);
  }

  /**
   * Delete ADK file
   * DELETE /api/aip/file/delete/{pipelineId}/{org}?filePath={filePath}
   * @param pipelineId - Pipeline ID or name
   * @param filePath - Relative file path
   * @param signal - Optional AbortSignal for cancellation
   * @returns Delete response
   */
  async deleteAdkFile(pipelineId: string, filePath: string, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    if (!pipelineId || !filePath) {
      throw new ServiceError('pipelineId and filePath are required', 'ERR_INVALID_PARAMS');
    }

    const safeId = encodeURIComponent(pipelineId);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.FILE_DELETE}/${safeId}/${safeOrg}`;

    const config = await this.buildAxiosConfig({ filePath }, {}, signal);
    return this.requestWithRetry<any>('delete', url, config);
  }

  /**
   * Update ADK folder files (batch update)
   * POST /api/aip/folder/update/{pipelineId}/{org}
   * @param pipelineId - Pipeline ID or name
   * @param files - Array of complete file objects with id, cname, organization, filename, filePath, filescript
   * @param signal - Optional AbortSignal for cancellation
   * @returns Update response
   */
  async updateAdkFolder(pipelineId: string, files: AdkFile[], signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    if (!pipelineId || !files || files.length === 0) {
      throw new ServiceError('pipelineId and files are required', 'ERR_INVALID_PARAMS');
    }

    const safeId = encodeURIComponent(pipelineId);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.FOLDER_UPDATE}/${safeId}/${safeOrg}`;

    const config = await this.buildAxiosConfig({}, {}, signal);
    return this.requestWithRetry<any>('post', url, config, files);
  }

  /**
   * Delete ADK folder file by ID
   * DELETE /api/aip/folder/delete/{id}?project={projectName}&interfacetype=pipeline-agent
   * @param fileId - File ID to delete
   * @param signal - Optional AbortSignal for cancellation
   * @returns Delete response
   */
  async deleteAdkFolderFile(fileId: number, signal?: AbortSignal): Promise<any> {
    this.refreshAuthData();

    if (!fileId) {
      throw new ServiceError('fileId is required', 'ERR_INVALID_PARAMS');
    }

    const url = `${this.API.FOLDER_DELETE}/${fileId}`;
    const queryParams = {
      project: this._project?.name || this.organization,
      interfacetype: 'pipeline-agent'
    };
    const config = await this.buildAxiosConfig(queryParams, {}, signal);
    return this.requestWithRetry<any>('delete', url, config);
  }

  /**
   * Download ADK folder as ZIP
   * GET /api/aip/folder/download/{pipelineId}/{org}
   * @param pipelineId - Pipeline ID or name
   * @param signal - Optional AbortSignal for cancellation
   * @returns ZIP file buffer
   */
  async downloadAdkZip(pipelineId: string, signal?: AbortSignal): Promise<Buffer> {
    this.refreshAuthData();

    if (!pipelineId) {
      throw new ServiceError('pipelineId is required', 'ERR_INVALID_PARAMS');
    }

    const safeId = encodeURIComponent(pipelineId);
    const safeOrg = encodeURIComponent(this.organization);
    const url = `${this.API.FOLDER_DOWNLOAD}/${safeId}/${safeOrg}`;

    const config = await this.buildAxiosConfig(
      {},
      {
        timeout: 120000,
        responseType: 'arraybuffer',
        headers: { 'accept': 'application/zip' }
      },
      signal
    );

    const response = await this.requestWithRetry<any>('get', url, config);
    return Buffer.from(response.data);
  }

  /**
   * Upload JSON file to server
   * POST /api/aip/file/create/{pipelineName}/{org}/json?file={fileName}
   * @param pipelineName - Pipeline name
   * @param organization - Organization name
   * @param fileName - JSON file name
   * @param content - JSON content as string
   * @param signal - Optional AbortSignal for cancellation
   */
  async uploadJsonFile(
    pipelineName: string,
    organization: string,
    fileName: string,
    content: string,
    signal?: AbortSignal
  ): Promise<any> {
    this.refreshAuthData();

    const safeName = encodeURIComponent(pipelineName);
    const safeOrg = encodeURIComponent(organization);
    const safeFile = encodeURIComponent(fileName);
    const url = `${this.API.FILE_CREATE}/${safeName}/${safeOrg}/json`;

    const FormData = require('form-data');
    const formData = new FormData();

    const jsonBlob = Buffer.from(content, 'utf-8');
    formData.append('scriptFile', jsonBlob, {
      filename: 'blob',
      contentType: 'application/json'
    });

    const baseHeaders = await this.buildHeaders();
    delete baseHeaders['content-type']; // FormData sets this

    const config = await this.buildAxiosConfig(
      { file: safeFile },
      {
        headers: {
          ...baseHeaders,
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
      signal
    );

    return this.requestWithRetry<any>('post', url, config, formData);
  }

  /**
   * Get MCP Server count
   * GET /api/aip/service/v1/pipelines/count
   * @param queryParams - Query parameters (page, size, project, etc.)
   * @param signal - Optional AbortSignal for cancellation
   * @returns Count of MCP servers
   */
  async getMcpServerCount(queryParams: HttpParams, signal?: AbortSignal): Promise<number> {
    this.refreshAuthData();

    const url = `${this.API.PIPELINES_COUNT}`;
    
    // Add MCP-specific parameters
    const params = {
      ...queryParams,
      interfacetype: 'mcp-pipeline',
      type: 'mcpServer',
      cloud_provider: 'internal'
    };

    const config = await this.buildAxiosConfig(params, {}, signal);
    const response = await this.requestWithRetry<any>('get', url, config);
    
    // Log the response to debug
    logger.info('[PipelineAgentService] MCP count response:', {
      fullResponse: response,
      data: response?.data,
      count: response?.data?.count,
      dataType: typeof response?.data
    });
    
    // Handle different response formats
    if (typeof response?.data === 'number') {
      return response.data;
    }
    return response?.data?.count || 0;
  }

  /**
   * Get MCP Server list
   * GET /api/aip/service/v1/pipelines/training/list
   * @param queryParams - Query parameters (page, size, project, etc.)
   * @param signal - Optional AbortSignal for cancellation
   * @returns List of MCP servers
   */
  async getMcpServerList(queryParams: HttpParams, signal?: AbortSignal): Promise<any[]> {
    this.refreshAuthData();

    const url = `${this.API.PIPELINES_LIST}`;
    
    // Add MCP-specific parameters
    const params = {
      ...queryParams,
      interfacetype: 'mcp-pipeline',
      type: 'mcpServer'
    };

    const config = await this.buildAxiosConfig(params, {}, signal);
    const response = await this.requestWithRetry<any>('get', url, config);
    
    // Log the response to debug
    logger.info('[PipelineAgentService] MCP list response:', {
      fullResponse: response,
      data: response?.data,
      dataLength: Array.isArray(response?.data) ? response.data.length : 'not an array',
      dataType: typeof response?.data
    });
    
    return response?.data || [];
  }

  /**
   * Get App Pipeline count
   * GET /api/aip/service/v1/pipelines/count
   * @param queryParams - Query parameters (page, size, project, etc.)
   * @param signal - Optional AbortSignal for cancellation
   * @returns Count of app pipelines
   */
  async getAppPipelineCount(queryParams: HttpParams, signal?: AbortSignal): Promise<number> {
    this.refreshAuthData();

    const url = `${this.API.PIPELINES_COUNT}`;

    const params = {
      ...queryParams,
      interfacetype: 'app-pipeline',
      type: 'appPipeline',
      cloud_provider: 'internal'
    };

    const config = await this.buildAxiosConfig(params, {}, signal);
    const response = await this.requestWithRetry<any>('get', url, config);

    logger.info('[PipelineAgentService] App Pipeline count response:', {
      data: response?.data,
      count: response?.data?.count,
      dataType: typeof response?.data
    });

    if (typeof response?.data === 'number') {
      return response.data;
    }
    return response?.data?.count || 0;
  }

  /**
   * Get App Pipeline list
   * GET /api/aip/service/v1/pipelines/training/list
   * @param queryParams - Query parameters (page, size, project, etc.)
   * @param signal - Optional AbortSignal for cancellation
   * @returns List of app pipelines
   */
  async getAppPipelineList(queryParams: HttpParams, signal?: AbortSignal): Promise<any[]> {
    this.refreshAuthData();

    const url = `${this.API.PIPELINES_LIST}`;

    const params = {
      ...queryParams,
      interfacetype: 'app-pipeline',
      type: 'appPipeline'
    };

    const config = await this.buildAxiosConfig(params, {}, signal);
    const response = await this.requestWithRetry<any>('get', url, config);

    logger.info('[PipelineAgentService] App Pipeline list response:', {
      data: response?.data,
      dataLength: Array.isArray(response?.data) ? response.data.length : 'not an array',
      dataType: typeof response?.data
    });

    return response?.data || [];
  }

  /**
   * Get GitHub repository branches
   * GET /api/github/branches?repo=owner/repo
   * @param repoName - Repository name in format "owner/repo"
   * @param signal - Optional AbortSignal for cancellation
   * @returns List of branch names
   */
  async getGitHubBranches(repoName: string, signal?: AbortSignal): Promise<string[]> {
    this.refreshAuthData();

    if (!repoName || !repoName.includes('/')) {
      throw new ServiceError('Invalid repository name. Format should be "owner/repo"', 'ERR_INVALID_PARAMS');
    }

    const url = `${this.API.GITHUB_BRANCHES}`;
    const params = { repo: repoName };

    logger.info(`[PipelineAgentService] Fetching GitHub branches for: ${repoName}`);
    logger.info(`[PipelineAgentService] URL: ${url}?repo=${repoName}`);

    const config = await this.buildAxiosConfig(params, {}, signal);
    const response = await this.requestWithRetry<any>('get', url, config);

    logger.info('[PipelineAgentService] GitHub branches response:', {
      branches: response?.data,
      count: Array.isArray(response?.data) ? response.data.length : 0
    });

    return response?.data || [];
  }

  /**
   * Pull files from GitHub repository
   * POST /api/aip/service/v1/github/pull
   * @param request - Repository URL and branch
   * @param signal - Optional AbortSignal for cancellation
   * @returns Object containing files array
   */
  async pullFromGitHub(request: { repoUrl: string; branch: string }, signal?: AbortSignal): Promise<{ files: any[] }> {
    this.refreshAuthData();

    if (!request.repoUrl || !request.branch) {
      throw new ServiceError('repoUrl and branch are required', 'ERR_INVALID_PARAMS');
    }

    const url = `${this.API.GITHUB_PULL}`;

    logger.info(`[PipelineAgentService] Pulling from GitHub:`, {
      repoUrl: request.repoUrl,
      branch: request.branch
    });
    logger.info(`[PipelineAgentService] URL: ${url}`);

    const config = await this.buildAxiosConfig({}, {}, signal);
    const response = await this.requestWithRetry<any>('post', url, config, request);

    logger.info('[PipelineAgentService] GitHub pull response:', {
      filesCount: response?.data?.files?.length || 0,
      hasFiles: !!response?.data?.files
    });

    return response?.data || { files: [] };
  }

  /**
   * Get skills catalogue for the "Attach a skill" feature
   * GET /api/aip/skills?org={org}&page={page}&size={size}
   * Mirrors the web app's agent-pipeline chat panel (essedum-ui), which fetches
   * skills the same way to let users attach them to a message/action.
   * @param options - org (defaults to current organization), page, size
   * @param signal - Optional AbortSignal for cancellation
   * @returns Raw skills API response (array or paginated object depending on backend)
   */
  async getSkills(
    options: { org?: string; page?: number; size?: number } = {},
    signal?: AbortSignal
  ): Promise<any> {
    this.refreshAuthData();
    configureSSLEnvironment(this.context);

    const org = options.org || this.organization;
    const page = options.page ?? 0;
    const size = options.size ?? 50;

    const headers = await this.buildHeaders();
    const config: AxiosRequestConfig = {
      httpsAgent: getHTTPSAgent(this.context),
      timeout: 30000,
      headers,
      params: { org, page, size },
      withCredentials: true,
      signal,
    };

    const response = await this.requestWithRetry<any>('get', this.API.SKILLS_LIST, config);
    return response?.data;
  }

}
