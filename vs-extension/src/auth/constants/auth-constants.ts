import { environment } from '../../config/environment';

/**
 * Network Configuration Types
 */
export type NetworkType = 'infosys' | 'lfn' | 'server5g';

/**
 * Network Configuration Interface
 */
export interface NetworkConfig {
    id: NetworkType;
    name: string;
    displayName: string;
    issuerUri: string;
    jwkSetUri: string;
    clientId: string;
    scope: string;
    claim: string;
    createUserIfNotExist: boolean;
    silentRefreshTimeoutFactor: number;
    baseURL: string;
}

/**
 * Keycloak Authentication Configuration
 * Contains all OAuth/OIDC related settings for different networks
 */
export const AUTH_CONFIG = {
    /** Authentication timeout in milliseconds */
    AUTH_TIMEOUT: 60000,

    /** Token refresh threshold in minutes (refresh when token expires within this time) */
    TOKEN_REFRESH_THRESHOLD_MINUTES: 5,

    /** Available authentication networks */
    NETWORKS: {
        INFOSYS: {
            id: 'infosys' as NetworkType,
            name: 'infosys',
            displayName: 'Infosys Internal Network',
            issuerUri: environment.networks.infosys.issuerUri,
            jwkSetUri: environment.networks.infosys.jwkSetUri,
            clientId: environment.networks.infosys.clientId,
            scope: 'openid profile email',
            claim: 'email||admin',
            createUserIfNotExist: true,
            silentRefreshTimeoutFactor: 0.85,
            baseURL: environment.networks.infosys.baseURL
        } as NetworkConfig,
        LFN: {
            id: 'lfn' as NetworkType,
            name: 'lfn',
            displayName: 'LFN Network',
            issuerUri: environment.networks.lfn.issuerUri,
            jwkSetUri: environment.networks.lfn.jwkSetUri,
            clientId: environment.networks.lfn.clientId,
            scope: 'openid profile email',
            claim: 'email||admin',
            createUserIfNotExist: true,
            silentRefreshTimeoutFactor: 0.85,
            baseURL: environment.networks.lfn.baseURL
        } as NetworkConfig,
        SERVER5G: {
            id: 'server5g' as NetworkType,
            name: 'server5g',
            displayName: '5G Server Network',
            issuerUri: environment.networks.server5g.issuerUri,
            jwkSetUri: environment.networks.server5g.jwkSetUri,
            clientId: environment.networks.server5g.clientId,
            scope: 'openid profile email',
            claim: 'email||admin',
            createUserIfNotExist: true,
            silentRefreshTimeoutFactor: 0.85,
            baseURL: environment.networks.server5g.baseURL
        } as NetworkConfig
    },

    /** Default network (for backwards compatibility) */
    DEFAULT_NETWORK: 'infosys' as NetworkType,

    /** Legacy constants for backwards compatibility */
    ISSUER_URI: environment.networks.infosys.issuerUri,
    CLIENT_ID: environment.networks.infosys.clientId,
    SCOPE: 'openid profile email',
    REALM: 'ESSEDUM'
} as const;

/**
 * Storage key for secure token storage
 */
export const TOKEN_STORAGE_KEY = 'keycloak_tokens_v2';

/**
 * Storage key for network selection persistence
 */
export const NETWORK_STORAGE_KEY = 'selected_network';

/**
 * Interval for checking token expiration (in milliseconds)
 * Checks every 60 seconds
 */
export const TOKEN_REFRESH_CHECK_INTERVAL = 60_000;

/**
 * Time before token expiry to trigger refresh (in milliseconds)
 * Refreshes 5 minutes before expiration
 */
export const TOKEN_REFRESH_BEFORE_EXPIRY = 300_000;

/**
 * Buffer time for token validation (in milliseconds)
 * Considers token invalid 2 minutes before actual expiry
 */
export const TOKEN_EXPIRY_BUFFER = 120_000;

/**
 * Default OAuth flow timeout (in milliseconds)
 * User has 5 minutes to complete authentication
 */
export const OAUTH_FLOW_TIMEOUT = 300_000;

/**
 * Default HTTP request timeout (in milliseconds)
 */
export const HTTP_REQUEST_TIMEOUT = 30_000;

/**
 * Userinfo endpoint request timeout (in milliseconds)
 */
export const USERINFO_REQUEST_TIMEOUT = 10_000;

/**
 * Warning threshold for token expiry (in seconds)
 * Warns user when less than 2 minutes remain
 */
export const TOKEN_EXPIRY_WARNING_THRESHOLD = 120;

/**
 * Status bar message duration (in milliseconds)
 */
export const STATUS_MESSAGE_DURATION = 3_000;
