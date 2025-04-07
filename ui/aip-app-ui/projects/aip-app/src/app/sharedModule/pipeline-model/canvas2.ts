export class Canvas {
    name: string;
    description: string;
    elements: Element[];
    code: string[];
    constructor(json?: any) {
        if (json != null) {
            this.name = json.name;
            this.description = json.description;
            this.elements = json.elements;
            this.code = json.code;
        }
    }
}

export class Element2 {
    name: string;
    runtime: string;
    index: string;

    constructor(name, runtime, index) {
        this.name = name;
        this.runtime = runtime;
        this.index = index;
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
    requiredJars: string[];
    formats: any;
    context: any[];
    cname: string;
    runtime: string;
    // isLocal:boolean;
    org: string;
    params: string;
    // expression:string;

    constructor(id, alias, category, classname, description,
        attributes, positionX, positionY, connectors, connattributes,
        inputEndpoints, outputEndpoints, requiredJars, formats, cname, runtime, isLocal, org, params, expression) {
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
        this.cname = cname;
        this.runtime = runtime;
        this.org = org;
        // this.isLocal=isLocal;
        this.params = params;
        // this.expression=expression;
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
