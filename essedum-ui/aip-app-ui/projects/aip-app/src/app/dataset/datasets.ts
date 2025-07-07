import { Datasource } from '../datasource/datasource';

export class Dataset {
    id: number;
    alias: string;
    name: string;
    type: string;
    description: string;
    schema: any;
    datasource: any;
    attributes: string;
    organization: string;
    backingDataset: Dataset;
    expStatus: number;     
    schemajson: any;
    archivalConfig: string
    dashboard: any;
    isArchivalEnabled
    taskdetails: any;
    views: any;
    constructor(json?: any) {
        if (json != null) {
            this.id = json.id ? json.id : 0;
            this.alias = json.alias;
            this.name = json.name;
            this.type = json.type;
            this.description = json.description;
            this.datasource = json.datasource;
            this.schema = json.schema;
            this.attributes = json.attributes;
            this.organization = json.organization;
            this.backingDataset = json.backingDataset;
            this.expStatus = json.expStatus;
            this.schemajson = json.jsonSchema;
            this.archivalConfig = json.archivalConfig;
            this.dashboard = json.dashboard;
            this.isArchivalEnabled = json.isArchivalEnabled;
            this.taskdetails = json.taskdetails;
            this.views = json.views;
        }
    }

    // Utils

    static toArray(jsons: any[]): Dataset[] {
        const datasets: Dataset[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                datasets.push(new Dataset(json));
            }
        }
        return datasets;
    }
}
export const FUNCPATTERNREGEX = /^[A-Z_a-z]+$/;
export const EXCECPTION_PACKS = ['logical'];
export const NO_ATTRIBUTE_FUNCTION = ['TODAY'];
export const COLUMNDATATYPES = [
    { name: 'Int', code: 'int64' },
    { name: 'Float', code: 'float64' },
    { name: 'Int', code: 'int32' },
    { name: 'Int', code: 'uint8' },
    { name: 'Float', code: 'float32' },
    { name: 'String', code: 'object' },
    { name: 'String', code: 'string' },
    { name: 'String', code: 'category' },
    { name: 'Datetime', code: 'datetime64' },
];
export const DEFAULT_OPERATOR_PACKS = [
    { pack: 'comparison' },
    { pack: 'general' },
    { pack: 'math' },
    { pack: 'aggregate' },
    { pack: 'logical' },
    { pack: 'groupby' },
    { pack: 'datetime' },
    { pack: 'trigonometric' },
    { pack: 'type' },
    { pack: 'financepack' },
];
export class StatisticsRequestObject {
    recipe_id: number;
    recipe_name: string;
    function_name: string[];
    args: Object[];
   
    actions_changed: string;
    screen: string;
    dataset_type: string;
    dataset_name: string;
    aip_login: string;
    org: string;
}
export class TransformObject {
    dataframe: string;
    recipe_id: number;
    recipe_name: string;
    function_name: string[];
    args: Object[];
    object_id: number;
    object_name: string;
    collection_name: string[];
    connection_id: number;
    mode: string;
    first_load: string;
    screen: string;
    user_id: number;
    dataset_type: string;
    dataset_name: string;
    aip_login: string;
    org: string;
}
export const QUERY_OPERATOR_TABLE_HEADERS = ['Operator Packs', 'Formula'];
export const DISABLED_ADVISORIES = [
    'find_and_update_column_data',
    'cleanse_column_data',
];
