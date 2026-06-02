import { Injectable, Inject } from "@angular/core";
import { DashConstantService } from "../services/dash-constant.service";
import { DashConstant } from "./dash-constant";


@Injectable()
export class encKey {
    lazyloadevent = { first: 0, rows: 1000, sortField: null, sortOrder: 1 };
    constructor(@Inject(DashConstantService) private dashConstantService:DashConstantService) {
    }
    private  salt: string=sessionStorage.getItem('encDefault');

  
  
    private  getSaltFromDB ():string {
     let dashconstant:DashConstant = new DashConstant();
     dashconstant.keys="application.uiconfig.enckeydefault";

     this.dashConstantService.getDashConstsCheck().subscribe((res) => {
        
        let enckeydefault = res.filter((item) => (item.keys == "application.uiconfig.enckeydefault"));
        // if(enckeydefault && enckeydefault.length>0){
              this.salt=enckeydefault[0].value;
              sessionStorage.setItem("salt",this.salt)
          // }
          
      })
        return this.salt 
    }
    public getSalt () {
        if (this.salt !=null || this.salt != undefined)
          return this.salt;
        else
          return this.getSaltFromDB();
      }
  
}