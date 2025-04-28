import { Injectable, Injector } from "@angular/core";
import { TelemetryService } from '@project-yoda/angular-telemetry-sdk';
import { TelemetryConfig, InitialConfig } from "./telemetry.config";

@Injectable({
 providedIn: "root",
})
export class LeapTelemetryService {
user=JSON.parse(sessionStorage.getItem("user")).user_login
project= JSON.parse(sessionStorage.getItem("project")).name
 startConfig = new InitialConfig();
 telemetryConfig = new TelemetryConfig();

 constructor(private telemetryService: TelemetryService) {}

 interact(type: string, className: string, subType: string, page: string) {
    if (sessionStorage.getItem("telemetry") == "true") {
     let telemetryConfig = new TelemetryConfig();
     telemetryConfig.type = type;
     telemetryConfig.subtype = subType;
     telemetryConfig.id = className;
     telemetryConfig.pageid = page;
    //  this.telemetryService.interact(telemetryConfig, {
    //   actor: {
    //     id: this.user?this.user:"deafult",
    //     type: this.project?this.project:"deafult",
    //   }});
    }
   }
  
   impression(module: string, type: string, className: string) {
    if (sessionStorage.getItem("telemetry") == "true") {
      let telemetryConfig = new TelemetryConfig();
     telemetryConfig.pageid = module;
     telemetryConfig.type = type;
     telemetryConfig.stageto = className;
    //  this.telemetryService.impression(telemetryConfig, {
    //   actor: {
    //     id: this.user?this.user:"deafult",
    //     type: this.project?this.project:"deafult",
    //   }});
    }
   }
   audit(state: any, prevstate: any,props?:any) {
    if (sessionStorage.getItem("telemetry") == "true") {
     let telemetryConfig = new TelemetryConfig();
     telemetryConfig.state = state;
     telemetryConfig.prevstate = prevstate;
     telemetryConfig.props = props;
    //  telemetryConfig.stageto = className;
    //  this.telemetryService.audit(telemetryConfig, {
      // actor: {
        // id: this.user?this.user:"deafult",
        // type: this.project?this.project:"deafult",
      // }});
    }
   }
}
