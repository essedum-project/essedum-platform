import { Role } from "./role";
import { UsmPortfolio } from "./usm-portfolio";

export class Project {
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
  createdDate : any;
  projectAutologin: Boolean;
  autologinRole : Role;
  constructor(json?: any) {
    if (json != null) {
      this.id = json.id;
      this.name = json.name;
      this.description = json.description;
      this.lastUpdated = json.lastUpdated;
      this.logo = json.logo;
      this.defaultrole = json.defaultrole;
      this.portfolioId = json.portfolioId;
      this.projectdisplayname = json.projectdisplayname;
      this.theme = json.theme;
      this.logoName = json.logoName;
      this.timeZone = json.timeZone;
      this.disableExcel = json.disableExcel;
      this.createdDate = json.createdDate
      this.projectAutologin = json.projectAutologin
      this.autologinRole = json.autologinRole
    }
  }

  // Utils

  static toArray(jsons: any[]): Project[] {
    let projects: Project[] = [];
    if (jsons != null) {
      for (let json of jsons) {
        projects.push(new Project(json));
      }
    }
    return projects;
  }
}
