import { Injectable, Injector } from "@angular/core";
import { TelemetryConfig, InitialConfig } from "./telemetry.config";

@Injectable({
  providedIn: "root",
})
export class LeapTelemetryService {
  user = JSON.parse(sessionStorage.getItem("user") || '').user_login
  project = JSON.parse(sessionStorage.getItem("project") || '').name
  role = JSON.parse(sessionStorage.getItem("role") || '').name
  constructor(
  ) { }

  start() {
   
  }

  interact(type: string, className: string, subType: string, page: string) {
    if (sessionStorage.getItem("telemetry") == "true") {
      this.role = JSON.parse(sessionStorage.getItem("role") || '').name
      let telemetryConfig = new TelemetryConfig();
      telemetryConfig.type = type;
      telemetryConfig.subtype = subType;
      telemetryConfig.id = className;
      telemetryConfig.pageid = page;
     
    }
  }

  impression(module: string, type: string, className: string) {
    if (sessionStorage.getItem("telemetry") == "true") {
      this.role = JSON.parse(sessionStorage.getItem("role") || '').name
      let telemetryConfig = new TelemetryConfig();
      telemetryConfig.pageid = module;
      telemetryConfig.type = type;
      telemetryConfig.stageto = className;
    }
  }
  audit(state: any, prevstate: any, props?: any) {
    if (sessionStorage.getItem("telemetry") == "true") {
      this.role = JSON.parse(sessionStorage.getItem("role") || '').name
      let telemetryConfig = new TelemetryConfig();
      telemetryConfig.state = state;
      telemetryConfig.prevstate = prevstate;
      telemetryConfig.props = props;
    }
  }
}
