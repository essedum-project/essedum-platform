# AGENTS.md - VS Code Extension

This file provides instructions for agents working on the Essedum VS Code Extension.

## Purpose
This extension allows developers to interact with the Essedum AI Platform directly from Visual Studio Code. Key features include authentication, managing jobs, and viewing logs.

## Guidelines for Modification

### Code Structure
*   **`src/extension.ts`**: The main entry point. Registers commands and providers.
*   **`src/auth.ts`**: Handles OAuth2 flow with Keycloak (PKCE).
*   **`src/sidebar.ts`**: Implementation of the Sidebar Webview.
*   **`media/`**: Contains CSS/JS for the webviews.

### Development Workflow
*   **Building**: Use `npm run compile` to build the extension.
*   **Packaging**: Use `vsce package` to create a `.vsix` file for distribution.

### Authentication Logic
*   The extension spins up a temporary local server (default port 8085) to receive the OAuth callback.
*   Tokens are stored securely (or in memory/context depending on implementation).

## Troubleshooting
*   **"Extension Host Terminated Unexpectedly"**: Check the "Developer Tools" in VS Code (Help -> Toggle Developer Tools) for console errors.
*   **Authentication Fails**: Verify the `redirect_uri` matches what is configured in Keycloak (usually `http://localhost:8085/callback`).
