import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Optional,
  Output,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { UsmRolePermissions } from "projects/iamp-usm/src/lib/models/usm-role-permissions";
import { Role } from "projects/iamp-usm/src/lib/models/role";
import { UsmPermissions } from "projects/iamp-usm/src/lib/models/usm-permissions";
import { RoleService } from "projects/iamp-usm/src/lib/services/role.service";
import { UsmPermissionsService } from "projects/iamp-usm/src/lib/services/usm-permission.service";
import { MessageService } from "projects/iamp-usm/src/lib/services/message.service";
import { Project } from "projects/iamp-usm/src/lib/models/project";
import { UsmRolePermissionsService } from "projects/iamp-usm/src/lib/services/usm-role-permissions.service";
import { Subscription } from "rxjs";

@Component({
  selector: "lib-role-permission-add",
  templateUrl: "./role-permission-add.component.html",
  styleUrl: "./role-permission-add.component.css",
})

export class RolePermissionAddComponent implements OnInit {
  edit: boolean = false;
  view: boolean = false;
  createRolePermissionLabel = "Create Role Permission";
  editRolePermissionLabel = "Edit Role Permission";
  viewRolePermissionLabel = "View Role Permission";
  saveRolePermissionLabel = "Save Role Permission";
  updateRolePermissionLabel = "Update Role Permission";
  clearLabel = "Clear";
  roleLabel = "Role";
  modulePermissionLabel = "Module-Permission";
  rolePermission: UsmRolePermissions = new UsmRolePermissions();
  @Output() rolePermissionModelClosed = new EventEmitter<void>();
  modulepermissionarrayFilter = [];  
  modulepermissionarray = [];
  roleArray = [];
  dbsViewFlag: boolean = false;
  examplerole: Role = new Role();
  examplepermission: UsmPermissions = new UsmPermissions();
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };

  showRoleError: boolean = false;
  showPermissionError: boolean = false;  busy: Subscription;
  
  constructor(
    public dialog: MatDialog,
    @Optional() public dialogRef: MatDialogRef<RolePermissionAddComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private changeDetectionRef: ChangeDetectorRef,
    private roleService: RoleService,
    private usmPermissionsService: UsmPermissionsService,
    private messageService: MessageService,
    private usmRolePermissionsService: UsmRolePermissionsService
  ) {}ngOnInit(): void {

    this.loadRolesAndPermissions();

    if (!this.rolePermission.permission) {
      this.rolePermission.permission = [];
    }
    
    if (this.data) {
      if (this.data.mode === "edit" || this.data.mode === "view") {
        this.rolePermission =
          this.data.rolePermission || new UsmRolePermissions();

        if (this.rolePermission.permission && !Array.isArray(this.rolePermission.permission)) {
          this.rolePermission.permission = [this.rolePermission.permission];
        } else if (!this.rolePermission.permission) {
          this.rolePermission.permission = [];
        }

        this.view = this.data.mode === "view";
        this.edit = true;

        if (this.rolePermission.role) {
          this.showRoleError = false;
        }
        
        if (this.rolePermission.permission && this.rolePermission.permission.length > 0) {
          this.showPermissionError = false;
          this.permissionCheck(null);
        }
      }
    }
  }

  /**
   * Load roles and permissions from API services
   */
  loadRolesAndPermissions() {
    this.loadRoles();
    this.loadPermissions();
  }

  /**
   * Load all roles from the API
   */
loadRoles() {
    this.roleArray = [];
    this.examplerole.projectId = null;
    this.roleService.findAll(this.examplerole, this.lazyload).subscribe((response) => {
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e) {
        project = null;
        //console.error("JSON.parse error - ", e.message);
      }
      this.roleArray = response.content;
      // let projectid = project.id;
      // this.rolearray = response.content.filter((role) => role.projectId == null || role.projectId == projectid);
      this.roleArray=response.content.filter((role) => role.id!=8);
      let role = JSON.parse(sessionStorage.getItem("role"))
      if(role.roleadmin){
        this.roleArray=response.content.filter((value) => (!value.projectId || value.projectId==project.id) && value.id!=6);
      }
      this.roleArray = this.roleArray.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
    });

    // this.loadPage({ first: 0, rows: 5000, sortField: null, sortOrder: null });
  }

  /**
   * Load all permissions from the API
   */
  loadPermissions() {

    this.modulepermissionarray = [];
    this.modulepermissionarray = [];
    this.usmPermissionsService.findAll(this.examplepermission, this.lazyload).subscribe((response) => {
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e) {
        project = null;
      }
      this.modulepermissionarray = response.content;
      this.modulepermissionarray = this.modulepermissionarray.filter(
        (arr, index, self) =>
          index === self.findIndex((t) => t.module === arr.module && t.permission === arr.permission)
      );
      this.modulepermissionarray = this.modulepermissionarray.sort((a, b) =>
        a.module.toLowerCase() > b.module.toLowerCase() ? 1 : -1
      );
      this.modulepermissionarrayFilter=this.modulepermissionarray

    });
  
  }

  closeDialog(): void {
    const openDialogs = this.dialog.openDialogs;
    for (const dialog of openDialogs) {
      if (dialog.componentInstance instanceof RolePermissionAddComponent) {
        dialog.close();
        this.dialogRef.afterClosed().subscribe(() => {
          this.rolePermissionModelClosed.emit();
        });
      }
    }
  }

  onKey(value) {
    if (!value) {
      this.modulepermissionarrayFilter = [...this.modulepermissionarray];
      return;
    }
  
    this.modulepermissionarrayFilter = this.search(value);
    console.log("searched usm-permission", this.modulepermissionarrayFilter);
    this.changeDetectionRef.detectChanges();
  }

  search(value: string) {
    let filter = value.toLowerCase();
    return this.modulepermissionarray.filter((option) => 
      (option.module + '-' + option.permission).toLowerCase().includes(filter)
    );
  }
  
  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }
  compareObjects1(o1: any, o2: any): boolean {
    return o1 && o2 && o1.module === o2.module && o1.permission === o2.permission;
  }
  
  roleSelectionChanged(event) {
    this.showRoleError = !this.rolePermission.role;
  }

  editViewChanged(type: "edit" | "view") {
    if (type === "edit") {
      this.edit = true;
      this.view = false;
    } else if (type === "view") {
      this.view = true;
      this.edit = false;
    }
  }  
  
  validateForm(): boolean {    
    this.showRoleError = false;
    this.showPermissionError = false;

    if (!this.rolePermission.role) {
      this.showRoleError = true;
    }
    
    const permissions = this.rolePermission.permission;
    if (!permissions || permissions.length === 0) {
      this.showPermissionError = true;
    }
    
    return !this.showRoleError && !this.showPermissionError;
  }  onSave() {
    let project: Project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      project = null;
    }  

    if (this.rolePermission.role == undefined || this.rolePermission.role == null) {
      this.messageService.error("Please Select A Role", "LEAP");
    } else if (
      this.rolePermission.permission == undefined ||
      this.rolePermission.permission == null
    ) {
      this.messageService.error("Please Select A Module and Permission", "LEAP");
    } else {
      if (this.edit) {
        this.performUpdateRolePermission();
      } else {
        this.performCreateRolePermission();
      }
    }
  }

  performCreateRolePermission() {
    const rolePermissionsArray = new Array<UsmRolePermissions>();
    const permissions: UsmPermissions[] = this.rolePermission.permission as UsmPermissions[];
    
    if (permissions && permissions.length > 0) {
      permissions.forEach((element) => {
        const temp = new UsmRolePermissions();
        temp.permission = [element];
        temp.role = this.rolePermission.role;
   
        if (!temp.role || !temp.role.id) {
          console.error('Invalid role object', temp.role);
        }
        
        rolePermissionsArray.push(temp);
      });
      console.log('About to send role permissions data:', JSON.stringify(rolePermissionsArray));

      this.busy = this.usmRolePermissionsService.createAll(rolePermissionsArray).subscribe(
        (response) => {
          console.log('Role permissions created successfully:', response);
          this.messageService.info("Role-Permissions Saved Successfully", "LEAP");
          

          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.rolePermissionModelClosed.emit();
          }
        },
        (error) => {
          console.error('Error creating role permissions:', error);

          const errorMsg = error?.error?.message || error?.statusText || "Could not create Role-Permissions";
          const statusCode = error?.status || "Unknown";
          this.messageService.error(`Error ${statusCode}: ${errorMsg}`, "LEAP");

          if (rolePermissionsArray.length === 1) {
            console.log('Trying alternative approach with single object...');
            const singlePermission = rolePermissionsArray[0];
              if (!Array.isArray(singlePermission.permission)) {
              singlePermission.permission = [singlePermission.permission];
            }
            
            this.usmRolePermissionsService.create(singlePermission).subscribe(
              (resp) => {
                console.log('Single permission created successfully:', resp);
                this.messageService.info("Role-Permission Saved Successfully", "LEAP");
                if (this.dialogRef) {
                  this.dialogRef.close(true);
                }
              },              (err) => {
                console.error('Single permission creation also failed:', err);
      
                const errDetails = err?.error?.message || err?.statusText || JSON.stringify(err);
                this.messageService.error(`All attempts failed. Last error: ${errDetails}`, "LEAP");
              }
            );
          }
        }
      );
    }
  }
  
  performUpdateRolePermission() {
    if (!this.rolePermission.id) {
      this.messageService.error("Cannot update: No role permission ID found", "LEAP");
      return;
    }

    if (this.rolePermission.permission && !Array.isArray(this.rolePermission.permission)) {
      this.rolePermission.permission = [this.rolePermission.permission];
    }

    this.busy = this.usmRolePermissionsService.update(this.rolePermission).subscribe(
      (response) => {
        this.messageService.info("Role-Permission Updated Successfully", "LEAP");

        if (this.dialogRef) {
          this.dialogRef.close(true);
        }
      },
      (error) => {
        this.messageService.error("Could not update Role-Permission", "LEAP");
      }
    );
  }


  clearWave() {
    this.rolePermission = new UsmRolePermissions();
    
    this.showRoleError = false;
    this.showPermissionError = false;
  }  permissionCheck(event) {
    let flag: boolean = false;
    let permissions = this.rolePermission.permission;

    if (!Array.isArray(permissions)) {
      this.rolePermission.permission = permissions ? [permissions] : [];
      permissions = this.rolePermission.permission;
    }
    
    if (permissions && permissions.length >= 1) {
      permissions.forEach(element => {
        if (element.module == "dbs" && element.permission == "view")
          flag = true;
      });
    }
    
    this.dbsViewFlag = flag;
    this.showPermissionError = !permissions || permissions.length === 0;
  }
}
