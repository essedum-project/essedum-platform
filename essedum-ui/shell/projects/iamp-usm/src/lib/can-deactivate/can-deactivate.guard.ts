//import { BroadcasterService } from "./../shared-modules/services/broadcaster.service";
import { Injectable } from "@angular/core";
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
// import { Observable } from "rxjs/Observable";
import { ComponentCanDeactivate } from "./component-can-deactivate";

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
 constructor(
  //private broadCastService: BroadcasterService,
  private route: Router
 ) {}
 canDeactivate(component: ComponentCanDeactivate): boolean {
  //this.broadCastService.activatedRoute(this.route.url);
  if (!component.canDeactivate()) {
   if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
    return true;
   } else {
    return false;
   }
  }
  return true;
 }
}
