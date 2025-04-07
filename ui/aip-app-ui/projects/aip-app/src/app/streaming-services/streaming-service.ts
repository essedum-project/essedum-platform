//
//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

// import { Jobs } from '../jobs/jobs';

export class StreamingServices {

    cid: number;
    alias: string;
    name: string;
    description: string;
    job_id: string;
    json_content: string;
    jsonContent: string;
    type: string;
    groups: any;
    organization: string;
    created_date: Date;
    created_by: string;
    modified_date: Date;
    modified_by: string;
    // jobs: Jobs[];
    finished: number;
    running: number;
    killed: number;
    error: number;
    tags: any;
    version: number;
    is_app:boolean;
    interfacetype: string;
    is_template:boolean
    constructor(json?: any) {
        if (json != null) {
            this.cid  = json.cid ;
            this.alias = json.alias;
            this.name  = json.name ;
            this.description  = json.description ;
            this.job_id  = json.job_id ;
            this.json_content  = json.json_content ;
            this.jsonContent  = json.jsonContent ;
            this.groups = json.groups;
            this.type = json.type;
            this.organization = json.organization;
            this.created_date = json.createdDate?json.createdDate:json.created_date;
            this.created_by = json.created_by;
            this.modified_date = json.lastModifiedDate;
            this.modified_by = json.lastModifiedBy;
            // this.jobs = Jobs.toArray(json.icipJobs);
            this.finished = json.finished;
            this.running = json.running;
            this.killed = json.killed;
            this.error = json.error;
            this.tags = json.tags;
            this.version = json.version;
            this.interfacetype = json.interfacetype;
            this.is_template = json.is_template;
            this.is_app=json.is_app;
        }
    }

    // Utils

    static toArray(jsons: any[]): StreamingServices[] {
        const streaming_servicess: StreamingServices[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                streaming_servicess.push(new StreamingServices(json));
            }
        }
        return streaming_servicess;
    }
}
