import { Component ,OnInit} from "@angular/core";

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
  saveRolePermission="Save Role Permission";
  updateRolePermission="Update Role Permission";
  clear="Clear";
  role="Role";
  module-permission="Module-Permission"


  constructor(){    
  }
  ngOnInit(): void {
    throw new Error("Method not implemented.");
  }
}
