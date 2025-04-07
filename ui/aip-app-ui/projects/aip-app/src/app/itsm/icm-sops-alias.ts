import   { Project } from 'com-lib-util';

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
export class IcmSopsAlias{
    
    alias_id : number;
    name : string;
    description:string;
    projectId: number;
    constructor(json? : any) {
        if (json != null) {
            this.description  = json.description ;
            this.alias_id  = json.alias_id ;
            this.name  = json.name ;
            this.projectId=json.projectId;
        }
    }

    // Utils

    static toArray(jsons : any[]) : IcmSopsAlias[] {
        let icm_sopss : IcmSopsAlias[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                icm_sopss.push(new IcmSopsAlias(json));
            }
        }
        return icm_sopss;
    }
}
