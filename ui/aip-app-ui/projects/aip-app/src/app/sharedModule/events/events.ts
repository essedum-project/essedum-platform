export class Events {

    id: number;
    eventname: string;
    jobdetails: string;
    organization: string;
    description:string;
    body:string
    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.eventname = json.eventname;
            this.jobdetails = json.jobdetails;
            this.organization = json.organization;
            this.description = json.description;
            this.body = json.body;
        }
    }

    // Utils

    static toArray(jsons: any[]): Events[] {
        const jobs: Events[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                jobs.push(new Events(json));
            }
        }
        return jobs;
    }
}

export class JobDetails {
    name: string;
    type: string;
  runtime: string;

    constructor(json?: any) {
        if (json != null) {
            this.name = json.name;
            this.type = json.type;
        }
    }
}