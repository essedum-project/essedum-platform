import { Role } from "./role";
import { UsmPortfolio } from "./usm-portfolio";


export class OrgProject {
    id: number;
    name: string;
    description: string;
    lastUpdated: Date;
    logo: any;
    defaultrole: Boolean;
    logoName: string
    portfolioId: UsmPortfolio;
    projectdisplayname: string;
    domainName: string;
    productDetails: string;
    theme: string;
    timeZone:string;
    azureOrgId:string
    ModulesOrg: any;
    createdDate: any;
    projectAutologin: Boolean;
    autologinRole : Role;
    User: any;
    Groups: any;
    disableExcel: Boolean;


    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.name = json.name;
            this.description = json.description;
            this.lastUpdated = json.lastUpdated;
            this.logo = json.logo;
            this.logoName = json.logoName;
            this.defaultrole = json.defaultrole;
            this.portfolioId = json.portfolioId;
            this.projectdisplayname = json.projectdisplayname;
            this.productDetails = json.productDetails;
            this.domainName = json.domainName;
            this.theme = json.theme;
            this.timeZone=json.timeZone;
            this.projectAutologin = json.projectAutologin
            this.autologinRole = json.autologinRole
            this.azureOrgId=json.azureOrgId;
            this.ModulesOrg = json.ModulesOrg;
            this.User = json.User;
            this.Groups = json.Groups;
        }
    };
    static toArray(jsons: any[]): OrgProject[] {
        let projects: OrgProject[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                projects.push(new OrgProject(json));
            }
        }
        return projects;
    }
}
