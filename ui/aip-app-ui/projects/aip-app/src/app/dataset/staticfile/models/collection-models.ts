export interface ConnectionModelList {
    collectionName: string;
    connectionID: number;
    description: string;
    modelsCreated: ModelList[];
}

export interface ModelList {
    modelName: string;
    modelID: number;
    modelType: string;
}