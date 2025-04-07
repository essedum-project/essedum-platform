export class AIWorkerDTO {

    id: number;
    alias: String;
    name: String;
    description: String;
    llm: String;
    knowledgeBase: String;
    planner: String;
    validator: String;
    generator: String;
    executor: string;
    taskGroup: string;

    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.alias = json.alias;
            this.name = json.name;
            this.description = json.description;
            this.llm = json.llm;
            this.knowledgeBase = json.knowledgeBase;
            this.planner = json.planner;
            this.validator = json.validator;
            this.generator = json.generator;
            this.executor = json.executor;
            this.taskGroup = json.taskGroup;
        }
    }
}

export class userInputParamsGrid {
    name: string;
    value: string;
  }