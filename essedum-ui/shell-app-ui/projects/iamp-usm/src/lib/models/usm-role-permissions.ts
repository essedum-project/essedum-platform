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
import { UsmPermissions } from "./usm-permissions";

//
export class UsmRolePermissions {
 id: number;
 role: Role;
 permission: UsmPermissions[] = []; // Changed to array to support multiple selection
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.role = json.role;
   
   // Handle both array and single permission
   if (json.permission) {
     if (Array.isArray(json.permission)) {
       this.permission = json.permission;
     } else {
       // If it's a single permission, convert to array
       this.permission = [json.permission];
     }
   } else {
     this.permission = [];
   }
  }
 }

 // Utils

 static toArray(jsons: any[]): UsmRolePermissions[] {
  let usm_role_permissionss: UsmRolePermissions[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    usm_role_permissionss.push(new UsmRolePermissions(json));
   }
  }
  return usm_role_permissionss;
 }
}
