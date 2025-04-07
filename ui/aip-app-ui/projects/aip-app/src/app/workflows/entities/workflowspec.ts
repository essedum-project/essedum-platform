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


export class WorkflowSpec {

    id: number;
    wkname: string;
    wkspec: any;
    constructor(json?: any) {
        if (json != null) {
            this.id  = json.id ;
            this.wkname  = json.wkname ;
            this.wkspec  = json.wkspec ;
        }
    }

    // Utils

    static toArray(jsons: any[]): WorkflowSpec[] {
        const streaming_servicess: WorkflowSpec[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                streaming_servicess.push(new WorkflowSpec(json));
            }
        }
        return streaming_servicess;
    }
}
