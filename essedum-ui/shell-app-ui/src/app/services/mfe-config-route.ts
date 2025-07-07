// projects/shell/src/app/utils/routes.ts

import { loadRemoteEntry, loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { routes } from '../landing/landing-routing.module';
import { CustomManifest } from './Config.model';
import { WebComponentWrapper,WebComponentWrapperOptions } from '@angular-architects/module-federation-tools';

export function buildRoutes(options: CustomManifest): Routes {

    for(let i of Object.keys(options)) {
        const entry = options[i];
        // console.log("entry value",entry); 
        // console.log("entry entry['title'] value",entry['title']);
        let r1 : any;
        if(!entry['type'] || (entry['type'] && entry['type']=='module')){
            let remoteEntry = entry.remoteEntry.includes('http') ? 
                entry.remoteEntry : 
                sessionStorage.getItem("contextPath") === '/' ?
                entry.remoteEntry:
                sessionStorage.getItem("contextPath").slice(0,-1) + entry.remoteEntry

            if(entry['title'] && entry['title']!=""){
                r1 = {
                    path: entry.routePath,
                    loadChildren: () => 
                        loadRemoteModule({
                            type: 'module',
                            // type: 'manifest',
                            // remoteName: i,
                            remoteEntry: remoteEntry,
                            exposedModule: entry.exposedModule
                        })
                        .then(m => m[entry.ngModuleName]),
                    data : {
                        title: entry['title']
                    }
                }
            }
            else{
                console.log(remoteEntry)
                r1 = {
                    path: entry.routePath,
                    loadChildren: () => 
                        loadRemoteModule({
                            type: 'module',
                            // type: 'manifest',
                            // remoteName: i,
                            remoteEntry: remoteEntry,
                            exposedModule: entry.exposedModule
                        })
                        .then(m => m[entry.ngModuleName])
                }
            }
        }
        else if(entry['type']=='script') {
            if(entry['title'] && entry['title']!=""){
                r1 = {
                    path: entry.routePath,
                    component: WebComponentWrapper,
                    data: {
                        remoteEntry: entry.remoteEntry,
                        exposedModule: entry.exposedModule,
                        type: "script",
                        remoteName: entry.remoteName,
                        elementName: entry.elementName,
                        title: entry['title']
                    } as WebComponentWrapperOptions
                }
            }
            else{
                r1 = {
                    path: entry.routePath,
                    component: WebComponentWrapper,
                    data: {
                        remoteEntry: entry.remoteEntry,
                        exposedModule: entry.exposedModule,
                        type: "script",
                        remoteName: entry.remoteName,
                        elementName: entry.elementName
                    } as WebComponentWrapperOptions
                }
            }
        }
        
        
        // console.log("route added", r1);
        routes[0]['children'].push(r1);
    }
    // console.log("all mfe conf route added", routes);
    return routes;
}
