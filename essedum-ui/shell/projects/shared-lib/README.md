# @essedum/shared-lib

Shared contracts and singleton services for the Essedum MFE platform.

Owns:
- `AuthService` (abstract) — implemented by host, injected by remotes
- `EventBusService` — typed pub/sub for cross-MFE notifications
- `WorkspaceService` — current workspace / tenant state
- `API_CONFIG` injection token — backend base URL configuration
- `AppEvent` discriminated-union event contracts

Federation rules:
- Declared `singleton: true, strictVersion: true` in every `webpack.config.js`
- Host registers concrete implementations; remotes only inject abstractions
- Versioned with SemVer — breaking changes require a deprecation cycle
