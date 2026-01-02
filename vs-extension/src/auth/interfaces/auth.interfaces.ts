import { NetworkType } from '../constants/auth-constants';


/**
 * OAuth 2.0 Token Response
 * Represents the response from a token endpoint
 */
export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope?: string;
}

/**
 * OAuth 2.0 Device Code Response
 * Used for device authorization grant flow
 */
export interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    verification_uri_complete?: string;
    expires_in: number;
    interval: number;
}

/**
 * Keycloak Authentication Configuration
 */
export interface KeycloakConfig {
    issuerUri: string;
    clientId: string;
    scope: string;
    networkType?: NetworkType;
    networkName?: string;
}

/**
 * User Information from Keycloak
 * Contains user details and roles from the JWT token
 */
export interface UserInfo {
    sub: string;
    email?: string;
    name?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    realm_access?: {
        roles: string[];
    };
    resource_access?: {
        [clientId: string]: {
            roles: string[];
        };
    };
    [key: string]: any;
}

/**
 * User Session Data
 * Contains project and role information for the current session
 */
export interface SessionData {
    projectId: string;
    projectName: string;
    roleId: string;
    roleName: string;
    organization?: string;
    userId?: string;
    email?: string;
    username?: string;
}

/**
 * Stored Token Data
 * Includes timestamp for expiration tracking
 */
export interface StoredTokenData extends TokenResponse {
    timestamp: number;
}

/**
 * Authentication Status
 */
export interface AuthenticationStatus {
    isAuthenticated: boolean;
    tokenExpiry?: Date;
    needsRefresh?: boolean;
}

/**
 * OAuth Authorization Code Response
 * Contains the authorization code and state from OAuth callback
 */
export interface AuthCodeResponse {
    code: string;
    state: string;
}

/**
 * PKCE Challenge Pair
 * Contains code verifier and challenge for PKCE flow
 */
export interface PKCEChallenge {
    codeVerifier: string;
    codeChallenge: string;
}

/**
 * Message types for communication between webview and extension
 */
export interface LoginMessage {
    command: 'login' | 'cancel' | 'ready';
    network?: NetworkType;
}
