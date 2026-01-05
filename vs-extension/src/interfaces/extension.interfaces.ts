/**
 * Extension Interfaces
 * 
 * Type definitions for extension data structures
 */

export interface PortfolioId {
    id: number;
    portfolioName: string;
    description: string | null;
    lastUpdated: number | null;
}

export interface ProjectId {
    id: number;
    name: string;
    description: string | null;
    lastUpdated: number | null;
    logoName: string | null;
    logo: string | null;
    defaultrole: boolean;
    portfolioId: PortfolioId;
    projectdisplayname: string;
    theme: string | null;
    domainName: string | null;
    productDetails: string | null;
    timeZone: string;
    azureOrgId: string | null;
    provisioneddate: number | null;
    disableExcel: boolean;
    createdDate: number;
    projectAutologin: string | null;
    autologinRole: string | null;
}

export interface RoleId {
    id: number;
    projectId: any | null;
    name: string;
    description: string;
    permission: boolean;
    roleadmin: any | null;
    projectadmin: any | null;
    portfolioId: any | null;
    projectAdminId: any | null;
}

export interface ProjectWithRoles {
    projectId: ProjectId;
    roleId: RoleId[];
}

export interface Portfolio {
    projectWithRoles: ProjectWithRoles[];
    porfolioId: PortfolioId;
}

export interface UserInfo {
    userId: any;
    porfolios?: Portfolio[];
}

export interface ServerConfig {
    data_limit?: number;
    autoUserCreation?: boolean;
    autoUserProject?: any;
    activeProfiles?: string;
    logoLocation?: string;
    theme?: string;
    font?: string;
    telemetryUrl?: string;
    telemetry?: boolean;
    telemetryPdataId?: string;
    capBaseUrl?: string;
    appVersion?: string;
    leapAppYear?: string;
    showPortfolioHeader?: boolean;
    showProfileIcon?: boolean;
    encDefault?: string;
    expireTokenTime?: number;
    issuerUri?: string;
    clientId?: string;
    scope?: string;
    silentRefreshTimeoutFactor?: number;
    baseUrl?: string;
}

export interface OAuthConfig {
    issuerUri: string;
    clientId: string;
    scope: string;
    responseType: string;
    useSilentRefresh: boolean;
    timeoutFactor: number;
    sessionChecksEnabled: boolean;
    showDebugInformation: boolean;
    clearHashAfterLogin: boolean;
    strictDiscoveryDocumentValidation: boolean;
}

export interface DashConstantQuery {
    keys: string;
}
