# Essedum VS Code Extension - Design & Implementation Documentation

> **Audience**: Software Architects, Senior Developers, and Technical Leads  
> **Version**: 1.0.40  
> **Last Updated**: March 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Component Design](#component-design)
6. [Authentication Architecture](#authentication-architecture)
7. [Service Layer Design](#service-layer-design)
8. [WebView Architecture](#webview-architecture)
9. [File System Provider](#file-system-provider)
10. [Data Flow & State Management](#data-flow--state-management)
11. [Security Implementation](#security-implementation)
12. [Code Organization](#code-organization)
13. [Extension Lifecycle](#extension-lifecycle)
14. [API Integration](#api-integration)
15. [Error Handling & Resilience](#error-handling--resilience)
16. [Testing Strategy](#testing-strategy)
17. [Performance Considerations](#performance-considerations)
18. [Deployment & Distribution](#deployment--distribution)
19. [Implementation Details](#implementation-details)
20. [Visual Walkthrough](#visual-walkthrough)

---

## 1. Executive Summary

### 1.1 Purpose

The Essedum VS Code Extension is a sophisticated integration that connects Visual Studio Code with the Essedum AI Platform, enabling developers to:

- Authenticate securely using OAuth 2.0 with PKCE flow
- Manage and execute AI pipelines directly from the IDE
- View real-time job logs and execution results
- Edit pipeline scripts with full IDE capabilities
- Manage AI agents and MCP (Model Context Protocol) servers
- Upload and download code seamlessly

### 1.2 Key Differentiators

- **Enterprise-Grade Security**: OAuth 2.0 with PKCE, automatic token refresh, secure credential storage
- **Seamless Integration**: Native VS Code UI components with custom webviews
- **Network Flexibility**: Support for multiple network configurations (private/restricted/public)
- **Developer Experience**: Full IDE features for pipeline development (IntelliSense, debugging, etc.)
- **Real-Time Monitoring**: Live job log streaming and status updates

### 1.3 Technical Highlights

- TypeScript-based with strict type safety
- Modular architecture with clear separation of concerns
- Custom file system provider for virtual files
- WebView-based UI with VS Code theming
- Comprehensive error handling with retry logic
- SSL/TLS configuration for enterprise environments

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VS Code Extension Host                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Extension Entry Point                  │  │
│  │                    (extension.ts)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│       ┌─────────────────────┼─────────────────────┐             │
│       │                     │                     │             │
│  ┌────▼─────┐        ┌─────▼──────┐       ┌─────▼──────┐       │
│  │   Auth   │        │  Services  │       │  Providers │       │
│  │  Layer   │        │   Layer    │       │   Layer    │       │
│  └────┬─────┘        └─────┬──────┘       └─────┬──────┘       │
│       │                     │                     │             │
│  ┌────▼──────────────────────▼─────────────────────▼────────┐  │
│  │              WebView Communication Layer                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────────┐  │
│  │              Webview Providers (UI Layer)                 │  │
│  │  - Login Screen      - Pipeline Cards                     │  │
│  │  - Navigation        - Pipeline Agent                     │  │
│  │  - Job Logs Viewer                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Essedum AI Platform                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Keycloak  │  │  Pipeline  │  │   Agent    │                │
│  │   OAuth    │  │    API     │  │    API     │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Architectural Patterns

- **Layered Architecture**: Clear separation between presentation, business logic, and data access
- **Service-Oriented**: Core functionality encapsulated in reusable services
- **Provider Pattern**: WebView providers for UI components
- **Observer Pattern**: Event-driven communication between webviews and extension
- **Factory Pattern**: Service and provider instantiation
- **Singleton Pattern**: Global state management through VS Code ExtensionContext

### 2.3 Design Principles

- **Single Responsibility**: Each module has a well-defined purpose
- **Dependency Injection**: Services receive dependencies through constructors
- **Loose Coupling**: Interface-based communication between layers
- **High Cohesion**: Related functionality grouped together
- **DRY (Don't Repeat Yourself)**: Utility modules for common operations
- **SOLID Principles**: Applied throughout the codebase

---

## 3. Technology Stack

### 3.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 5.x | Primary language for type safety and maintainability |
| **VS Code API** | ^1.103.0 | Extension development framework |
| **Node.js** | 18.x+ | Runtime environment |
| **Webpack** | 5.x | Module bundling and optimization |

### 3.2 Key Dependencies

#### HTTP & Networking
- **axios** (^1.7.9): HTTP client with interceptor support for API calls
- **form-data** (^4.0.1): Multipart form data for file uploads
- **node-fetch** (^3.3.2): Fetch API for additional HTTP operations

#### Authentication & Security
- **crypto** (Node.js built-in): PKCE generation, hashing
- **https** (Node.js built-in): Custom HTTPS agents for SSL/TLS

#### Development Tools
- **ESLint** (^9.17.0): Code quality and style enforcement
- **@typescript-eslint**: TypeScript-specific linting rules
- **webpack-cli** (^6.0.1): Build tooling
- **ts-loader** (^9.5.1): TypeScript compilation for Webpack

### 3.3 VS Code APIs Used

- **authentication**: Token management
- **commands**: Command registration and execution
- **window**: UI interactions, webviews, notifications
- **workspace**: Configuration, file operations
- **FileSystemProvider**: Custom file system for virtual files
- **WebviewViewProvider**: Custom UI panels
- **SecretStorage**: Secure credential storage
- **GlobalState/WorkspaceState**: Persistent data storage

---

## 4. System Architecture

### 4.1 Module Architecture

```
src/
├── extension.ts              # Main entry point, lifecycle management
├── auth/                     # Authentication module
│   ├── services/
│   │   └── keycloak-auth.service.ts
│   ├── servers/
│   │   └── oauth-auth.server.ts
│   ├── constants/
│   ├── interfaces/
│   └── utils/
├── services/                 # Business logic services
│   ├── pipeline.service.ts
│   └── pipeline-agent.service.ts
├── providers/               # UI and resource providers
│   └── essedum-file-provider.ts
├── app/                     # Webview applications
│   ├── navigation/
│   ├── pipeline/
│   ├── pipeline-agent/
│   └── job-logs/
├── utils/                   # Shared utilities
│   ├── auth-setup-utils.ts
│   ├── command-handlers.ts
│   ├── config-utils.ts
│   ├── encryption-utils.ts
│   ├── extension-utils.ts
│   ├── initialization-utils.ts
│   ├── service-manager.ts
│   └── ssl-config.util.ts
├── constants/               # Configuration and constants
├── interfaces/              # TypeScript interfaces
└── messages/               # Localized messages
```

### 4.2 Dependency Graph

```
extension.ts
    ├── auth/KeycloakAuthService
    │   └── auth/OAuthAuthServer
    ├── providers/EssedumFileSystemProvider
    ├── services/PipelineService
    │   └── auth/KeycloakAuthService
    ├── services/PipelineAgentService
    ├── app/LoginScreenProvider
    ├── app/NavigationScreenProvider
    ├── app/PipelineCardsProvider
    │   ├── services/PipelineService
    │   ├── providers/EssedumFileSystemProvider
    │   └── app/JobLogsViewer
    └── app/PipelineAgentProvider
        └── services/PipelineAgentService
```

---

## 5. Component Design

### 5.1 Core Components

#### extension.ts - Main Orchestrator

**Responsibilities**:
- Extension lifecycle management (activate/deactivate)
- Service initialization and coordination
- Command registration
- Error handling and recovery

**Key Functions**:
```typescript
export async function activate(context: ExtensionContext): Promise<void>
export async function deactivate(): Promise<void>
function registerCommands(): void
async function updateServices(accessToken: string): Promise<void>
```

**Initialization Flow**:
1. SSL configuration
2. Authentication service setup
3. File system provider creation
4. WebView provider registration
5. Pipeline services initialization
6. Command registration
7. Initial screen display

#### Authentication Components

**KeycloakAuthService** (`src/auth/services/keycloak-auth.service.ts`)

- OAuth 2.0 authentication with PKCE
- Token lifecycle management
- Automatic token refresh
- Multi-network support
- Session monitoring

**Key Methods**:
```typescript
public async login(): Promise<TokenResponse>
public async refreshToken(): Promise<TokenResponse>
public async logout(): Promise<void>
public async updateNetworkConfig(networkConfig: NetworkConfig): Promise<void>
private startTokenRefreshMonitoring(): void
```

**OAuthAuthServer** (`src/auth/servers/oauth-auth.server.ts`)

- Local HTTP server for OAuth callback
- PKCE challenge generation
- State validation
- HTML template rendering for auth flow

**Key Methods**:
```typescript
public generatePKCE(): PKCEChallenge
public generateState(): string
public async waitForAuthCode(expectedState: string): Promise<AuthCodeResponse>
public close(): void
```

### 5.2 Service Layer Components

#### PipelineService

**Purpose**: Centralized API client for pipeline operations

**Key Features**:
- Retry logic with exponential backoff
- Request cancellation support
- SSL configuration
- Structured error handling

**API Methods**:
```typescript
public async listPipelines(params?: HttpParams): Promise<any>
public async getPipelineDetails(name: string): Promise<any>
public async getScripts(pipelineName: string): Promise<any>
public async getRunTypes(pipelineName: string): Promise<any>
public async runPipeline(pipelineName: string, payload: any): Promise<any>
public async getJobLogs(params?: HttpParams): Promise<any>
```

#### PipelineAgentService

**Purpose**: Agent and MCP server management

**Key Features**:
- Agent CRUD operations
- Code download/upload
- MCP server integration
- File handling

**API Methods**:
```typescript
public async getAgentsList(): Promise<any>
public async getAgentDetails(agentId: string): Promise<any>
public async downloadAgentCode(agentId: string): Promise<void>
public async uploadAgentCode(agentId: string, files: any[]): Promise<any>
public async getMCPServers(): Promise<any>
```

### 5.3 Provider Components

#### EssedumFileSystemProvider

**Purpose**: Virtual file system for pipeline scripts and agent code

**Implementation**:
- Custom `FileSystemProvider` interface
- In-memory file storage
- Change event emission
- Bidirectional sync with server

**Key Methods**:
```typescript
public readFile(uri: Uri): Uint8Array
public writeFile(uri: Uri, content: Uint8Array): void
public registerFile(uri: Uri, content: string, metadata: FileMetadata): void
public saveToServer(uri: Uri): Promise<void>
```

#### WebView Providers

**LoginScreenProvider**
- Network selection UI
- Authentication trigger
- OAuth flow coordination

**NavigationScreenProvider**
- Main navigation dashboard
- Feature access points
- Session information display

**PipelineCardsProvider**
- Pipeline listing with pagination
- Script editing interface
- Execution management
- Job log integration

**PipelineAgentProvider**
- Agent management UI
- MCP server browser
- Code editor integration
- Upload/download operations

---

## 6. Authentication Architecture

### 6.1 OAuth 2.0 with PKCE Flow

```
┌──────────┐                                          ┌──────────┐
│ VS Code  │                                          │ Keycloak │
│Extension │                                          │  Server  │
└────┬─────┘                                          └────┬─────┘
     │                                                      │
     │ 1. Generate PKCE Challenge                          │
     │    code_verifier = random(43-128 chars)            │
     │    code_challenge = SHA256(code_verifier)          │
     │                                                      │
     │ 2. Start Local OAuth Server (localhost:8085)       │
     │                                                      │
     │ 3. Open Browser with Auth URL                       │
     ├──────────────────────────────────────────────────────▶
     │    /auth?client_id=xxx&redirect_uri=xxx&            │
     │    code_challenge=xxx&code_challenge_method=S256    │
     │                                                      │
     │                                              4. User Login
     │                                              ┌──────┴──────┐
     │                                              │    User     │
     │                                              │Authenticates│
     │                                              └──────┬──────┘
     │                                                      │
     │ 5. Auth Code Callback                               │
     │◀──────────────────────────────────────────────────────┤
     │    http://localhost:8085/callback?code=xxx&state=xxx│
     │                                                      │
     │ 6. Validate State Parameter                         │
     │                                                      │
     │ 7. Exchange Code for Token                          │
     ├──────────────────────────────────────────────────────▶
     │    POST /token                                       │
     │    code=xxx&code_verifier=xxx                       │
     │                                                      │
     │ 8. Receive Tokens                                   │
     │◀──────────────────────────────────────────────────────┤
     │    { access_token, refresh_token, expires_in }      │
     │                                                      │
     │ 9. Store Tokens Securely                            │
     │                                                      │
     │ 10. Start Token Refresh Monitoring                  │
     │                                                      │
```

### 6.2 Token Management

**Token Storage**:
- Access Token: VS Code SecretStorage (encrypted)
- Refresh Token: VS Code SecretStorage (encrypted)
- Expiry Timestamp: GlobalState
- Network Configuration: GlobalState

**Token Refresh Strategy**:
```typescript
// Constants
TOKEN_REFRESH_CHECK_INTERVAL = 60000 (1 minute)
TOKEN_REFRESH_BEFORE_EXPIRY = 300 (5 minutes before expiry)
TOKEN_EXPIRY_BUFFER = 60 (minimum 60 seconds remaining)
TOKEN_EXPIRY_WARNING_THRESHOLD = 300 (warn at 5 minutes)

// Refresh Logic
if (timeUntilExpiry <= TOKEN_EXPIRY_BUFFER) {
    // Token is expired or about to expire
    refreshToken();
} else if (timeUntilExpiry <= TOKEN_REFRESH_BEFORE_EXPIRY) {
    // Proactive refresh
    refreshToken();
}
```

**Automatic Refresh Monitoring**:
- Timer runs every 60 seconds
- Checks token expiry
- Proactively refreshes before expiration
- Updates UI status bar with session info
- Handles refresh failures gracefully

### 6.3 Multi-Network Support

**Network Types**:
- **Private**: Internal/on-premise deployment
- **Restricted**: Limited access network
- **Public**: Cloud/public internet

**Network Configuration**:
```typescript
interface NetworkConfig {
    id: NetworkType;
    displayName: string;
    issuerUri: string;
    clientId: string;
    scope: string;
    requiresSSLBypass?: boolean;
}
```

**Network Selection Flow**:
1. User selects network from login screen
2. Configuration loaded from constants
3. SSL settings applied based on network
4. Keycloak endpoints configured
5. OAuth flow initiated

### 6.4 Security Measures

- **PKCE**: Prevents authorization code interception attacks
- **State Parameter**: CSRF protection
- **Secure Storage**: Tokens stored in VS Code's encrypted SecretStorage
- **HTTPS Enforcement**: All API calls over HTTPS
- **Certificate Validation**: Configurable for enterprise environments
- **Token Expiry**: Automatic expiration and refresh
- **Session Timeout**: User notified of expiring sessions

---

## 7. Service Layer Design

### 7.1 PipelineService Architecture

**Retry Logic**:
```typescript
async function retryRequest<T>(
    requestFn: () => Promise<T>,
    options: RetryOptions
): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= options.retries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            if (shouldRetry(error, options)) {
                const delay = options.baseDelayMs * Math.pow(2, attempt);
                await sleep(delay);
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}
```

**Request Configuration**:
```typescript
private buildRequestConfig(
    params?: HttpParams,
    signal?: AbortSignal
): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
        headers: {
            'Authorization': `Bearer ${this._token}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: getHTTPSAgent(this.context),
        timeout: HTTP_REQUEST_TIMEOUT,
        signal: signal
    };
    
    if (params) {
        config.params = params;
    }
    
    return config;
}
```

**Error Handling**:
```typescript
private handleError(error: any, operation: string): never {
    const serviceError = new ServiceError(
        `${operation} failed: ${error.message}`,
        {
            code: error.code,
            status: error.response?.status,
            details: error.response?.data
        }
    );
    
    logger.error(operation, serviceError);
    throw serviceError;
}
```

### 7.2 API Endpoint Configuration

**Base URL Resolution**:
```typescript
export function getBaseUrl(context: ExtensionContext): string {
    const network = context.globalState.get<NetworkConfig>('selectedNetwork');
    
    if (!network) {
        throw new Error('No network configuration found');
    }
    
    // Extract base URL from issuer URI
    const baseUrl = extractBaseUrl(network.issuerUri);
    
    return baseUrl;
}
```

**Endpoint Definitions**:
```typescript
export const API_ENDPOINTS = {
    PIPELINES: '/api/v1/pipelines',
    PIPELINE_DETAILS: '/api/v1/pipelines/:name',
    SCRIPTS: '/api/v1/pipelines/:name/scripts',
    RUN_TYPES: '/api/v1/pipelines/:name/runtypes',
    EXECUTE: '/api/v1/pipelines/:name/execute',
    JOB_LOGS: '/api/v1/jobs',
    AGENTS: '/api/v1/agents',
    AGENT_DETAILS: '/api/v1/agents/:id',
    MCP_SERVERS: '/api/v1/mcp/servers'
};
```

### 7.3 SSL/TLS Configuration

**Certificate Handling**:
```typescript
export function createHTTPSAgent(context: ExtensionContext): https.Agent {
    const shouldBypass = shouldBypassSSL(context);
    
    if (shouldBypass) {
        return new https.Agent({
            rejectUnauthorized: false,
            requestCert: false
        });
    }
    
    // Use custom CA certificates if provided
    const customCA = loadCustomCertificates(context);
    
    return new https.Agent({
        rejectUnauthorized: true,
        ca: customCA
    });
}
```

**Network-Aware Configuration**:
- Private networks: SSL bypass allowed
- Restricted networks: Certificate validation configurable
- Public networks: Strict certificate validation

---

## 8. WebView Architecture

### 8.1 WebView Communication Pattern

```
┌────────────────────────────────────────────────────────────────┐
│                       Extension Host                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               WebView Provider (TypeScript)               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Message Handler                            │  │  │
│  │  │  - handleWebviewMessage()                         │  │  │
│  │  │  - Route messages to appropriate handlers         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                           ▲                               │  │
│  │                           │ postMessage()                 │  │
│  │                           │                               │  │
│  │  ┌────────────────────────┴───────────────────────────┐  │  │
│  │  │         WebView Content (HTML + JavaScript)        │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │  Client-Side JavaScript                      │  │  │  │
│  │  │  │  - User interactions                         │  │  │  │
│  │  │  │  - Data rendering                            │  │  │  │
│  │  │  │  - vscode.postMessage() calls                │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 8.2 Message Protocol

**Client to Extension**:
```javascript
// Client-side (webview JavaScript)
vscode.postMessage({
    command: 'loadPipelines',
    payload: {
        page: 1,
        pageSize: 10,
        filter: 'test'
    }
});
```

**Extension to Client**:
```typescript
// Extension-side (TypeScript)
webview.postMessage({
    command: 'pipelinesLoaded',
    data: {
        pipelines: [...],
        totalCount: 50,
        page: 1
    }
});
```

### 8.3 WebView HTML Structure

**Template Pattern**:
```typescript
private getHtml(webview: Webview): string {
    // Get resource URIs for CSS, JS
    const styleUri = webview.asWebviewUri(
        Uri.joinPath(this._extensionUri, 'media', 'app', 'styles.css')
    );
    const scriptUri = webview.asWebviewUri(
        Uri.joinPath(this._extensionUri, 'media', 'app', 'script.js')
    );
    
    // Use nonce for CSP
    const nonce = getNonce();
    
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" 
              content="default-src 'none'; 
                       style-src ${webview.cspSource} 'unsafe-inline'; 
                       script-src 'nonce-${nonce}';">
        <link href="${styleUri}" rel="stylesheet">
        <title>Essedum Pipeline</title>
    </head>
    <body>
        <div id="app"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
}
```

### 8.4 WebView Lifecycle

**Creation**:
```typescript
context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
        'essedum-pipeline',
        pipelineCardsProvider,
        {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        }
    )
);
```

**State Management**:
- `retainContextWhenHidden: true`: Preserve state when hidden
- Message queue for initialization
- State restoration on visibility change

**Resource Management**:
- Disposables tracked in `context.subscriptions`
- Automatic cleanup on extension deactivation
- Memory-efficient content loading

---

## 9. File System Provider

### 9.1 Virtual File System Design

**Purpose**: Enable editing of pipeline scripts and agent code as if they were local files

**URI Scheme**: `essedum://`

**URI Format**:
```
essedum://pipeline/{pipelineName}/{scriptName}.py
essedum://agent/{agentId}/{fileName}.py
```

### 9.2 File Operations

**Read Operation**:
```typescript
readFile(uri: Uri): Uint8Array {
    const file = this._files.get(uri.toString());
    if (!file) {
        throw FileSystemError.FileNotFound(uri);
    }
    return Buffer.from(file.content, 'utf8');
}
```

**Write Operation**:
```typescript
writeFile(uri: Uri, content: Uint8Array, options: WriteFileOptions): void {
    const contentStr = Buffer.from(content).toString('utf8');
    const file = this._files.get(uri.toString());
    
    if (!file) {
        throw FileSystemError.FileNotFound(uri);
    }
    
    file.content = contentStr;
    file.modified = true;
    
    // Emit change event
    this._emitter.fire([{ type: FileChangeType.Changed, uri }]);
}
```

**Server Synchronization**:
```typescript
public async saveToServer(uri: Uri): Promise<void> {
    const file = this._files.get(uri.toString());
    
    if (!file || !file.modified) {
        return;
    }
    
    // Determine file type and call appropriate API
    if (uri.path.includes('/pipeline/')) {
        await this.savePipelineScript(file);
    } else if (uri.path.includes('/agent/')) {
        await this.saveAgentFile(file);
    }
    
    file.modified = false;
}
```

### 9.3 Integration with VS Code Editor

**File Registration**:
```typescript
public registerFile(
    pipelineName: string,
    fileName: string,
    content: string,
    extension: string
): Uri {
    const uri = Uri.parse(
        `essedum://pipeline/${pipelineName}/${fileName}`
    );
    
    this._files.set(uri.toString(), {
        uri,
        content,
        modified: false,
        fileName,
        extension,
        pipelineName,
        organization: this.getOrganization()
    });
    
    return uri;
}
```

**Opening Files**:
```typescript
// From PipelineCardsProvider
const uri = this._fileProvider.registerFile(
    pipelineName,
    fileName,
    content,
    extension
);

const document = await vscode.workspace.openTextDocument(uri);
await vscode.window.showTextDocument(document, {
    preview: false,
    viewColumn: vscode.ViewColumn.One
});
```

**Save Listener**:
```typescript
vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (document.uri.scheme === 'essedum') {
        await fileSystemProvider.saveToServer(document.uri);
        vscode.window.showInformationMessage('File saved to server');
    }
});
```

---

## 10. Data Flow & State Management

### 10.1 State Storage Strategy

**VS Code Storage APIs**:

| Storage Type | Use Case | Scope | Encryption |
|-------------|----------|-------|------------|
| **SecretStorage** | Access tokens, refresh tokens | Global | Yes |
| **GlobalState** | User preferences, network config | Global | No |
| **WorkspaceState** | Workspace-specific settings | Workspace | No |
| **Memento** | Temporary session data | Session | No |

**Data Flow**:
```typescript
// Authentication Flow
User Login
    ↓
KeycloakAuthService.login()
    ↓
TokenResponse { access_token, refresh_token, expires_in }
    ↓
SecretStorage.store('accessToken', token)
SecretStorage.store('refreshToken', refresh_token)
GlobalState.update('tokenExpiry', expiry)
    ↓
updateServices(accessToken)
    ↓
All Services Updated with New Token
```

### 10.2 State Synchronization

**Authentication State**:
```typescript
// Set authentication context
await vscode.commands.executeCommand(
    'setContext',
    'essedum.isAuthenticated',
    true
);

// Triggers:
// - View visibility changes (when clause)
// - Command availability
// - UI updates
```

**View State Management**:
```typescript
// Navigation state
await ExtensionUtils.setContext('essedum.showNavigation', true);
await ExtensionUtils.setContext('essedum.showPipeline', false);
await ExtensionUtils.setContext('essedum.showPipelineAgent', false);

// Result: Navigation view visible, others hidden
```

### 10.3 Data Caching Strategy

**Pipeline Data**:
- Cache duration: 5 minutes
- Invalidation: On manual refresh or mutation
- Storage: In-memory in provider

**User Info**:
- Cache duration: Session lifetime
- Invalidation: On logout
- Storage: GlobalState

**Job Logs**:
- Cache: None (real-time data)
- Polling interval: 5 seconds when viewing
- Storage: Temporary in webview

---

## 11. Security Implementation

### 11.1 Security Layers

**1. Authentication Layer**:
- OAuth 2.0 with PKCE (Proof Key for Code Exchange)
- State parameter for CSRF protection
- Secure token storage in VS Code SecretStorage
- Automatic token expiry and refresh

**2. Transport Layer**:
- HTTPS for all API communication
- Configurable certificate validation
- Custom HTTPS agents per network
- TLS 1.2+ enforcement

**3. Application Layer**:
- Input validation on all user inputs
- Output encoding in webviews
- Content Security Policy (CSP) headers
- XSS prevention

**4. Data Layer**:
- Encrypted storage for sensitive data
- No plaintext credentials in logs
- Secure credential cleanup on logout

### 11.2 Content Security Policy

**WebView CSP**:
```typescript
const csp = `
    default-src 'none';
    script-src 'nonce-${nonce}';
    style-src ${webview.cspSource} 'unsafe-inline';
    img-src ${webview.cspSource} https: data:;
    font-src ${webview.cspSource};
    connect-src https:;
`;
```

**Nonce Generation**:
```typescript
function getNonce(): string {
    return crypto.randomBytes(16).toString('base64');
}
```

### 11.3 Input Validation

**Pipeline Name Validation**:
```typescript
function validatePipelineName(name: string): boolean {
    // Alphanumeric, hyphens, underscores only
    const pattern = /^[a-zA-Z0-9_-]+$/;
    return pattern.test(name) && name.length <= 100;
}
```

**File Upload Validation**:
```typescript
function validateFileUpload(file: File): boolean {
    const allowedExtensions = ['.py', '.js', '.ts', '.json', '.yaml'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const ext = path.extname(file.name).toLowerCase();
    const size = file.size;
    
    return allowedExtensions.includes(ext) && size <= maxSize;
}
```

### 11.4 Error Information Disclosure

**Sanitized Error Messages**:
```typescript
function sanitizeErrorMessage(error: any): string {
    // Never expose internal paths, tokens, or sensitive data
    const message = error.message || 'An error occurred';
    
    // Remove sensitive patterns
    return message
        .replace(/token[=:]\s*[\w-]+/gi, '[REDACTED]')
        .replace(/password[=:]\s*\S+/gi, '[REDACTED]')
        .replace(/\/home\/\S+/g, '[PATH]')
        .replace(/C:\\\S+/g, '[PATH]');
}
```

---

## 12. Code Organization

### 12.1 Directory Structure

```
vs-extension/
├── src/                          # Source code
│   ├── extension.ts              # Entry point
│   ├── auth/                     # Authentication module
│   │   ├── index.ts              # Module exports
│   │   ├── services/             # Auth services
│   │   ├── servers/              # OAuth server
│   │   ├── constants/            # Auth constants
│   │   ├── interfaces/           # Auth interfaces
│   │   └── utils/                # Auth utilities
│   ├── services/                 # Business logic
│   │   ├── pipeline.service.ts
│   │   └── pipeline-agent.service.ts
│   ├── providers/                # Resource providers
│   │   └── essedum-file-provider.ts
│   ├── app/                      # WebView applications
│   │   ├── navigation/
│   │   │   ├── navigation-screen.ts          # Provider
│   │   │   ├── navigation-screen.html        # Template
│   │   │   ├── navigation-screen-client.js   # Client script
│   │   │   └── navigation-screen.css         # Styles
│   │   ├── pipeline/
│   │   ├── pipeline-agent/
│   │   └── job-logs/
│   ├── utils/                    # Shared utilities
│   ├── constants/                # Configuration
│   ├── interfaces/               # TypeScript interfaces
│   └── messages/                 # Localization
├── media/                        # Static assets
│   ├── screenshots/              # Documentation images
│   ├── auth-*.html               # OAuth templates
│   └── adk-prompt.txt           # Agent development kit
├── dist/                         # Build output
├── package.json                  # Extension manifest
├── tsconfig.json                 # TypeScript config
├── webpack.config.js             # Build configuration
└── README.md                     # User documentation
```

### 12.2 Naming Conventions

**Files**:
- Services: `*.service.ts`
- Providers: `*-provider.ts` or `*-screen.ts`
- Utilities: `*-utils.ts` or `*.util.ts`
- Interfaces: `*.interfaces.ts` or `*.interface.ts`
- Constants: `*-constants.ts` or `*-config.ts`

**Classes**:
- PascalCase: `KeycloakAuthService`, `PipelineCardsProvider`
- Suffix indicates type: `*Service`, `*Provider`, `*Manager`

**Functions**:
- camelCase: `initializeSSL`, `handleLogin`, `registerCommands`
- Prefix indicates action: `get*`, `set*`, `handle*`, `create*`

**Constants**:
- SCREAMING_SNAKE_CASE: `TOKEN_STORAGE_KEY`, `DEFAULT_PAGE_SIZE`
- Group in objects: `COMMANDS`, `MESSAGES`, `API_ENDPOINTS`

### 12.3 Module Organization

**Feature-Based Modules**:
```typescript
// auth/index.ts - Module exports
export { KeycloakAuthService } from './services/keycloak-auth.service';
export { LoginScreenProvider } from './login/login-screen';
export { OAuthAuthServer } from './servers/oauth-auth.server';
export * from './constants/auth-constants';
export * from './interfaces/auth.interfaces';
```

**Barrel Exports**:
- Each major directory has an `index.ts`
- Simplifies imports: `import { KeycloakAuthService } from './auth'`

### 12.4 Dependency Management

**Layered Dependencies**:
```
Presentation Layer (app/)
    ↓ depends on
Business Logic Layer (services/)
    ↓ depends on
Data Access Layer (providers/, auth/)
    ↓ depends on
Utility Layer (utils/, constants/)
```

**Circular Dependency Prevention**:
- Utilities never import from higher layers
- Interfaces in separate files
- Dependency injection for cross-layer communication

---

## 13. Extension Lifecycle

### 13.1 Activation Sequence

```typescript
1. Extension Host loads extension
   ↓
2. activate(context: ExtensionContext) called
   ↓
3. Activation Guard (prevent re-entrancy)
   ↓
4. Initialize SSL Configuration
   ├─ Load custom certificates
   ├─ Configure Node.js HTTPS
   └─ Set environment variables
   ↓
5. Initialize Authentication Service
   ├─ Check stored tokens
   ├─ Validate token expiry
   └─ Restore session if valid
   ↓
6. Create File System Provider
   └─ Register essedum:// scheme
   ↓
7. Initialize Configuration
   ├─ Load network config
   ├─ Load user preferences
   └─ Configure API endpoints
   ↓
8. Register WebView Providers
   ├─ Login screen
   ├─ Navigation dashboard
   ├─ Pipeline cards
   └─ Pipeline agent
   ↓
9. Initialize Pipeline Services
   ├─ PipelineService
   └─ PipelineAgentService
   ↓
10. Register Commands
    ├─ Authentication commands
    ├─ Navigation commands
    ├─ Pipeline commands
    └─ Agent commands
    ↓
11. Set Up Configuration Listeners
    └─ React to settings changes
    ↓
12. Show Initial Screen
    ├─ Login screen (if not authenticated)
    └─ Navigation dashboard (if authenticated)
    ↓
13. Activation Complete
```

### 13.2 Deactivation Sequence

```typescript
1. deactivate() called
   ↓
2. Collect all disposables
   ↓
3. Clear authentication tokens
   ├─ Remove from SecretStorage
   └─ Clear GlobalState
   ↓
4. Cleanup services
   ├─ PipelineCardsProvider.dispose()
   ├─ PipelineAgentProvider.dispose()
   ├─ FileSystemProvider.dispose()
   └─ Stop token refresh timer
   ↓
5. Dispose all registered disposables
   ├─ Commands
   ├─ WebView providers
   ├─ Event listeners
   └─ Status bar items
   ↓
6. Deactivation Complete
```

### 13.3 Command Registration Pattern

```typescript
interface CommandDefinition {
    id: string;
    handler: (...args: any[]) => any;
}

const commands: CommandDefinition[] = [
    {
        id: 'essedum.login',
        handler: () => CommandHandlers.handleLogin(context, authService, updateServices)
    },
    {
        id: 'essedum.logout',
        handler: () => CommandHandlers.handleLogout(context, authService, updateServices)
    },
    // ... more commands
];

commands.forEach(({ id, handler }) => {
    const disposable = vscode.commands.registerCommand(id, handler);
    context.subscriptions.push(disposable);
});
```

### 13.4 Error Recovery

**Activation Errors**:
```typescript
try {
    await activate(context);
} catch (error) {
    logger.error('Activation failed:', error);
    
    const choice = await vscode.window.showErrorMessage(
        `Failed to activate Essedum: ${error.message}`,
        'Open Logs',
        'Retry Activation',
        'Disable Extension'
    );
    
    if (choice === 'Open Logs') {
        await vscode.commands.executeCommand('workbench.action.openLogsFolder');
    } else if (choice === 'Retry Activation') {
        activating = false;
        await activate(context);
    }
}
```

**Runtime Errors**:
- Graceful degradation
- User-friendly error messages
- Automatic retry for transient failures
- Logging for diagnostics

---

## 14. API Integration

### 14.1 API Architecture

**Base URL Determination**:
```typescript
const network = context.globalState.get<NetworkConfig>('selectedNetwork');
const baseUrl = extractBaseUrl(network.issuerUri);
// Example: https://essedum.example.com
```

**Endpoint Categories**:

1. **Authentication API**
   - `POST /auth/realms/{realm}/protocol/openid-connect/token`
   - `POST /auth/realms/{realm}/protocol/openid-connect/logout`
   - `GET /auth/realms/{realm}/protocol/openid-connect/userinfo`

2. **Pipeline API**
   - `GET /api/v1/pipelines` - List pipelines
   - `GET /api/v1/pipelines/{name}` - Pipeline details
   - `GET /api/v1/pipelines/{name}/scripts` - List scripts
   - `POST /api/v1/pipelines/{name}/execute` - Run pipeline
   - `PUT /api/v1/pipelines/{name}/scripts/{file}` - Update script

3. **Job API**
   - `GET /api/v1/jobs` - List jobs
   - `GET /api/v1/jobs/{id}` - Job details
   - `GET /api/v1/jobs/{id}/logs` - Job logs
   - `GET /api/v1/jobs/{id}/artifacts` - Download artifacts

4. **Agent API**
   - `GET /api/v1/agents` - List agents
   - `GET /api/v1/agents/{id}` - Agent details
   - `POST /api/v1/agents/{id}/upload` - Upload code
   - `GET /api/v1/agents/{id}/download` - Download code

5. **MCP API**
   - `GET /api/v1/mcp/servers` - List MCP servers
   - `GET /api/v1/mcp/servers/{id}` - Server details
   - `POST /api/v1/mcp/servers/{id}/install` - Install server

### 14.2 Request/Response Flow

```typescript
// Example: List Pipelines
export async function listPipelines(
    params?: {
        page?: number;
        size?: number;
        filter?: string;
    }
): Promise<PipelineListResponse> {
    // 1. Build request configuration
    const config: AxiosRequestConfig = {
        method: 'GET',
        url: `${baseUrl}${API_ENDPOINTS.PIPELINES}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        params: {
            page: params?.page || 0,
            size: params?.size || 10,
            filter: params?.filter || ''
        },
        httpsAgent: getHTTPSAgent(context),
        timeout: 30000
    };
    
    // 2. Execute request with retry logic
    const response = await retryRequest(
        () => axios.request(config),
        {
            retries: 3,
            baseDelayMs: 1000,
            retryOnStatuses: [502, 503, 504]
        }
    );
    
    // 3. Validate response
    if (!response.data) {
        throw new ServiceError('Empty response from server');
    }
    
    // 4. Transform and return
    return {
        pipelines: response.data.content || [],
        totalCount: response.data.totalElements || 0,
        page: response.data.number || 0,
        totalPages: response.data.totalPages || 0
    };
}
```

### 14.3 Request Interceptors

```typescript
// Automatic token refresh on 401
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Attempt token refresh
                const newToken = await authService.refreshToken();
                
                // Update header and retry
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // Refresh failed, force re-login
                await authService.logout();
                throw refreshError;
            }
        }
        
        return Promise.reject(error);
    }
);
```

### 14.4 File Upload Implementation

```typescript
public async uploadFiles(
    agentId: string,
    files: File[]
): Promise<void> {
    const formData = new FormData();
    
    // Add files to form data
    files.forEach(file => {
        formData.append('files', file.stream, {
            filename: file.name,
            contentType: file.mimeType
        });
    });
    
    // Add metadata
    formData.append('agentId', agentId);
    formData.append('uploadedBy', userInfo.username);
    
    // Execute upload
    await axios.post(
        `${baseUrl}/api/v1/agents/${agentId}/upload`,
        formData,
        {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${this._token}`
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpsAgent: getHTTPSAgent(this.context)
        }
    );
}
```

---

## 15. Error Handling & Resilience

### 15.1 Error Hierarchy

```typescript
// Base error class
export class ServiceError extends Error {
    constructor(
        message: string,
        public code?: string,
        public status?: number,
        public details?: any
    ) {
        super(message);
        this.name = 'ServiceError';
    }
}

// Specific error types
export class AuthenticationError extends ServiceError {
    constructor(message: string) {
        super(message, 'AUTH_ERROR', 401);
    }
}

export class NetworkError extends ServiceError {
    constructor(message: string) {
        super(message, 'NETWORK_ERROR');
    }
}

export class ValidationError extends ServiceError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', 400, details);
    }
}
```

### 15.2 Retry Strategy

**Exponential Backoff**:
```typescript
async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            if (!isRetryableError(error)) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt);
            const jitter = Math.random() * 1000;
            await sleep(delay + jitter);
        }
    }
    
    throw new Error('Max retries exceeded');
}

function isRetryableError(error: any): boolean {
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        return true;
    }
    
    // HTTP status codes
    const status = error.response?.status;
    return status === 502 || status === 503 || status === 504;
}
```

### 15.3 Circuit Breaker Pattern

```typescript
class CircuitBreaker {
    private failureCount = 0;
    private successCount = 0;
    private lastFailureTime?: number;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    
    constructor(
        private threshold: number = 5,
        private timeout: number = 60000,
        private successThreshold: number = 2
    ) {}
    
    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime! < this.timeout) {
                throw new Error('Circuit breaker is OPEN');
            }
            this.state = 'HALF_OPEN';
        }
        
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    private onSuccess(): void {
        this.failureCount = 0;
        
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.successThreshold) {
                this.state = 'CLOSED';
                this.successCount = 0;
            }
        }
    }
    
    private onFailure(): void {
        this.failureCount++;
        this.successCount = 0;
        
        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
            this.lastFailureTime = Date.now();
        }
    }
}
```

### 15.4 User-Facing Error Messages

**Error Message Guidelines**:
1. Clear and actionable
2. No technical jargon for end-users
3. Suggest next steps
4. Include support information for unrecoverable errors

**Examples**:
```typescript
// Good error messages
const ERROR_MESSAGES = {
    NETWORK_UNREACHABLE: {
        message: 'Unable to connect to Essedum server',
        actions: [
            'Check your internet connection',
            'Verify VPN is connected',
            'Contact administrator if the problem persists'
        ]
    },
    
    AUTHENTICATION_FAILED: {
        message: 'Authentication failed',
        actions: [
            'Click "Login" to sign in again',
            'Ensure your credentials are correct',
            'Contact administrator if you cannot access your account'
        ]
    },
    
    PIPELINE_EXECUTION_FAILED: {
        message: 'Pipeline execution failed',
        actions: [
            'Check pipeline script for errors',
            'Review job logs for details',
            'Contact pipeline administrator for assistance'
        ]
    }
};

// Display error to user
vscode.window.showErrorMessage(
    ERROR_MESSAGES.NETWORK_UNREACHABLE.message,
    ...ERROR_MESSAGES.NETWORK_UNREACHABLE.actions
).then(selection => {
    // Handle action selection
});
```

---

## 16. Testing Strategy

### 16.1 Test Organization

```
src/test/
├── suite/
│   ├── auth/
│   │   ├── keycloak-auth.test.ts
│   │   └── oauth-server.test.ts
│   ├── services/
│   │   ├── pipeline.service.test.ts
│   │   └── pipeline-agent.service.test.ts
│   ├── providers/
│   │   └── essedum-file-provider.test.ts
│   └── integration/
│       ├── authentication-flow.test.ts
│       └── pipeline-execution.test.ts
├── extension.test.ts
└── oauth-test.ts
```

### 16.2 Unit Testing

**Example Test - PipelineService**:
```typescript
import * as assert from 'assert';
import * as sinon from 'sinon';
import { PipelineService } from '../../services/pipeline.service';

suite('PipelineService Tests', () => {
    let service: PipelineService;
    let axiosStub: sinon.SinonStub;
    
    setup(() => {
        service = new PipelineService(mockContext);
        axiosStub = sinon.stub(axios, 'request');
    });
    
    teardown(() => {
        sinon.restore();
    });
    
    test('listPipelines returns paginated results', async () => {
        // Arrange
        const mockResponse = {
            data: {
                content: [{ id: 1, name: 'test-pipeline' }],
                totalElements: 1,
                number: 0,
                totalPages: 1
            }
        };
        axiosStub.resolves(mockResponse);
        
        // Act
        const result = await service.listPipelines({ page: 0, size: 10 });
        
        // Assert
        assert.strictEqual(result.pipelines.length, 1);
        assert.strictEqual(result.totalCount, 1);
        assert.strictEqual(axiosStub.callCount, 1);
    });
    
    test('listPipelines retries on network error', async () => {
        // Arrange
        axiosStub.onFirstCall().rejects(new Error('ECONNRESET'));
        axiosStub.onSecondCall().resolves({ data: { content: [] } });
        
        // Act
        await service.listPipelines();
        
        // Assert
        assert.strictEqual(axiosStub.callCount, 2);
    });
});
```

### 16.3 Integration Testing

**Authentication Flow Test**:
```typescript
suite('Authentication Integration Tests', () => {
    test('complete OAuth flow', async () => {
        // 1. Start OAuth server
        const oauthServer = new OAuthAuthServer(extensionPath);
        const pkce = oauthServer.generatePKCE();
        const state = oauthServer.generateState();
        
        // 2. Initiate authentication
        const authPromise = oauthServer.waitForAuthCode(state);
        
        // 3. Simulate browser callback
        await simulateOAuthCallback(state, 'mock-auth-code');
        
        // 4. Verify code received
        const authCode = await authPromise;
        assert.strictEqual(authCode.code, 'mock-auth-code');
        assert.strictEqual(authCode.state, state);
        
        // 5. Exchange code for token
        const tokenResponse = await authService.exchangeCodeForToken(
            authCode.code,
            pkce.codeVerifier
        );
        
        // 6. Verify token received
        assert.ok(tokenResponse.access_token);
        assert.ok(tokenResponse.refresh_token);
        
        // 7. Cleanup
        oauthServer.close();
    });
});
```

### 16.4 E2E Testing

**Pipeline Execution Test**:
```typescript
suite('E2E: Pipeline Execution', () => {
    test('user can execute pipeline and view logs', async () => {
        // 1. Authenticate
        await vscode.commands.executeCommand('essedum.login');
        await waitForAuthentication();
        
        // 2. Navigate to pipelines
        await vscode.commands.executeCommand('essedum.showPipeline');
        await waitForView('essedum-pipeline');
        
        // 3. Select pipeline
        const webview = getActiveWebview();
        await webview.postMessage({
            command: 'selectPipeline',
            payload: { name: 'test-pipeline' }
        });
        
        // 4. Execute pipeline
        await webview.postMessage({
            command: 'executePipeline',
            payload: {
                runType: 'test',
                parameters: {}
            }
        });
        
        // 5. Wait for execution
        await waitForExecution();
        
        // 6. Open job logs
        await vscode.commands.executeCommand('essedum.openJobLogs');
        
        // 7. Verify logs displayed
        const logsWebview = getActiveWebview();
        const logs = await logsWebview.evaluate(() => {
            return document.querySelector('.job-logs').textContent;
        });
        
        assert.ok(logs.includes('Execution started'));
        assert.ok(logs.includes('Execution completed'));
    });
});
```

### 16.5 Testing Best Practices

- **Isolation**: Each test is independent
- **Mocking**: External dependencies mocked
- **Coverage**: Aim for 80%+ code coverage
- **Performance**: Tests complete in < 5 minutes
- **CI/CD**: Automated test execution on commits

---

## 17. Performance Considerations

### 17.1 WebView Optimization

**Lazy Loading**:
```typescript
// Load data on demand
private async loadPipelineDetails(name: string): Promise<void> {
    if (this.cachedDetails[name]) {
        this.displayDetails(this.cachedDetails[name]);
        return;
    }
    
    const details = await this.pipelineService.getPipelineDetails(name);
    this.cachedDetails[name] = details;
    this.displayDetails(details);
}
```

**Virtual Scrolling**:
```javascript
// Client-side implementation
class VirtualList {
    constructor(container, itemHeight, items) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.items = items;
        this.visibleStart = 0;
        this.visibleEnd = Math.ceil(container.clientHeight / itemHeight);
    }
    
    render() {
        const visibleItems = this.items.slice(this.visibleStart, this.visibleEnd);
        const html = visibleItems.map(item => this.renderItem(item)).join('');
        this.container.innerHTML = html;
    }
}
```

**Pagination**:
- Default page size: 10 items
- Load more on scroll or button click
- Total count displayed for user awareness

### 17.2 Caching Strategy

**Multi-Level Cache**:
```typescript
class CacheManager {
    private memoryCache = new Map<string, CacheEntry>();
    private diskCache?: DiskCache;
    
    async get<T>(key: string): Promise<T | undefined> {
        // L1: Memory cache
        const memEntry = this.memoryCache.get(key);
        if (memEntry && !this.isExpired(memEntry)) {
            return memEntry.value as T;
        }
        
        // L2: Disk cache
        if (this.diskCache) {
            const diskEntry = await this.diskCache.get(key);
            if (diskEntry && !this.isExpired(diskEntry)) {
                // Promote to memory cache
                this.memoryCache.set(key, diskEntry);
                return diskEntry.value as T;
            }
        }
        
        return undefined;
    }
    
    async set<T>(key: string, value: T, ttl: number): Promise<void> {
        const entry: CacheEntry = {
            value,
            expiry: Date.now() + ttl
        };
        
        // Store in both levels
        this.memoryCache.set(key, entry);
        if (this.diskCache) {
            await this.diskCache.set(key, entry);
        }
    }
    
    private isExpired(entry: CacheEntry): boolean {
        return Date.now() > entry.expiry;
    }
}
```

### 17.3 Bundle Optimization

**Webpack Configuration**:
```javascript
module.exports = {
    mode: 'production',
    target: 'node',
    entry: './src/extension.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2'
    },
    optimization: {
        minimize: true,
        usedExports: true,
        sideEffects: false
    },
    externals: {
        vscode: 'commonjs vscode',
        // Externalize large dependencies
        'node-fetch': 'commonjs node-fetch',
        'axios': 'commonjs axios'
    }
};
```

**Code Splitting**:
- Core extension bundle
- WebView bundles (separate)
- Lazy-loaded features

### 17.4 Network Optimization

**Request Batching**:
```typescript
class RequestBatcher {
    private queue: Request[] = [];
    private timer?: NodeJS.Timeout;
    
    enqueue(request: Request): Promise<Response> {
        return new Promise((resolve, reject) => {
            this.queue.push({ request, resolve, reject });
            
            if (!this.timer) {
                this.timer = setTimeout(() => this.flush(), 100);
            }
        });
    }
    
    private async flush(): Promise<void> {
        const batch = this.queue.splice(0);
        this.timer = undefined;
        
        try {
            const responses = await this.executeBatch(batch.map(b => b.request));
            batch.forEach((item, index) => {
                item.resolve(responses[index]);
            });
        } catch (error) {
            batch.forEach(item => item.reject(error));
        }
    }
}
```

**Connection Pooling**:
```typescript
const agent = new https.Agent({
    keepAlive: true,
    maxSockets: 10,
    maxFreeSockets: 5,
    timeout: 60000,
    freeSocketTimeout: 30000
});
```

### 17.5 Memory Management

**Disposable Pattern**:
```typescript
class ResourceManager implements vscode.Disposable {
    private disposables: vscode.Disposable[] = [];
    
    register(disposable: vscode.Disposable): void {
        this.disposables.push(disposable);
    }
    
    dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}
```

**Weak References**:
```typescript
class CacheWithWeakRefs {
    private cache = new WeakMap<object, CachedData>();
    
    set(key: object, value: CachedData): void {
        this.cache.set(key, value);
        // Automatically garbage collected when key is no longer referenced
    }
}
```

---

## 18. Deployment & Distribution

### 18.1 Build Process

**Build Script** (`package.json`):
```json
{
    "scripts": {
        "vscode:prepublish": "npm run compile",
        "compile": "webpack --mode production",
        "watch": "webpack --mode development --watch",
        "package": "vsce package",
        "publish": "vsce publish"
    }
}
```

**Build Steps**:
1. `npm run compile` - TypeScript compilation with Webpack
2. `vsce package` - Create `.vsix` package
3. `vsce publish` - Publish to marketplace

### 18.2 Versioning

**Semantic Versioning**:
- Format: `MAJOR.MINOR.PATCH`
- Current: `1.0.40`

**Version Increment Rules**:
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### 18.3 Extension Packaging

**Package Manifest** (`package.json`):
```json
{
    "name": "essedum",
    "displayName": "Essedum",
    "description": "VS Code extension for Essedum AI Platform",
    "version": "1.0.40",
    "publisher": "essedum",
    "engines": {
        "vscode": "^1.103.0"
    },
    "main": "./dist/extension.js"
}
```

**Package Contents**:
- `dist/extension.js` - Compiled extension code
- `media/` - Static assets (images, HTML templates)
- `README.md` - User documentation
- `CHANGELOG.md` - Version history
-`LICENSE.txt` - License information

### 18.4 Marketplace Publishing

**Prerequisites**:
1. VS Code Marketplace account
2. Publisher ID created
3. Personal Access Token (PAT) from Azure DevOps

**Publishing Command**:
```bash
vsce publish -p <personal-access-token>
```

**Automated Publishing** (CI/CD):
```yaml
# .github/workflows/publish.yml
name: Publish Extension

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run compile
      - run: npm run package
      - run: vsce publish -p ${{ secrets.VSCE_TOKEN }}
```

### 18.5 Update Mechanism

**Extension Auto-Update**:
- VS Code automatically checks for updates
- Users notified of new versions
- One-click update from marketplace

**Breaking Change Communication**:
- CHANGELOG.md updated
- Release notes displayed on update
- Migration guide for major versions

---

## 19. Implementation Details

### 19.1 Key Implementation Patterns

#### Factory Pattern - Provider Creation
```typescript
// utils/initialization-utils.ts
export function createLoginProvider(context: ExtensionContext): LoginScreenProvider {
    return new LoginScreenProvider(
        context.extensionUri,
        context
    );
}

export function createFileSystemProvider(context: ExtensionContext): EssedumFileSystemProvider {
    const token = context.globalState.get<string>(STORAGE_KEYS.ACCESS_TOKEN) || '';
    const project = context.globalState.get(STORAGE_KEYS.PROJECT);
    const role = context.globalState.get(STORAGE_KEYS.ROLE);
    
    return new EssedumFileSystemProvider(token, project, role, context);
}
```

#### Observer Pattern - Event Handling
```typescript
// providers/essedum-file-provider.ts
private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

// Emit change events
this._emitter.fire([{
    type: vscode.FileChangeType.Changed,
    uri: fileUri
}]);

// Subscribers notified automatically
workspace.onDidSaveTextDocument(async (document) => {
    // Handle file save
});
```

#### Strategy Pattern - Network Configuration
```typescript
interface NetworkStrategy {
    configure(context: ExtensionContext): void;
    getSSLAgent(): https.Agent;
}

class PrivateNetworkStrategy implements NetworkStrategy {
    configure(context: ExtensionContext): void {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    
    getSSLAgent(): https.Agent {
        return new https.Agent({ rejectUnauthorized: false });
    }
}

class PublicNetworkStrategy implements NetworkStrategy {
    configure(context: ExtensionContext): void {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    }
    
    getSSLAgent(): https.Agent {
        return new https.Agent({ rejectUnauthorized: true });
    }
}
```

### 19.2 Advanced TypeScript Features

#### Generics
```typescript
// Generic service method with type safety
public async fetchData<T>(
    endpoint: string,
    params?: HttpParams
): Promise<T> {
    const response = await this.request<T>({
        url: endpoint,
        params
    });
    return response.data;
}

// Usage
const pipelines = await service.fetchData<Pipeline[]>('/api/pipelines');
```

#### Union Types & Type Guards
```typescript
type NetworkType = 'private' | 'restricted' | 'public';

function isPrivateNetwork(type: NetworkType): type is 'private' {
    return type === 'private';
}

if (isPrivateNetwork(networkType)) {
    // TypeScript knows networkType is 'private' here
    configurePrivateNetwork();
}
```

#### Interfaces & Type Aliases
```typescript
interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

type PipelineStatus = 'running' | 'completed' | 'failed' | 'pending';

interface Pipeline {
    id: string;
    name: string;
    status: PipelineStatus;
    scripts: Script[];
}
```

### 19.3 Async/Await Patterns

#### Sequential Operations
```typescript
async function initializeExtension(): Promise<void> {
    await initializeSSL();
    const authService = await initializeAuth();
    const token = await authService.login();
    await updateServices(token);
}
```

#### Parallel Operations
```typescript
async function loadDashboardData(): Promise<void> {
    const [pipelines, agents, jobs] = await Promise.all([
        pipelineService.listPipelines(),
        agentService.listAgents(),
        jobService.listJobs()
    ]);
    
    renderDashboard({ pipelines, agents, jobs });
}
```

#### Error Handling
```typescript
async function safeOperation(): Promise<void> {
    try {
        await riskyOperation();
    } catch (error) {
        if (error instanceof NetworkError) {
            await handleNetworkError(error);
        } else if (error instanceof AuthError) {
            await handleAuthError(error);
        } else {
            logger.error('Unexpected error:', error);
            throw error;
        }
    } finally {
        cleanup();
    }
}
```

### 19.4 WebView Communication Implementation

#### Extension to WebView
```typescript
// Extension side
this._view?.webview.postMessage({
    command: 'updatePipelines',
    data: {
        pipelines: pipelineList,
        page: currentPage,
        totalCount: total
    }
});
```

#### WebView to Extension
```javascript
// Client-side JavaScript
const vscode = acquireVsCodeApi();

function loadPipelines(page) {
    vscode.postMessage({
        command: 'loadPipelines',
        payload: { page }
    });
}
```

#### Bidirectional Communication
```typescript
// Extension: Message handler
webview.onDidReceiveMessage(async (message) => {
    switch (message.command) {
        case 'loadPipelines':
            const pipelines = await this.loadPipelines(message.payload.page);
            webview.postMessage({
                command: 'pipelinesLoaded',
                data: pipelines
            });
            break;
    }
});

// Client: Message listener
window.addEventListener('message', (event) => {
    const message = event.data;
    switch (message.command) {
        case 'pipelinesLoaded':
            renderPipelines(message.data);
            break;
    }
});
```

### 19.5 Custom File System Implementation

#### FileSystemProvider Interface
```typescript
export class EssedumFileSystemProvider implements vscode.FileSystemProvider {
    // Event emitter for file changes
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile = this._emitter.event;
    
    // File storage
    private _files = new Map<string, EssedumFile>();
    
    // Required methods
    watch(uri: vscode.Uri): vscode.Disposable { /* ... */ }
    stat(uri: vscode.Uri): vscode.FileStat { /* ... */ }
    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] { /* ... */ }
    createDirectory(uri: vscode.Uri): void { /* ... */ }
    readFile(uri: vscode.Uri): Uint8Array { /* ... */ }
    writeFile(uri: vscode.Uri, content: Uint8Array): void { /* ... */ }
    delete(uri: vscode.Uri): void { /* ... */ }
    rename(oldUri: vscode.Uri, newUri: vscode.Uri): void { /* ... */ }
}
```

#### File Registration and Opening
```typescript
// Register virtual file
public registerFile(
    pipelineName: string,
    fileName: string,
    content: string
): vscode.Uri {
    const uri = vscode.Uri.parse(
        `essedum://pipeline/${pipelineName}/${fileName}`
    );
    
    this._files.set(uri.toString(), {
        uri,
        content,
        modified: false,
        fileName,
        pipelineName
    });
    
    return uri;
}

// Open in editor
const uri = fileProvider.registerFile(name, file, content);
const document = await vscode.workspace.openTextDocument(uri);
await vscode.window.showTextDocument(document);
```

---

## 20. Visual Walkthrough

### 20.1 Authentication Flow (Screenshots)

**Network Selection** ([07-login-screen.png](media/screenshots/07-login-screen.png), [08-network-selection.png](media/screenshots/08-network-selection.png))
- User selects network type (Private/Restricted/Public)
- Network-specific OAuth configuration loaded
- SSL settings applied based on network

**Browser Authentication** ([10-browser-auth.png](media/screenshots/10-browser-auth.png), [11-auth-success.png](media/screenshots/11-auth-success.png))
- OAuth flow initiated in external browser
- User authenticates with Keycloak
- Success page displayed on completion
- Extension receives OAuth callback

### 20.2 Navigation Interface (Screenshots)

**Navigation Dashboard** ([12-navigation-dashboard.png](media/screenshots/12-navigation-dashboard.png))
- Central hub for all features
- Quick access to Pipelines, Agents, MCP Servers
- Session information display
- Logout option

**Navigation Options** ([13-pipeline-navigation.png](media/screenshots/13-pipeline-navigation.png))
- Pipeline Management
- Agent Development
- MCP Server Integration
- Job Log Viewer

### 20.3 Pipeline Management (Screenshots)

**Pipeline List** ([14-pipeline-list.png](media/screenshots/14-pipeline-list.png))
- Paginated pipeline cards
- Search and filter capabilities
- Pipeline status indicators
- Quick actions

**Pipeline Details** ([16-pipeline-card-details.png](media/screenshots/16-pipeline-card-details.png), [17-pipeline-detail-screen.png](media/screenshots/17-pipeline-detail-screen.png))
- Comprehensive pipeline information
- Script list with file types
- Run type options
- Execution controls

**Script Editing** ([19-pipeline-script-open.png](media/screenshots/19-pipeline-script-open.png), [20-python-file-opened.png](media/screenshots/20-python-file-opened.png))
- Full IDE capabilities (IntelliSense, syntax highlighting)
- Virtual file system integration
- Auto-save to server
- Support for Python, Shell, Notebook files

**Notebook Support** ([21-notebook-open.png](media/screenshots/21-notebook-open.png), [22-notebook-display.png](media/screenshots/22-notebook-display.png))
- Jupyter notebook rendering
- Cell execution preview
- Interactive visualization

### 20.4 Pipeline Execution (Screenshots)

**Execution Control** ([26-run-pipeline-button.png](media/screenshots/26-run-pipeline-button.png))
- Run type selection
- Parameter configuration
- Real-time status updates

**Execution Results** ([27-execution-success.png](media/screenshots/27-execution-success.png), [28-updated-job-list.png](media/screenshots/28-updated-job-list.png))
- Success/failure notification
- Job list updated immediately
- Quick access to logs

**Job Logs Viewer** ([25-job-logs-viewer.png](media/screenshots/25-job-logs-viewer.png), [30-console-logs.png](media/screenshots/30-console-logs.png))
- Comprehensive job history
- Pagination and filtering
- Console log streaming
- Job metadata display

**Log Details** ([31-job-log-details.png](media/screenshots/31-job-log-details.png))
- Detailed execution logs
- Artifact download
- Execution timeline
- Error diagnostics

### 20.5 Agent Management (Screenshots)

**Agent List** ([38-agents-list.png](media/screenshots/38-agents-list.png))
- Available agents display
- Agent status and metadata
- Quick actions

**Agent Details** ([44-agent-view-details.png](media/screenshots/44-agent-view-details.png), [45-agent-detail-screen.png](media/screenshots/45-agent-detail-screen.png))
- Agent configuration
- Code structure overview
- Download/upload operations

**Code Download** ([46-download-code-button.png](media/screenshots/46-download-code-button.png), [47-download-location.png](media/screenshots/47-download-location.png), [49-download-success.png](media/screenshots/49-download-success.png))
- Select download location
- Progress indication
- Workspace integration

**Code Upload** ([59-upload-code-menu.png](media/screenshots/59-upload-code-menu.png), [60-upload-confirmation.png](media/screenshots/60-upload-confirmation.png), [61-upload-success.png](media/screenshots/61-upload-success.png))
- Context menu integration
- Folder upload support
- Confirmation and validation
- Success notification

### 20.6 MCP Server Integration (Screenshots)

**MCP Servers Tab** ([37-agent-mcp-access.png](media/screenshots/37-agent-mcp-access.png), [39-mcp-servers-tab.png](media/screenshots/39-mcp-servers-tab.png))
- Available MCP servers
- Server capabilities
- Installation options

**MCP Search** ([41-mcp-search.png](media/screenshots/41-mcp-search.png), [42-mcp-search-results.png](media/screenshots/42-mcp-search-results.png))
- Search across servers
- Filter by capabilities
- Server details

### 20.7 GitHub Integration (Screenshots)

**GitHub Copilot** ([63-open-copilot.png](media/screenshots/63-open-copilot.png))
- AI-powered code assistance
- Context-aware suggestions
- Integration with Essedum workflows

**Repository Operations** ([64-github-url-input.png](media/screenshots/64-github-url-input.png), [65-branch-selection.png](media/screenshots/65-branch-selection.png))
- Repository clone
- Branch management
- Code synchronization

### 20.8 Session Management (Screenshots)

**Session Information**
- Token expiry display
- Session duration
- User information

**Logout** ([66-logout.png](media/screenshots/66-logout.png))
- Secure credential cleanup
- Return to login screen
- Session termination

---

## 21. Conclusion

### 21.1 Architectural Strengths

1. **Modularity**: Clear separation of concerns enables independent development and testing
2. **Extensibility**: New features can be added without modifying core code
3. **Maintainability**: Well-organized code structure and comprehensive documentation
4. **Scalability**: Efficient caching, pagination, and lazy loading support growth
5. **Security**: Enterprise-grade authentication and secure credential management
6. **Reliability**: Comprehensive error handling and retry mechanisms

### 21.2 Key Technical Achievements

- **OAuth 2.0 with PKCE**: Industry-standard authentication with enhanced security
- **Custom File System**: Seamless editing of remote files as if local
- **Multi-Network Support**: Flexible deployment across different environments
- **Real-Time Monitoring**: Live job log streaming and status updates
- **WebView Integration**: Native VS Code UI with custom business logic
- **TypeScript Excellence**: Strong typing and modern language features

### 21.3 Best Practices Demonstrated

- **Clean Code**: Readable, maintainable, and well-documented
- **SOLID Principles**: Applied throughout the architecture
- **Design Patterns**: Appropriate use of Factory, Observer, Strategy, etc.
- **Error Handling**: Comprehensive and user-friendly error management
- **Testing**: Unit, integration, and E2E testing strategies
- **Performance**: Optimized for responsiveness and efficiency
- **Security**: Defense in depth with multiple security layers

### 21.4 Future Enhancement Opportunities

1. **Advanced Caching**: Redis or similar for distributed caching
2. **Offline Mode**: Local execution with sync when online
3. **Collaborative Editing**: Real-time multi-user script editing
4. **AI Assistance**: Intelligent code suggestions and error detection
5. **Custom Dashboards**: User-configurable analytics and metrics
6. **Plugin System**: Third-party extension support
7. **Mobile Support**: Companion mobile app for monitoring

### 21.5 Resources & References

**Documentation**:
- [vs-extension/README.md](README.md) - User guide
- [vs-extension/EXTENSION-USAGE-README.md](EXTENSION-USAGE-README.md) - Visual guide
- [vs-extension/CHANGELOG.md](CHANGELOG.md) - Version history

**External Resources**:
- [VS Code Extension API](https://code.visualstudio.com/api)
- [OAuth 2.0 with PKCE](https://oauth.net/2/pkce/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Webpack Configuration](https://webpack.js.org/configuration/)

**Support**:
- GitHub Issues: [https://github.com/Infosys-MWC-GENAI/ai-platform/issues](https://github.com/Infosys-MWC-GENAI/ai-platform/issues)
- Documentation: [https://github.com/Infosys-MWC-GENAI/ai-platform#readme](https://github.com/Infosys-MWC-GENAI/ai-platform#readme)

---

## Appendix A: Architecture Diagrams

### A.1 System Context Diagram
```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ▼
┌────────────────────────────────┐
│   VS Code with Essedum Ext    │
└───────────┬────────────────────┘
            │
            ├─────────▶ ┌────────────────┐
            │           │   Keycloak     │
            │           │ (Authentication)│
            │           └────────────────┘
            │
            ├─────────▶ ┌────────────────┐
            │           │ Essedum API    │
            │           │  (Pipelines)   │
            │           └────────────────┘
            │
            └─────────▶ ┌────────────────┐
                        │ Essedum API    │
                        │   (Agents)     │
                        └────────────────┘
```

### A.2 Component Diagram
```
┌──────────────────────────────────────────────────────────┐
│                    Extension Host                         │
│                                                           │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │   Auth     │  │  Pipeline  │  │  Pipeline Agent  │   │
│  │  Service   │  │  Service   │  │     Service      │   │
│  └────────────┘  └────────────┘  └──────────────────┘   │
│                                                           │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │   Login    │  │Navigation  │  │    Pipeline      │   │
│  │  Provider  │  │  Provider  │  │    Provider      │   │
│  └────────────┘  └────────────┘  └──────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │        File System Provider (essedum://)          │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### A.3 Authentication Sequence Diagram
(See Section 6.1 for detailed OAuth flow diagram)

### A.4 Data Flow Diagram
(See Section 10.1 for state management flow)

---

## Appendix B: API Reference

### B.1 Extension Commands

| Command ID | Description | Parameters |
|-----------|-------------|------------|
| `essedum.login` | Initiate OAuth login | None |
| `essedum.logout` | Logout and clear session | None |
| `essedum.showPipeline` | Show pipeline view | None |
| `essedum.showPipelineAgent` | Show agent view | None |
| `essedum.openJobLogs` | Open job logs viewer | `pipelineName?: string` |
| `essedum.uploadAgentFolder` | Upload code to agent | `uri?: Uri` |

### B.2 Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `essedum.auth.oauthPort` | number | 8085 | OAuth callback server port |
| `essedum.auth.allowSelfSignedCertificates` | boolean | true | Allow self-signed SSL certificates |
| `essedum.auth.showCertificateWarnings` | boolean | true | Show certificate warnings |
| `essedum.auth.autoLogin` | boolean | false | Auto-login on extension start |

### B.3 Context Keys

| Context Key | Type | Description |
|------------|------|-------------|
| `essedum.isAuthenticated` | boolean | User is authenticated |
| `essedum.showNavigation` | boolean | Navigation view visible |
| `essedum.showPipeline` | boolean | Pipeline view visible |
| `essedum.showPipelineAgent` | boolean | Agent view visible |
| `essedum.jobLogsVisible` | boolean | Job logs panel visible |

---

**Document End**  
For additional information or support, please refer to the GitHub repository or contact the development team.
