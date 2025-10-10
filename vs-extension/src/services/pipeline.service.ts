/**
 * Pipeline Service
 * 
 * Centralized service for all pipeline-related API operations.
 * Follows best practices with proper error handling, configuration management,
 * and separation of concerns.
 */

import axios, { AxiosRequestConfig } from "axios";
import * as https from "https";
import { HttpParams } from "../interfaces/pipeline.interfaces";
import { API_ENDPOINTS, BASE_URL, createSecureAxiosConfig } from "../constants/api-config";

export class PipelineService {
  private _token: string;
  private organization: string;

  constructor(token?: string, organization: string = "your-org-name") {
    this._token = token || '';
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
   * Fetches the pipeline count from the API
   */
  async getPipelinesCount(params: HttpParams): Promise<number> {
    try {
      // Disable TLS rejection for self-signed certificates (not recommended for production)
      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

      const config: AxiosRequestConfig = {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 10000,
        params: {
          ...params,
          project: this.organization,
        },
        headers: this.buildHeaders(),
      };

      const response = await axios.get(API_ENDPOINTS.PIPELINES_COUNT, config);
      console.log("Pipeline count response:", response.data);

      return response.data ?? 0;
    } catch (error: any) {
      console.error("Failed to fetch pipeline count:", error.message);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }

      throw new Error(`Failed to fetch pipelines count: ${error.message}`);
    }
  }

  /**
 * Fetches the pipeline cards (list) from the API
 */
  async getPipelinesCards(params: HttpParams): Promise<any> {
    try {
      console.log("Attempting fallback request for pipelines list...");
      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

      const config: AxiosRequestConfig = {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 10000,
        params: {
          ...params,
          project: this.organization,
        },
        headers: this.buildHeaders(),
      };

      const response = await axios.get(API_ENDPOINTS.PIPELINES_LIST, config);
      console.log("Fallback pipelines list success");
      return response.data;
    } catch (error: any) {
      console.error("Fallback pipelines list also failed:", error);

      let errorMessage = "Failed to fetch pipeline data";

      switch (error.code) {
        case "UNABLE_TO_GET_ISSUER_CERT_LOCALLY":
          errorMessage = "SSL Certificate error - unable to verify server certificate";
          break;
        case "ENOTFOUND":
          errorMessage = "Network error - unable to reach the server";
          break;
        default:
          if (error.response) {
            errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
          } else if (error.request) {
            errorMessage = "Network timeout or connection refused";
          } else {
            errorMessage = `Request setup error: ${error.message}`;
          }
      }

      throw new Error(errorMessage);
    }
  }

  /**
* Fetch streaming service details by pipeline name
*/
  async getStreamingService(pipelineName: string): Promise<any> {
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
  async getPipelineByName(pipelineName: string): Promise<any> {
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
  async readPipelineFile(pipelineName: string, fileName: string): Promise<axios.AxiosResponse<any, any>> {
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

  // /**
  //  * Fetch streaming service by name
  //  */
  // async getStreamingServices(name: string, org?: string): Promise<any> {
  //   const organization = org || this.organization;

  //   return axios.get(`/api/aip/service/v1/streamingServices/${name}/${organization}`, {
  //     baseURL: BASE_URL,
  //     headers: {
  //       'Accept': 'application/json, text/plain, */*',
  //       'Accept-Language': 'en-US,en;q=0.9',
  //       'Authorization': `Bearer ${this._token}`,
  //       'Content-Type': 'application/json',
  //       'Project': '2',
  //       'ProjectName': organization,
  //       'X-Requested-With': 'Leap',
  //       'roleId': '1',
  //       'roleName': 'IT Portfolio Manager',
  //       'Referer': BASE_URL,
  //       'Sec-Fetch-Dest': 'empty',
  //       'Sec-Fetch-Mode': 'cors',
  //       'Sec-Fetch-Site': 'same-origin'
  //     },
  //     httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  //     timeout: 30000
  //   });
  // }

  /**
   * Fetch datasource by name
   */
  async getDatasourceByName(name: string, org?: string): Promise<any> {
    const organization = org || this.organization;

    return axios.get('https://essedum.az.ad.idemo-ppc.com/api/aip/service/v1/fetchDatasource', {
      params: {
        name,
        org: organization
      },
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'authorization': `Bearer ${this._token}`,
        'content-type': 'application/json; charset=UTF-8',
        'project': '2',
        'projectname': organization,
        'referer': BASE_URL,
        'roleid': '1',
        'rolename': 'IT Portfolio Manager',
        'x-requested-with': 'Leap'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000
    });
  }

  /**
   * Trigger a script generation event for a stream item
   */
  async triggerScriptGenerationEvent(eventType: string, body: any): Promise<any> {
    return axios.post(`/api/aip/service/v1/events/trigger/${eventType}`, body, {
      baseURL: BASE_URL,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'application/json',
        'Project': '2',
        'ProjectName': this.organization,
        'X-Requested-With': 'Leap',
        'roleId': '1',
        'roleName': 'IT Portfolio Manager',
        'Referer': BASE_URL,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 60000
    });
  }

  /**
   * Fetch the status of a triggered event by its ID
   */
  async getEventStatus(eventId: string): Promise<any> {
    return axios.get(`/api/aip/service/v1/events/status/${eventId}`, {
      baseURL: BASE_URL,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'application/json',
        'Project': '2',
        'ProjectName': this.organization,
        'X-Requested-With': 'Leap',
        'roleId': '1',
        'roleName': 'IT Portfolio Manager',
        'Referer': BASE_URL,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000
    });
  }

  /**
   * Trigger a native script pipeline run
   */
  async runNativeScriptPipeline(pipelineName: string, runtime: string, requestBody: any): Promise<any> {
    return axios.post(
      `/api/aip/service/v1/pipeline/run-pipeline/NativeScript/${pipelineName}/${this.organization}/${runtime}`,
      requestBody,
      {
        baseURL: BASE_URL,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Authorization': `Bearer ${this._token}`,
          'Content-Type': 'application/json',
          'Project': '2',
          'ProjectName': this.organization,
          'X-Requested-With': 'Leap',
          'roleId': '1',
          'roleName': 'IT Portfolio Manager',
          'Referer': BASE_URL,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 60000
      }
    );
  }

  /**
   * Update a streaming service
   */
  async updateStreamingService(requestBody: any): Promise<any> {
    return axios.put(
      'https://essedum.az.ad.idemo-ppc.com/api/aip/service/v1/streamingServices/update',
      requestBody,
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Authorization': `Bearer ${this._token}`,
          'Content-Type': 'application/json',
          'Project': '2',
          'ProjectName': this.organization,
          'X-Requested-With': 'Leap',
          'roleId': '1',
          'roleName': 'IT Portfolio Manager',
          'Referer': BASE_URL,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 300
      }
    );
  }

  /**
   * Upload a script file to the pipeline
   */
  async uploadScriptFile(pipelineName: string, fileName: string, formData: any): Promise<any> {
    const url = `https://essedum.az.ad.idemo-ppc.com/api/aip/file/create/${pipelineName}/${this.organization}/Python3?file=${fileName}`;

    return axios.post(url, formData, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'multipart/form-data',
        'Project': '2',
        'ProjectName': this.organization,
        'X-Requested-With': 'Leap',
        'roleId': '1',
        'roleName': 'IT Portfolio Manager',
        'Referer': BASE_URL,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
  }


  /**
   * Upload script content to the pipeline
   */
  async uploadScriptContent(pipelineName: string, fileName: string, form: any): Promise<any> {
    const url = `https://essedum.az.ad.idemo-ppc.com/api/aip/file/create/${pipelineName}/${this.organization}/Python3?file=${fileName}`;

    return axios.post(url, form, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'multipart/form-data',
        'Project': '2',
        'ProjectName': this.organization,
        'X-Requested-With': 'Leap',
        'roleId': '1',
        'roleName': 'IT Portfolio Manager',
        'Referer': BASE_URL,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000
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
    const org = this.organization;
    const offset = new Date().getTimezoneOffset();

    const queryParams = new URLSearchParams();
    queryParams.append('offset', offset.toString());
    queryParams.append('param', params);
    queryParams.append('alias', alias);
    if (datasource) { queryParams.append('datasource', datasource); }
    queryParams.append('workerlogId', workerlogId || 'undefined');

    const url = `https://essedum.az.ad.idemo-ppc.com/api/aip/service/v1/pipeline/run-pipeline/${pipelineType}/${cname}/${org}/${isLocal}?${queryParams.toString()}`;

    return axios.get(url, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'authorization': `Bearer ${this._token}`,
        'content-type': 'application/json',
        'priority': 'u=1, i',
        'project': '2',
        'projectname': org,
        'referer': BASE_URL,
        'roleid': '1',
        'rolename': 'IT Portfolio Manager',
        'sec-ch-ua': '"Microsoft Edge";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
        'x-requested-with': 'Leap'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 60000,
      responseType: 'text'
    });
  }

  /**
   * Fetch streaming service by name
   */
  async getStreamingServicesByName(name: string, org?: string): Promise<any> {
    const organization = org || this.organization;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Authorization': `Bearer ${this._token}`,
      'Content-Type': 'application/json',
      'Project': '2',
      'ProjectName': organization,
      'X-Requested-With': 'Leap',
      'roleId': '1',
      'roleName': 'IT Portfolio Manager',
      'Referer': BASE_URL,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    };
    return await axios.get(`/api/aip/service/v1/streamingServices/${name}/${organization}`, {
      baseURL: BASE_URL,
      headers: headers,
      httpsAgent: httpsAgent,
      timeout: 30000
    });
  }

/**
 * Update a streaming service with the given payload
 */
 async updateStreamingServices(streamItemPayload: any): Promise<any> {
  return axios.put(
    'https://essedum.az.ad.idemo-ppc.com/api/aip/service/v1/streamingServices/update',
    streamItemPayload,
    {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'authorization': `Bearer ${this._token}`,
        'content-type': 'application/json; charset=UTF-8',
        'connection': 'keep-alive',
        'origin': BASE_URL,
        'priority': 'u=1, i',
        'project': '2',
        'projectname': this.organization,
        'referer': BASE_URL,
        'roleid': '1',
        'rolename': 'IT Portfolio Manager',
        'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'x-requested-with': 'Leap'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        requestCert: false
      }),
      timeout: 30000,
      validateStatus: (status) => status >= 200 && status < 300
    }
  );
}


/**
 * Save pipeline JSON before script generation
 */
 async savePipelineJson(pipelineName: string): Promise<any> {
  return axios.post(
    '/api/aip/service/v1/pipelines/save-json',
    {
      name: pipelineName,
      organization: this.organization
    },
    {
      baseURL: BASE_URL,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'application/json',
        'Project': '2',
        'ProjectName': this.organization,
        'X-Requested-With': 'Leap'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000
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
      organization: this.organization
    },
    {
      baseURL: BASE_URL,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'application/json',
        'Project': '2',
        'ProjectName': this.organization,
        'X-Requested-With': 'Leap'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 60000
    }
  );
}

/**
 * Check the status of a script generation event
 */
 async getScriptGenerationStatus(eventId: string): Promise<any> {
  return axios.get(
    `/api/aip/service/v1/events/status/${eventId}`,
    {
      baseURL: BASE_URL,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'application/json',
        'Project': '2',
        'ProjectName': this.organization,
        'X-Requested-With': 'Leap'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000
    }
  );
}

}

// Export a singleton instance
export const pipelineService = new PipelineService();
