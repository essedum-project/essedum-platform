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

export class Datasource {

    id:number;
    alias: string;
    name: string;
    type: string;
    description: string;
    connectionDetails: string;
    organization: string;
    lastmodifiedby : string ;
	lastmodifieddate : any ;
    category: string;
    extras:any;
    interfacetype: string;

    constructor(json?: any) {
        if (json != null) {
            this.id=json.id?json.id:0;
            this.alias = json.alias;
            this.name  = json.name ;
            this.type = json.type;
            this.description = json.description;
            this.connectionDetails = json.connectionDetails;
            this.organization = json.organization;
            this.lastmodifiedby = json.lastmodifiedby;
            this.lastmodifieddate = json.lastmodifieddate;
            this.category = json.category;
            this.extras=json.extras;
            this.interfacetype=json.interfacetype;
        }
    }

    // Utils

    static toArray(jsons: any[]): Datasource[] {
        const datasets: Datasource[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                datasets.push(new Datasource(json));
            }
        }
        return datasets;
    }
}
