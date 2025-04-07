import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RaiservicesService } from '../../services/raiservices.service';
import { Role } from '../../models/role';
import { RoleService } from '../../services/role.service';
import { UserProjectRole } from '../../models/user-project-role';
import { Users } from '../../models/users';
import { ThirdColPanelDirective } from 'leds-lib';
import { Project } from '../../models/project';

@Component({
  selector: 'app-add-work-group',
  templateUrl: './add-work-group.component.html',
  styleUrls: ['./add-work-group.component.scss'],
})
export class AddWorkGroupComponent implements OnInit {
  @Output() modalClose = new EventEmitter();
  @Input() initiativeId: any;
  roleUserList: any = [];
  role: any = 'Project Manager';
  tempUserProjectRole = new UserProjectRole();
  pageEvent = { page: 0, size: 6 };
  portfolio_id: number;
  portfolio_name: string;
  all_selected_data: any;
  selectedCards: any[] = [];
  userDetails: any = [];
  role_id: any;
  userData: any = [];
  groupedData: any = [];
  finalUserList: any[];
  filteredData: any = [];
  search = '';
  searchData: any[];
  selectedRole: any;
  loadMoreUserData: boolean = false;
  constructor(
    public roleSerive: RoleService,
    public raiservices: RaiservicesService
  ) {}
  ngOnInit(): void {
    this.getWorkGroup();
    this.getRoleList();
  }
  render(keys: any) {
    this.role = keys;
    this.selectedRole = keys;
  }
  // getUserList(selectedRoleid: any, selectedRoleName: any) {
  //   let project_id=JSON.parse(sessionStorage.getItem('project')).id;
  //   this.tempUserProjectRole.role_id = new Role({ id: selectedRoleid,projectId:project_id });
  //   if(this.search.length>0) {this.tempUserProjectRole.user_id = new Users({ user_email:this.search });}
  //   this.roleSerive
  //     .getUserList(this.tempUserProjectRole, this.pageEvent)
  //     .subscribe((res) => {
  //       res.content.forEach((item) => {
  //         {    let userz = {
  //           user_email: item['user_id'].user_email,
  //           user_f_name: item['user_id'].user_f_name,
  //           user_l_name: item['user_id'].user_l_name,
  //           portfolio_id: selectedRoleid,
  //           portfolio_name: selectedRoleName,
  //           user_status: false,
  //           user_id: item['user_id'].id,
  //         };
  //         if (this.groupedData.length > 0) {
  //           this.groupedData.forEach((element: any) => {
  //             if (
  //               element.user_email == userz.user_email &&
  //               element.roleId == selectedRoleid
  //             ) {
  //               userz.user_status = true;
  //             }
  //           });
  //         }
  //         this.userData.push(userz);
  //         if (userz.user_status) {
  //           if(!this.selectedCards.some((item) => item['user_id'].user_email === userz.user_email && item['role_id'].id === selectedRoleid)) {
  //             this.selectedCards.push(userz);
  //           }
  //         }}
  //       });
  //       this.filteredData = this.userData;
  //     });
  // }
  // GET ROLE LIST
  getRoleList() {
    let project_id = JSON.parse(sessionStorage.getItem('project')).id;
    let tempUserProjectRole = new UserProjectRole();
    tempUserProjectRole.project_id = new Project({ id: project_id });
    if (this.search.length > 0) {
      tempUserProjectRole.user_id = new Users({ user_f_name: this.search });
      this.roleUserList = [];
    }
    this.roleSerive.getRoleList(tempUserProjectRole).subscribe((res) => {
      res.content.forEach((item) => {
        this.roleUserList.push({
          roleId: item.id,
          roleName: item.name,
          users: [],
          totalUsers: 0,
          userStatus: false,
          noMoreData: false,
        });
      });
      this.getUserList(0);
    });
  }
  // GET USER LIST WITH PROJECT ID AND ROLE ID AND SEARCH
  getUserList(page?: any) {
    let pageEvent = { page: page, size: 6 };
    let project_id = JSON.parse(sessionStorage.getItem('project')).id;
    let tempUserProjectRolez = new UserProjectRole();
    tempUserProjectRolez.project_id = new Project({ id: project_id });
    this.roleUserList.forEach((role) => {
      tempUserProjectRolez.role_id = new Role({ id: role.roleId });
      if (this.search.length > 0) {
        tempUserProjectRolez.user_id = new Users({ user_f_name: this.search });
      }
      this.roleSerive
        .getUserList(tempUserProjectRolez, pageEvent)
        .subscribe((res) => {
          role.totalUsers = res.totalElements;
          if (this.groupedData.length > 0) {
            res.content.forEach((userz) => {
              this.groupedData.forEach((element: any) => {
                if (
                  element.user_email == userz.user_id.user_email &&
                  element.roleId == role.roleId
                ) {
                  userz.user_id['user_status'] = true;
                  userz.user_id['role_id'] = role.roleId;
                  userz.user_id['role_name'] = role.roleName;
                  this.selectedCards.push(userz.user_id);
                }
              });
            });
          }
          res.content.forEach((userz) => {
            role.users.push(userz.user_id);
          });
          this.selectedRole = this.roleUserList[0];
          this.role = this.roleUserList[0];
        });
    });
  }
  loadMoreUser() {
    let totalCalledUsers = this.selectedRole['users'].length;
    let defaultPageSize = 6;
    let currentPageNumber = Math.ceil(totalCalledUsers / defaultPageSize) - 1;
    let pageEvent = { page: currentPageNumber + 1, size: 6 };
    let project_id = JSON.parse(sessionStorage.getItem('project')).id;
    let tempUserProjectRolez = new UserProjectRole();
    tempUserProjectRolez.project_id = new Project({ id: project_id });
    tempUserProjectRolez.role_id = new Role({
      id: this.selectedRole.roleId,
    });
    if (this.search.length > 0) {
      tempUserProjectRolez.user_id = new Users({ user_f_name: this.search });
    }
    this.roleSerive
      .getUserList(tempUserProjectRolez, pageEvent)
      .subscribe((res) => {
        this.selectedRole.totalUsers = res.totalElements;
        if (res.content.length == 0) {
          this.selectedRole.noMoreData = true;
        } else {
          if (this.groupedData.length > 0) {
            res.content.forEach((userz) => {
              this.groupedData.forEach((element: any) => {
                if (
                  element.user_email == userz.user_id.user_email &&
                  element.roleId == this.selectedRole.roleId
                ) {
                  userz.user_id['user_status'] = true;
                  userz.user_id['role_id'] = this.selectedRole.roleId;
                  userz.user_id['role_name'] = this.selectedRole.roleName;
                  this.selectedCards.push(userz.user_id);
                }
              });
            });}
          res.content.forEach((userz) => {
            this.selectedRole.users.push(userz.user_id);
          });
        }
      });
    // this.getRoleList();
  }
  linked(selectedUser: any, role: any, i: any) {
    role['users'][i].user_status = !role['users'][i].user_status;
    role['users'][i].role_id = role.roleId;
    role['users'][i].role_name = role.roleName;
    const index = this.selectedCards.indexOf(selectedUser);
    if (index == -1) {
      this.selectedCards.push(selectedUser);
    } else {
      this.selectedCards.splice(index, 1);
    }
  }
  getWorkGroup() {
    this.raiservices.workgroupList(this.initiativeId).subscribe((res) => {
      this.groupedData = res;
    });
  }
  addworkgroup() {
    this.finalUserList = [];
    this.selectedCards.forEach((item) => {
      let userLname: any = '';
      if (item.user_l_name || item.user_l_name == null) {
        userLname = item.user_l_name==null?'':item.user_l_name;
      }
      this.finalUserList.push({
        initiativeId: this.initiativeId,
        roleId: item.role_id,
        roleName: item.role_name,
        userId: item.user_id,
        userName: item.user_f_name + ' ' + userLname,
        user_email: item.user_email,
      });
    });
    this.raiservices
      .createWorkgroup(this.finalUserList, this.initiativeId)
      .subscribe((res) => {
        let state = true;
        this.modalClose.emit(state);
      });
  }
  changesOccur(event: any) {
    this.search = event.target.value;
    this.roleUserList = [];
    this.ngOnInit();
  }
}
