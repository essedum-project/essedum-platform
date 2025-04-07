import { Process } from "./process";
import { Role } from "./role";
import { Project } from "./project";

export class RoleProcess{

    id: number;
    process_id: Process;
    role_id: Role;
    role_hierarchy: number;
    last_updated_date: string;
    last_updated_user: string;
    is_role_based_search_access: boolean;
    is_role_based_reassign_access: boolean;
    is_role_based_assign_access: boolean;
    is_role_based_transfer_access: boolean;
    is_role_based_bulkPage_access: boolean;
    is_role_based_manualPage_access: boolean;
    project_id: Project;

    constructor(json?: any){
        if(json != null){
            this.id = json.id;
            this.process_id = json.process_id;
            this.role_id = json.role_id;
            this.role_hierarchy = json.role_hierarchy;
            this.last_updated_date = json.last_updated_date;
            this.last_updated_user = json.last_updated_user;
            this.is_role_based_search_access = json.is_role_based_search_access;
            this.is_role_based_reassign_access = json.is_role_based_reassign_access;
            this.is_role_based_assign_access = json.is_role_based_assign_access;
            this.is_role_based_transfer_access = json.is_role_based_transfer_access;
            this.is_role_based_bulkPage_access = json.is_role_based_bulkPage_access;
            this.is_role_based_manualPage_access = json.is_role_based_manualPage_access;
            this.project_id = json.project_id;
        }
    }

    static toArray(jsons: any[]): RoleProcess[]{
        let roleProcess: RoleProcess[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                roleProcess.push(new RoleProcess(json));
            }
        }
        return roleProcess;
    }


}