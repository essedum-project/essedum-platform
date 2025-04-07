export class UsmModules {
    id: number;
    name: string;
    
    constructor(json?: any){
         if (json != null) {
            this.id = json.id;
            this.name = json.name;
          
           
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
