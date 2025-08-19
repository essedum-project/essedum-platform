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

@Component({
  selector: "lib-role-permission-add",
  templateUrl: "./role-permission-add.component.html",
  styleUrl: "./role-permission-add.component.css",
})

export class RolePermissionAddComponent implements OnInit {
  edit: boolean = false;
  view: boolean = false;
  createRolePermission = "Create Role Permission";
  editRolePermission = "Edit Role Permission";
  viewRolePermission = "View Role Permission";
  saveRolePermission = "Save Role Permission";
  updateRolePermission = "Update Role Permission";
  clear = "Clear";
  role = "Role";
  modulePermission = "Module-Permission";  rolePermission: UsmRolePermissions = new UsmRolePermissions();
  @Output() rolePermissionModelClosed = new EventEmitter<void>();
  modulepermissionarrayFilter = [];  
  modulepermissionarray = [];
  roleArray = [];
  dbsViewFlag: boolean = false;
  
  // Validation flags
  showRoleError: boolean = false;
  showPermissionError: boolean = false;

  constructor(
    public dialog: MatDialog,
    @Optional() public dialogRef: MatDialogRef<RolePermissionAddComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private changeDetectionRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    // Initialize mock data
    this.initializeMockData();
    
    if (this.data) {
      if (this.data.mode === "edit" || this.data.mode === "view") {
        this.rolePermission =
          this.data.rolePermission || new UsmRolePermissions();

        this.view = this.data.mode === "view";
        this.edit = true;
        
        // Reset validation errors when in edit/view mode with existing data
        if (this.rolePermission.role) {
          this.showRoleError = false;
        }
        
        if (
          this.rolePermission.permission &&
          (Array.isArray(this.rolePermission.permission)
            ? this.rolePermission.permission.length > 0
            : true)
        ) {
          this.showPermissionError = false;
          this.permissionCheck(null);
        }
      }
    }
  }

  initializeMockData() {
    // Mock data for roles
    this.roleArray = [
      { id: 1, name: 'Admin', description: 'Administrator role', projectId: null },
      { id: 2, name: 'User', description: 'Standard user role', projectId: null },
      { id: 3, name: 'Manager', description: 'Manager role', projectId: null },
      { id: 4, name: 'Viewer', description: 'Read-only role', projectId: null },
      { id: 5, name: 'Developer', description: 'Developer role', projectId: null }
    ];

    // Mock data for module permissions
    this.modulepermissionarray = [
      { id: 1, module: 'usm', permission: 'create' },
      { id: 2, module: 'usm', permission: 'view' },
      { id: 3, module: 'usm', permission: 'edit' },
      { id: 4, module: 'usm', permission: 'delete' },
      { id: 5, module: 'dbs', permission: 'view' },
      { id: 6, module: 'dbs', permission: 'edit' },
      { id: 7, module: 'portfolio', permission: 'create' },
      { id: 8, module: 'portfolio', permission: 'view' },
      { id: 9, module: 'portfolio', permission: 'edit' },
      { id: 10, module: 'portfolio', permission: 'delete' }
    ];

    // Initialize the filtered array with all permissions
    this.modulepermissionarrayFilter = [...this.modulepermissionarray];
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
    
    // Check permissions validation
    const permissions: any = this.rolePermission.permission;
    if (!permissions || (Array.isArray(permissions) && permissions.length === 0)) {
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
    
    // Implement your save functionality here
    console.log('Role Permission to save:', this.rolePermission);
    
    // Close dialog on successful save
    this.closeDialog();
  }
  clearWave() {
    // Reset the form fields
    this.rolePermission = new UsmRolePermissions();
    
    // Reset validation flags
    this.showRoleError = false;
    this.showPermissionError = false;
  }  permissionCheck(event) {
    let flag: boolean = false;
    let permissions: any = this.rolePermission.permission;
    
    if (permissions && Array.isArray(permissions) && permissions.length >= 1) {
      permissions.forEach(element => {
        if (element.module == "dbs" && element.permission == "view")
          flag = true;
      });
    }
    
    if (flag)
      this.dbsViewFlag = true;
    else
      this.dbsViewFlag = false;
      
    // Update validation flag for permissions
    this.showPermissionError = !permissions || (Array.isArray(permissions) && permissions.length === 0);
  }
}
