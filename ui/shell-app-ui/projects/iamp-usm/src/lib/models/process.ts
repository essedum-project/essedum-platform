import { Project } from "./project";

export class Process {
    process_id: number;
    process_name: string;
    process_display_name: string;
    process_description: string;
    workflow_id: string;
    is_active: boolean;
    created_date: any;
    last_updated_date: any;
    last_updated_user: string;
    project_id: Project;

    constructor(json? : any){
        if(json != null){
            
            this.process_id = json.process_id;
            this.process_name = json.process_name;
            this.process_display_name = json.process_display_name;
            this.process_description = json.process_description;
            this.workflow_id = json.workflow_id;
            this.is_active = json.is_active;
            this.created_date = json.created_date;
            this.last_updated_date = json.last_updated_date;
            this.last_updated_user = json.last_updated_user;
            this.project_id = json.project_id;

        }
    }

    static toArray(jsons: any[]): Process[] {
        let process: Process[] = [];
        if (jsons != null) {
         for (let json of jsons) {
          process.push(new Process(json));
         }
        }
        return process;
    }

}