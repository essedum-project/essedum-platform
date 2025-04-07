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
// import {Users} from 'projects/com-lib-util/src/public-api';
import { Users } from 'com-lib-util';
import {Category} from './category';
export class Tickets{
    
    ticketid : string;
    id : number;
    summary : string;
    creationdate : any;
    priority : string;
    group : string;
    resource : string;
    status : string;
    closeddate : any;
    user : Users;
    responseDate : any;
    responsetime : any;
    isResponseDelayed : boolean;
    category : Category;
    constructor(json? : any) {
        if (json != null) {
            this.ticketid  = json.ticketid ;
            this.id  = json.id ;
            this.summary  = json.summary ;
            this.creationdate  = json.creationdate ;
            this.priority  = json.priority ;
            this.group  = json.group ;
            this.resource  = json.resource ;
            this.status  = json.status ;
            this.closeddate  = json.closeddate ;
            this.user  = json.user ;
            this.responseDate  = json.responseDate ;
            this.responsetime  = json.responsetime ;
            this.isResponseDelayed  = json.isResponseDelayed ;
            this.category  = json.category ;
        }
    }

    // Utils

    static toArray(jsons : any[]) : Tickets[] {
        let ticketss : Tickets[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                ticketss.push(new Tickets(json));
            }
        }
        return ticketss;
    }
}
