/**
* The MIT License (MIT)
* Copyright © 2025 Infosys Limited
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { Role } from "./role";
import { Portfolio } from "./portfolio";

export class Project {
  id: number;
  name: string;
  description: string;
  lastUpdated: any;
  logo: any;
  defaultrole: Boolean;
  portfolioId: Portfolio;
  projectdisplayname: string;
  theme: string;
  logoName: string;
  timeZone: string;
  disableExcel: Boolean;
  createdDate : any;
  projectAutologin: Boolean;
  autoUserProject: Boolean;
  autologinRole : Role;
  is_active: boolean;
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
      this.is_active = json.is_active !== undefined ? json.is_active : true;
      if(json.autoUserProject==null) this.autoUserProject = false;
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
