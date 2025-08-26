import { UsmModule } from "./usm-module";

//
export class UsmPermissions {
 id: number;
 module: string;
 permission: string;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.module = json.module;
   this.permission = json.permission;
  }
 }

 // Utils

 static toArray(jsons: any[]): UsmPermissions[] {
  let usm_permissionss: UsmPermissions[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    usm_permissionss.push(new UsmPermissions(json));
   }
  }
  return usm_permissionss;
 }
}
