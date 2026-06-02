
export class UsmModule {
    id: number;
    name: string;
    display_name: string;
    descriptions: string;
    module_type: string;
    url: any;
    users_count: number;
    constructor(json?: any) {
     if (json != null) {
      this.id = json.id;
      this.name = json.name;
      this.display_name = json.display_name;
      this.descriptions = json.descriptions;
      this.module_type = json.module_type;
      this.url = json.url;
      this.users_count = json.users_count;
     }
    }
   
    // Utils
   
    static toArray(jsons: any[]): UsmModule[] {
     let usm_modules: UsmModule[] = [];
     if (jsons != null) {
      for (let json of jsons) {
       usm_modules.push(new UsmModule(json));
      }
     }
     return usm_modules;
    }
   }
   