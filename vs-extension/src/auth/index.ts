/**
 * Auth Module
 * Central export point for all authentication-related components
 * 
 * @fileoverview Provides clean exports for services, servers, providers, and utilities
 */

// Services
export { KeycloakAuthService, KeycloakConfig } from './services/keycloak-auth.service';

// Servers
export { OAuthAuthServer, AuthCodeResponse, PKCEChallenge } from './servers/oauth-auth.server';

// Providers
export { LoginScreenProvider } from './login/login-screen';

// Utilities
export { HtmlTemplateLoader } from './utils/html-template-loader.util';

// Interfaces
export type {
    TokenResponse,
    DeviceCodeResponse,
    UserInfo,
    SessionData,
    StoredTokenData,
    AuthenticationStatus
} from './interfaces/auth.interfaces';

// Constants
export * from './constants/auth-constants';
export * from './constants/login-constants';
export * from './constants/oauth-constants';

// Re-export commonly used types for convenience
export type { NetworkType, NetworkConfig } from './constants/auth-constants';
