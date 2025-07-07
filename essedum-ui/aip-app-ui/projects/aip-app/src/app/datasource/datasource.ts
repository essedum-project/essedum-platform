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
