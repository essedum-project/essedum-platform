import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{

  constructor(public router: Router) { }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if(!this.isAuthenticated()){
      this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
      return false;
    }
    return true
  }

  isAuthenticated(): boolean{
    const user = sessionStorage.getItem('user');
    if(!user)
      return false
    return true
  }
}
