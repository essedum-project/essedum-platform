/**
 * OAuth Server Configuration Constants
 */

/**
 * Default OAuth callback server port
 */
export const DEFAULT_OAUTH_PORT = 8085;

/**
 * Default OAuth flow timeout (in milliseconds)
 * User has 2 minutes to complete authentication
 */
export const DEFAULT_OAUTH_TIMEOUT = 120_000;

/**
 * OAuth callback path
 */
export const OAUTH_CALLBACK_PATH = '/callback';

/**
 * VS Code configuration section for OAuth settings
 */
export const OAUTH_CONFIG_SECTION = 'essedum.auth';

/**
 * Configuration key for OAuth port
 */
export const OAUTH_PORT_CONFIG_KEY = 'oauthPort';

/**
 * PKCE code verifier length (in bytes)
 * Will be base64url encoded to 43 characters
 */
export const PKCE_VERIFIER_LENGTH = 32;

/**
 * PKCE state parameter length (in bytes)
 * Will be hex encoded to 32 characters
 */
export const PKCE_STATE_LENGTH = 16;

/**
 * PKCE code challenge method
 */
export const PKCE_CHALLENGE_METHOD = 'S256';

/**
 * Hash algorithm for PKCE challenge
 */
export const PKCE_HASH_ALGORITHM = 'sha256';

/**
 * OAuth response type for authorization code flow
 */
export const OAUTH_RESPONSE_TYPE = 'code';
