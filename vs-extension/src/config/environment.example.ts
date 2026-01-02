/**
 * Environment Configuration Template
 * 
 * This file serves as a template for environment.ts
 * Copy this file to environment.ts and fill in your actual values.
 * 
 * DO NOT commit environment.ts to version control!
 */

/**
 * Network Configuration Interface
 */
export interface EnvironmentNetworkConfig {
    issuerUri: string;
    jwkSetUri: string;
    clientId: string;
    baseURL: string;
}

/**
 * Environment Configuration Interface
 */
export interface EnvironmentConfig {
    networks: {
        infosys: EnvironmentNetworkConfig;
        lfn: EnvironmentNetworkConfig;
    };
}

/**
 * Environment Configuration Template
 * Replace these placeholder values with your actual configuration
 */
export const environment: EnvironmentConfig = {
    networks: {
        infosys: {
            // Keycloak issuer URI for Infosys network
            issuerUri: 'https://your-keycloak-server:8443/realms/YOUR_REALM',
            // JWK Set URI for token verification
            jwkSetUri: 'https://your-keycloak-server:8443/realms/YOUR_REALM/protocol/openid-connect/certs',
            // OAuth Client ID
            clientId: 'your-client-id',
            // Base URL for API requests
            baseURL: 'https://your-api-server'
        },
        lfn: {
            // Keycloak issuer URI for LFN network
            issuerUri: 'https://your-keycloak-server:8443/realms/YOUR_REALM',
            // JWK Set URI for token verification
            jwkSetUri: 'https://your-keycloak-server:8443/realms/YOUR_REALM/protocol/openid-connect/certs',
            // OAuth Client ID
            clientId: 'your-client-id',
            // Base URL for API requests
            baseURL: 'https://your-api-server'
        }
    }
};
