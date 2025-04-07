export declare class Role {
    projectId: number;
    id: number;
    name: string;
    description: string;
    permission: boolean;
    roleadmin: boolean;
    projectadmin: boolean;
    constructor(json?: any);
    getProjectId(): any;
    static toArray(jsons: any[]): Role[];
}
