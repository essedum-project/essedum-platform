
import { Project } from "./project";

export class DashConstant {
 id: number;
 project_name: string;
 keys: string;
 value: string;
 project_id: Project;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.project_name = json.project_name;
   this.keys = json.keys;
   this.value = json.value;
   this.project_id = json.project_id;
  }
 }

 // Utils

 static toArray(jsons: any[]): DashConstant[] {
  let dash_constants: DashConstant[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    dash_constants.push(new DashConstant(json));
   }
  }
  return dash_constants;
 }
}
