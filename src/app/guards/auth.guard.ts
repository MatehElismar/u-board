import { Injectable } from "@angular/core";
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { first } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthService, private router: Router) {}
  // canActivate(): Observable<boolean> {
  //   return this.auth.isLoggedIn();
  // }
  async canActivate(route: ActivatedRouteSnapshot) {
    return this.isLogged(route);
  }

  async canActivateChild(route: ActivatedRouteSnapshot) {
    return this.isLogged(route);
  }

  private async isLogged(route: ActivatedRouteSnapshot) {
    const roles: string | string[] = route.data.roles;
    if (!roles) {
      console.log("ruta abierta a todo publico");
      return true;
    }
    const isLogged = await this.auth.isLoggedIn().toPromise();
    if (!isLogged) {
      this.router.navigateByUrl("/auth/login");
      return false;
    }
    const user = await this.auth.user$.pipe(first()).toPromise();
    const allowed = roles.includes(user?.role);
    if (!allowed) {
      console.log(user.role, "cannot access this rout", roles, route.url);
      this.router.navigateByUrl("/");

      return false;
    } else return true;
    return isLogged && roles && allowed; // Para poder acceder tiene que estar loggeado y tener un role especifico
  }
}
