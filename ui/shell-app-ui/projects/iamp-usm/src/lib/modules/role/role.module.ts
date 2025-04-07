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
// Template pack-angular:web/src/app/modules/entity.module.ts.e.vm
//

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
//material module
import { SharedModule } from "../../shared-modules/shared.module";


//  Role ...
import { RoleService } from "../../services/role.service";
import { RoleListComponent } from "../../entities/role/role-list.component";
import { RoleDetailComponent } from "../../entities/role/role-detail.component";

import { HelperService } from "../../services/helper.service";
import { MessageService } from "../../services/message.service";
import { AuthService } from "../../services/auth.service";
import { RoleDetailListComponent } from "../../entities/role/role-detail-list.component";
import { NgxPaginationModule } from "ngx-pagination";
// import { NgBusyModule} from 'ng-busy';
//one to many relation
import { UserProjectRoleModule } from "../user-project-role/user-project-role.module";
import { RoleDetailNewComponent } from "../../entities/role/role-detail-new.component";
import { NgBusyModule } from "ng-busy";
import { RoleRoleComponent } from "../../entities/Role-Role/role-role.component";
import { RoleroleService } from "../../services/role-role.service";

@NgModule({
 declarations: [
  RoleListComponent,
  RoleDetailComponent,
  RoleDetailListComponent,
  RoleDetailNewComponent,
  RoleRoleComponent,
  //  NgBusyModule
 ],
 imports: [
  //material
  SharedModule,
  //angular
  FormsModule,
  
  RouterModule,
//   CommonModule,
  //ng2 bootstrap
  NgxPaginationModule,
  UserProjectRoleModule,
  NgBusyModule
 ],
 exports: [
  RoleListComponent,
  RoleDetailComponent,
  RoleDetailListComponent,
  UserProjectRoleModule,
  RoleDetailNewComponent,
  RoleRoleComponent,
 ],
 providers: [
  RoleService,
  // ConfirmationService,
  HelperService,
  MessageService,
  AuthService,
  RoleroleService
 ],
 entryComponents: [RoleDetailNewComponent],
})
export class RoleModule {}
