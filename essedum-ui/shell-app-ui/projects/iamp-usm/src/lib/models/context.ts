export class Context {
    id: number;
    name: string;
    type: string;
    value: string;
    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.name = json.name;
            this.type = json.type;
            this.value = json.value;
        }
    }

    // Utils

    static toArray(jsons: any[]): Context[] {
        let contexts: Context[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                contexts.push(new Context(json));
            }
        }
        return contexts;
    }
}
