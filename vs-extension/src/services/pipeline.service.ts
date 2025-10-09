/**
 * Pipeline Service
 * 
 * Centralized service for all pipeline-related API operations.
 * Follows best practices with proper error handling, configuration management,
 * and separation of concerns.
 */

import axios from "axios";
import * as https from 'https';
import { HttpParams } from "../interfaces/pipeline.interfaces";
import { API_ENDPOINTS } from "../constants/api-config";



export class PipelineService {

    
 private _token: string | null = null;
  private organization: string = 'your-org-name'; // replace with actual value or inject

    constructor(token?: string, organization?: string) {
        this._token = token || null;
        this.organization = organization || this.organization;
    }

    /**
     * Update the token used for API requests
     */
    updateToken(token: string): void {
        this._token = token;
    }

    async getPipelinesCount(params: HttpParams): Promise<number> {
        try {
            console.log('Attempting fallback request...');
            process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

      const axiosConfig = {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 10000,
        params: {
          ...params,
          project: this.organization
        },
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'priority': 'u=1, i',
          'project': '2',
          'projectname': 'leo1311',
          'referer': 'https://essedum.az.ad.idemo-ppc.com/',
          'roleid': '1',
          'rolename': 'IT Portfolio Manager',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
          'x-requested-with': 'Leap',
          ...(this._token ? { 'authorization': `Bearer ${this._token}` } : {})
        }
      };

      const response = await axios.get(API_ENDPOINTS.PIPELINES_COUNT, axiosConfig);
      console.log('Fallback response:', response.data);
      return response.data || 0;

    } catch (fallbackError: any) {
      console.error('Fallback request also failed:', fallbackError);
      if (fallbackError.response) {
        console.error('Response data:', fallbackError.response.data);
        console.error('Response status:', fallbackError.response.status);
        console.error('Response headers:', fallbackError.response.headers);
      } else if (fallbackError.request) {
        console.error('Request made but no response received:', fallbackError.request);
      } else {
        console.error('Error setting up request:', fallbackError.message);
      }
      throw new Error(`Failed to fetch pipelines count: ${fallbackError.message || fallbackError}`);
    }
  }
}

// Export a singleton instance
export const pipelineService = new PipelineService();
