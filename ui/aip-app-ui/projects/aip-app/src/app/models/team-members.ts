

export class TeamMembers {
    // Raw attributes
    id: number;
    // userId: User[];
    userId: number;
    teamId: any;



    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.userId=json.userId;
            this.teamId=json.teamId;

        }
    }


    static toArray(jsons: any[]): TeamMembers[] {
        let team_members: TeamMembers[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                team_members.push(new TeamMembers(json));
            }
        }
        return team_members;
    }
}
