import { Role } from "./role";
import { UsmPortfolio } from "./usm-portfolio";
export declare class Project {
    id: number;
    name: string;
    description: string;
    lastUpdated: any;
    logo: any;
    defaultrole: Boolean;
    portfolioId: UsmPortfolio;
    projectdisplayname: string;
    theme: string;
    logoName: string;
    timeZone: string;
    disableExcel: Boolean;
    createdDate: any;
    projectAutologin: Boolean;
    autologinRole: Role;
    constructor(json?: any);
    static toArray(jsons: any[]): Project[];
}
