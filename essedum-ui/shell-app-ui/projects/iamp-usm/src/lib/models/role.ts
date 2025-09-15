export class Role {
 projectId: number;
 id: number;
 name: string;
 description: string;
 permission: boolean;
 roleadmin: boolean;
 projectadmin: boolean;
 portfolioId: number;
 projectAdminId: number;
 constructor(json?: any) {
  this.projectId = this.getProjectId();
  if (json != null) {
   this.id = json.id;
   this.name = json.name;
   this.description = json.description;
   this.permission = json.permission;
   this.projectId = json.projectId;
   this.roleadmin = json.roleadmin;
   this.projectadmin = json.projectadmin;
   this.portfolioId = json.portfolioId;
   this.projectAdminId = json.projectAdminId;
  }
 }
 getProjectId() {
  let project: any;
  try {
   project = JSON.parse(sessionStorage.getItem("project"));
  } catch (e : any)  {
   project = null;
   console.error("JSON.parse error - ", e.message);
  }
  let projectId = project.id;
  if (projectId == undefined || projectId === null) {
  } else if (isNaN(projectId)) {
  } else return projectId;
 }

 // Utils

 static toArray(jsons: any[]): Role[] {
  let roles: Role[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    roles.push(new Role(json));
   }
  }
  return roles;
 }
}
