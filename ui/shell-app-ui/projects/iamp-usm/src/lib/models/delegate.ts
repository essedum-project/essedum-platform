import { Project } from "./project";
import { Users } from "./users";
import { Role } from "./role";
export class Delegate {
    id: number;
    login_id: Users;
    process_id: number;
    is_delegate: boolean;
    alternate_user: string;
    start_time: any;
    end_time: any;
    reason: string;
    comments: string;
    last_updated_user: string;
    last_updated_date: any;
    is_active: boolean;
    role_id: Role;
    notifyViaMail: boolean;
    from: string;
    to: string;
    cc: string;
    subject: string;
    message: string;
    project_id: Project;

    constructor(json? : any){
        if(json != null){
            this.id = json.id;
            this.login_id = json.login_id;
            this.process_id = json.process_id;
            this.is_delegate = json.is_delegate;
            this.reason = json.reason;
            this.role_id = json.role_id;
            this.alternate_user = json.alternate_user;
            this.start_time = json.start_time;
            this.end_time = json.end_time;
            this.notifyViaMail = json.notifyViaMail;
            this.from = json.from;
            this.to = json.emailTo;
            this.cc = json.cc;
            this.subject = json.subject;
            this.message = json.message;
            this.is_active = json.is_active;
            this.project_id = json.project_id;
            this.last_updated_user = json.last_updated_user;
            this.last_updated_date = json.last_updated_date;
            this.comments = json.comments;
        }
    }

    static toArray(jsons: any[]): Delegate[] {
        let delegates: Delegate[] = [];
        if (jsons != null) {
         for (let json of jsons) {
          delegates.push(new Delegate(json));
         }
        }
        return delegates;
       }
}