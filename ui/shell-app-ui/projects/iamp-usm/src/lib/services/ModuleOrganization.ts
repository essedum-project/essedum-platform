import { OrgProject } from '../models/OrgProject'
import { UsmModules } from './module'

export class ModuleOrganization {

    id:number
    module:UsmModules
    startdate:any
    enddate:any
    subscriptionstatus:boolean
    organisation:OrgProject
    subscription:string

    constructor(json?: any){
        if (json != null) {
            this.id = json.id;
            this.module = json.module;
            this.startdate = json.startdate;
            this.enddate = json.enddate;
            this.subscriptionstatus = json.subscriptionstatus;
            this.organisation = json.organisation;
            this.subscription = json.subscription;
           
           
        }
    };
    static toArray(jsons: any[]): ModuleOrganization[] {
        let moduleOrganization: ModuleOrganization[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                moduleOrganization.push(new ModuleOrganization(json));
            }
        }
        return moduleOrganization;
    }

}