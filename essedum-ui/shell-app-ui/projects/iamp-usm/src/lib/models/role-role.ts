
import { Role } from "./role";

export class Roletorole {
    id: number;
    parentRoleId: Role;
    childRoleId: Role;
    constructor(json?: any) {
     if (json != null) {
      this.id = json.id;
      this.parentRoleId = json.parentRoleId;
      this.childRoleId = json.childRoleId;
     }
    }
   
    // Utils
   
    static toArray(jsons: any[]): Roletorole[] {
     let usm_permissionss: Roletorole[] = [];
     if (jsons != null) {
      for (let json of jsons) {
       usm_permissionss.push(new Roletorole(json));
      }
     }
     return usm_permissionss;
    }
   }
   