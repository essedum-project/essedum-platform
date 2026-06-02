import { Users } from "./users";

import { Project } from "./project";

import { Role } from "./role";
import { Portfolio } from "./portfolio";

export class UserProjectRole {
 id: number;
 user_id: Users;
 project_id: Project;
 role_id: Role;
 portfolio_id: Portfolio;
 time_stamp: Date;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.user_id = json.user_id;
   this.project_id = json.project_id;
   this.role_id = json.role_id;
   this.portfolio_id = json.portfolio_id;
   this.time_stamp = json.time_stamp;
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
