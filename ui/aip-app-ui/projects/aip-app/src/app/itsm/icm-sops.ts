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
import { IcmSopsAlias } from './icm-sops-alias'
export class IcmSops{
    
    id : number;
    name : string;
    description : string;
    createdBy : string;
    createdByDate : any;
    aliasId:IcmSopsAlias;
    aliasType:string
    sopDocName : string;
    sopDocContentType : string;
    sopDoc : any;
    projectId: number;
    details:string;
    workflowName:string;
    workflowEngine:string;
    flowchartJson:string;
    constructor(json? : any) {
        if (json != null) {
            this.id  = json.id ;
            this.name  = json.name ;
            this.description  = json.description ;
            this.createdBy=json.createdBy
            this.createdByDate  = json.createdByDate ;
            this.aliasId=json.aliasId;
            this.aliasType=json.aliasType;
            this.sopDocName=json.sopDocName;
            this.sopDocContentType=json.sopDocContentType;
            this.sopDoc=json.sopDoc;
          this.projectId=json.projectId;  
          this.details=json.details;
          this.workflowName=json.workflowName;
          this.workflowEngine=json.workflowEngine;
          this.flowchartJson=json.flowchartJson
        }
    }

    // Utils

    static toArray(jsons : any[]) : IcmSops[] {
        let icm_sopss : IcmSops[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                icm_sopss.push(new IcmSops(json));
            }
        }
        return icm_sopss;
    }
}
