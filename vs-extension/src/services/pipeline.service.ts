/**
 * Pipeline Service
 * 
 * Centralized service for all pipeline-related API operations.
 * Follows best practices with proper error handling, configuration management,
 * and separation of concerns.
 */
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpParams } from "../interfaces/pipeline.interfaces";
import { API_ENDPOINTS, getBaseUrl, createSecureAxiosConfig, HTTPS_AGENT, createHTTPSAgent, getApiEndpoints } from "../constants/api-config";

export class PipelineService {
  private _token: string;
  private _project: any;
  private _role:any;
  private organization: string;

  // Get dynamic API endpoints
  private get API(): ReturnType<typeof getApiEndpoints> {
    return getApiEndpoints();
  }

  constructor(token: string = "", role: any = "", project: any = "leo1311") {
    this._token = token;
    this._project = project;
    this._role = role;
    this.organization = project.name;
    
    // Debug logging to check what we're receiving
    console.log('PipelineService constructor called with:');
    console.log('Token present:', !!token);
    console.log('Role:', role);
    console.log('Project:', project);
    console.log('Organization set to:', this.organization);
    
    // Ensure SSL bypass is active when service is created
    this.ensureSSLBypass();
  }

  updateToken(token: string): void {
    this._token = token;
  }

  /**
   * Ensure SSL bypass is active for all requests
   */
  private ensureSSLBypass(): void {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    console.log('PipelineService: SSL bypass ensured');
  }

  private buildHeaders(overrides: Record<string, string> = {}): Record<string, string> {
    // Use default values if project/role data is missing or incomplete
    const projectId = this._project?.id || '2';
    const projectName = this._project?.name || 'leo1311';
    const roleId = this._role?.id || '';
    const roleName = this._role?.name || 'IT Port';
    
    const headers = {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      priority: "u=1, i",
      project: projectId,
      projectname: projectName,
      referer: `${getBaseUrl()}/`,
      roleid: roleId,
      rolename: roleName,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      "x-requested-with": "Leap",
      ...(this._token ? { authorization: `Bearer ${this._token}` } : {}),
      ...overrides,
    };
    
    // Debug logging to see what headers we're building
    console.log('PipelineService building headers:');
    console.log('- project (id):', projectId, '(from:', this._project?.id, ')');
    console.log('- projectname:', projectName, '(from:', this._project?.name, ')');
    console.log('- roleid:', roleId, '(from:', this._role?.id, ')');
    console.log('- rolename:', roleName, '(from:', this._role?.name, ')');
    console.log('- token present:', !!this._token);
    console.log('- referer:', `${getBaseUrl()}/`);
    
    return headers;
  }

  private buildAxiosConfig(params?: HttpParams, overrides: Partial<AxiosRequestConfig> = {}): AxiosRequestConfig {
    // Ensure SSL bypass is active for this request
    this.ensureSSLBypass();
    
    return {
      httpsAgent: HTTPS_AGENT, // Use the comprehensive HTTPS agent from api-config
      timeout: 30000,
      headers: this.buildHeaders(),
      ...(params ? { params: { ...params, project: this.organization } } : {}),
      ...overrides,
    };
  }

  async getPipelinesCount(params: HttpParams): Promise<number> {
    console.log('PipelineService: Getting pipelines count...');
    console.log('SSL bypass status:', process.env['NODE_TLS_REJECT_UNAUTHORIZED']);
    console.log('API endpoint:', this.API.PIPELINES_COUNT);
    console.log('Request params:', params);
    console.log('Token present:', !!this._token);
    
    const config = this.buildAxiosConfig(params);
    console.log('Request config:', {
      url: this.API.PIPELINES_COUNT,
      hasHttpsAgent: !!config.httpsAgent,
      timeout: config.timeout,
      headers: Object.keys(config.headers || {})
    });
    
    try {
      const response = await axios.get(this.API.PIPELINES_COUNT, config);
      console.log('Pipelines count request successful:', response.status);
      return response.data ?? 0;
    } catch (error: any) {
      console.error('Pipelines count request failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }

  async getPipelinesCards(params: HttpParams): Promise<any> {
    const config = this.buildAxiosConfig(params);
    const response = await axios.get(this.API.PIPELINES_LIST, config);
    return response.data;
  }

  async getStreamingService(pipelineName: string): Promise<AxiosResponse<any>> {
    return axios.get(
      `${this.API.STREAMING_SERVICES}/${pipelineName}/${this.organization}`,
      this.buildAxiosConfig()
    );
  }

  async getStreamingServicesByName(name: string, org?: string): Promise<any> {
    const organization = org || this.organization;
    return axios.get(`/api/aip/service/v1/streamingServices/${name}/${organization}`, {
      baseURL: getBaseUrl(),
      ...this.buildAxiosConfig(),
    });
  }

  async updateStreamingService(payload: any): Promise<any> {
    return axios.put(this.API.STREAMING_SERVICES_UPDATE, payload, {
      ...this.buildAxiosConfig(),
      validateStatus: (status) => status >= 200 && status < 300,
    });
  }

  async getPipelineByName(pipelineName: string): Promise<AxiosResponse<any>> {
    const urlParams = new URLSearchParams();
    urlParams.append("name", pipelineName);
    urlParams.append("org", this.organization);

    return axios.get(this.API.PIPELINES_BY_NAME, {
      ...createSecureAxiosConfig(this._token, this._role),
      params: urlParams,
      timeout: 30000,
    });
  }

  async readPipelineFile(pipelineName: string, fileName: string): Promise<AxiosResponse<any>> {
    return axios.get(
      `${this.API.FILE_READ}/${pipelineName}/${this.organization}`,
      {
        ...createSecureAxiosConfig(this._token, this._role),
        params: { file: fileName },
        responseType: "arraybuffer",
        timeout: 30000,
      }
    );
  }

  async uploadScript(pipelineName: string, fileName: string, formData: any): Promise<any> {
    const url = `${this.API.FILE_CREATE}/${pipelineName}/${this.organization}/Python3?file=${fileName}`;
    
    // Force SSL bypass
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
    return axios.post(url, formData, {
      headers: {
        ...this.buildHeaders({ "Content-Type": "multipart/form-data" }),
      },
      httpsAgent: HTTPS_AGENT, // Use comprehensive HTTPS agent
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  }

  async getJobRunTypes(): Promise<any> {
    return axios.get(`${this.API.JOB_RUNTIME_TYPES}/${this.organization}`, this.buildAxiosConfig());
  }

  async getAlternativeRunTypes(): Promise<any> {
    return axios.get(this.API.DATASOURCES_RUNTIME, this.buildAxiosConfig());
  }

  async getDatasourceByName(name: string, org?: string): Promise<any> {
    const organization = org || this.organization;
    
    // Force SSL bypass
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
    return axios.get(this.API.FETCH_DATASOURCE, {
      params: { name, org: organization },
      headers: this.buildHeaders(),
      httpsAgent: HTTPS_AGENT, // Use comprehensive HTTPS agent
      timeout: 30000,
    });
  }

  async runNativeScriptPipeline(pipelineName: string, runtime: string, requestBody: any): Promise<any> {
    const url = `/api/aip/service/v1/pipeline/run-pipeline/NativeScript/${pipelineName}/${this.organization}/${runtime}`;
    
    // Force SSL bypass
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
    return axios.post(url, requestBody, {
      baseURL: getBaseUrl(),
      headers: this.buildHeaders(),
      httpsAgent: HTTPS_AGENT, // Use comprehensive HTTPS agent
      timeout: 60000,
    });
  }

  async runPipeline(
    alias: string,
    cname: string,
    pipelineType: string,
    isLocal: string = "REMOTE",
    datasource: string = "",
    params: string = "{}",
    workerlogId: string = "undefined"
  ): Promise<any> {
    // Force SSL bypass
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
    const offset = new Date().getTimezoneOffset();
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      param: params,
      alias,
      workerlogId: workerlogId || "undefined",
    });
    if (datasource) {queryParams.append("datasource", datasource);}

    const url = `${this.API.PIPELINE_RUN}/${pipelineType}/${cname}/${this.organization}/${isLocal}?${queryParams.toString()}`;
    return axios.get(url, {
      headers: this.buildHeaders(),
      httpsAgent: HTTPS_AGENT, // Use comprehensive HTTPS agent
      timeout: 60000,
      responseType: "text",
    });
  }

  async triggerScriptEvent(eventType: string, payload: any): Promise<any> {
    // Force SSL bypass
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
    return axios.post(`/api/aip/service/v1/events/trigger/${eventType}`, payload, {
      baseURL: getBaseUrl(),
      headers: this.buildHeaders(),
      httpsAgent: HTTPS_AGENT, // Use comprehensive HTTPS agent
      timeout: 60000,
    });
  }

  async getEventStatus(eventId: string): Promise<any> {
    // Force SSL bypass
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
    return axios.get(`/api/aip/service/v1/events/status/${eventId}`, {
      baseURL: getBaseUrl(),
      headers: this.buildHeaders(),
      httpsAgent: HTTPS_AGENT, // Use comprehensive HTTPS agent
      timeout: 10000,
    });
  }

  async savePipelineJson(pipelineName: string): Promise<any> {
    // Force SSL bypass
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
    return axios.post(
      "/api/aip/service/v1/pipelines/save-json",
      { name: pipelineName, organization: this.organization },
      {
        baseURL: getBaseUrl(),
        headers: this.buildHeaders(),
        httpsAgent: HTTPS_AGENT, // Use comprehensive HTTPS agent
        timeout: 30000,
      }
    );
  }
}


// Export a singleton instance
export const pipelineService = new PipelineService();
