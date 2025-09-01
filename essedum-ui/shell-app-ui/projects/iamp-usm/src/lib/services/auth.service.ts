import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root'
})
export class AuthService {
    public getToken(): string {
        if (sessionStorage.getItem("jwtToken") !== undefined) {
            return sessionStorage.getItem("jwtToken");
        }
        return "";
    }
}
