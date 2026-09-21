import { RemoteConfig } from "@angular-architects/module-federation";
export class Config {  
    settings: ISettings[];  
}  
export interface ISettings {  
    key: string;  
    value: string;  
}  
 
export type CustomRemoteConfig = Omit<RemoteConfig, 'type'> & {
    exposedModule: string;
    routePath: string;
    ngModuleName: string;
    remoteEntry: string;
    type: 'module' | 'script' | 'iframe';
    elementName: string;
    remoteName: string;
};

export type CustomManifest = Record<string, CustomRemoteConfig>;