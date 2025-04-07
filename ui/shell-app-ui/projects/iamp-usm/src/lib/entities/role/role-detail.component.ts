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
// Template pack-angular:web/src/app/base-entities/entity-detail.component.ts.e.vm
//
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { MessageService } from "../../services/message.service";
import { Role } from "../../models/role";
import { RoleService } from "../../services/role.service";
import { HelperService } from "../../services/helper.service";
import { ProjectService } from "../../services/project.service";
import { Project } from "../../models/project";
import { UsersService } from "../../services/users.service";
import { UsmPortfolio } from "../../models/usm-portfolio";
import { Subscription } from "rxjs/Subscription";
import { IampUsmService } from "../../iamp-usm.service";
import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
@Component({
  templateUrl: "role-detail.component.html",
  providers: [DatePipe],
  selector: "role-detail",
  styleUrls: ["./role-list.component.css"],
})
export class RoleDetailComponent implements OnInit {
  role: Role;
  params_subscription: any;
  edit: boolean = false;
  view: boolean = false;
  displayProjectDropdown: Boolean = false;
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
  projectList = new Array<Project>();
  viewRole: boolean = false;
  lengthNameErrorMessage: String = "Maximum Character Limit Reached";
  showNameLengthErrorMessage: Boolean = false;
  showDescLengthErrorMessage: Boolean = false;
  busy: Subscription;
  rolesArray: any;
  allRole = new Role();
  auth: string = "";
  isAuth: boolean = true;
  permissionList: any[];
  selectedPermissionList: any[];
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  createFlag: boolean = false;
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public messageService: MessageService,
    public helperService: HelperService,
    public elementRef: ElementRef,
    public roleService: RoleService,
    private projectService: ProjectService,
    private usersService: UsersService,
    private usmService: IampUsmService,
    private telemetryService: LeapTelemetryService,
  ) {}

  ngOnInit() {
    this.role = new Role();
    if (sessionStorage.getItem("usmAuthority")) {
      sessionStorage.removeItem("usmAuthority");
    }
    this.usmService.getPermission("usm").subscribe(
      (resp) => {
        this.permissionList = JSON.parse(resp);
        let temp = "";
        if (this.permissionList.length >= 1) {
          this.permissionList.forEach((ele) => {
            temp += "" + ele.permission + ",";
          });
          temp = temp.substring(0, temp.length - 1);
          sessionStorage.setItem("usmAuthority", temp);
        } else {
          sessionStorage.setItem("usmAuthority", "");
        }
      },
      (error) => {},
      () => {
        this.auth = sessionStorage.getItem("usmAuthority");
        this.selectedPermissionList = this.auth.split(",");
        this.selectedPermissionList.forEach((ele) => {
          if (ele === "edit") {
            this.editFlag = true;
          }
          if (ele === "view") {
            this.viewFlag = true;
          }
          if (ele === "delete") {
            this.deleteFlag = true;
          }
          if (ele === "create") {
            this.createFlag = true;
          }
        });
      }
    );
    this.fetchRoles();
    this.params_subscription = this.route.params.subscribe((params) => {
      let id = params["rid"];
      if (id) {
        if (window.location.href.includes("edit")) {
          this.edit = true;
          this.view = false;
        } else {
          this.view = true;
          this.edit = false;
          this.viewRole = true;
        }
        this.roleService.getRole(window.atob(id)).subscribe(
          (roles) => {
            this.role = roles;
            if (this.role.projectId == undefined || this.role.projectId == null) this.displayProjectDropdown = false;
            else this.displayProjectDropdown = true;
          },
          (error) => this.messageService.error("Could not fetch role", "IAMP")
        );
      } else {
        this.edit = false;
        this.view = false;
        this.viewRole = false;
      }
    });
    this.fetchProjects();
  }

  fetchProjects() {
    let project = new Project();
    let role: Role;
    try {
      role = JSON.parse(sessionStorage.getItem("role"));
    } catch (e) {
      role = null;
      console.error("JSON.parse error - ", e.message);
    }
    if (role.roleadmin) {
      let portfolio: UsmPortfolio;
      try {
        portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
      } catch (e) {
        portfolio = null;
        console.error("JSON.parse error - ", e.message);
      }

      project.portfolioId = portfolio;
    }
    this.projectService.findAll(project, this.lazyload).subscribe((res) => {
      this.projectList = res.content;
      this.projectList = this.projectList.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
    });
  }

  check(tool) {
    if (this.role && this.role.name) {
      this.role.name = this.role.name.trim();
    }
    if (tool.name == undefined || tool.name == null || tool.name.trim().length == 0) {
      this.messageService.info("Role name can't be empty", "IAMP");
    } else if (!/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(tool.name)) {
      this.messageService.info("Role name format is incorrect", "IAMP");
    } 
    else if (tool.description && (!/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(tool.description))) {
      this.messageService.info("Role description format is incorrect", "IAMP");
    }
    // else if (tool.permission == undefined || tool.permission == null) {
    //   this.messageService.info("Type of access can't be empty", "IAMP");
    // } 
    else {
      if (this.displayProjectDropdown == false)
        /** if "Map to project" checkbox is deselected, then set projectId to null */
        this.role.projectId = null;
      this.onSave();
    }
  }

  radioChange(event) {
    this.role.permission = event.value;
  }

  onSave() {
    this.role.permission=false;
    if (this.edit) {
      this.onUpdate();
    } else {
      let arr1 = this.rolesArray.filter((item) => item.name != undefined);
      let arr2 = arr1.filter((item) => item.name.toLowerCase() == this.role.name.toLowerCase());
      if (arr2.length > 0) {
        this.messageService.error("Role already exists", "IAMP");
        return;
      } else {
        if (sessionStorage.getItem("telemetry") == "true") {
        this.telemetryService.audit(this.role,"CREATE");
        }
        this.busy = this.roleService.create(this.role).subscribe((roles) => {
          this.role = new Role();
          this.displayProjectDropdown = false;
          this.messageService.info("Role created", "IAMP");
          this.listView();
        });
      }
    }
  }
  compareTodiff(curr:any,prev:any){
    let temparr=[];
    Object.keys(prev).forEach(key => {
    if(prev[key]!=curr[key])
    temparr.push(key)
   });
   return temparr;
  }
  onUpdate() {
    this.allRole.projectId = null;
    let arr1 = this.rolesArray.filter((item) => item.name != undefined);
    let arr2 = arr1.filter(
      (item) => item.id != this.role.id && item.name.toLowerCase() == this.role.name.toLowerCase()
    );
    if (arr2.length > 0) {
      this.messageService.error("Role already exists", "IAMP");
      return;
    } else {
      if (sessionStorage.getItem("telemetry") == "true") {
      let arr = this.rolesArray.filter(
        (item) =>
          item.id == this.role.id 
      );
      let diff=this.compareTodiff(this.role,arr1[0])
      this.telemetryService.audit(this.role,arr[0],diff);
      }
      this.busy = this.roleService.update(this.role).subscribe(
        (roles) => {
          this.role = roles;
          this.messageService.info("Role updated", "IAMP");
          this.clearRole();
          if (sessionStorage.getItem("role")) {
            let role: Role;
            try {
              role = JSON.parse(sessionStorage.getItem("role"));
            } catch (e) {
              role = null;
              console.error("JSON.parse error - ", e.message);
            }
            let currentrole = role;
            if (roles.id == currentrole.id) {
              try {
                sessionStorage.setItem("role", JSON.stringify(roles));
              } catch (e) {
                console.error("JSON.stringify error - ", e.message);
              }
            }
            sessionStorage.setItem("UpdatedUser", "true");
            if (sessionStorage.getItem("roleList")) {
              let rolelist;
              try {
                rolelist = JSON.parse(sessionStorage.getItem("roleList"));
              } catch (e) {
                console.error("JSON.parse error - ", e.message);
              }
              let newrolelist = [];
              rolelist.forEach((element) => {
                if (element.id == roles.id) {
                  element = roles;
                  newrolelist.push(roles);
                } else {
                  newrolelist.push(element);
                }
              });
              try {
                sessionStorage.setItem("roleList", JSON.stringify(newrolelist));
              } catch (e) {
                console.error("JSON.stringify error - ", e.message);
              }
            }
          }
          this.listView();
        },
        (error) => this.messageService.error("Could not update", "IAMP")
      );
    }
  }
  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }
  listView() {
    this.showNameLengthErrorMessage = false;
    this.showDescLengthErrorMessage = false;
    if (this.edit || this.view) this.router.navigate(["./../../list"], { relativeTo: this.route });
    else this.router.navigate(["./../list"], { relativeTo: this.route });
  }
  clearRole() {
    if (this.edit || this.view) {
      this.role.name = null;
      this.role.description = null;
      this.role.permission = null;
      this.role.roleadmin = null;
      this.role.projectId = null;
      this.displayProjectDropdown = false;
      this.showDescLengthErrorMessage = false;
      this.showNameLengthErrorMessage = false;
    } else {
      this.role = new Role();
      this.displayProjectDropdown = false;
      this.role.permission = null;
      this.showDescLengthErrorMessage = false;
      this.showNameLengthErrorMessage = false;
    }
  }
  trackByMethod(index, item) {}

  checkNameMaxLength() {
    if (this.role.name.length >= 255) {
      this.showNameLengthErrorMessage = true;
    } else {
      this.showNameLengthErrorMessage = false;
    }
  }

  checkDescMaxLength() {
    if (this.role.description.length >= 255) {
      this.showDescLengthErrorMessage = true;
    } else {
      this.showDescLengthErrorMessage = false;
    }
  }

  fetchRoles() {
    this.allRole.projectId = null;
    this.roleService
      .findAll(this.allRole, { first: 0, rows: 1000, sortField: null, sortOrder: null })
      .subscribe((res) => {
        this.rolesArray = res.content;
      });
  }
}
