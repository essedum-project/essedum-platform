/**
 * Pipeline Service
 * 
 * Centralized service for all pipeline-related API operations.
 * Follows best practices with proper error handling, configuration management,
 * and separation of concerns.
 */

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import {
    API_ENDPOINTS,
    BASE_URL,
    createSecureAxiosConfig,
    initializeSSLBypass,
    setupAxiosDefaults
} from '../constants/api-config';
import {
    PipelineCard,
    ScriptFile,
    PipelineScript,
    HttpParams,
    JobStatus,
    JobLogResponse,
    StreamingService,
    DatasourceInfo,
    PipelineExecutionRequest,
    FileUploadRequest,
    EventTriggerRequest,
    EventStatusResponse,
    PipelineServiceConfig
} from '../interfaces/pipeline.interfaces';

export class PipelineService {
    private readonly config: PipelineServiceConfig;
    private token: string = '';

    constructor(config?: Partial<PipelineServiceConfig>) {
        // Initialize SSL bypass on service creation
        initializeSSLBypass();
        setupAxiosDefaults();

        this.config = {
            baseUrl: BASE_URL,
            apiBasePath: '/api/aip/service/v1',
            timeout: 30000,
            defaultOrganization: 'leo1311',
            defaultProjectId: '2',
            defaultProjectName: 'leo1311',
            ...config
        };

        // Validate configuration to prevent 500 errors
        this.validateConfiguration();
    }

    /**
     * Validate service configuration to prevent common 500 errors
     */
    private validateConfiguration(): void {
        const issues: string[] = [];
        
        if (!this.config.baseUrl) {
            issues.push('Base URL is not configured');
        }
        
        if (!this.config.defaultOrganization) {
            issues.push('Default organization is not configured');
        }
        
        if (issues.length > 0) {
            console.warn('⚠️ Configuration issues detected:', issues);
            console.warn('💡 These may cause 500 errors. Please configure properly.');
        } else {
            console.log('✅ Pipeline service configuration validated successfully');
        }
    }

    /**
     * Test method to diagnose 500 errors - call this first to identify the issue
     */
    public async testConnection(): Promise<{ success: boolean; details: any }> {
        console.log('🧪 STARTING CONNECTION AND API DIAGNOSTICS...');
        console.log('═════════════════════════════════════════════════');
        
        const diagnostics: any = {
            timestamp: new Date().toISOString(),
            configTest: false,
            tokenTest: false,
            baseUrlTest: false,
            simpleApiTest: false,
            organizationTest: false,
            details: {}
        };
        
        try {
            // 1. Configuration Test
            console.log('1️⃣ Testing Configuration...');
            diagnostics.details.config = {
                baseUrl: this.config.baseUrl,
                hasOrganization: !!this.config.defaultOrganization,
                organization: this.config.defaultOrganization,
                timeout: this.config.timeout
            };
            diagnostics.configTest = true;
            console.log('   ✅ Configuration looks good');
            
            // 2. Token Test
            console.log('2️⃣ Testing Authentication Token...');
            diagnostics.details.token = {
                present: !!this.token,
                length: this.token?.length || 0,
                format: this.token ? (this.token.startsWith('eyJ') ? 'JWT' : 'Other') : 'None',
                preview: this.token ? `${this.token.substring(0, 20)}...` : 'None'
            };
            
            if (!this.token) {
                console.log('   ❌ No token set - this will cause authentication errors');
                diagnostics.details.token.issue = 'No token provided';
            } else if (!this.token.startsWith('eyJ')) {
                console.log('   ⚠️ Token doesn\'t look like JWT format');
                diagnostics.details.token.issue = 'Token format may be incorrect';
            } else {
                console.log('   ✅ Token format looks correct');
                diagnostics.tokenTest = true;
            }
            
            // 3. Base URL Test
            console.log('3️⃣ Testing Base URL Accessibility...');
            try {
                const response = await axios.get(`${this.config.baseUrl}/actuator/health`, {
                    timeout: 5000,
                    validateStatus: () => true // Accept any status for this test
                });
                
                diagnostics.details.baseUrl = {
                    accessible: true,
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data
                };
                diagnostics.baseUrlTest = true;
                console.log(`   ✅ Base URL accessible (Status: ${response.status})`);
                
            } catch (urlError: any) {
                diagnostics.details.baseUrl = {
                    accessible: false,
                    error: urlError.message,
                    code: urlError.code
                };
                console.log(`   ❌ Base URL not accessible: ${urlError.message}`);
            }
            
            // 4. Simple API Test (if token is available)
            if (this.token) {
                console.log('4️⃣ Testing Simple API Endpoint...');
                try {
                    // Try a simple endpoint that shouldn't cause 500 errors
                    const testResponse = await this.makeRequest<any>('GET', '/api/aip/service/v1/health');
                    diagnostics.details.simpleApi = {
                        success: true,
                        data: testResponse
                    };
                    diagnostics.simpleApiTest = true;
                    console.log('   ✅ Simple API test successful');
                    
                } catch (apiError: any) {
                    diagnostics.details.simpleApi = {
                        success: false,
                        error: apiError.message,
                        status: apiError.response?.status,
                        data: apiError.response?.data
                    };
                    console.log(`   ❌ Simple API test failed: ${apiError.message}`);
                }
            }
            
            // 5. Organization Test
            console.log('5️⃣ Testing Organization Access...');
            if (this.token) {
                try {
                    const orgResponse = await this.makeRequest<any>('GET', `/api/aip/service/v1/organizations/${this.config.defaultOrganization}`);
                    diagnostics.details.organization = {
                        accessible: true,
                        data: orgResponse
                    };
                    diagnostics.organizationTest = true;
                    console.log('   ✅ Organization access successful');
                    
                } catch (orgError: any) {
                    diagnostics.details.organization = {
                        accessible: false,
                        error: orgError.message,
                        status: orgError.response?.status,
                        data: orgError.response?.data
                    };
                    console.log(`   ❌ Organization access failed: ${orgError.message}`);
                }
            }
            
        } catch (error: any) {
            console.log(`❌ Diagnostic test failed: ${error.message}`);
            diagnostics.details.generalError = error.message;
        }
        
        // Summary
        console.log('═════════════════════════════════════════════════');
        console.log('🧪 DIAGNOSTIC SUMMARY:');
        console.log(`   Configuration: ${diagnostics.configTest ? '✅' : '❌'}`);
        console.log(`   Token: ${diagnostics.tokenTest ? '✅' : '❌'}`);
        console.log(`   Base URL: ${diagnostics.baseUrlTest ? '✅' : '❌'}`);
        console.log(`   Simple API: ${diagnostics.simpleApiTest ? '✅' : '❌'}`);
        console.log(`   Organization: ${diagnostics.organizationTest ? '✅' : '❌'}`);
        
        const allTestsPassed = diagnostics.configTest && diagnostics.tokenTest && 
                             diagnostics.baseUrlTest && diagnostics.simpleApiTest && 
                             diagnostics.organizationTest;
        
        console.log(`   Overall Health: ${allTestsPassed ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);
        console.log('═════════════════════════════════════════════════');
        
        return {
            success: allTestsPassed,
            details: diagnostics
        };
    }

    /**
     * Set authentication token for API requests
     */
    public setToken(token: string): void {
        this.token = token;
    }

    /**
     * Get current authentication token
     */
    public getToken(): string {
        return this.token;
    }

    /**
     * Create axios configuration with authentication and SSL bypass
     */
    private createRequestConfig(additionalConfig: Partial<AxiosRequestConfig> = {}): AxiosRequestConfig {
        if (!this.token) {
            throw new Error('Authentication token is required. Please call setToken() first.');
        }

        // Validate token format
        if (!this.token.startsWith('eyJ') && !this.token.includes('.')) {
            console.warn('⚠️ Token format appears invalid. Expected JWT format.');
        }

        console.log(`🔐 Creating request config with token length: ${this.token.length}`);
        
        return createSecureAxiosConfig(this.token, {
            timeout: this.config.timeout,
            ...additionalConfig
        });
    }

    /**
     * Generic request wrapper with error handling
     */
    private async makeRequest<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        url: string,
        data?: any,
        config?: Partial<AxiosRequestConfig>
    ): Promise<T> {
        try {
            const requestConfig = this.createRequestConfig(config);
            const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;

            // Enhanced debugging for 500 error investigation
            console.log('🔍 DETAILED REQUEST ANALYSIS:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`   Timestamp: ${new Date().toISOString()}`);
            console.log(`   Method: ${method}`);
            console.log(`   Full URL: ${fullUrl}`);
            console.log(`   Token Present: ${this.token ? '✅ Yes' : '❌ No'}`);
            console.log(`   Token Length: ${this.token ? this.token.length : 0} chars`);
            console.log(`   Token Preview: ${this.token ? `${this.token.substring(0, 20)}...` : 'None'}`);
            console.log(`   Base URL: ${this.config.baseUrl}`);
            console.log(`   Organization: ${this.config.defaultOrganization}`);
            
            // Show ALL headers being sent
            console.log(`   Headers Being Sent:`);
            Object.entries(requestConfig.headers || {}).forEach(([key, value]) => {
                if (key.toLowerCase() === 'authorization') {
                    console.log(`     ${key}: Bearer [...${String(value).slice(-10)}]`);
                } else {
                    console.log(`     ${key}: ${value}`);
                }
            });
            
            if (data) {
                console.log(`   Request Body Type: ${typeof data}`);
                console.log(`   Request Body Size: ${JSON.stringify(data).length} chars`);
                console.log(`   Request Body Preview:`, JSON.stringify(data, null, 2).substring(0, 500));
            }
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            let response: AxiosResponse<T>;

            switch (method) {
                case 'GET':
                    response = await axios.get(fullUrl, requestConfig);
                    break;
                case 'POST':
                    response = await axios.post(fullUrl, data, requestConfig);
                    break;
                case 'PUT':
                    response = await axios.put(fullUrl, data, requestConfig);
                    break;
                case 'DELETE':
                    response = await axios.delete(fullUrl, requestConfig);
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }

            console.log(`✅ ${method} ${fullUrl} - Status: ${response.status}`);
            return response.data;
        } catch (error: any) {
            console.error('❌ REQUEST FAILED - COMPREHENSIVE ERROR ANALYSIS:');
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error(`   Error Type: ${error.constructor.name}`);
            console.error(`   Error Message: ${error.message}`);
            console.error(`   Has Response: ${error.response ? '✅ Yes' : '❌ No'}`);
            console.error(`   Has Request: ${error.request ? '✅ Yes' : '❌ No'}`);
            
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                console.error(`   Response Status: ${status}`);
                console.error(`   Response Status Text: ${error.response.statusText}`);
                console.error(`   Response Headers:`, error.response.headers);
                console.error(`   Response Data Type: ${typeof data}`);
                console.error(`   Response Data:`, data);
                
                // SUPER DETAILED 500 ERROR ANALYSIS
                if (status === 500) {
                    console.error('🔥 500 INTERNAL SERVER ERROR - DEEP DIVE ANALYSIS:');
                    console.error('╔══════════════════════════════════════════════════════════════╗');
                    console.error('║                    500 ERROR INVESTIGATION                   ║');
                    console.error('╠══════════════════════════════════════════════════════════════╣');
                    console.error(`║ URL: ${url.padEnd(54)} ║`);
                    console.error(`║ Method: ${method.padEnd(51)} ║`);
                    console.error(`║ Timestamp: ${new Date().toISOString().padEnd(45)} ║`);
                    console.error('╠══════════════════════════════════════════════════════════════╣');
                    
                    // Analyze response data structure
                    if (data) {
                        console.error('║ SERVER RESPONSE ANALYSIS:                                    ║');
                        console.error(`║ Response Type: ${typeof data}`.padEnd(62) + '║');
                        
                        if (typeof data === 'string') {
                            console.error(`║ String Content: ${data.substring(0, 40)}...`.padEnd(62) + '║');
                            
                            // Check for common error patterns in string responses
                            if (data.toLowerCase().includes('java.lang.nullpointerexception')) {
                                console.error('║ 🔍 LIKELY CAUSE: NullPointerException in Java backend      ║');
                                console.error('║ 💡 SOLUTION: Check if required parameters are missing      ║');
                            } else if (data.toLowerCase().includes('sql')) {
                                console.error('║ 🔍 LIKELY CAUSE: Database/SQL related error                ║');
                                console.error('║ 💡 SOLUTION: Check database connectivity and queries       ║');
                            } else if (data.toLowerCase().includes('token') || data.toLowerCase().includes('jwt')) {
                                console.error('║ 🔍 LIKELY CAUSE: Authentication/JWT token issue            ║');
                                console.error('║ 💡 SOLUTION: Refresh token or check token format           ║');
                            }
                        } else if (typeof data === 'object') {
                            console.error(`║ Object Keys: ${Object.keys(data).join(', ')}`.padEnd(62) + '║');
                            
                            // Check specific error fields
                            if (data.message) {
                                console.error(`║ Error Message: ${data.message.substring(0, 35)}...`.padEnd(62) + '║');
                            }
                            if (data.error) {
                                console.error(`║ Error Field: ${data.error.substring(0, 37)}...`.padEnd(62) + '║');
                            }
                            if (data.exception) {
                                console.error(`║ Exception: ${data.exception.substring(0, 39)}...`.padEnd(62) + '║');
                            }
                            if (data.path) {
                                console.error(`║ Error Path: ${data.path}`.padEnd(62) + '║');
                            }
                            if (data.timestamp) {
                                console.error(`║ Server Time: ${data.timestamp}`.padEnd(62) + '║');
                            }
                        }
                    } else {
                        console.error('║ No response data available                                   ║');
                    }
                    
                    console.error('╠══════════════════════════════════════════════════════════════╣');
                    console.error('║ TROUBLESHOOTING CHECKLIST:                                   ║');
                    console.error('║ □ Check server logs at this exact timestamp                  ║');
                    console.error('║ □ Verify all required parameters are present                 ║');
                    console.error('║ □ Confirm authentication token is valid                      ║');
                    console.error('║ □ Check organization name and permissions                    ║');
                    console.error('║ □ Verify pipeline exists and is in correct state            ║');
                    console.error('║ □ Test with minimal request parameters                       ║');
                    console.error('║ □ Check server health and resource availability              ║');
                    console.error('╚══════════════════════════════════════════════════════════════╝');
                    
                    // Try to categorize the error
                    let errorCategory = 'Unknown';
                    let errorMessage = 'Internal Server Error';
                    
                    const errorText = JSON.stringify(data || {}).toLowerCase();
                    const statusText = error.response.statusText?.toLowerCase() || '';
                    
                    if (errorText.includes('token') || errorText.includes('unauthorized') || 
                        errorText.includes('authentication') || errorText.includes('jwt') ||
                        statusText.includes('unauthorized')) {
                        errorCategory = 'Authentication';
                        errorMessage = 'Authentication failed - token may be expired or invalid';
                    } else if (errorText.includes('organization') || errorText.includes('org')) {
                        errorCategory = 'Organization';
                        errorMessage = 'Invalid organization parameter or access denied';
                    } else if (errorText.includes('pipeline') || errorText.includes('not found')) {
                        errorCategory = 'Pipeline';
                        errorMessage = 'Pipeline not found or invalid pipeline parameters';
                    } else if (errorText.includes('database') || errorText.includes('sql') || 
                              errorText.includes('connection')) {
                        errorCategory = 'Database';
                        errorMessage = 'Database error - check server logs';
                    } else if (errorText.includes('nullpointer') || errorText.includes('null')) {
                        errorCategory = 'Server Logic';
                        errorMessage = 'Server-side null pointer error - missing required data';
                    } else if (data?.message) {
                        errorMessage = data.message;
                    } else if (data?.error) {
                        errorMessage = data.error;
                    }
                    
                    console.error(`🏷️ ERROR CATEGORY: ${errorCategory}`);
                    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    
                    throw new Error(`[${errorCategory}] Server Error (500): ${errorMessage}`);
                }
                
                throw new Error(`API Error (${status}): ${data?.message || data?.error || error.message}`);
            } else if (error.request) {
                console.error('   Request was made but no response received');
                console.error('   Request details:', error.request);
                throw new Error('Network error: No response received from server');
            } else {
                console.error('   Error in request setup:', error.message);
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }

    /**
     * Get total count of pipelines
     */
    public async getPipelinesCount(params: HttpParams): Promise<number> {
        try {
            const response = await this.makeRequest<{ count: number }>('GET', API_ENDPOINTS.PIPELINES_COUNT, null, {
                params
            });
            return response.count || 0;
        } catch (error: any) {
            console.warn('Failed to get pipelines count, using default count method');
            try {
                // Fallback: get cards and count them
                const cards = await this.getPipelinesList(params);
                return Array.isArray(cards) ? cards.length : 0;
            } catch (fallbackError: any) {
                console.error('Fallback count method also failed:', fallbackError);
                return 0;
            }
        }
    }

    /**
     * Get list of pipeline cards
     */
    public async getPipelinesList(params: HttpParams): Promise<PipelineCard[]> {
        try {
            const response = await this.makeRequest<PipelineCard[]>('GET', API_ENDPOINTS.PIPELINES_LIST, null, {
                params
            });
            return Array.isArray(response) ? response : [];
        } catch (error: any) {
            console.error('Failed to fetch pipelines list:', error);
            return [];
        }
    }

    /**
     * Get streaming service by name and organization
     */
    public async getStreamingServiceByName(name: string, organization?: string): Promise<StreamingService | null> {
        const org = organization || this.config.defaultOrganization;
        
        try {
            const url = `${API_ENDPOINTS.STREAMING_SERVICES}/${name}/${org}`;
            const response = await this.makeRequest<StreamingService>('GET', url);
            return response;
        } catch (error: any) {
            console.error(`Failed to get streaming service ${name} for org ${org}:`, error);
            return null;
        }
    }

    /**
     * Get pipeline by name
     */
    public async getPipelineByName(pipelineName: string, organization?: string): Promise<any> {
        const org = organization || this.config.defaultOrganization;
        
        try {
            const response = await this.makeRequest<any>('GET', API_ENDPOINTS.PIPELINES_BY_NAME, null, {
                params: { name: pipelineName, org }
            });
            return response;
        } catch (error: any) {
            console.error(`Failed to get pipeline ${pipelineName}:`, error);
            throw error;
        }
    }

    /**
     * Read file content from pipeline
     */
    public async readPipelineFile(pipelineName: string, organization?: string): Promise<string[]> {
        const org = organization || this.config.defaultOrganization;
        
        try {
            const url = `${API_ENDPOINTS.FILE_READ}/${pipelineName}/${org}`;
            const response = await this.makeRequest<{ files: string[] }>('GET', url);
            return response.files || [];
        } catch (error: any) {
            console.error(`Failed to read files for pipeline ${pipelineName}:`, error);
            return [];
        }
    }

    /**
     * Get job runtime types for organization
     */
    public async getJobRuntimeTypes(organization?: string): Promise<any[]> {
        const org = organization || this.config.defaultOrganization;
        
        try {
            const url = `${API_ENDPOINTS.JOB_RUNTIME_TYPES}/${org}`;
            const response = await this.makeRequest<any[]>('GET', url);
            return Array.isArray(response) ? response : [];
        } catch (error: any) {
            console.error(`Failed to get job runtime types for org ${org}:`, error);
            return [];
        }
    }

    /**
     * Get datasources runtime information
     */
    public async getDatasourcesRuntime(): Promise<any[]> {
        try {
            const response = await this.makeRequest<any[]>('GET', API_ENDPOINTS.DATASOURCES_RUNTIME);
            return Array.isArray(response) ? response : [];
        } catch (error: any) {
            console.error('Failed to get datasources runtime:', error);
            return [];
        }
    }

    /**
     * Get datasource by name and organization
     */
    public async getDatasourceByName(name: string, organization?: string): Promise<DatasourceInfo | null> {
        const org = organization || this.config.defaultOrganization;
        
        try {
            const url = `/api/aip/service/v1/datasources/${name}/${org}`;
            const response = await this.makeRequest<DatasourceInfo>('GET', url);
            return response;
        } catch (error: any) {
            console.error(`Failed to get datasource ${name} for org ${org}:`, error);
            return null;
        }
    }

    /**
     * Save pipeline JSON configuration
     */
    public async savePipelineJSON(name: string, jsonContent: string): Promise<any> {
        try {
            const url = '/api/aip/service/v1/pipelines/save-json';
            const body = {
                name,
                json: jsonContent,
                organization: this.config.defaultOrganization
            };
            
            const response = await this.makeRequest<any>('POST', url, body);
            return response;
        } catch (error: any) {
            console.error(`Failed to save pipeline JSON for ${name}:`, error);
            throw error;
        }
    }

    /**
     * Trigger event
     */
    public async triggerEvent(eventType: string, body: any): Promise<EventStatusResponse> {
        try {
            const url = `/api/aip/service/v1/events/trigger/${eventType}`;
            const response = await this.makeRequest<EventStatusResponse>('POST', url, body);
            return response;
        } catch (error: any) {
            console.error(`Failed to trigger event ${eventType}:`, error);
            throw error;
        }
    }

    /**
     * Get event status
     */
    public async getEventStatus(eventId: string): Promise<any> {
        try {
            const url = `/api/aip/service/v1/events/status/${eventId}`;
            const response = await this.makeRequest<any>('GET', url);
            return response;
        } catch (error: any) {
            console.error(`Failed to get event status for ${eventId}:`, error);
            throw error;
        }
    }

    /**
     * Run pipeline with specified parameters
     */
    public async runPipeline(request: PipelineExecutionRequest): Promise<any> {
        try {
            console.log('🚀 Starting pipeline execution:', request);

            // Validate required parameters
            if (!request.alias || !request.cname) {
                throw new Error('Missing required parameters: alias and cname are required');
            }

            const org = this.config.defaultOrganization;
            
            // Use the correct runtime parameter mapping
            const runtime = request.isLocal === 'Local' || request.isLocal === 'true' ? 'Local' : 'REMOTE';
            
            // Build URL with proper encoding
            const encodedPipelineName = encodeURIComponent(request.cname);
            const encodedOrg = encodeURIComponent(org);
            const encodedRuntime = encodeURIComponent(runtime);
            
            const url = `/api/aip/service/v1/pipeline/run-pipeline/NativeScript/${encodedPipelineName}/${encodedOrg}/${encodedRuntime}`;
            
            // Build query parameters - many 500 errors come from missing required params
            const queryParams = new URLSearchParams();
            queryParams.append('alias', request.alias);
            queryParams.append('param', request.params || '{}');
            queryParams.append('offset', new Date().getTimezoneOffset().toString());
            
            if (request.datasource && request.datasource.trim() !== '') {
                queryParams.append('datasource', request.datasource);
            }
            
            if (request.workerlogId && request.workerlogId !== 'undefined') {
                queryParams.append('workerlogId', request.workerlogId);
            }

            const fullUrl = `${url}?${queryParams.toString()}`;
            
            console.log('🌐 Full pipeline execution URL:', fullUrl);
            
            // Use GET method for pipeline execution (following the working pattern)
            const response = await this.makeRequest<any>('GET', fullUrl);
            
            console.log('✅ Pipeline execution successful:', response);
            return response;
        } catch (error: any) {
            console.error('❌ Failed to run pipeline:', error);
            
            // Provide specific guidance for common 500 errors
            if (error.message.includes('500')) {
                console.error('💡 Common 500 error causes for pipeline execution:');
                console.error('   1. Invalid pipeline name or organization');
                console.error('   2. Missing or expired authentication token');
                console.error('   3. Pipeline not in READY state');
                console.error('   4. Invalid datasource configuration');
                console.error('   5. Server-side resource limitations');
            }
            
            throw error;
        }
    }

    /**
     * Update streaming service
     */
    public async updateStreamingService(streamItem: any): Promise<void> {
        try {
            const url = API_ENDPOINTS.STREAMING_SERVICES_UPDATE;
            await this.makeRequest<void>('PUT', url, streamItem);
        } catch (error: any) {
            console.error('Failed to update streaming service:', error);
            throw error;
        }
    }

    /**
     * Create native file with FormData
     */
    public async createNativeFileWithFormData(
        pipelineName: string,
        fileName: string,
        scriptContent: string,
        organization?: string
    ): Promise<any> {
        const org = organization || this.config.defaultOrganization;
        
        try {
            const url = `${this.config.baseUrl}/api/aip/file/create/${pipelineName}/${org}/Python3`;
            
            const formData = new FormData();
            const scriptBlob = Buffer.from(scriptContent, 'utf-8');
            formData.append('files', scriptBlob, fileName);

            const config = this.createRequestConfig({
                headers: {
                    ...formData.getHeaders(),
                    'Content-Type': 'multipart/form-data'
                }
            });

            const response = await axios.post(url, formData, config);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to create native file ${fileName}:`, error);
            throw error;
        }
    }

    /**
     * Create script file
     */
    public async createScriptFile(
        pipelineName: string,
        scriptContent: string,
        fileName: string,
        organization?: string
    ): Promise<any> {
        const org = organization || this.config.defaultOrganization;
        
        try {
            const url = `${this.config.baseUrl}/api/aip/file/create/${pipelineName}/${org}/Python3`;
            
            const form = new FormData();
            form.append('content', scriptContent);
            form.append('fileName', fileName);

            const config = this.createRequestConfig({
                headers: {
                    ...form.getHeaders()
                }
            });

            const response = await axios.post(url, form, config);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to create script file ${fileName}:`, error);
            throw error;
        }
    }

    /**
     * Get job status by job ID
     */
    public async getJobStatus(jobId: string): Promise<JobStatus | null> {
        try {
            const url = `/api/aip/service/v1/jobs/status/${jobId}`;
            const response = await this.makeRequest<JobStatus>('GET', url);
            return response;
        } catch (error: any) {
            console.error(`Failed to get job status for ${jobId}:`, error);
            return null;
        }
    }

    /**
     * Generate pipeline scripts
     */
    public async generatePipelineScripts(
        pipelineName: string,
        organization?: string
    ): Promise<void> {
        const org = organization || this.config.defaultOrganization;
        
        try {
            // Save JSON first
            const saveJsonResponse = await this.makeRequest<any>('POST', '/api/aip/service/v1/pipelines/save-json', {
                name: pipelineName,
                organization: org
            });

            console.log('Pipeline JSON saved:', saveJsonResponse);

            // Then trigger generation
            const generateResponse = await this.makeRequest<any>('POST', '/api/aip/service/v1/events/trigger', {
                type: 'generate',
                pipelineName,
                organization: org
            });

            console.log('Pipeline script generation triggered:', generateResponse);
        } catch (error: any) {
            console.error(`Failed to generate pipeline scripts for ${pipelineName}:`, error);
            throw error;
        }
    }

    /**
     * Create or update native file
     */
    public async createNativeFile(
        pipelineName: string,
        organization: string,
        fileName: string,
        fileType: string,
        content: string
    ): Promise<string> {
        try {
            const url = `${this.config.baseUrl}/api/aip/file/create/${pipelineName}/${organization}/${fileType}`;
            
            const formData = new FormData();
            formData.append('content', content);
            formData.append('fileName', fileName);

            const config = this.createRequestConfig({
                headers: {
                    ...formData.getHeaders()
                }
            });

            const response = await axios.post(url, formData, config);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to create native file ${fileName}:`, error);
            throw error;
        }
    }

    /**
     * Download native file
     */
    public async downloadNativeFile(
        pipelineName: string,
        organization: string,
        fileName: string
    ): Promise<ArrayBuffer> {
        try {
            const url = `${this.config.baseUrl}/api/aip/file/download/${pipelineName}/${organization}/${fileName}`;
            
            const config = this.createRequestConfig({
                responseType: 'arraybuffer'
            });

            const response = await axios.get(url, config);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to download native file ${fileName}:`, error);
            throw error;
        }
    }

    /**
     * Fetch complete pipeline scripts with metadata
     */
    public async fetchPipelineScripts(
        pipelineName: string,
        organization?: string
    ): Promise<PipelineScript> {
        const org = organization || this.config.defaultOrganization;
        
        try {
            console.log(`Fetching scripts for pipeline: ${pipelineName}`);

            // Get streaming service
            const streamingService = await this.getStreamingServiceByName(pipelineName, org);
            if (!streamingService) {
                throw new Error(`Streaming service not found for pipeline: ${pipelineName}`);
            }

            // Get pipeline data
            const pipelineData = await this.getPipelineByName(pipelineName, org);
            
            const scriptFiles: ScriptFile[] = [];
            
            // Process script files
            if (pipelineData?.files) {
                const fileEntries = Object.entries(pipelineData.files);
                
                for (const [fileName, fileContent] of fileEntries) {
                    if (typeof fileContent === 'string' && fileContent.trim()) {
                        const extension = fileName.split('.').pop()?.toLowerCase() || 'txt';
                        const language = this.getLanguageByExtension(extension);
                        
                        scriptFiles.push({
                            fileName,
                            content: fileContent,
                            extension,
                            language
                        });
                    }
                }
            }

            // If no files from pipeline data, try reading from file API
            if (scriptFiles.length === 0) {
                try {
                    const fileList = await this.readPipelineFile(pipelineName, org);
                    
                    for (const fileName of fileList) {
                        if (fileName && fileName.trim()) {
                            const extension = fileName.split('.').pop()?.toLowerCase() || 'txt';
                            const language = this.getLanguageByExtension(extension);
                            
                            scriptFiles.push({
                                fileName: fileName.trim(),
                                content: `# ${fileName}\n# File content will be loaded when opened`,
                                extension,
                                language
                            });
                        }
                    }
                } catch (fileError) {
                    console.warn('Could not read file list:', fileError);
                }
            }

            // Get runtime types
            let runTypes: any[] = [];
            try {
                runTypes = await this.getJobRuntimeTypes(org);
                
                if (runTypes.length === 0) {
                    runTypes = await this.getDatasourcesRuntime();
                }
                
                if (runTypes.length === 0) {
                    runTypes = [
                        { type: 'Local', dsAlias: 'local' },
                        { type: 'Remote', dsAlias: 'remote' }
                    ];
                }
            } catch (runTypeError) {
                console.warn('Could not get run types:', runTypeError);
                runTypes = [
                    { type: 'Local', dsAlias: 'local' },
                    { type: 'Remote', dsAlias: 'remote' }
                ];
            }

            return {
                pipelineName,
                files: scriptFiles,
                runTypes,
                selectedRunType: runTypes[0] || null
            };
        } catch (error: any) {
            console.error(`Failed to fetch pipeline scripts for ${pipelineName}:`, error);
            throw error;
        }
    }

    /**
     * Get programming language by file extension
     */
    private getLanguageByExtension(extension: string): string {
        const languageMap: { [key: string]: string } = {
            'py': 'python',
            'js': 'javascript',
            'ts': 'typescript',
            'json': 'json',
            'sql': 'sql',
            'sh': 'shellscript',
            'bat': 'bat',
            'yml': 'yaml',
            'yaml': 'yaml',
            'xml': 'xml',
            'txt': 'plaintext'
        };
        return languageMap[extension.toLowerCase()] || 'plaintext';
    }

    /**
     * Build HTTP parameters for API requests
     */
    public buildHttpParams(
        pageNumber: number = 1,
        pageSize: number = 4,
        organization?: string,
        filter?: string,
        selectedAdapterType: string[] = [],
        selectedTag: string[] = []
    ): HttpParams {
        const org = organization || this.config.defaultOrganization;
        
        let params: HttpParams = {
            page: pageNumber.toString(),
            size: pageSize.toString(),
            project: org,
            isCached: 'true',
            adapter_instance: 'internal',
            interfacetype: 'pipeline',
            cloud_provider: 'internal'
        };

        if (selectedAdapterType.length >= 1) {
            params.type = selectedAdapterType.join(',');
        }

        if (filter && filter.length >= 1) {
            params.query = filter;
        }

        if (selectedTag.length >= 1) {
            params.tags = selectedTag.join(',');
        }

        return params;
    }
}

// Export a singleton instance
export const pipelineService = new PipelineService();
