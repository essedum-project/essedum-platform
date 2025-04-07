
// import { Project } from './project';

import { TeamMembers } from "./team-members";

export class Team {
    // Raw attributes
    id: number;
    name: String;
    description: String;
    // orgid: Organization;
    organizationId: number;
    // user: User;
    // project: Project[];
    // owner: User;
    owner: number;
    createdDate: Date;
    teamMembers: TeamMembers[];



    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.name=json.name;
            this.description=json.description;
            this.organizationId=json.organizationId;
            this.owner=json.owner;
            this.createdDate=json.createdDate;
            this.teamMembers = json.teamMembers;
            // this.project  = json.project ;
            // this.user  = json.user ;

        }
    }


    static toArray(jsons: any[]): Team[] {
        let team: Team[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                team.push(new Team(json));
            }
        }
        return team;
    }
}
