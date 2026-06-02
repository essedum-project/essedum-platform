import { InjectionToken } from '@angular/core';

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');

export interface AuthConfig {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  responseType?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
  tenantId?: string;
}
