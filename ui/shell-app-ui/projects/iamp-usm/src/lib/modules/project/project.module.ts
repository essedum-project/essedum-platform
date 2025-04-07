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

//  Project ...
import { ProjectService } from "../../services/project.service";

import { HelperService } from "../../services/helper.service";
import { MessageService } from "../../services/message.service";
import { AuthService } from "../../services/auth.service";
import { ProjectListViewComponent } from "../../entities/project/project-list-view.component";
import { NgxPaginationModule } from "ngx-pagination";
import { UserProjectRoleModule } from "../user-project-role/user-project-role.module";
//one to many relation
import { NgBusyModule } from "ng-busy";
import { AuditService } from "../../services/audit.service";
import { ViewOrganizationComponent } from "../../entities/org-dashboard/view-organization/view-organization.component";
import { OrgDashboardComponent } from "../../entities/org-dashboard/org-dashboard.component";
import { CreateOrgaanizationComponent } from "../../entities/org-dashboard/create-orgaanization/create-orgaanization.component";
import { NgbModule, NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
// import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
@NgModule({
 declarations: [ProjectListViewComponent, ViewOrganizationComponent, OrgDashboardComponent, CreateOrgaanizationComponent],
 imports: [
  //material
//   CommonModule,
  SharedModule,

  //angular
  FormsModule,  
  RouterModule,
  //ng2 bootstrap
  // BsDropdownModule.forRoot(),
  // TimepickerModule.forRoot(),
  NgxPaginationModule,
  NgbPaginationModule,
  NgbModule,
  //prime-ng
  // FileUploadModule
  UserProjectRoleModule,
  NgBusyModule,
 ],
 exports: [ProjectListViewComponent, NgxPaginationModule, UserProjectRoleModule],
 providers: [
  ProjectService,
  //ConfirmationService,
  HelperService,
  MessageService,
  AuthService,
  AuditService
 ],
})
export class ProjectModule {}
