# Essedum AI Platform Extension for VS Code

This extension integrates VS Code with the Essedum AI Platform, allowing you to authenticate with Keycloak and run your scripts directly on Essedum's pipelines.

## Features

- Authenticate with Essedum AI Platform using Keycloak authentication
- Submit scripts directly from VS Code to run on Essedum pipelines
- View execution results in the sidebar
- Modern VS Code-themed UI with loading indicators and error handling

## Requirements

- Visual Studio Code version 1.103.0 or higher
- Active Essedum AI Platform account
- Network access to the Essedum AI Platform server (https://aiplatform.az.ad.idemo-ppc.com:8443)

## Installation

1. Install the extension via VS Code Extensions Marketplace
2. Reload VS Code
3. The Essedum icon will appear in the Activity Bar

## Usage

### Authentication

1. Click on the Essedum icon in the Activity Bar to open the sidebar
2. Enter your Essedum username and password in the login form
3. Click "Login" to authenticate with the Keycloak server
4. Once authenticated, you'll see the "Run Current Script" button in the sidebar

### Running Scripts

1. Open a script file in the editor
2. Make sure you're authenticated with Essedum
3. Click the "Run Current Script" button in the sidebar
4. View the execution status and results in the sidebar

## Security

This extension securely communicates with the Essedum Keycloak server for authentication. Your credentials are never stored locally and are only used for the authentication request.

## Known Issues

- May encounter certificate validation issues with self-signed certificates

## Release Notes

### 0.0.1

Initial release of the Essedum AI Platform extension with Keycloak authentication and script submission functionality.

---

## Development

### Building the Extension

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press F5 to launch the extension in a new VS Code window

### Package the Extension

```bash
npm run package
```

This will create a .vsix file that can be installed in VS Code.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
