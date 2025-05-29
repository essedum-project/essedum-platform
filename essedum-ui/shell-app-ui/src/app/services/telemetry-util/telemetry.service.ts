import { Injectable, Injector } from "@angular/core";
import { TelemetryConfig, InitialConfig } from "./telemetry.config";
//import { TelemetryService } from '@project-yoda/angular-telemetry-sdk';

@Injectable({
  providedIn: "root",
})
export class LeapTelemetryService {
  user = JSON.parse(sessionStorage.getItem("user") || '').user_login
  project = JSON.parse(sessionStorage.getItem("project") || '').name
  role = JSON.parse(sessionStorage.getItem("role") || '').name
  constructor(
   // private telemetryService: TelemetryService
  ) { }

  start() {
    // if (sessionStorage.getItem("telemetry") == "true") {
    //   this.role = JSON.parse(sessionStorage.getItem("role") || '').name
    //   let startConfig = new InitialConfig()
    //   startConfig.authtoken = localStorage.getItem("jwtToken") || ''.toString();
    //   startConfig.host = sessionStorage.getItem("telemetryUrl") || '';
    //   startConfig.pdata.id = sessionStorage.getItem("telemetryPdataId") || startConfig.pdata.id;
    //   startConfig.env = window.location.origin;
    //    this.telemetryService.provider = "SUNBIRD";
    //    this.telemetryService.setProviderImplementation("SUNBIRD",startConfig);
    //    this.telemetryService.start(
    //     startConfig,
    //     "contentId1",
    //     1,
    //     {},
    //     {
    //      actor: {
    //       id: this.user?this.user:"deafult",
    //       type: this.project?this.project:"deafult",
    //      },
    //      context:{
    //        channel:this.role?this.role:"default",
    //      }}
    //    );
    // }
  }

  interact(type: string, className: string, subType: string, page: string) {
    if (sessionStorage.getItem("telemetry") == "true") {
      this.role = JSON.parse(sessionStorage.getItem("role") || '').name
      let telemetryConfig = new TelemetryConfig();
      telemetryConfig.type = type;
      telemetryConfig.subtype = subType;
      telemetryConfig.id = className;
      telemetryConfig.pageid = page;
      //  this.telemetryService.interact(telemetryConfig, {
      //   actor: {
      //     id: this.user?this.user:"deafult",
      //     type: this.project?this.project:"deafult",
      //   },
      //   context:{
      //     channel:this.role?this.role:"default",
      //   }
      // });
    }
  }

  impression(module: string, type: string, className: string) {
    if (sessionStorage.getItem("telemetry") == "true") {
      this.role = JSON.parse(sessionStorage.getItem("role") || '').name
      let telemetryConfig = new TelemetryConfig();
      telemetryConfig.pageid = module;
      telemetryConfig.type = type;
      telemetryConfig.stageto = className;
      //  this.telemetryService.impression(telemetryConfig, {
      //   actor: {
      //     id: this.user?this.user:"deafult",
      //     type: this.project?this.project:"deafult",
      //   },
      //   context:{
      //     channel:this.role?this.role:"default",
      //   }});
    }
  }
  audit(state: any, prevstate: any, props?: any) {
    if (sessionStorage.getItem("telemetry") == "true") {
      this.role = JSON.parse(sessionStorage.getItem("role") || '').name
      let telemetryConfig = new TelemetryConfig();
      telemetryConfig.state = state;
      telemetryConfig.prevstate = prevstate;
      telemetryConfig.props = props;
      //  telemetryConfig.stageto = className;
      //  this.telemetryService.audit(telemetryConfig, {
      //   actor: {
      //     id: this.user?this.user:"deafult",
      //     type: this.project?this.project:"deafult",
      //   },
      //   context:{
      //     channel:this.role?this.role:"default",
      //   }});
    }
  }
}


//
//