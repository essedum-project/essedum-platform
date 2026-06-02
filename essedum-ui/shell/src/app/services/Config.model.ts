import { Manifest, RemoteConfig } from "@angular-architects/module-federation";
export class Config {  
    settings: ISettings[];  
}  
export interface ISettings {  
    key: string;  
    value: string;  
}  
 
export type CustomRemoteConfig = RemoteConfig & {
    exposedModule: string;
    routePath: string;
    ngModuleName: string;
    remoteEntry: string;
    type: string;
    elementName: string;
    remoteName: string;
};

export type CustomManifest = Manifest<CustomRemoteConfig>;