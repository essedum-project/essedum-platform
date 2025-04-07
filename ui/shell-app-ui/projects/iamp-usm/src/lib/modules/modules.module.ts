import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DragScrollModule } from "ngx-drag-scroll";
import { FormsModule } from "@angular/forms";
import { DashConstantModule } from "./dash-constant/dash-constant.module";
import { NgBusyModule } from "ng-busy";
import { ProjectModule } from "../modules/project/project.module";
import { RoleModule } from "../modules/role/role.module";
import { UserProjectRoleModule } from "../modules/user-project-role/user-project-role.module";
import { UsersModule } from "../modules/users/users.module";
import { NgxPaginationModule } from "ngx-pagination";
import { MessageService } from "../services/message.service";
import { UsmPortfolioModule } from "./usm-portfolio/usm-portfolio.module";
import { MatDialogModule } from "@angular/material/dialog";
import { DelegateModule } from "./delegate/delegate.module";
import { ProcessModule } from "./process/process.module";
import { CountryTimezoneModule } from "./countryTimezone/countryTimezone.module";
import { QuillModule } from "ngx-quill";
import { RoleProcessModule } from "./role-process/role-process.module";
import { StageModule } from "./stage/stage.module";
import { UserUserModule } from "./user-user/user-user.module";
@NgModule({
 imports: [
  CommonModule,
  DragScrollModule,
  ProjectModule,
  NgBusyModule,
  RoleModule,
  UserProjectRoleModule,
  DashConstantModule,
  UsersModule,
  NgxPaginationModule,
  UsmPortfolioModule,
  MatDialogModule,
  DelegateModule,
  ProcessModule,
  CountryTimezoneModule,
  QuillModule.forRoot(),
  RoleProcessModule,
  StageModule,
  UserUserModule
 ],
 declarations: [
  /*SidebarComponent
   */
 ],
 exports: [
  DragScrollModule,
  FormsModule,
  ProjectModule,
  RoleModule,
  UserProjectRoleModule,
  UsersModule,
  UsmPortfolioModule,
  DelegateModule,
  ProcessModule,
  CountryTimezoneModule,
  RoleProcessModule,
  StageModule,
  UserUserModule
 ],
 providers: [MessageService ],
})
export class ModulesModule {}
