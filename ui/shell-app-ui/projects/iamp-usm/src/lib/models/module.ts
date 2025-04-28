export class UsmModules {
    id: number;
    name: string;
    display_name: string;
    descriptions: string;
    users_count: string;
    module_type: string;
    url: string;
    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.name = json.name;
            this.descriptions = json.descriptions;
            this.display_name = json.display_name;
            this.module_type = json.module_type;
            this.url = json.url;
            this.users_count = json.users_count;
        }
    };
    static toArray(jsons: any[]): UsmModules[] {
        let usmModules: UsmModules[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                usmModules.push(new UsmModules(json));
            }
        }
        return usmModules;
    }
}
