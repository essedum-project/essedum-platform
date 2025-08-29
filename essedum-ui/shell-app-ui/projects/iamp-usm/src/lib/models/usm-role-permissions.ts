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
