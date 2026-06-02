export class MLOpsSwaggerAPISpec {

    constructor() { }

    apispec = {
        "openapi": "3.0.1",
        "info": {
            "title": "LFN AI Platform - MLOps",
            "description": "API documentation for LFN AI Platform",
            "version": "vi"
        },
        "servers": [
            {
                "url": "server_host_url"
            }
        ],
        "security": [
            {
                "Basic": []
            }
        ],
        "paths": {
            "/api/aip/service/v1/endpoints/{endpoint_id}": {
                "get": {
                    "tags": [],
                    "description": "Gets or Deletes an Endpoint.",
                    "alias": "projects_endpoints_get",
                    "parameters": [
                        {
                            "name": "endpoint_id",
                            "value": "endpoint__id",
                            "in": "path",
                            "required": true,
                            "description": "",
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "adapter_instance",
                            "value": "{datasource}",
                            "in": "query",
                            "required": false,
                            "description": "",
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "project",
                            "value": "{org}",
                            "in": "query",
                            "required": false,
                            "description": "",
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "isCached",
                            "value": "false",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        }
                    ],
                    "responses": {
                        "204": {
                            "description": "",
                            "content": {}
                        }
                    }
                }
            },
            "/api/aip/service/v1/endpoints/{endpoint_id}/explain": {
                "post": {
                    "tags": [],
                    "description": "Perform an online explanation. If deployedModelId is specified, the corresponding endpoints.deployModel must have explanationSpec populated. If deployedModelId is not specified, all DeployedModels must have explanationSpec populated. Only deployed AutoML tabular Models have explanationSpec.",
                    "alias": "projects_endpoints_explain_create",
                    "parameters": [
                        {
                            "name": "endpoint_id",
                            "value": "endpoint__id",
                            "in": "path",
                            "required": true,
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "adapter_instance",
                            "value": "{datasource}",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "project",
                            "value": "{org}",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "isCached",
                            "value": "false",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        }
                    ],
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "required": [
                                        "instances"
                                    ],
                                    "type": "object",
                                    "properties": {
                                        "instances": {
                                            "type": "array[object]",
                                            "description": "The instances that are the input to the inference call. A DeployedModel may have an upper limit on the number of instances it supports per request, and when it is exceeded the inference call errors in case of AutoML Models, or, in case of customer created Models, the behaviour is as documented by that Model. The schema of any single instance may be specified via Endpoint's DeployedModels' Model's InferenceSchemata's instanceSchemaUri."
                                        },
                                        "parameters": {
                                            "type": "object",
                                            "description": "The parameters that govern the inference. The schema of the parameters may be specified via Endpoint's DeployedModels' Model's InferenceSchemata's parametersSchemaUri."
                                        },
                                        "deployModelId": {
                                            "type": "string",
                                            "description": "If specified, this ExplainRequest will be served by the chosen DeployedModel, overriding Endpoint.traffic_split."
                                        },
                                        "cloud_explain_model_config": {
                                            "type": "object",
                                            "description": "Config for the LFN AI Cloud"
                                        }
                                    }
                                }
                            }
                        },
                        "required": true
                    },
                    "responses": {
                        "201": {
                            "description": "",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "required": [
                                            "instances"
                                        ],
                                        "type": "object",
                                        "properties": {
                                            "instances": {
                                                "type": "array[object]",
                                                "description": "The instances that are the input to the inference call. A DeployedModel may have an upper limit on the number of instances it supports per request, and when it is exceeded the inference call errors in case of AutoML Models, or, in case of customer created Models, the behaviour is as documented by that Model. The schema of any single instance may be specified via Endpoint's DeployedModels' Model's InferenceSchemata's instanceSchemaUri."
                                            },
                                            "parameters": {
                                                "type": "object",
                                                "description": "The parameters that govern the inference. The schema of the parameters may be specified via Endpoint's DeployedModels' Model's InferenceSchemata's parametersSchemaUri."
                                            },
                                            "deployModelId": {
                                                "type": "string",
                                                "description": "If specified, this ExplainRequest will be served by the chosen DeployedModel, overriding Endpoint.traffic_split."
                                            },
                                            "cloud_explain_model_config": {
                                                "type": "object",
                                                "description": "Config for the LFN AI Cloud"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/aip/service/v1/endpoints/{endpoint_id}/infer": {
                "post": {
                    "tags": [],
                    "description": "Perform an online inference.",
                    "alias": "projects_endpoints_infer_create",
                    "parameters": [
                        {
                            "name": "endpoint_id",
                            "value": "endpoint__id",
                            "in": "path",
                            "required": true,
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "adapter_instance",
                            "value": "{datasource}",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "project",
                            "value": "{org}",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "isCached",
                            "value": "false",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        }
                    ],
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "required": [
                                        "instances"
                                    ],
                                    "type": "object",
                                    "properties": {
                                        "instances": {
                                            "type": "array[object]",
                                            "description": "The instances that are the input to the inference call. A DeployedModel may have an upper limit on the number of instances it supports per request, and when it is exceeded the inference call errors in case of AutoML Models, or, in case of customer created Models, the behaviour is as documented by that Model. The schema of any single instance may be specified via Endpoint's DeployedModels' Model's InferenceSchemata's instanceSchemaUri."
                                        },
                                        "parameters": {
                                            "type": "object",
                                            "description": "The parameters that govern the inference. The schema of the parameters may be specified via Endpoint's DeployedModels' Model's InferenceSchemata's parametersSchemaUri."
                                        },
                                        "deployModelId": {
                                            "type": "string",
                                            "description": "If specified, this ExplainRequest will be served by the chosen DeployedModel, overriding Endpoint.traffic_split."
                                        },
                                        "cloud_infer_model_config": {
                                            "type": "object",
                                            "description": "Config for the LFN AI Cloud"
                                        }
                                    }
                                }
                            }
                        },
                        "required": true
                    },
                    "responses": {
                        "201": {
                            "description": "",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "required": [
                                            "instances"
                                        ],
                                        "type": "object",
                                        "properties": {
                                            "instances": {
                                                "type": "array[object]",
                                                "description": "The instances that are the input to the inference call. A DeployedModel may have an upper limit on the number of instances it supports per request, and when it is exceeded the inference call errors in case of AutoML Models, or, in case of customer created Models, the behaviour is as documented by that Model. The schema of any single instance may be specified via Endpoint's DeployedModels' Model's InferenceSchemata's instanceSchemaUri."
                                            },
                                            "parameters": {
                                                "type": "object",
                                                "description": "The parameters that govern the inference. The schema of the parameters may be specified via Endpoint's DeployedModels' Model's InferenceSchemata's parametersSchemaUri."
                                            },
                                            "deployModelId": {
                                                "type": "string",
                                                "description": "If specified, this ExplainRequest will be served by the chosen DeployedModel, overriding Endpoint.traffic_split."
                                            },
                                            "cloud_infer_model_config": {
                                                "type": "object",
                                                "description": "Config for the LFN AI Cloud"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/aip/service/v1/endpoints/{endpoint_id}/undeploy_models": {
                "post": {
                    "tags": [],
                    "description": "Undeploys all the models from an Endpoint.",
                    "alias": "projects_endpoints_undeploy_models_create",
                    "parameters": [
                        {
                            "name": "endpoint_id",
                            "value": "endpoint__id",
                            "in": "path",
                            "required": true,
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "adapter_instance",
                            "value": "{datasource}",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "project",
                            "value": "{org}",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "name": "isCached",
                            "value": "false",
                            "in": "query",
                            "required": false,
                            "schema": {
                                "type": "string"
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "",
                            "content": {}
                        }
                    }
                }
            }
        }
    }

    apispec3 = {
        "openapi": "3.0.1",
        "info": {
            "title": "LFN AI Platform - AICLOUD",
            "description": "LFN AI Platform - AICLOUD",
            "version": "vi"
        },
        "servers": [
            {
                "url": "server_host_url"
            }
        ],
        "security": [
            {
                "Basic": []
            }
        ],
        "paths": {
            "/v1/language/generate/models/mixtral8x7b-instruct/versions/2/infer": {
                "get": {
                    "tags": [],
                    "description": "mixtral",
                    "alias": "mixtral",
                    "parameters": [],
                    "responses": {
                        "204": {
                            "description": "",
                            "content": {}
                        }
                    }
                }
            }
        }
        
    }
    apispec2 = 
        {
            "openapi": "3.0.1",
            "info": {
              "title": "LFN AI Platform",
              "description": "LFN AI Platform",
              "version": "vi"
            },
            "servers": [
              {
                "url": "server_host_url"
              }
            ],
            "security": [
              {
                "Basic": []
              }
            ],
            "paths": {
              "/<inference_url_example_for_get_request>": {
                "get": {
                  "tags": [],
                  "description": "",
                  "alias": "",
                  "parameters": [],
                  "responses": {
                    "204": {
                      "description": "",
                      "content": {}
                    }
                  }
                }
              },
              "/<inference_url_example_for_post_request>": {
                "post": {
                  "tags": [],
                  "description": "",
                  "alias": "",
                  "parameters": [],
                  "requestBody": {
                    "description": "Request body",
                    "required": true,
                    "content": {
                      "application/json": {
                        "schema": {
                          "type": "object",
                          "properties": {
                            "model": {
                              "type": "string",
                              "example": "/home/jovyan/mify-2b-itops"
                            },
                            "prompt": {
                              "type": "string",
                              "example": "### Prompt:\n\nYou need to replicate a MySQL database across data centers. Please explain how to create and configure a master-slave relationship using the replication plugin provided by MySQL.\n\n### Response:\n"
                            },
                            "temperature": {
                              "type": "number",
                              "example": 0.4
                            },
                            "top_p": {
                              "type": "number",
                              "example": 0.97
                            },
                            "max_tokens": {
                              "type": "integer",
                              "example": 500
                            },
                            "frequency_penalty": {
                              "type": "number",
                              "example": 0
                            },
                            "stop": {
                              "type": "string",
                              "example": " Question:"
                            }
                          }
                        }
                      }
                    },
                    "value": "{\"inputText\":\"Input by User\"}"
                  },
                  "responses": {
                    "200": {
                      "description": "Successful inference",
                      "content": {
                        "application/json": {
                          "schema": {
                            "type": "object",
                            "properties": {
                              "response": {
                                "type": "string",
                                "example": "Master-slave replication in MySQL is set up by configuring a master server and one or more slave servers..."
                              }
                            }
                          }
                        }
                      }
                    },
                    "400": {
                      "description": "Invalid request parameters",
                      "content": {}
                    },
                    "500": {
                      "description": "Server error",
                      "content": {}
                    },
                    "default": {
                      "description": "Unexpected error",
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
            }
          }
    
    public getAPISpec2() {
        return this.apispec2
    }
    public getAPISpec() {
        return this.apispec
    }
    
}