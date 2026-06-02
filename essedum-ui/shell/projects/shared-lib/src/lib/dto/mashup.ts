
export class Mashup {

    id: number;
    name: string;
    template: any;
    organization: any
    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.name = json.name;
            this.template = json.template;
            this.organization = json.organization;
        }
    }

    // Utils

    static toArray(jsons: any[]): Mashup[] {
        const streaming_servicess: Mashup[] = [];
        if (jsons != null) {
            for (const json of jsons) {
                streaming_servicess.push(new Mashup(json));
            }
        }
        return streaming_servicess;
    }
}
