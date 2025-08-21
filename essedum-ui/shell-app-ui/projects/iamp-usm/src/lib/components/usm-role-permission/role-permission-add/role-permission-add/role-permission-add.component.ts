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
  
  // Validation flags
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
    // Load data from APIs
    this.loadRolesAndPermissions();
    
    // Initialize rolePermission with default values
    if (!this.rolePermission.permission) {
      this.rolePermission.permission = [];
    }
    
    if (this.data) {
      if (this.data.mode === "edit" || this.data.mode === "view") {
        this.rolePermission =
          this.data.rolePermission || new UsmRolePermissions();

        // Ensure permission is always an array
        if (this.rolePermission.permission && !Array.isArray(this.rolePermission.permission)) {
          this.rolePermission.permission = [this.rolePermission.permission];
        } else if (!this.rolePermission.permission) {
          this.rolePermission.permission = [];
        }

        this.view = this.data.mode === "view";
        this.edit = true;
        
        // Reset validation errors when in edit/view mode with existing data
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
        //console.error("JSON.parse error - ", e.message);
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
    
      // this.permissionarray = response.content;
      // this.permissionarray = this.permissionarray.filter(
      //   (arr, index, self) => index === self.findIndex((t) => t.permission === arr.permission)
      // );
      // this.permissionarray = this.permissionarray.sort((a, b) => (a.permission.toLowerCase() > b.permission.
      //toLowerCase() ? 1 : -1));
      // this.permissionarraycopy=this.permissionarray;
    });
    // this.loadPage({ first: 0, rows: 5000, sortField: null, sortOrder: null });
  
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
    
    // Filter the permissions based on search value
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
    // Update validation flag for role
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
  }  validateForm(): boolean {
    // Reset validation flags
    this.showRoleError = false;
    this.showPermissionError = false;
    
    // Check role validation
    if (!this.rolePermission.role) {
      this.showRoleError = true;
    }
    
    // Check permissions validation - ensure it's always treated as an array
    const permissions = this.rolePermission.permission;
    if (!permissions || permissions.length === 0) {
      this.showPermissionError = true;
    }
    
    // Return true if form is valid
    return !this.showRoleError && !this.showPermissionError;
  }
  onSave() {
    // Validate the form
    if (!this.validateForm()) {
      return;
    }
    
    // Get project information if needed
    let project: Project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      project = null;
    }
    
    // Process role permissions based on mode
    if (this.edit) {
      this.performUpdateRolePermission();
    } else {
      this.performCreateRolePermission();
    }
  }
  performCreateRolePermission() {
    // Create array of role permissions
    const rolePermissionsArray = new Array<UsmRolePermissions>();
    const permissions: UsmPermissions[] = this.rolePermission.permission as UsmPermissions[];
    
    if (permissions && permissions.length > 0) {
      // Process each permission
      permissions.forEach((element) => {
        const temp = new UsmRolePermissions();
        // Ensure permissions is always an array
        temp.permission = [element];
        temp.role = this.rolePermission.role;
        
        // Make sure the role is properly set
        if (!temp.role || !temp.role.id) {
          console.error('Invalid role object', temp.role);
        }
        
        rolePermissionsArray.push(temp);
      });
      
      // Debug the payload
      console.log('About to send role permissions data:', JSON.stringify(rolePermissionsArray));
      
      // Call API to create role permissions
      this.busy = this.usmRolePermissionsService.createAll(rolePermissionsArray).subscribe(        (response) => {
          console.log('Role permissions created successfully:', response);
          this.messageService.info("Role-Permissions Saved Successfully", "LEAP");
          
          // Close dialog or return to list view based on context
          if (this.dialogRef) {
            this.dialogRef.close(true);
          }
        },
        (error) => {
          console.error('Error creating role permissions:', error);
          
          // Provide more detailed error message if available
          const errorMsg = error?.error?.message || "Could not create Role-Permissions";
          this.messageService.error(errorMsg, "LEAP");
          
          // Try with direct single object if array approach failed
          if (rolePermissionsArray.length === 1) {
            console.log('Trying alternative approach with single object...');
            const singlePermission = rolePermissionsArray[0];
            
            // Try with direct create method instead
            this.usmRolePermissionsService.create(singlePermission).subscribe(
              (resp) => {
                console.log('Single permission created successfully:', resp);
                this.messageService.info("Role-Permission Saved Successfully", "LEAP");
                if (this.dialogRef) {
                  this.dialogRef.close(true);
                }
              },
              (err) => {
                console.error('Single permission creation also failed:', err);
                this.messageService.error("All attempts to create Role-Permissions failed", "LEAP");
              }
            );
          }
        }
      );
    }
  }
  
  performUpdateRolePermission() {
    // Create array of role permissions to update
    if (!this.rolePermission.id) {
      this.messageService.error("Cannot update: No role permission ID found", "LEAP");
      return;
    }
    
    // Ensure permission is always an array
    if (this.rolePermission.permission && !Array.isArray(this.rolePermission.permission)) {
      this.rolePermission.permission = [this.rolePermission.permission];
    }
    
    // Call API to update role permission
    this.busy = this.usmRolePermissionsService.update(this.rolePermission).subscribe(
      (response) => {
        this.messageService.info("Role-Permission Updated Successfully", "LEAP");
        
        // Close dialog if in dialog mode
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
    // Reset the form fields
    this.rolePermission = new UsmRolePermissions();
    
    // Reset validation flags
    this.showRoleError = false;
    this.showPermissionError = false;
  }  permissionCheck(event) {
    let flag: boolean = false;
    let permissions = this.rolePermission.permission;
    
    // Ensure permissions is always an array
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
      
    // Update validation flag for permissions
    this.showPermissionError = !permissions || permissions.length === 0;
  }
}
