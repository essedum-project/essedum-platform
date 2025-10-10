/**
 * Pipeline Service
 * 
 * Centralized service for all pipeline-related API operations.
 * Follows best practices with proper error handling, configuration management,
 * and separation of concerns.
 */

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as https from "https";
import { HttpParams } from "../interfaces/pipeline.interfaces";
import { API_ENDPOINTS, BASE_URL, createSecureAxiosConfig } from "../constants/api-config";

export class PipelineService {
  private _token: string;
  private organization: string;

  constructor(token: string = "", organization: string = "your-org-name") {
    this._token = token;
    this.organization = organization;
  }

  /**
   * Update the token used for API requests
   */
  updateToken(token: string): void {
    this._token = token;
  }

  /**
   * Builds the headers for the API request
   */
  private buildHeaders(): Record<string, string> {
    return {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      priority: "u=1, i",
      project: "2",
      projectname: "leo1311",
      referer: BASE_URL,
      roleid: "1",
      rolename: "IT Portfolio Manager",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      "x-requested-with": "Leap",
      ...(this._token ? { authorization: `Bearer ${this._token}` } : {}),
    };
  }

  /**
   * Builds a secure Axios config with common settings
   */
  private buildAxiosConfig(params: HttpParams): AxiosRequestConfig {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; // Not recommended for production

    return {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000,
      params: {
        ...params,
        project: this.organization,
      },
      headers: this.buildHeaders(),
    };
  }

  /**
   * Fetches the pipeline count from the API
   */
  async getPipelinesCount(params: HttpParams): Promise<number> {
    try {
      const config = this.buildAxiosConfig(params);
      const response = await axios.get(API_ENDPOINTS.PIPELINES_COUNT, config);
      console.log("Pipeline count response:", response.data);
      return response.data ?? 0;
    } catch (error: any) {
      this.handleError("Failed to fetch pipeline count", error);
      throw new Error(`Failed to fetch pipelines count: ${error.message}`);
    }
  }

  /**
   * Fetches the pipeline cards (list) from the API
   */
  async getPipelinesCards(params: HttpParams): Promise<any> {
    try {
      console.log("Attempting fallback request for pipelines list...");
      const config = this.buildAxiosConfig(params);
      const response = await axios.get(API_ENDPOINTS.PIPELINES_LIST, config);
      console.log("Fallback pipelines list success");
      return response.data;
    } catch (error: any) {
      this.handleError("Fallback pipelines list also failed", error);
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  }

  /**
   * Fetch streaming service details by pipeline name
   */
  async getStreamingService(pipelineName: string): Promise<AxiosResponse<any>> {
    return axios.get(
      `${API_ENDPOINTS.STREAMING_SERVICES}/${pipelineName}/${this.organization}`,
      {
        ...createSecureAxiosConfig(this._token),
        timeout: 30000,
      }
    );
  }

  /**
   * Fetch pipeline details by name
   */
  async getPipelineByName(pipelineName: string): Promise<AxiosResponse<any>> {
    const urlParams = new URLSearchParams();
    urlParams.append("name", pipelineName);
    urlParams.append("org", this.organization);

    return axios.get(API_ENDPOINTS.PIPELINES_BY_NAME, {
      ...createSecureAxiosConfig(this._token),
      params: urlParams,
      timeout: 30000,
    });
  }

  /**
   * Read a file from the pipeline
   */
  async readPipelineFile(pipelineName: string, fileName: string): Promise<AxiosResponse<any>> {
    return axios.get(
      `${API_ENDPOINTS.FILE_READ}/${pipelineName}/${this.organization}`,
      {
        ...createSecureAxiosConfig(this._token),
        params: { file: fileName },
        responseType: "arraybuffer",
        timeout: 30000,
      }
    );
  }

  /**
   * Centralized error logging
   */
  private handleError(context: string, error: any): void {
    console.error(`${context}:`, error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
  }

  /**
   * Converts technical error codes to user-friendly messages
   */
  private getFriendlyErrorMessage(error: any): string {
    switch (error.code) {
      case "UNABLE_TO_GET_ISSUER_CERT_LOCALLY":
        return "SSL Certificate error - unable to verify server certificate";
      case "ENOTFOUND":
        return "Network error - unable to reach the server";
      default:
        if (error.response) {
          return `Server error: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
          return "Network timeout or connection refused";
        } else {
          return `Request setup error: ${error.message}`;
        }
    }
  }



  /**
   * Fetch job run types from primary endpoint
   */
  async getJobRunTypes(): Promise<any> {
    return axios.get(`${API_ENDPOINTS.JOB_RUNTIME_TYPES}/${this.organization}`, {
      ...createSecureAxiosConfig(this._token),
      timeout: 30000,
    });
  }

  /**
   * Fetch job run types from alternative endpoint
   */
  async getAlternativeRunTypes(): Promise<any> {
    return axios.get(API_ENDPOINTS.DATASOURCES_RUNTIME, {
      ...createSecureAxiosConfig(this._token),
      timeout: 30000,
    });
  }

  /**
   * Fetch datasource by name
   */
  async getDatasourceByName(name: string, org?: string): Promise<any> {
    const organization = org || this.organization;

    return axios.get(API_ENDPOINTS.FETCH_DATASOURCE, {
      params: { name, org: organization },
      headers: this.buildHeaders(),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000,
    });
  }

  /**
   * Trigger a script generation event for a stream item
   */
  async triggerScriptGenerationEvent(eventType: string, body: any): Promise<any> {
    return axios.post(`/api/aip/service/v1/events/trigger/${eventType}`, body, {
      baseURL: BASE_URL,
      headers: this.buildHeaders(),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 60000,
    });
  }

  /**
   * Fetch the status of a triggered event by its ID
   */
  async getEventStatus(eventId: string): Promise<any> {
    return axios.get(`/api/aip/service/v1/events/status/${eventId}`, {
      baseURL: BASE_URL,
      headers: this.buildHeaders(),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000,
    });
  }

  /**
   * Trigger a native script pipeline run
   */
  async runNativeScriptPipeline(pipelineName: string, runtime: string, requestBody: any): Promise<any> {
    const url = `/api/aip/service/v1/pipeline/run-pipeline/NativeScript/${pipelineName}/${this.organization}/${runtime}`;
    return axios.post(url, requestBody, {
      baseURL: BASE_URL,
      headers: this.buildHeaders(),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 60000,
    });
  }

  /**
   * Update a streaming service
   */
  async updateStreamingService(requestBody: any): Promise<any> {
    return axios.put(API_ENDPOINTS.STREAMING_SERVICES_UPDATE, requestBody, {
      headers: this.buildHeaders(),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
  }

  /**
   * Upload a script file to the pipeline
   */
  async uploadScriptFile(pipelineName: string, fileName: string, formData: any): Promise<any> {
    const url = `${API_ENDPOINTS.FILE_CREATE}/${pipelineName}/${this.organization}/Python3?file=${fileName}`;
    return axios.post(url, formData, {
      headers: {
        ...this.buildHeaders(),
        'Content-Type': 'multipart/form-data',
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  }

  /**
   * Upload script content to the pipeline
   */
  async uploadScriptContent(pipelineName: string, fileName: string, form: any): Promise<any> {
    const url = `${API_ENDPOINTS.FILE_CREATE}/${pipelineName}/${this.organization}/Python3?file=${fileName}`;
    return axios.post(url, form, {
      headers: {
        ...this.buildHeaders(),
        'Content-Type': 'multipart/form-data',
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000,
    });
  }




  /**
   * Run a pipeline with specified parameters
   */
  async runPipeline(
    alias: string,
    cname: string,
    pipelineType: string,
    isLocal: string = 'REMOTE',
    datasource: string = '',
    params: string = '{}',
    workerlogId: string = 'undefined'
  ): Promise<any> {
    const offset = new Date().getTimezoneOffset();
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      param: params,
      alias,
      workerlogId: workerlogId || 'undefined',
    });

    if (datasource) queryParams.append('datasource', datasource);

    const url = `${API_ENDPOINTS.PIPELINE_RUN}/${pipelineType}/${cname}/${this.organization}/${isLocal}?${queryParams.toString()}`;

    return axios.get(url, {
      headers: this.buildHeaders(),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 60000,
      responseType: 'text',
    });
  }

  /**
   * Fetch streaming service by name
   */
  async getStreamingServicesByName(name: string, org?: string): Promise<any> {
    const organization = org || this.organization;
    return axios.get(`/api/aip/service/v1/streamingServices/${name}/${organization}`, {
      baseURL: BASE_URL,
      headers: this.buildHeaders(),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000,
    });
  }

  /**
   * Update a streaming service with the given payload
   */
  async updateStreamingServices(streamItemPayload: any): Promise<any> {
    return axios.put(API_ENDPOINTS.STREAMING_SERVICES_UPDATE, streamItemPayload, {
      headers: this.buildHeaders(),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
  }

  /**
   * Save pipeline JSON before script generation
   */
  async savePipelineJson(pipelineName: string): Promise<any> {
    return axios.post(
      '/api/aip/service/v1/pipelines/save-json',
      { name: pipelineName, organization: this.organization },
      {
        baseURL: BASE_URL,
        headers: this.buildHeaders(),
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 30000,
      }
    );
  }

  /**
   * Trigger script generation event for a pipeline
   */
  async triggerScriptGenerationEvents(pipelineName: string): Promise<any> {
    return axios.post(
      '/api/aip/service/v1/events/trigger',
      {
        eventType: 'generateScript_Pipeline',
        pipelineName,
        organization: this.organization,
      },
      {
        baseURL: BASE_URL,
        headers: this.buildHeaders(),
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 60000,
      }
    );
  }

  /**
   * Check the status of a script generation event
   */
  async getScriptGenerationStatus(eventId: string): Promise<any> {
    return axios.get(`/api/aip/service/v1/events/status/${eventId}`, {
      baseURL: BASE_URL,
      headers: this.buildHeaders(),
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000,
    });
  }

}

// Export a singleton instance
export const pipelineService = new PipelineService();
