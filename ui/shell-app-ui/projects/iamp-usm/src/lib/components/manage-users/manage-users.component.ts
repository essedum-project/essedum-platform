import { Component, OnInit, ViewChild, ElementRef, Injector, SkipSelf, OnDestroy } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { Msg } from "../../shared-modules/services/msg";
import { OrgUnitService } from "../../services/org-unit.service";
import { UserUnitService } from "../../services/user-unit.service";
import { MessageService } from "../../services/message.service";
import { ConfirmDeleteDialogComponent } from "../../support/confirm-delete-dialog.component";
import { OrgUnit } from "../../models/org-unit";
import { Project } from "../../models/project";
import { UserUnit } from "../../models/user-unit";
import { Users } from "../../models/users";
import { UsersService } from "../../services/users.service";
import { ProjectService } from "../../services/project.service";
import { UserProjectRoleService } from "../../services/user-project-role.service";
import { RoleService } from "../../services/role.service";
import { Role } from "../../models/role";
import { UserProjectRole } from "../../models/user-project-role";
import { PageResponse } from "../../support/paging";
import { ActivatedRoute, Router } from "@angular/router";
import { HelperService } from "../../services/helper.service";
import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { IampUsmService } from "../../iamp-usm.service";
import * as moment from "moment-timezone";
import { C } from "@angular/cdk/keycodes";
import { DashConstantService } from "com-lib-util";
import { OpenTelemetryService } from "../../telemetry-util/open-telemetry.service";
@Component({
  selector: "lib-manage-users",
  templateUrl: "./manage-users.component.html",
  styleUrls: ["./manage-users.component.css"],
})
export class ManageUsersComponent implements OnInit, OnDestroy {
  lazyloadevent = {
    first: 0,
    rows: 5000,
    sortField: null,
    sortOrder: null,
  };
  newUser: Users;
  password;
  Message: string = "";
  selectedRole: String = "All";
  selectedProjects: String = "All";
  Roles = [];
  busy: Subscription;
  units = [];
  selectedUnit: string = "ICETS";
  adminUsers = [];
  totalcount = this.adminUsers.length;
  NormalUsrs = [];
  otheruserstotalcount = this.NormalUsrs.length;
  addUsers: boolean = true;
  projects: Project[] = [];
  selectedProject: Project;
  allRoleList = [];
  users: Users[] = [];
  userupdate: Users;
  selecteduserlogin: any;
  selectedemail: any;
  AllUserProjectRoleList: UserProjectRole[];
  UserProjectRoleList: MatTableDataSource<any> = new MatTableDataSource();
  currentPage: PageResponse<Users> = new PageResponse<Users>(0, 0, []);
  displayedColumns: string[] = ["id", "user_f_name", "user_login", "user_email", "actions"];
  private paginator: MatPaginator;
  private sort: MatSort;
  pageSize = 6;
  wavesLength: number;
  example: Users = new Users();
  filterFlag: boolean = false;
  filterFlag1: boolean = false;
  userSearched: any;
  enableGlobalSearch: boolean = false;

  url;
  showList: boolean = true;

  /*create,edit,view user varibales*/
  id;
  view: boolean = false;
  params_subscription: any;
  showCreate: boolean = false;
  user: Users;
  edit: boolean = false;
  buttonFlag: boolean = false;
  defaultFlag: boolean = false;
  viewWave: boolean = false;
  userlogins: string[] = [];
  useremails: string[] = [];
  p: number;
  userDetailCheck: boolean = false;
  userDetailJson: any[] = [{ pointer: "", value: "" }];
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  viewuser: boolean = false;
  lengthNameErrorMessage: String = "Maximum Character Limit Reached";
  showfNameLengthErrorMessage: Boolean = false;
  showmNameLengthErrorMessage: Boolean = false;
  showlNameLengthErrorMessage: Boolean = false;
  showLoginNameErrorMessage: Boolean = false;
  showEmailErrorMessage: Boolean = false;
  userss: Users[] = [];
  auth: string = "";
  isAuth: boolean = true;
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  createFlag: boolean = false;
  flag: boolean = false;
  permissionList: any[];
  selectedPermissionList: any[];
  demoUserFlag: boolean = false;
  country: string;
  countryNames: string[] = [];
  countryMap = new Map();
  timeZone: string;
  pageIndex: number = 0;
  tzNames: string[] = [];
  isUserName: boolean =true;
  lastPage: boolean = false;
  pageEvent: any;
  callId: any;
  deleteItem: boolean = false;
  private options = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };

  nonallowedExtention: boolean = false;
  imageSizeExceeded: boolean = false;
  imageSizeExceededErrMsg = '';

  constructor(
    protected dashConstantService: DashConstantService,
    private usersService: UsersService,
    private unitService: OrgUnitService,
    private userUnitService: UserUnitService,
    private roleService: RoleService,
    private userProjectRoleService: UserProjectRoleService,
    public confirmDeleteDialog: MatDialog,
    public confirmDialog: MatDialog,
    private messageService: MessageService,
    public route: ActivatedRoute,
    private router: Router,
    private helperService: HelperService,
    private telemetryService: LeapTelemetryService,
    private usmService: IampUsmService,
    private openTelemetryService: OpenTelemetryService,
    @SkipSelf() private https: HttpClient,
  ) { 
    this.options.headers.append("Authorization", `Bearer ` + localStorage.getItem("jwtToken"));
  }

  ngOnDestroy(): void {
    let activeSpan = this.openTelemetryService.fetchActiveSpan();
    this.openTelemetryService.endTelemetry(activeSpan);
  }

  ngOnInit() {
    this.lazyloadevent.rows=this.dashConstantService.getrowCount();
    this.telemetryImpression();
    if (sessionStorage.getItem("usmAuthority")) {
      sessionStorage.removeItem("usmAuthority");
      this.auth = "";
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
      (error) => { },
      () => {
        this.auth = sessionStorage.getItem("usmAuthority");
        this.selectedPermissionList = this.auth.split(",");
        this.selectedPermissionList.forEach((ele) => {
          let role;
          try {
            role = JSON.parse(sessionStorage.getItem("role"));
          } catch (e:any) {
            console.error("JSON.parse error - ", e.message);
          }
          if (ele === "edit") {
            this.editFlag = true;
          }
          if (ele === "view") {
            this.viewFlag = true;
          }
          if (ele === "delete") {
            if(role.projectadmin || role.roleadmin){
              this.deleteFlag = false;
            }else{
              this.deleteFlag = true;
            }
          }
          if (ele === "create") {
            this.createFlag = true;
          }
        });
      }
    );
    this.getAllUsers();
    this.params_subscription = this.route.params.subscribe((params) => {
      this.id = params["uid"];
      this.view = params["view"];
      if (this.id == "new") {
        this.showCreate = true;
        this.edit = false;
        this.view = false;
        this.viewuser = false;
        this.buttonFlag = false;
        this.user = new Users();
        this.user.isUiInactivityTracked=true;
      } else if (this.id != null && this.id != undefined && params["view"] == "false") {
        this.showCreate = true;
        this.edit = true;
        this.view = false;
        this.viewWave = true;
        this.buttonFlag = false;
        this.usersService.getUsers(this.id).subscribe((res) => {
          this.user = res;
          try {
            if (this.user.clientDetails) {
              try {
                this.userDetailJson = JSON.parse(this.user.clientDetails);
              } catch (e : any)  {
                console.error("JSON.parse error - ", e.message);
              }
              this.userDetailCheck = true;
            }
          } catch (e : any)  {
            this.userDetailCheck = false;
          }
          if (this.user.profileImage) {
            this.url = "data:image/png;base64," + this.user.profileImage;
          } else {
            this.url = null;
          }
          if(this.user && this.user.timezone)
            this.tzNames.push(this.user.timezone)
        });
      } else if (this.id != null && this.id != undefined && params["view"] == "true") {
        this.showCreate = true;
        this.edit = true;
        this.view = true;
        this.viewuser = true;
        this.viewWave = true;
        this.buttonFlag = true;
        this.usersService.getUsers(this.id).subscribe((res) => {
          this.user = res;
          if (this.user.user_email == "demouser@infosys.com") {
            this.demoUserFlag = true;
          }
          try {
            if (this.user.clientDetails) {
              try {
                this.userDetailJson = JSON.parse(this.user.clientDetails);
              } catch (e : any)  {
                console.error("JSON.parse error - ", e.message);
              }

              this.userDetailCheck = true;
            }
          } catch (e : any)  {
            this.userDetailCheck = false;
          }
          if (this.user.profileImage) {
            this.url = "data:image/png;base64," + this.user.profileImage;
          } else {
            this.url = null;
          }
          if(this.user && this.user.timezone)
            this.tzNames.push(this.user.timezone)
        });
      } else {
        this.getAllUserss(null);
      }
    });
    
      this.fetchCountries();
    
  }

  telemetryImpression() {
    // this.telemetryService.impression("iamp-usm", "detail", "ManageUsersComponent");
    this.openTelemetryService.startTelemetry("iamp-usm", "ManageUsersComponent", 'detail');
  }

  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  profileImageAdded(event) {
    if (event && event.target.files && event.target.files[0]) {
      var filePath = event.target.files[0].name;
      var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
      if (!allowedExtensions.exec(filePath)) {
        this.imageSizeExceeded = false;
        this.nonallowedExtention = true;
      }
      else {
        this.nonallowedExtention = false;
        if (event.target.files[0].size > 10 * 1000000) {
          this.imageSizeExceeded = true;
          this.imageSizeExceededErrMsg = "Image file size exceeds 10 MB";
        } else if (event.target.files[0].name.length > 100) {
          this.imageSizeExceeded = true;
          this.imageSizeExceededErrMsg = "Image Name  cannot be more than 100 characters";
        } else {
          this.imageSizeExceeded = false;
          this.imageSizeExceededErrMsg = "";
          this.helperService.toBase64(event.target.files[0], (base64Data) => {
            this.user.profileImage = base64Data;
            this.user.profileImageName = event.target.files[0].name;
            this.url = "data:image/png;base64," + this.user.profileImage;
          });
        }
      }
    } else this.url = null;
  }

  getAllUnits() {
    this.unitService.findAll(new OrgUnit(), this.lazyloadevent).subscribe((response) => {
      response.content.forEach((element) => {
        this.units.push(element.name);
      });
    });
  }

  getAllUsers() {
    this.checkForAdminAuthority();
    if(!this.defaultFlag){
      this.usersService.findAllByProjectIdOrPortfolioId(new Users(), this.lazyloadevent, this.flag, this.callId).subscribe((response) => {
        let users = response.content;
        users = users.sort((a, b) => (a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1));
        this.useremails = [];
        this.userlogins = [];
        users.forEach((element) => {
          this.useremails.push(element.user_email);
          this.userlogins.push(element.user_login);
        });
        this.useremails = this.useremails.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
        this.userlogins = this.userlogins.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
      }),
        (error) => this.messageService.error(error, Msg.APP);
    }
    else{
      this.usersService.findAll(new Users(), this.lazyloadevent).subscribe((response) => {
        this.currentPage = response;
        this.userss = response.content;
        this.userss = this.userss.sort((a, b) =>
          a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1
        );
        this.userss.forEach((element) => {
          this.useremails.push(element.user_email);
          this.userlogins.push(element.user_login);
        });
        this.useremails = this.useremails.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
        this.userlogins = this.userlogins.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
      }),
        (error) => this.messageService.error(error, Msg.APP);
    }
  }
  callApi() {
    this.checkForAdminAuthority();
    //if (!(this.userlogins && this.userlogins.length > 0)) {
    if(!this.defaultFlag){
      this.usersService.findAllByProjectIdOrPortfolioId(new Users(), this.lazyloadevent, this.flag, this.callId).subscribe((response) => {
        let users = response.content;
        users = users.sort((a, b) => (a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1));
        this.useremails = [];
        this.userlogins = [];
        users.forEach((element) => {
          this.useremails.push(element.user_email);
          this.userlogins.push(element.user_login);
        });
        this.useremails = this.useremails.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
        this.userlogins = this.userlogins.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
      }),
        (error) => this.messageService.error(error, Msg.APP);
    } else {
      this.usersService.findAll(new Users(), this.lazyloadevent).subscribe((response) => {
        let users = response.content;
        users = users.sort((a, b) => (a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1));
        this.useremails = [];
        this.userlogins = [];
        users.forEach((element) => {
          this.useremails.push(element.user_email);
          this.userlogins.push(element.user_login);
        });
        this.useremails = this.useremails.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
        this.userlogins = this.userlogins.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
      }),
        (error) => this.messageService.error(error, Msg.APP);
    }
    //}
  }

  checkForAdminAuthority(){
    let project: any;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    let role: any;
    try {
      role = JSON.parse(sessionStorage.getItem("role"));
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    let portfolio: any;
    try {
      portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    if(role.roleadmin){
      this.flag = true;
      this.callId = portfolio.id;
    } else if(role.projectadmin){
      this.flag = false;
      this.callId = project.id;
    } else {
      this.defaultFlag = true;
    }
  }

  
  getAllUserss(pageEvent) {

    this.checkForAdminAuthority();

    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
      this.pageIndex = 0;
    }

    if(!this.defaultFlag){

      this.usersService.findByProjectIdOrPortfolioId(this.example, pageEvent, this.flag, this.callId).subscribe((response) => {
        this.currentPage = response;
        this.users = response.content;
        this.wavesLength = this.currentPage.totalElements;  
        this.users = this.users.sort((a, b) =>
          a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1
        );
        this.UserProjectRoleList = new MatTableDataSource(this.users);
        this.UserProjectRoleList.sort = this.sort;
        this.UserProjectRoleList.paginator = this.paginator;
      }),
        (error) => this.messageService.error(error, Msg.APP);

    } else {
      this.usersService.FindAll(this.example, pageEvent).subscribe((response) => {
        this.currentPage = response;
        this.users = response.content;
        this.wavesLength = this.currentPage.totalElements;
        this.users = this.users.sort((a, b) =>
          a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1
        );
        this.UserProjectRoleList = new MatTableDataSource(this.users);
        this.UserProjectRoleList.sort = this.sort;
        this.UserProjectRoleList.paginator = this.paginator;
      }),
        (error) => this.messageService.error(error, Msg.APP);
    }
  }

  getAllUserAuthorities() {
    this.adminUsers = [];
    this.NormalUsrs = [];
    this.allRoleList = [];

    this.busy = this.userProjectRoleService.findAll(new UserProjectRole(), this.lazyloadevent).subscribe(
      (response) => {
        this.AllUserProjectRoleList = response.content;
        this.Roles.forEach((role) => {
          let userList = [];
          response.content.forEach((userprojectrole) => {
            if (role == userprojectrole.role_id.name) {
              userList.push(userprojectrole);
            }
          });
          this.allRoleList.push({ rolename: role, userlist: userList });
        });
      },
      (error) => this.messageService.error(error, Msg.APP)
    );
  }

  ChangePassword(user: any) {
    user.force_password_change = true;
    this.usersService.update(user).subscribe(
      (response) => {
        this.user = response;
        this.messageService.info("User authorized to change password", "IAMP");
      },
      (error) => this.messageService.error(error, Msg.APP)
    );
  }

  SaveUserInfo() {
    if (this.user && this.user.user_login) this.user.user_login = this.user.user_login.trim();
    if (this.user && this.user.user_email) this.user.user_email = this.user.user_email.trim();
    if (this.user && this.user.user_f_name) this.user.user_f_name = this.user.user_f_name.trim();
    if(this.user && this.user.country == null || this.user.country == undefined){
      this.user.country = 'India';
    }

    if(this.user && this.user.country.trim().length > 0 && (!this.user.timezone || this.user.timezone.trim().length == 0)){
      this.user.timezone = this.tzNames[0];
    }

    if(this.user && this.user.timezone == null || this.user.timezone == undefined){
      this.user.timezone = 'Asia/Kolkata';
    }
    
    if (
      this.user.user_login == undefined ||
      this.user.user_login.trim().length == 0 ||
      this.user.user_login == null
    ) {
      this.messageService.error("Please Provide User Login", Msg.APP);
    } else if (
      this.user.user_email == undefined ||
      this.user.user_email == null ||
      this.user.user_email.trim().length == 0
    ) {
      this.messageService.error("Please Provide User Email", Msg.APP);
    } else if (!this.user.user_email.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,10})$/)) {
      this.messageService.error("This User Email does not match the required pattern", Msg.APP);
    } else if (
      this.user.user_f_name == undefined ||
      this.user.user_f_name == null ||
      this.user.user_f_name.trim().length == 0
    ) {
      this.messageService.error("Please Provide User First Name", Msg.APP);
    } else if (this.user.user_f_name.length > 255) {
      this.messageService.info("User first name cannot be more than 255 characters", Msg.APP);
    } else if (this.user.user_m_name && this.user.user_m_name.length > 255) {
      this.messageService.info("User middle name cannot be more than 255 characters", Msg.APP);
    } else if (this.user.user_l_name && this.user.user_l_name.length > 255) {
      this.messageService.info("User last name cannot be more than 255 characters", Msg.APP);
    } else if (
      this.user.user_f_name &&
      !/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(this.user.user_f_name)
    ) {
      this.messageService.error("User First Name format is incorrect", Msg.APP);
    } else if (
      this.user.user_m_name &&
      !/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(this.user.user_m_name)
    ) {
      this.messageService.error("User Middle Name format is incorrect", Msg.APP);
    } else if (
      this.user.user_l_name &&
      !/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(this.user.user_l_name)
    ) {
      this.messageService.error("User Last Name format is incorrect", Msg.APP);
    } else if(this.user.other_details && this.user.other_details.length > 100){
      this.messageService.info("Other details cannot be more than 100 characters", Msg.APP);
    } else if(this.user.contact_number && this.user.contact_number.length > 15){
      this.messageService.info("Contact number cannot be more than 100 characters", Msg.APP)
    }else if (this.user.user_login != "") {
      //Validating user.user_f_name with directory
      var user = [{ employeeName: this.user.user_login }];
      this.saveUser(user);
    }
  }
  saveUser(user: any) {
    if (user.length) {
      //uncomment if you want only one user to have only one role
      // this.userProjectRoleService.findAll(new UserProjectRole(), this.lazyloadevent).subscribe(
      // response => {
      //if(response.content.find( x => x.user_id.user_login.toLowerCase() == this.user.user_f_name.toLowerCase()) ==
      //null){
      this.usersService.findAll(new Users(), this.lazyloadevent).subscribe((res) => {
        if (res.content) {
          let arr1 = res.content.filter((item) => item.user_email != undefined);
          let arr = arr1.filter(
            (item) => item.user_email.toLowerCase() == this.user.user_email.toLowerCase()
          );
          if (arr.length > 0) {
            this.messageService.error("User Email already exists", "IAMP");
            return;
          }
        }
        if (
          res.content.find((x) => x.user_login.toLowerCase() == this.user.user_login.toLowerCase()) == null
        ) {
          this.newUser = new Users();
          this.newUser.user_login = this.user.user_login.toLowerCase();
          this.newUser.user_email = this.user.user_email;
          this.newUser.onboarded = true;
          this.newUser.activated = true;
          this.newUser.user_act_ind = false;
          this.newUser.user_f_name = this.user.user_f_name;
          this.newUser.user_m_name = this.user.user_m_name;
          this.newUser.user_l_name = this.user.user_l_name;
          this.newUser.force_password_change = false;
          this.newUser.profileImage = this.user.profileImage;
          this.newUser.country = this.user.country;
          this.newUser.timezone = this.user.timezone;
          this.newUser.other_details = this.user.other_details;
          this.newUser.contact_number = this.user.contact_number;
          let flag: boolean = false;
          this.newUser.isUiInactivityTracked = this.user.isUiInactivityTracked;
          if (this.userDetailCheck) {
            this.userDetailJson.forEach((ele) => {
              if (ele.pointer == "" || ele.value == "") {
                flag = true;
                this.messageService.info("User Details cannot be empty", "LEAP");
              }
            });
          }
          if (!flag) {
            try {
              if (
                this.userDetailCheck &&
                this.userDetailJson[0].pointer != "" &&
                this.userDetailJson[0].value != ""
              )
                this.newUser.clientDetails = JSON.stringify(this.userDetailJson);
            } catch (e : any)  {
              this.newUser.clientDetails = null;
            }
          }
          if (!flag) {
            this.addUser(this.newUser);
          }
        } else {
          this.messageService.error("User Already Exists", Msg.APP);
        }
      });
      // }
      // , error => this.messageService.error(error, Msg.APP)
      // )
    } else {
      this.messageService.error(Msg.ERR021, Msg.APP);
    }
  }

  addUser(newUser: Users) {
    if (sessionStorage.getItem("telemetry") == "true") {
    // this.telemetryService.audit(newUser,"CREATE");
    }
    this.busy = this.usersService.create(newUser).subscribe(
      (response) => {
        this.newUser = response;
        this.addUserUnit(this.newUser);
      },
      (error) => this.messageService.error(error, Msg.APP)
    );
  }

  addUserUnit(newUser: Users) {
    this.busy = this.unitService.findAll(new OrgUnit(), this.lazyloadevent).subscribe(
      (response) => {
        let unit = new OrgUnit();
        unit = response.content.find((x) => x.name == this.selectedUnit);
        let userUnit = new UserUnit();
        userUnit.unit = unit;
        userUnit.user = newUser;

        this.userUnitService.create(userUnit).subscribe(
          (res) => {
            this.messageService.info("Created Successfully", "IAMP");
            this.ClearInfo();
            this.showCreate = false;
            this.listUsers();
          },
          (error) => this.messageService.error(error, Msg.APP)
        );
      },
      (error) => this.messageService.error(error, Msg.APP)
    );
  }

  addUserAuthority(newUser: Users) {
    this.busy = this.roleService.findAll(new Role(), this.lazyloadevent).subscribe(
      (response) => {
        let authority = new Role();
        authority = response.content.find((x) => x.name.toLowerCase() == this.selectedRole.toLowerCase());
        let userAuthority = new UserProjectRole();
        userAuthority.role_id = authority;
        userAuthority.user_id = newUser;
        userAuthority.project_id = this.selectedProject;
        this.userProjectRoleService.create(userAuthority).subscribe(
          (res) => {
            this.getAllUserAuthorities();
            this.messageService.info(Msg.INF012, Msg.APP);
            this.ClearInfo();
          },
          (error) => this.messageService.error(error, Msg.APP)
        );
      },
      (error) => this.messageService.error(error, Msg.APP)
    );
  }
  Cancel($event) { }
  deleteUser(user: any) {
    let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
      disableClose: true,
      data: {
        title: "Delete User",
        message: "Are you sure you want to delete?",
      },
    });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result == "yes") {
          this.delete(user);
        }
      },
      (error) => this.messageService.error(error, Msg.APP)
    );
  }
  // editUserProjectRole(user: UserProjectRole){
  //
  //   let dialogRef = this.confirmDialog.open(EditManageUsersComponent,{
  //     disableClose: true,
  //     height: '50vh',
  //     width: '54vw',
  //     data:user.id
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //    this.getAllUserAuthorities();
  //   });
  // }
  editUser(user) {
    this.router.navigate(["./" + user.id + "/" + false], { relativeTo: this.route });
  }
  viewUser(user) {
    this.router.navigate(["./" + user.id + "/" + true], { relativeTo: this.route });
  }
  addNewUser() {
    this.router.navigate(["./new/" + false], { relativeTo: this.route });
  }
  listUsers() {
    this.showfNameLengthErrorMessage = false;
    this.showmNameLengthErrorMessage = false;
    this.showlNameLengthErrorMessage = false;
    this.showLoginNameErrorMessage = false;
    this.showEmailErrorMessage = false;
    this.router.navigate(["../../"], { relativeTo: this.route });
  }
  delete(user: any) {
    //user.isdeleted = true;
    // this.usersService.update(user).subscribe(
    //   response => {

    if (user.id == JSON.parse(sessionStorage.getItem("user")).id) {
      this.busy = this.usersService.delete(user.id).subscribe(
        (response) => {
          this.messageService.info(Msg.INF013, Msg.APP);
          if (sessionStorage.getItem("telemetry") == "true") {
          // this.telemetryService.audit(user,"DELETE");
          }
          try {
            this.router.navigate(["/logout"]);
          } catch (e : any)  {
            user = null;
            console.error("JSON.parse error - ", e.message);
          }
        },
        (error) => this.messageService.error("Could not Delete", Msg.APP)
      );
    } else {
      this.busy = this.usersService.delete(user.id).subscribe(
        (response) => {
          if (sessionStorage.getItem("telemetry") == "true") {
          // this.telemetryService.audit(user,"DELETE");
          }
          this.messageService.info(Msg.INF013, Msg.APP);
          let sessionUser: Users;
          try {
            sessionUser = JSON.parse(sessionStorage.getItem("user"));
          } catch (e : any)  {
            sessionUser = null;
            console.error("JSON.parse error - ", e.message);
          }
          let currentUser = sessionUser;
          if (sessionUser.id == currentUser.id) {
            sessionStorage.setItem("UpdatedUser", "true");
          }
          this.deleteItem = true;
          this.ClearFilter();
        },
        (error) => this.messageService.error("Could not Delete", Msg.APP)
      );
    }
  }

  roleChange(role) {
    this.selectedRole = role;
  }

  ClearInfo() {
    if (this.edit || this.view) {
      this.user.user_f_name = null;
      this.user.user_l_name = null;
      this.user.user_m_name = null;
      this.user.user_login = null;
      this.user.user_email = null;
      this.user.profileImage = null;
      this.user.profileImageName = null;
      this.userDetailCheck = false;
      this.user.country = null;
      this.user.timezone = null;
      this.url = null;
      this.user.other_details = null;
      this.user.contact_number = null;
      this.userDetailJson = [{ pointer: "", value: "" }];
      //this.myInputReference.nativeElement.value = null;
      this.showfNameLengthErrorMessage = false;
      this.showlNameLengthErrorMessage = false;
      this.showmNameLengthErrorMessage = false;
      this.showLoginNameErrorMessage = false;
      this.showEmailErrorMessage = false;
    } else {
      this.user = new Users();
      this.url = null;
      this.userDetailCheck = false;
      this.userDetailJson = [{ pointer: "", value: "" }];
      //this.myInputReference.nativeElement.value = null;
      this.showfNameLengthErrorMessage = false;
      this.showlNameLengthErrorMessage = false;
      this.showmNameLengthErrorMessage = false;
      this.showLoginNameErrorMessage = false;
      this.showEmailErrorMessage = false;
    }
  }

  //reset the UserProjectRole value to list variable.
  assignCopy() {
    this.users = this.currentPage.content;
    this.UserProjectRoleList = new MatTableDataSource(this.users);
    this.UserProjectRoleList.sort = this.sort;
    this.UserProjectRoleList.paginator = this.paginator;
  }

  validateEmail(email) {
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
}
  // name search filter
  filterItem(value, pageEvent) {
    this.checkForAdminAuthority();
    let isValidEmail = this.validateEmail(value);
    if (!value) {
      this.assignCopy();
    }
    if (this.userSearched == "" || this.userSearched == undefined) {
      this.ClearFilter();
    } else {
      let params;
      const names = this.userSearched.split(" ");
      const vet = name => name ? name : null;
      var temp = {
        fname: vet(names.shift()),
        lname: vet(names.pop()),
        mname: vet(names.join(" "))
      }

      if (temp != null || temp != undefined) {
        params = {
          user_f_name: temp.fname,
          user_m_name: temp.mname,
          user_l_name: temp.lname
        };
      }
      else {
        params = {
          user_f_name: this.userSearched
        };
      }
      this.filterFlag1 = true;
      if (pageEvent == null || !pageEvent) {
        pageEvent = { page: 0, size: this.pageSize };
      }
      if(!this.enableGlobalSearch){
      if (this.filterFlag1) {
        if(!this.defaultFlag){

          this.usersService.searchInProjectOrPortfolio(params, pageEvent, this.flag, this.callId).subscribe((res) => {
            this.currentPage = res;
            this.users = res.content;
            this.users = this.users.sort((a, b) =>
              a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1
            );
            this.wavesLength = res.totalElements;
            this.pageIndex = 0;
            this.UserProjectRoleList = new MatTableDataSource(this.users);
            this.UserProjectRoleList.sort = this.sort;
            this.UserProjectRoleList.paginator = this.paginator;
            //If cannot find a username, it will then look for an email address
            if (this.UserProjectRoleList.data.length===0){
              let params;
              this.filterFlag1 = true;
              if (pageEvent == null || !pageEvent) {
                pageEvent = { page: 0, size: this.pageSize };
              }
              params = {
                user_email: this.userSearched
              };
              if (this.filterFlag1) {
                this.usersService.searchInProjectOrPortfolio(params, pageEvent, this.flag, this.callId).subscribe((res) => {
                  this.currentPage = res;
                  this.users = res.content;
                  this.users = this.users.sort((a, b) =>
                    a.user_email.toLowerCase() > b.user_email.toLowerCase() ? 1 : -1
                  );
                  this.wavesLength = res.totalElements;
                  this.UserProjectRoleList = new MatTableDataSource(this.users);
                  this.UserProjectRoleList.sort = this.sort;
                  this.UserProjectRoleList.paginator = this.paginator;
                });
              }
            }
          });

        } else {
          this.usersService.search(params, pageEvent).subscribe((res) => {
            this.currentPage = res;
            this.users = res.content;
            this.users = this.users.sort((a, b) =>
              a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1
            );
            this.wavesLength = res.totalElements;
            this.pageIndex = 0;
            this.UserProjectRoleList = new MatTableDataSource(this.users);
            this.UserProjectRoleList.sort = this.sort;
            this.UserProjectRoleList.paginator = this.paginator;
            //If cannot find a username, it will then look for an email address
            if (this.UserProjectRoleList.data.length===0){
              let params;
              this.filterFlag1 = true;
              if (pageEvent == null || !pageEvent) {
                pageEvent = { page: 0, size: this.pageSize };
              }
              params = {
                user_email: this.userSearched
              };
              if (this.filterFlag1) {
                this.usersService.search(params, pageEvent).subscribe((res) => {
                  this.currentPage = res;
                  this.users = res.content;
                  this.users = this.users.sort((a, b) =>
                    a.user_email.toLowerCase() > b.user_email.toLowerCase() ? 1 : -1
                  );
                  this.wavesLength = res.totalElements;
                  this.UserProjectRoleList = new MatTableDataSource(this.users);
                  this.UserProjectRoleList.sort = this.sort;
                  this.UserProjectRoleList.paginator = this.paginator;
                });
              }
            }
          });
        }
      }
      } else {

        this.usersService.search(params, pageEvent).subscribe((res) => {
          this.currentPage = res;
          this.users = res.content;
          this.users = this.users.filter((ele) => ele.user_email.toLowerCase() == value.toLowerCase());
          this.users = this.users.sort((a, b) =>
            a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1
          );
          this.wavesLength = this.users.length;
          this.pageIndex = 0;
          this.UserProjectRoleList = new MatTableDataSource(this.users);
          this.UserProjectRoleList.sort = this.sort;
          this.UserProjectRoleList.paginator = this.paginator;
          //If cannot find a username, it will then look for an email address
          if (this.UserProjectRoleList.data.length===0){
            let params;
            this.filterFlag1 = true;
            if (pageEvent == null || !pageEvent) {
              pageEvent = { page: 0, size: this.pageSize };
            }
            params = {
              user_email: this.userSearched
            };
            if (this.filterFlag1) {
              this.usersService.search(params, pageEvent).subscribe((res) => {
                this.currentPage = res;
                this.users = res.content;
                this.users = this.users.filter((ele) => ele.user_email.toLowerCase() == value.toLowerCase());
                this.users = this.users.sort((a, b) =>
                  a.user_email.toLowerCase() > b.user_email.toLowerCase() ? 1 : -1
                );
                this.wavesLength = this.users.length;
                this.UserProjectRoleList = new MatTableDataSource(this.users);
                this.UserProjectRoleList.sort = this.sort;
                this.UserProjectRoleList.paginator = this.paginator;
              });
            }
          }
        });
      }
    }
  }

  // valueChangeEmail(event) {
  //   this.selectedemail = event;
  // }

  // valueChangeLogin(event) {
  //   this.selecteduserlogin = event;
  // }

  // Search() {
  //   if (this.selecteduserlogin == "All" && this.selectedemail == "All") {
  //     this.assignCopy();
  //   } else if (this.selecteduserlogin != "All" && this.selectedemail == "All") {
  //     this.users = Object.assign([], this.currentPage.content).filter(
  //       (item1) => item1.user_login.toLowerCase() == this.selecteduserlogin.toLowerCase()
  //     );
  //   } else if (this.selecteduserlogin == "All" && this.selectedemail != "All") {
  //     this.users = Object.assign([], this.currentPage.content).filter(
  //       (item1) => item1.user_email.toLowerCase() == this.selectedemail.toLowerCase()
  //     );
  //   } else if (this.selecteduserlogin != "All" && this.selectedemail != "All") {
  //     this.users = Object.assign([], this.currentPage.content).filter(
  //       (item1) =>
  //         item1.user_email.toLowerCase() == this.selectedemail.toLowerCase() &&
  //         item1.user_login.toLowerCase() == this.selecteduserlogin.toLowerCase()
  //     );
  //   }

  //   this.UserProjectRoleList = new MatTableDataSource(this.users);
  //   this.UserProjectRoleList.sort = this.sort;
  //   this.UserProjectRoleList.paginator = this.paginator;
  // }
  Search(pageEvent) {
    let newtasks = new Array<Project>();
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }
    this.pageIndex = 0;
    let params;
    if (this.selecteduserlogin == undefined && this.selectedemail == undefined) {
      this.ClearFilter();
      this.filterFlag = true;
    } else if (this.selecteduserlogin != undefined && this.selectedemail == undefined) {
      params = {
        user_login: this.selecteduserlogin,
      };
      this.filterFlag = true;
    } else if (this.selecteduserlogin == undefined && this.selectedemail != undefined) {
      params = {
        user_email: this.selectedemail,
      };
      this.filterFlag = true;
    } else {
      params = {
        user_login: this.selecteduserlogin,
        user_email: this.selectedemail,
      };
      this.filterFlag = true;
    }
    if (this.filterFlag) {
      this.usersService.search(params, pageEvent).subscribe((res) => {
        this.currentPage = res;
        this.users = res.content;
        this.users = this.users.sort((a, b) =>
          a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1
        );
        this.wavesLength = res.totalElements;
        this.UserProjectRoleList = new MatTableDataSource(this.users);
        this.UserProjectRoleList.sort = this.sort;
        this.UserProjectRoleList.paginator = this.paginator;
      });
    }
  }
  ClearFilter() {
    this.selectedemail = undefined;
    this.selecteduserlogin = undefined;
    this.myInputReference.nativeElement.value = null;
    if(this.pageEvent && this.deleteItem){
      if((this.pageEvent.length-1)%this.pageSize == 0){
          this.pageEvent.pageIndex = this.pageEvent.pageIndex == 0 ? this.pageEvent.pageIndex : this.pageEvent.pageIndex-1;
          this.pageIndex = this.pageEvent.pageIndex;
      }
      this.pageEvent.length--;
      this.getAllUserss({ page: this.pageEvent.pageIndex, size: this.pageSize });
    }
    else{
      // this.lastPage = false;
      this.getAllUserss(null);
    }
    this.deleteItem = false;
    this.filterFlag1 = false;
    this.userSearched = undefined;
    this.filterFlag = false;
  }
  compareTodiff(curr:any,prev:any){
     let temparr=[];
     Object.keys(prev).forEach(key => {
     if(prev[key]!=curr[key])
     temparr.push(key)
    });
    return temparr;
   }
  UpdateUser(user) {
    this.user.user_login = this.user.user_login.trim();
    this.user.user_email = this.user.user_email.trim();
    this.user.user_f_name = this.user.user_f_name.trim();
    if(this.user.country == null || this.user.country == undefined){
      this.user.country = 'India';
    }

    if(this.user && this.user.country.trim().length > 0 && (!this.user.timezone || this.user.timezone.trim().length == 0)){
      this.user.timezone = this.tzNames[0];
    }

  
    if(this.user.timezone == null || this.user.timezone == undefined){
      this.user.timezone = 'Asia/Kolkata';
    }

    if (user.user_login == undefined || user.user_login.trim().length == 0 || user.user_login == null) {
      this.messageService.error("Please Provide User Login", Msg.APP);
    } else if (
      user.user_email == undefined ||
      user.user_email == null ||
      user.user_email.trim().length == 0
    ) {
      this.messageService.error("Please Provide User Email", Msg.APP);
    } else if (!user.user_email.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)) {
      this.messageService.error("This User Email does not match the required pattern", Msg.APP);
    } else if (
      user.user_f_name == undefined ||
      user.user_f_name == null ||
      user.user_f_name.trim().length == 0
    ) {
      this.messageService.error("Please Provide User First Name", Msg.APP);
    } else if (user.user_f_name.length > 255) {
      this.messageService.info("User first name cannot be more than 255 characters", Msg.APP);
    } else if (user.user_m_name && user.user_m_name.length > 255) {
      this.messageService.info("User middle name cannot be more than 255 characters", Msg.APP);
    } else if (user.user_l_name && user.user_l_name.length > 255) {
      this.messageService.info("User last name cannot be more than 255 characters", Msg.APP);
    } else if (
      user.user_f_name &&
      !/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(user.user_f_name)
    ) {
      this.messageService.error("User First Name format is incorrect", Msg.APP);
    } else if (
      user.user_m_name &&
      !/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(user.user_m_name)
    ) {
      this.messageService.error("User Middle Name format is incorrect", Msg.APP);
    } else if (
      user.user_l_name &&
      !/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(user.user_l_name)
    ) {
      this.messageService.error("User Last Name format is incorrect", Msg.APP);
    } else if (user.user_login != "") {
      let flag: boolean = false;
      if (this.userss) {
        let arr1 = this.userss.filter(
          (item) => item.id != user.id && item.user_login.toLowerCase() == user.user_login.toLowerCase()
        );
        let arr2 = this.userss.filter(
          (item) => item.id != user.id && item.user_email.toLowerCase() == user.user_email.toLowerCase()
        );
        if (arr1.length > 0) {
          flag = true;
          this.messageService.error("User Already Exists", "IAMP");
          return;
        }
        if (arr2.length > 0) {
          flag = true;
          this.messageService.error("User Email already exists", "IAMP");
          return;
        }
      }

      if (this.userDetailCheck) {
        this.userDetailJson.forEach((ele) => {
          if (ele.pointer == "" || ele.value == "" || ele.pointer == null || ele.value == null) {
            flag = true;
            this.messageService.info("User Details cannot be empty", "LEAP");
          }
        });
      } else {
        user.clientDetails = null;
      }
      if (!flag) {
        try {
          if (this.userDetailCheck && this.userDetailJson[0].pointer != "" && this.userDetailJson[0].value != "")
            user.clientDetails = JSON.stringify(this.userDetailJson);
        } catch (e : any)  {
          user.clientDetails = null;
        }
      }
      user.activated = true;
      user.user_act_ind = false;
      if (!flag) {
        if (sessionStorage.getItem("telemetry") == "true") {
        let arr1=[];
        if(this.userss){
       arr1 = this.userss.filter(
          (item) => item.id == user.id && item.user_login.toLowerCase() == user.user_login.toLowerCase()
        );
        }
        let diff=this.compareTodiff(user,arr1[0])
        // this.telemetryService.audit(user, arr1[0],diff);
      }
        this.busy = this.usersService.update(user).subscribe(
          (res) => {
            this.messageService.info("Updated Successfully", "IAMP");
            if (sessionStorage.getItem("user")) {
              let user: Users;
              try {
                user = JSON.parse(sessionStorage.getItem("user"));
              } catch (e : any)  {
                user = null;
                console.error("JSON.parse error - ", e.message);
              }
              let currentUser = user;
              if (res.id == currentUser.id) {
                try {
                  sessionStorage.setItem("user", JSON.stringify(res));
                } catch (e : any)  {
                  console.error("JSON.stringify error - ", e.message);
                }
                sessionStorage.setItem("UpdatedUser", "true");
              }
            }
            this.user = res;
            this.ClearInfo();
            this.showCreate = false;
            this.listUsers();
          },
          (error) => this.messageService.info("Could not Update", "IAMP")
        );
      }
    }
  }

  // checkEnterPressed(event: any, val: any) {
  //   if (event.keyCode === 13) {
  //     this.filterItem(event.srcElement.value);
  //   }
  // }
  removelogo() {
    this.url = null;
    //this.myInputReference.nativeElement.value = null;
    this.user.profileImage = null;
    this.user.profileImageName = null;
  }

  deleteChild(index: any) {
    if (this.userDetailJson.length > 1) this.userDetailJson.splice(index, 1);
  }

  addChild(child: any) {
    if (
      child.pointer == undefined ||
      child.value == undefined ||
      child.pointer.trim().length < 1 ||
      child.value.trim().length < 1 ||
      child.pointer == null ||
      child.value == null
    )
      this.messageService.error("Enter all mandatory fields", "IAMP");
    else this.userDetailJson.push({ pointer: "", value: "" });
  }
  trackByMethod(index, item) { }
  onPageFired(event) {
    this.pageEvent = event;
    // this.lastPage = !(this.paginator.hasNextPage());
    // console.log(this.paginator.hasNextPage());
    if (this.filterFlag == false && this.filterFlag1 == false){
      this.getAllUserss({ page: event.pageIndex, size: this.pageSize });
      this.pageIndex = event.pageIndex;
    }
      
    else if (this.filterFlag == true){
       this.Search({ page: event.pageIndex, size: this.pageSize });
    }
    else if (this.filterFlag1 == true){
      this.filterItem(this.userSearched, { page: event.pageIndex, size: this.pageSize });
    }
      
  }

  checkFirstNameMaxLength() {
    if (this.user.user_f_name.length >= 255) {
      this.showfNameLengthErrorMessage = true;
    } else {
      this.showfNameLengthErrorMessage = false;
    }
  }

  checkMiddleNameMaxLength() {
    if (this.user.user_m_name.length >= 255) {
      this.showmNameLengthErrorMessage = true;
    } else {
      this.showmNameLengthErrorMessage = false;
    }
  }

  checkLastNameMaxLength() {
    if (this.user.user_l_name.length >= 255) {
      this.showlNameLengthErrorMessage = true;
    } else {
      this.showlNameLengthErrorMessage = false;
    }
  }

  checkLoginNameMaxLength() {
    if (this.user.user_login.length >= 255) {
      this.showLoginNameErrorMessage = true;
    } else {
      this.showLoginNameErrorMessage = false;
    }
  }

  checkEmailMaxLength() {
    if (this.user.user_email.length >= 255) {
      this.showEmailErrorMessage = true;
    } else {
      this.showEmailErrorMessage = false;
    }
  }

  getUserName(data) {
    var userName = "";
    if (data.user_f_name) {
      userName += data.user_f_name + " ";
    }

    if (data.user_m_name) {
      userName += data.user_m_name + " ";
    }

    if (data.user_l_name) {
      userName += data.user_l_name + " ";
    }
    return userName;
  }


  fetchCountries() {
    this.https.get("./assets/json/country-list.json").subscribe(
      (data) => {
        let countries: any[] = JSON.parse(JSON.stringify(data["countries"]))
        Object.values(countries).forEach(
          (item)=>{
            this.countryMap.set(item.name.toString(),item.abbr.toString());
          }
        );
        this.countryNames = [...this.countryMap.keys()].sort();
      }
    )
  }
  fetchTimezone(event){
    this.tzNames = [];
    this.user.timezone = '';
    this.tzNames = moment.tz.zonesForCountry(this.countryMap.get(event.value));
  }

  resetChanges(isDisabled,type){
    if(!isDisabled){
      if(type === "userDetailCheck"){
        this.userDetailJson.forEach(item => {
          item.key = null;
          item.pointer = null;
          item.value = null;
        })
      }
    }
  }
}
