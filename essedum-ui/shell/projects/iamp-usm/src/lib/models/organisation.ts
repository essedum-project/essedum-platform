import { Context } from "./context";

export class Organisation {
 id: number;
 name: string;
 decription: string;
 location: string;
 division: string;
 country: string;
 status: string;
 createdby: string;
 createddate: Date;
 modifiedby: string;
 modifieddate: Date;
 context: Context;
 userCount: number;
 unitCount: number;
 onboarded: boolean;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.name = json.name;
   this.decription = json.decription;
   this.status = json.status;
   this.createdby = json.createdby;
   this.createddate = json.createddate;
   this.modifiedby = json.modifiedby;
   this.modifieddate = json.modifieddate;
   this.context = json.context;
   this.onboarded = json.onboarded;
   this.location = json.location;
   this.division = json.division;
   this.country = json.country;
  }
 }

 // Utils

 static toArray(jsons: any[]): Organisation[] {
  let organisations: Organisation[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    organisations.push(new Organisation(json));
   }
  }
  return organisations;
 }
}
