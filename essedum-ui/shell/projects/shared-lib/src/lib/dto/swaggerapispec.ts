export class SwaggerAPISpec {
    messageService: any

    constructor() { }

    readonlyjsoninput = {
        "properties": {
        }
    }

    readonlyformdatainput = {
        "type": "object",
        "required": [],
        "properties": {
        }
    }

    readonlyapispec = {
        "openapi": "3.0.2",
        "info": {
            "version": "@version",
            "title": "@title",
            "description": "@description"
        },
        "servers": [{
            "url": "@url"
        }],
        "paths": {
            "@urlpath": {
                "@requestMethod": {
                    "requestBody": {
                        "description": "request",
                        "required": true,
                        "content": {
                            "@type": {
                                "schema": {
                                    "$ref": "#/components/schemas/input"
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "string"
                                    }
                                }
                            }
                        },
                        "default": {
                            "description": "error",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "components": {
            "schemas": {
                "input": {
                }
            },
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                },
                "basicAuth": {
                    "type": "http",
                    "scheme": "basic"
                }
            },
            "security": [{
                "bearerAuth": [],
                "basicAuth": []
            }]
        }
    }

    samplejsoninput = {
        "properties": {
        }
    }

    sampleformdatainput = {
        "type": "object",
        "required": [],
        "properties": {
        }
    }

    sampleapispec = {
        "openapi": "3.0.2",
        "info": {
            "version": "@version",
            "title": "@title",
            "description": "@description"
        },
        "servers": [{
            "url": "@url"
        }],
        "paths": {
            "@urlpath": {

                "@requestMethod": {
                    "dataset": "",
                    "parameters": [],
                    "requestBody": {
                        "description": "request",
                        "required": true,
                        "content": {
                            "@type": {
                                "schema": {
                                    "$ref": "#/components/schemas/input",
                                    "properties": {
                                        "example": {}
                                    }
                                }
                            }
                        },
                        "value": ""
                    },
                    "responses": {
                        "200": {
                            "description": "response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "string"
                                    }
                                }
                            }
                        },
                        "default": {
                            "description": "error",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "components": {
            "schemas": {
                "input": {
                }
            },
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                },
                "basicAuth": {
                    "type": "http",
                    "scheme": "basic"
                }
            },
            "security": [{
                "bearerAuth": [],
                "basicAuth": []
            }]
        }
    }

    public addTitle(title) {
        this.sampleapispec.info.title = title
    }

    public addVersion(version) {
        this.sampleapispec.info.version = version
    }

    public addDescription(desc) {
        this.sampleapispec.info.description = desc
    }

    public addUrl(url) {
        this.sampleapispec.servers[0].url = url
    }

    public addDatasetAndParams(dataset, parameters) {
        this.sampleapispec.paths["@urlpath"]["@requestMethod"].dataset = dataset
        this.sampleapispec.paths["@urlpath"]["@requestMethod"].parameters = parameters
    }

    public addUrlPath(urlpath) {
        this.sampleapispec.paths[urlpath] = this.sampleapispec.paths["@urlpath"]
        delete this.sampleapispec.paths["@urlpath"]
    }

    public addRequestMethod(method) {
        if (method.toLowerCase() == "get")
            delete this.sampleapispec.paths["@urlpath"]["@requestMethod"].requestBody
        this.sampleapispec.paths["@urlpath"][method] = this.sampleapispec.paths["@urlpath"]["@requestMethod"]
        delete this.sampleapispec.paths["@urlpath"]["@requestMethod"]
    }

    public addRequestBody(body) {
        let reqBody = body
        this.sampleapispec.paths["@urlpath"]["@requestMethod"].requestBody.content["@type"].schema.properties.example = reqBody
        this.sampleapispec.paths["@urlpath"]["@requestMethod"].requestBody.value = reqBody
    }

    public changeType(type) {
        this.sampleapispec.paths["@urlpath"]["@requestMethod"].requestBody.content[type] = this.sampleapispec.paths["@urlpath"]["@requestMethod"].requestBody.content["@type"]
        delete this.sampleapispec.paths["@urlpath"]["@requestMethod"].requestBody.content["@type"]
    }

    public addJsonInput() {
        this.sampleapispec.components.schemas.input = this.samplejsoninput
    }

    public addFormDataInput() {
        this.sampleapispec.components.schemas.input = this.sampleformdatainput
    }

    public addElementInJson(key, value) {
        this.samplejsoninput.properties[key] = { "type": value }
    }

    public addElementInFormData(key, value, required) {
        if (value != 'binary') {
            this.sampleformdatainput.properties[key] = { "type": value }
        } else {
            this.sampleformdatainput.properties[key] = { "type": "string", "format": value }
        }
        if (required) {
            this.sampleformdatainput.required.push(key)
        }
    }

    public getPropertiesKeys() {
        return Object.keys(this.sampleformdatainput.properties)
    }

    public getRequiredFields(): any[] {
        return this.sampleformdatainput.required
    }

    public deleteElementInJson(key) {
        delete this.samplejsoninput.properties[key]
    }

    public deleteElementInFormData(key) {
        delete this.sampleformdatainput.properties[key]
        const index: number = this.sampleformdatainput.required.indexOf(key);
        if (index !== -1) {
            this.sampleformdatainput.required.splice(index, 1);
        }
    }

    public reset() {
        try {
            this.sampleapispec = JSON.parse(JSON.stringify(this.readonlyapispec))
            this.sampleformdatainput = JSON.parse(JSON.stringify(this.readonlyformdatainput))
            this.samplejsoninput = JSON.parse(JSON.stringify(this.readonlyjsoninput))
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }

    }

    public getAPISpec(isJson: boolean): string {
        try {
            this.sampleapispec.components.schemas.input = isJson ? this.samplejsoninput : this.sampleformdatainput
            return JSON.stringify(this.sampleapispec);
        }
        catch (Exception) {
            this.messageService.error("Some error occured", "Error")
        }

    }

    public getAPIPath() {
        return JSON.stringify(this.sampleapispec.paths)
    }
}