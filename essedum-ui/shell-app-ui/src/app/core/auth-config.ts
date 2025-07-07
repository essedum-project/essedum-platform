import { AuthConfig } from 'angular-oauth2-oidc';
import { InjectionToken } from '@angular/core';


export const BASE_OAUTH_CONFIG  = new InjectionToken<AuthConfig>('OAUTH Configuration details')
