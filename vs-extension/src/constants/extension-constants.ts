/**
 * Extension Constants
 * 
 * Centralized constants for extension configuration and API communication
 */

/**
 * API request timeouts (in milliseconds)
 */
export const TIMEOUTS = {
    CONFIG: 10000,
    FALLBACK: 15000
} as const;

/**
 * Storage keys for VS Code global state
 */
export const STORAGE_KEYS = {
    // Authentication
    JWT_TOKEN: 'jwtToken',
    ACCESS_TOKEN: 'accessToken',

    // User data
    USER: 'user',
    ROLE: 'role',
    PROJECT: 'project',
    ORGANIZATION: 'organization',
    CURRENT_USER_INFO: 'currentUserInfo',
    USER_INFO_DATA: 'userInfoData',
    USER_PORTFOLIOS: 'userPortfolios',
    UPDATED_USER: 'UpdatedUser',

    // Configuration
    OAUTH_CONFIG: 'oauthConfig',
    BASE_URL: 'baseUrl',
    THEME: 'theme',
    DEFAULT_THEME: 'defaultTheme',
    ACTIVE_PROFILES: 'activeProfiles',
    AUTO_USER_CREATION: 'autoUserCreation',
    AUTO_USER_PROJECT: 'autoUserProject',
    ENC_DEFAULT: 'encDefault',

    // Navigation
    RETURN_URL: 'returnUrl',
    CURRENT_PROJECT: 'currentProject',
    CURRENT_PORTFOLIO: 'currentPortfolio',

    // Network and Authentication State
    SELECTED_NETWORK: 'selected_network',
    HAS_USED_LOGIN_SCREEN: 'has_used_login_screen',
    TOKEN_VALIDATION_FAILED: 'token_validation_failed',
    ACTIVE_VIEW: 'active_view',

    // Additional Configuration
    DATA_LIMIT: 'dataLimit',
    LOGO_LOCATION: 'logoLocation',
    FONT: 'font',
    TELEMETRY_URL: 'telemetryUrl',
    TELEMETRY: 'telemetry',
    TELEMETRY_PDATA_ID: 'telemetryPdataId',
    CAP_BASE_URL: 'capBaseUrl',
    APP_VERSION: 'appVersion',
    LEAP_APP_YEAR: 'leapAppYear',
    SHOW_PORTFOLIO_HEADER: 'showPortfolioHeader',
    SHOW_PROFILE_ICON: 'showProfileIcon',
    EXPIRE_TOKEN_TIME: 'expireTokenTime',

    // User Preferences and Dashboard
    DASH_CONSTANTS: 'dashConstants',
    USER_PREFERENCES: 'userPreferences',
    SELECTED_ROLE: 'selectedRole',
    SELECTED_PROJECT: 'selectedProject',
    SELECTED_PORTFOLIO: 'selectedPortfolio'
} as const;

/**
 * HTTP request headers
 */
export const REQUEST_HEADERS = {
    ACCEPT: 'application/json, text/plain, */*',
    CONTENT_TYPE: 'application/json',
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    X_REQUESTED_WITH: 'Leap'
} as const;
