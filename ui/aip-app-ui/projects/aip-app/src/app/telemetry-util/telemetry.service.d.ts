import { TelemetryService } from '@project-yoda/angular-telemetry-sdk';
import { TelemetryConfig, InitialConfig } from "./telemetry.config";
import * as i0 from "@angular/core";
export declare class LeapTelemetryService {
    private telemetryService;
    user: any;
    project: any;
    startConfig: InitialConfig;
    telemetryConfig: TelemetryConfig;
    constructor(telemetryService: TelemetryService);
    interact(type: string, className: string, subType: string, page: string): void;
    impression(module: string, type: string, className: string): void;
    start(): void;
    audit(state: any, prevstate: any, props?: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LeapTelemetryService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LeapTelemetryService>;
}
