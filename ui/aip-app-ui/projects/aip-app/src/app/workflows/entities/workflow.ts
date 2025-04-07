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


export class Workflow {

    id: number;
    name: string;
    description: string;
    wkspec: any;
    workflowData: any;
    currentStage: any;
    corelid: any;
    organization: string;
    updatedBy: string;
    updatedOn: Date;
  alias: any;
    constructor(json?: any) {
        if (json != null) {
            this.id  = json.id ;
            this.name  = json.name ;
            this.alias  = json.alias ;
            this.description  = json.description ;
            this.wkspec  = json.wkspec ;
            this.workflowData  = json.workflowData?json.workflowData:json.wk_data ;
            this.currentStage = json.currentStage;
            this.corelid = json.corelid;
            this.organization = json.organization;
            this.updatedBy = json.updatedBy;
            this.updatedOn = json.updatedOn;

        }
    }

    // Utils

    static toArray(jsons: any[]): Workflow[] {
        const streaming_servicess: Workflow[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                streaming_servicess.push(new Workflow(json));
            }
        }
        return streaming_servicess;
    }
}
