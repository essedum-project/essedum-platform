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

export class Jobs {

    id: number;
    jobId: string;
    streaming_service: string;
    submittedBy: string;
    jobStatus: string;
    version: number;
    submitted_on: Date;
    validation: string;
    type: string;
    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.jobId = json.jobId;
            this.streaming_service = json.streamingService;
            this.submittedBy = json.submittedBy;
            this.jobStatus = json.jobStatus;
            this.version = json.version;
            this.validation = json.validation;
            this.submitted_on = json.submitted_on;
            this.type = json.jobType;
        }
    }

    // Utils

    static toArray(jsons: any[]): Jobs[] {
        const jobs: Jobs[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                jobs.push(new Jobs(json));
            }
        }
        return jobs;
    }
}
