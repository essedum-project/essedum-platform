import { Router, RouterModule, Routes } from '@angular/router';
import { Services } from '../../services/service';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';

interface remoteRoutes {
  path: string;
  component: ComponentType<any>;
}

@Injectable()
export class DynamicRemoteLoad {
  remoteModule: any;
  allRoutes: remoteRoutes[] = [];
  returnComp: ComponentType<any>;
  constructor(private router: Router, private service: Services) {}

  navigateToRemoteComponent(
    mfeAppName: string,
    url: string
  ): ComponentType<any> {
    let module;
    let remoteEntry;
    this.service.getMfeAppConfig().subscribe(async (response) => {
      for (let i of Object.keys(response)) {
        const entry = response[i];
        if (i == mfeAppName) {
          remoteEntry = entry.remoteEntry.includes('http')
            ? entry.remoteEntry
            : sessionStorage.getItem('contextPath') === '/'
            ? entry.remoteEntry
            : sessionStorage.getItem('contextPath').slice(0, -1) +
              entry.remoteEntry;

          module = await loadRemoteModule({
            type: 'module',
            remoteEntry: remoteEntry,
            exposedModule: entry.exposedModule,
          }).then((m) => entry.exposedModule);
        }
      }
      this.remoteModule = module;
    });

    this.getAllRoutes(this.router.config);
    this.allRoutes.forEach((route) => {
      if (url.includes(route.path) && route.component) {
        this.returnComp = route.component;
      }
    });
    return this.returnComp;
  }

  async getAllRoutes(routes, parentPath?): Promise<void> {
    parentPath = parentPath || '';
    routes.forEach(async (route) => {
      const path = route['path']
        ? parentPath + '/' + route['path']
        : parentPath + '';
      this.allRoutes.push({ path: path, component: route['component'] });

      if (route['children']) {
        this.getAllRoutes(route['children'], path);
      }

      if (route._loadedRoutes) {
        await this.getAllRoutes(route._loadedRoutes, path);
      }
    });
  }
}
