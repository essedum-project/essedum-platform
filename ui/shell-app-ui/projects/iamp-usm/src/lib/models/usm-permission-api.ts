export class UsmPermissionsApi {
    id: number;
    api:string;
    isWhiteListed:boolean
    permissionId:number;
    description:string;
    type:string;


    constructor(json?: any) {
     if (json != null) {
      this.id = json.id;
      this.api = json.api;
      this.isWhiteListed=json.isWhiteListed;
      this.permissionId = json.permissionId;
      this.type=json.type;
      this.description=json.description;

     }
    }

    // Utils

    static toArray(jsons: any[]): UsmPermissionsApi[] {
     let usm_permissionss_api: UsmPermissionsApi[] = [];
     if (jsons != null) {
      for (let json of jsons) {
        usm_permissionss_api.push(new UsmPermissionsApi(json));
      }
     }
     return usm_permissionss_api;
    }
   }