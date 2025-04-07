export class Groups {

    id: number;
    alias: string;
    name: string;
    description: string;
    organization: string;
    // models: StreamingServices[];

    constructor(json?: any) {
        if (json != null) {
            this.id  = json.cid ;
            this.alias = json.alias,
            this.name  = json.name ;
            this.description  = json.description ;
            this.organization = json.organization;
            // this.models = StreamingServices.toArray(json.iCNIPPartialStreamingServices);
        }
    }

    // Utils

    static toArray(jsons: any[]): Groups[] {
        const groups: Groups[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                groups.push(new Groups(json));
            }
        }
        return groups;
    }
}
