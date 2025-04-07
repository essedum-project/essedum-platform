import { Process } from "./process";
import { Project } from "./project";
import { Users } from "./users";

export class Stage{
    id: number;
    project_id: Project;
    user_id: Users;
    process_id: Process;
    stage_id: number;

    constructor(json?: any){
        if(json != null){
            this.id = json.id;
            this.project_id = json.project_id;
            this.user_id = json.user_id;
            this.process_id = json.process_id;
            this.stage_id = json.stage_id;
        }
    }

    static toArray(jsons: any[]): Stage[] {
        let stage: Stage[] = [];
        if (jsons != null) {
         for (let json of jsons) {
          stage.push(new Stage(json));
         }
        }
        return stage;
    }
}