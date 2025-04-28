import { Injectable } from '@angular/core';
import { tracer } from './instrumentation';

@Injectable({
  providedIn: "root",
})
export class OpenTelemetryService {

  activeSpan: any;
  baseUrl = sessionStorage.getItem("telemetryUrl");
  user = JSON.parse(sessionStorage.getItem("user")).user_login;
  userId = JSON.parse(sessionStorage.getItem("user")).id.toString();
  project = JSON.parse(sessionStorage.getItem("project")).name;
  projectId = JSON.parse(sessionStorage.getItem("project")).id.toString();
  role = JSON.parse(sessionStorage.getItem("role") || '').name;
  portfolio = JSON.parse(sessionStorage.getItem("portfoliodata")).portfolioName;
  portfolioId = JSON.parse(sessionStorage.getItem("portfoliodata")).id.toString();
  appVersion = sessionStorage.getItem("appVersion");

  constructor() { }

  startTelemetry(module: string, component: string, context: any) {
    if (sessionStorage.getItem("telemetry") == "true") {
      tracer.startActiveSpan(component, span => {
        this.activeSpan = span;
        // Set attributes on the span 
        span.setAttribute('url', this.baseUrl);
        span.setAttribute('portfolio', this.portfolio);
        span.setAttribute('portfolioId', this.portfolioId);
        span.setAttribute('project', this.project);
        span.setAttribute('projectId', this.projectId);
        span.setAttribute('user', this.user);
        span.setAttribute('userId', this.userId);
        span.setAttribute('role', this.role);
        span.setAttribute('version', this.appVersion);
        span.setAttribute('module', module);
        span.setAttribute('component', component);
        span.setAttribute('context', context);
      });
    }
  }

  fetchActiveSpan() {
    return this.activeSpan;
  }

  endTelemetry(activespan: any) {
    if (activespan && activespan.isRecording()) {
      activespan.end();
    }
  }

  addTelemetryEvent(eventName: string, attributes?: any) {
    if (sessionStorage.getItem("telemetry") == "true") {
      this.activeSpan.addEvent(eventName, attributes);
    }
  }
}
