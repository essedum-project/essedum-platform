import { loadRemoteEntry, loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { routes } from '../landing/landing-routing.module';
import { CustomManifest } from './Config.model';
import { WebComponentWrapper,WebComponentWrapperOptions } from '@angular-architects/module-federation-tools';
import { MfeErrorBoundaryModule } from '../landing/mfe-error-boundary/mfe-error-boundary.module';

// Plan §13 Pitfall #14 — when an MFE's remoteEntry.js fails to load (network,
// stale manifest, broken deploy), swap in MfeErrorBoundaryModule so the user
// sees a recoverable fallback inside the host layout instead of a blank page.
function loadWithFallback(remoteEntry: string, exposedModule: string, ngModuleName: string, mfeName: string) {
  return loadRemoteModule({ type: 'module', remoteEntry, exposedModule })
    .then(m => m[ngModuleName])
    .catch(err => {
      console.error(`[MFE-load] Failed to load remote "${mfeName}" from ${remoteEntry}:`, err);
      return MfeErrorBoundaryModule;
    });
}

export function buildRoutes(options: CustomManifest): Routes {

    for(let i of Object.keys(options)) {
        const entry = options[i];
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
                    loadChildren: () => loadWithFallback(remoteEntry, entry.exposedModule, entry.ngModuleName, entry.routePath),
                    data : {
                        title: entry['title']
                    }
                }
            }
            else{
                // console.log(remoteEntry)
                r1 = {
                    path: entry.routePath,
                    loadChildren: () => loadWithFallback(remoteEntry, entry.exposedModule, entry.ngModuleName, entry.routePath)
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
        
        
        routes[0]['children'].push(r1);
    }
    return routes;
}
