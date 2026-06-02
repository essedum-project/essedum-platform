import { Context } from "./context";
import { Users } from "./users";
import { OrgUnit } from "./org-unit";

export class UserUnit {
 id: number;
 context: Context;
 user: Users;
 unit: OrgUnit;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.context = json.context;
   this.user = json.user;
   this.unit = json.unit;
  }
 }

 // Utils

 static toArray(jsons: any[]): UserUnit[] {
  let user_units: UserUnit[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    user_units.push(new UserUnit(json));
   }
  }
  return user_units;
 }
}
