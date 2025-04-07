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
