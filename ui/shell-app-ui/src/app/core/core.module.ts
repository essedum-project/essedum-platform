import { ModuleWithProviders, NgModule, Optional, SkipSelf,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OAuthModule, OAuthModuleConfig, OAuthStorage } from 'angular-oauth2-oidc';
import { AppOAuthService } from './auth.service';
import { authModuleConfig } from './oauth-module-config';
import { AppInitService } from '../services/common-app-init.service';
import { BASE_OAUTH_CONFIG } from './auth-config';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function storageFactory(): OAuthStorage {
  return localStorage;
}

export function authConfigFactory(appInitService: AppInitService) {
  return appInitService.getAuthConfig;
}

@NgModule({
  declarations: [],
  imports: [
    OAuthModule.forRoot()
  ],
  providers: [
    AppOAuthService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: BASE_OAUTH_CONFIG, useFactory: authConfigFactory, deps: [AppInitService] },
        { provide: OAuthModuleConfig, useValue: authModuleConfig },
        { provide: OAuthStorage, useFactory: storageFactory },
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
