import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUser } from './auth.tokens';

@Injectable({ providedIn: 'root' })
export abstract class AuthService {
  abstract readonly user$: Observable<AuthUser | null>;
  abstract readonly token$: Observable<string | null>;
  abstract readonly ready$: Observable<boolean>;

  abstract getToken(): string | null;
  abstract getUser(): AuthUser | null;
  abstract login(): void;
  abstract logout(): void;
  abstract refreshToken(): Observable<string>;
}
