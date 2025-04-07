// import   { Project } from 'projects/com-lib-util/src/public-api'

//
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/base-entities/entity.ts.e.vm
//
export class IcmProblemType{
    
    automate : boolean;
    automate_assignee : any;
    automate_end_date : any;
    automate_start_date : any;
    description : string;
    eliminate : boolean;
    eliminate_assignee : any;
    eliminate_end_date : any;
    eliminate_start_date : any;
    id : number;
    name : string;
    selfservice : boolean;
    selfservice_assignee : any;
    selfservice_end_date : any;
    selfservice_start_date : any;
    projectId: number;
    constructor(json? : any) {
        if (json != null) {
            this.automate  = json.automate ;
            this.automate_assignee  = json.automate_assignee ;
            this.automate_end_date  = json.automate_end_date ;
            this.automate_start_date  = json.automate_start_date ;
            this.description  = json.description ;
            this.eliminate  = json.eliminate ;
            this.eliminate_assignee  = json.eliminate_assignee ;
            this.eliminate_end_date  = json.eliminate_end_date ;
            this.eliminate_start_date  = json.eliminate_start_date ;
            this.id  = json.id ;
            this.name  = json.name ;
            this.selfservice  = json.selfservice ;
            this.selfservice_assignee  = json.selfservice_assignee ;
            this.selfservice_end_date  = json.selfservice_end_date ;
            this.selfservice_start_date  = json.selfservice_start_date ;
            this.projectId=json.projectId;
        }
    }

    // Utils

    static toArray(jsons : any[]) : IcmProblemType[] {
        let icm_problem_types : IcmProblemType[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                icm_problem_types.push(new IcmProblemType(json));
            }
        }
        return icm_problem_types;
    }
}
