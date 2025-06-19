

export class Canvas {
    alias: string;
    name: string;
    description: string;
    elements: Element[];
    code: string[];
    constructor(json?: any) {
        if (json != null) {
            this.alias = json.alias;
            this.name = json.name;
            this.description = json.description;
            this.elements = json.elements;
            this.code = json.code;
        }
    }
}

export class Element {
    id: number;
    alias: string;
    category: string;
    name: string;
    classname: string;
    description: string;
    attributes: any;
    position_x: number;
    position_y: number;
    connectors: Connector[];
    connattributes: any;
    inputEndpoints: string[];
    outputEndpoints: string[];
    codeGeneration:any
    requiredJars: string[];
    formats: any;
    context: any[];

    constructor(id, alias, category, classname, description,
        attributes, positionX, positionY, connectors, connattributes,
        inputEndpoints, outputEndpoints, requiredJars, formats,codeGeneration) {
        this.id = id;
        this.alias = alias;
        this.name = alias;
        this.classname = classname;
        this.category = category;
        this.description = description;
        this.attributes = attributes;
        this.position_x = positionX;
        this.position_y = positionY;
        this.connectors = connectors;
        this.connattributes = connattributes,
        this.inputEndpoints = inputEndpoints;
        this.outputEndpoints = outputEndpoints;
        this.requiredJars = requiredJars;
        this.formats = formats;
        this.codeGeneration = codeGeneration
    }
}




export class Connector {
    type: string;
    endpoint: string;
    position: string;
    elementId: string;
    elementPosition: string;

    constructor(type: string, endpoint: string, position: string, elementId: string, elementPosition: string) {
        this.type = type;
        this.endpoint = endpoint;
        this.position = position;
        this.elementId = elementId;
        this.elementPosition = elementPosition;
    }
}

export class PipelineModel {

    id: number;
    modelname: string;
    apispec: string;
    fileid: string;
    pipelinemodel: boolean;
    modelOption: string;
    explanation: string;
    executionscript: string[];
    loadscript: any[];
    modelpath: string;
    org: string;
    metadata: string;
    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.fileid = json.fileid
            this.modelname = json.modelname;
            this.explanation = json.explanation;
            this.apispec = json.apispec;
            this.pipelinemodel = json.pipelinemodel;
            this.modelOption = json.modelOption;
            this.executionscript = json.pyscript;
            this.loadscript = json.loadscript;
            this.modelpath = json.modelpath;
            this.org = json.org;
            this.metadata = json.metadata;
        }
    }

    
}
export class DataSetTable{
    name:string;
    dataset:any;
    constructor( Name,datasetArray)
    {this.dataset=datasetArray;
        this.name=Name;
        
    }

}
