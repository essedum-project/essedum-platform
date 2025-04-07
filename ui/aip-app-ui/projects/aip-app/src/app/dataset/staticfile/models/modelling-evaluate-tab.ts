export interface ModellingEvaluateTab {
    algorithmName: string;
    modelName: string;
    close: boolean;
    toolitip: string;
    versions: Versions[];
}

export interface Versions {
    versionNo: string;
    runId: string;
    metrics: any;
    params: any;
    status: string;
    imageData: any;
    selectedFinal: any;
    otherOptions: string;
}