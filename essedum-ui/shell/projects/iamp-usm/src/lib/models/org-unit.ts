import { Organisation } from "./organisation";
import { Context } from "./context";

export class OrgUnit {
 id: number;
 name: string;
 description: string;
 onboarded: boolean;
 context: Context;
 organisation: Organisation;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.name = json.name;
   this.onboarded = json.onboarded;
   this.description = json.description;
   this.context = json.context;
   this.organisation = json.organisation;
  }
 }

 // Utils

 static toArray(jsons: any[]): OrgUnit[] {
  let org_units: OrgUnit[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    org_units.push(new OrgUnit(json));
   }
  }
  return org_units;
 }
}
