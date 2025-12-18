/**
 * Interface definitions for Pipeline Service
 */

export interface PipelineCard {
    type: string;
    alias: string;
    createdDate: string;
    created_by: string;
    id?: string;
    [key: string]: any;
}

export interface ScriptFile {
    fileName: string;
    content: string;
    extension: string;
    language: string;
}

export interface PipelineScript {
    pipelineName: string;
    files: ScriptFile[];
    runTypes: any[];
    selectedRunType?: any;
}

export interface HttpParams {
    page: string;
    size: string;
    project: string;
    isCached: string;
    adapter_instance: string;
    interfacetype: string;
    cloud_provider: string;
    type?: string;
    query?: string;
    tags?: string;
}

export interface JobStatus {
    jobId: string;
    correlationId?: string;
    streamingService?: string;
    jobStatus: string;
    version?: string;
    type?: string;
    runtime?: string;
    finishTime?: string;
    submittedBy?: string;
    submittedOn?: string;
    pipelineName: string;
    organization: string;
    logs?: string;
    hashParams?: string;
}

export interface JobLogResponse {
    log: string;
    jobStatus: string;
    hashparams?: string;
    jobmetadata?: string;
    organization?: string;
}

export interface StreamingService {
    name: string;
    organization: string;
    [key: string]: any;
}

export interface DatasourceInfo {
    name: string;
    organization: string;
    [key: string]: any;
}

export interface PipelineExecutionRequest {
    alias: string;
    cname: string;
    pipelineType: string;
    isLocal: string;
    datasource: string;
    params: string;
    workerlogId: string;
}

export interface FileUploadRequest {
    pipelineName: string;
    organization: string;
    fileName: string;
    content: string;
    fileType: string;
}

export interface EventTriggerRequest {
    eventType: string;
    body: any;
}

export interface EventStatusResponse {
    eventId: string;
    status: string;
    [key: string]: any;
}

export interface PipelineServiceConfig {
    baseUrl: string;
    apiBasePath: string;
    timeout: number;
    defaultOrganization: string;
    defaultProjectId: string;
    defaultProjectName: string;
}