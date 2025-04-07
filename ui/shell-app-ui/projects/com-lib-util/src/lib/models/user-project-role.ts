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

import { Users } from "./users";

import { Project } from "./project";

import { Role } from "./role";
import { UsmPortfolio } from "./usm-portfolio";

export class UserProjectRole {
 id: number;
 user_id: Users;
 project_id: Project;
 role_id: Role;
 portfolio_id: UsmPortfolio;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.user_id = json.user_id;
   this.project_id = json.project_id;
   this.role_id = json.role_id;
   this.portfolio_id = json.portfolio_id;
  }
 }

 // Utils

 static toArray(jsons: any[]): UserProjectRole[] {
  let user_project_roles: UserProjectRole[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    user_project_roles.push(new UserProjectRole(json));
   }
  }
  return user_project_roles;
 }
}
