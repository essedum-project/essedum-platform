import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { LedsModalService } from 'leds-lib';
import { Services } from '../../services/service';
import { RaiservicesService } from 'projects/aip-app/src/app/services/raiservices.service';
import { Users } from '../../models/users';
import { Project } from '../../models/project';
import { UserProjectRole } from '../../models/user-project-role';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role';

@Component({
  selector: 'app-ivm-create-modal',
  templateUrl: './ivm-create-modal.component.html',
  styleUrls: ['./ivm-create-modal.component.scss'],
})
export class IvmCreateModalComponent implements OnInit {
  @Output() modalClose = new EventEmitter();
  user: any = JSON.parse(sessionStorage.getItem('user'));
  role: any = JSON.parse(sessionStorage.getItem('role'));
  creator: any = {
    initiativeId: 1,
    roleId: this.role.id,
    roleName: this.role.name,
    userId: this.user.id,
    userName:
      this.user.user_f_name +
      ' ' +
      (this.user.user_l_name ? this.user.user_l_name : ''),
    user_email: this.user.user_Email,
  };
  finalUsers: any = [];
  chooseOption: any = 'new';
  createForm: FormGroup;
  roleUserList: any = [];
  selectedUsers: any = [];
  errorMessage: string;
  fiscalOptions = [
    {
      viewValue: 'Q3 2023',
      value: 'Q3 2023',
    },
    {
      viewValue: 'Q2 2023',
      value: 'Q2 2023',
    },
    {
      viewValue: 'Q1 2023',
      value: 'Q1 2023',
    },
  ];
  search: any;
  userList: any = [];
  selectedRole: any = [];
  constructor(
    private modalService: LedsModalService,
    private fb: FormBuilder,
    private service: Services,
    public roleSerive: RoleService,
    public raiservice: RaiservicesService
  ) {}
  ngOnInit(): void {
    this.createForms();
    this.getRoleList();
  }
  createInitiative() {
    if (this.createForm.valid) {
      this.errorMessage = null;
      this.raiservice
        .createInitiative(this.createForm.value)
        .subscribe((res) => {
          if (res.SUCCESS) {
            this.finalUsers.forEach((element) => {
              element.initiativeId = res.SUCCESS.id;
            });
            this.creator.initiativeId = res.SUCCESS.id;
            this.finalUsers.push(this.creator);
            this.createTeam(this.finalUsers, res.SUCCESS.id);
            this.service.message('Solution created successfully');
          }
        });
      let state = true;
      this.modalClose.emit(state);
    } else {
      this.errorMessage = 'Please fill out all required fields.';
    }
  }

  close() {
    this.modalService.dismissAll('close the modal');
  }
  createForms() {
    let user = JSON.parse(sessionStorage.getItem('user'));
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      IvmLinkid: [''],
      hasIvmLink: [false],
      organization: [sessionStorage.getItem('organization')],
      createdBy: [user.user_login],
      lastUpdatedBy: [user.user_f_name],
    });
  }

  toggleFileUpload(event: MatRadioChange) {
    this.chooseOption = event.value;
  }
  getRoleList() {
    this.roleUserList = [];
    let project_id = JSON.parse(sessionStorage.getItem('project')).id;
    let tempUserProjectRole = new UserProjectRole();
    tempUserProjectRole.project_id = new Project({ id: project_id });
    // if (this.search.length > 0) {
    //   tempUserProjectRole.user_id = new Users({ user_f_name: this.search });
    //   this.roleUserList = [];
    // }
    this.roleSerive.getRoleList(tempUserProjectRole).subscribe((res) => {
      res.content.forEach((item) => {
        // this.roleUserList.push({
        //   roleId: item.id,
        //   roleName: item.name,
        //   users: [],
        //   totalUsers: 0,
        //   userStatus: false,
        //   noMoreData: false,
        // });
        this.roleUserList.push({
          value: { id: item.id, name: item.name },
          viewValue: item.name,
        });
      });
    });
  }
  selectChangeUserList(event: any) {
    this.selectedUsers = event;
  }
  selectChangeRoleList(event: any) {
    this.selectedRole = event;
    this.getUserList(event.id, 0);
  }
  // GET USER LIST WITH PROJECT ID AND ROLE ID AND SEARCH
  getUserList(projectId: any, page?: any) {
    this.userList = [];
    let pageEvent = { page: page, size: 100000 };
    let tempUserProjectRolez = new UserProjectRole();
    // tempUserProjectRolez.project_id = new Project({ id: projectId });
    tempUserProjectRolez.role_id = new Role({ id: projectId });
    // this.roleUserList.forEach((role) => {
    //   tempUserProjectRolez.role_id = new Role({ id: role.roleId });
    // if (this.search.length > 0) {
    //   tempUserProjectRolez.user_id = new Users({ user_f_name: this.search });
    // }
    this.roleSerive
      .getUserList(tempUserProjectRolez, pageEvent)
      .subscribe((res) => {
        res.content.forEach((item) => {
          let uName = `${item.user_id['user_f_name']}  ${item.user_id['user_l_name']}`;
          this.userList.push({
            value: {
              user_Id: item.user_id.id,
              user_Email: item.user_id['user_email'],
              user_f_name: item.user_id['user_f_name'],
              user_l_name: item.user_id['user_l_name'],
            },
            viewValue: uName,
          });
        });
      });
  }
  addUserlist() {
    this.selectedUsers.forEach((user) => {
      if (user.user_l_name || user.user_l_name == null) {
        user.user_l_name = user.user_l_name == null ? '' : user.user_l_name;
      }
      this.finalUsers.push({
        initiativeId: 1,
        roleId: this.selectedRole.id,
        roleName: this.selectedRole.name,
        userId: user.user_Id,
        userName: user.user_f_name + ' ' + user.user_l_name,
        user_email: user.user_Email,
      });
    });
    this.getRoleList();
    this.userList = [];
  }
  removeUser(user: any) {
    this.finalUsers = this.finalUsers.filter(
      (item) =>
        item.user_email !== user.user_email && item.userId !== user.userId
    );
  }
  createTeam(teamList, initiativeId) {
    this.raiservice.createWorkgroup(teamList, initiativeId).subscribe((res) => {
    });
  }
}
