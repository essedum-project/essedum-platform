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

// import { Project } from "./project";

export class Role {
 projectId: number;
 id: number;
 name: string;
 description: string;
 permission: boolean;
 roleadmin: boolean;
 projectadmin: boolean;
 portfolioId: number;
 projectAdminId: number;
 constructor(json?: any) {
  this.projectId = this.getProjectId();
  if (json != null) {
   this.id = json.id;
   this.name = json.name;
   this.description = json.description;
   this.permission = json.permission;
   this.projectId = json.projectId;
   this.roleadmin = json.roleadmin;
   this.projectadmin = json.projectadmin;
   this.portfolioId = json.portfolioId;
   this.projectAdminId = json.projectAdminId;
  }
 }
 getProjectId() {
  let project: any;
  try {
   project = JSON.parse(sessionStorage.getItem("project"));
  } catch (e : any)  {
   project = null;
   console.error("JSON.parse error - ", e.message);
  }
  let projectId = project.id;
  if (projectId == undefined || projectId === null) {
  } else if (isNaN(projectId)) {
  } else return projectId;
 }

 // Utils

 static toArray(jsons: any[]): Role[] {
  let roles: Role[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    roles.push(new Role(json));
   }
  }
  return roles;
 }
}
