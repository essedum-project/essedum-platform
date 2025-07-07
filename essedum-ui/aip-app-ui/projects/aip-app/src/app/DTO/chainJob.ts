
export class ChainJob {

    id: number;
    jobId:String;
    jobName: string;
    jobDesc: string;
    org:string;
    jobStatus: string;
    submittedBy: string;
    submitted_on: Date;
    flowjson: any;
    parallelchain: number;

    type: string;
    log:String;

    jsonContent:JSONContent;
    messageService: any;
    constructor(json?: any) {
        try{
            if (json != null) {
                this.id = json.id;
                this.jobId = json.jobId;
                this.flowjson = json.flowjson;
                this.jobName = json.jobName;
                this.jobDesc=json.jobDesc||json.description;
                this.submittedBy = json.submittedBy;
                this.jobStatus = json.jobStatus;
                this.submitted_on = json.submitted_on;
                this.type = json.jobType;
                this.log=json.log;
                this.jsonContent=new JSONContent(JSON.parse(json.jsonContent));
            }

        }
        catch(Exception){
        this.messageService.error("Some error occured", "Error")
        }
       
    }

    // Utils

    static toArray(jsons: any[]): ChainJob[] {
        const jobs: ChainJob[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                jobs.push(new ChainJob(json));
            }
        }
        return jobs;
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

export class JSONContent{
myDate:String;
myTime:String;
expression:String;
timeZone:String;
runNow:boolean;
element:Elements;
runtime:String;


constructor(json?: any) {
    if (json != null) {
        // this.myDate=json.myDate;
        // this.myTime=json.myTime;
        // this.expression=json.expression;
        // this.timeZone=json.timeZone;
        this.runNow=json.runNow;
        // this.runtime=json.runtime;
        this.element=json.element;
    }
}
}

export class Elements{
    elements:Element2[];
    // params:string;
}