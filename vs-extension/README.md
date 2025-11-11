# Essedum AI Platform Extension for VS Code

This extension integrates VS Code with the Essedum AI Platform, providing seamless authentication and pipeline execution capabilities with enhanced OAuth 2.0 security.

## ✨ Features

- **🔐 Automatic OAuth 2.0 Authentication**: Secure, one-click authentication with PKCE support - no more manual token copying!
- **🚀 Pipeline Execution**: Submit and run scripts directly from VS Code on Essedum pipelines
- **📊 Real-time Monitoring**: View execution results, logs, and status in an integrated sidebar
- **🎨 Modern UI**: Clean, VS Code-themed interface with loading indicators and comprehensive error handling
- **🔄 Automatic Token Refresh**: Seamless token management with automatic renewal
- **⚙️ Configurable Settings**: Customizable OAuth server port and authentication options

## Requirements

- Visual Studio Code version 1.103.0 or higher
- Active Essedum AI Platform account
- Network access to the Essedum AI Platform server (https://aiplatform.az.ad.idemo-ppc.com:8443)
- Available port 8085 (configurable) for OAuth callback server

## Installation

1. Install the extension via VS Code Extensions Marketplace
2. Reload VS Code
3. The Essedum icon will appear in the Activity Bar

## 🚀 Quick Start

### First-Time Authentication

1. **Open Extension**: Click the Essedum icon in the Activity Bar
2. **Login**: Use Command Palette (`Ctrl+Shift+P`) and run "Login to Essedum"
3. **Browser Authentication**: Your browser will open to the Keycloak login page
4. **Complete Login**: Enter your credentials in the browser
5. **Automatic Redirect**: You'll be redirected back to VS Code automatically
6. **Ready to Use**: Start using Essedum pipelines immediately!

### Running Scripts

1. Open any script file in the VS Code editor
2. Ensure you're authenticated (automatic on first use)
3. Click "Run Current Script" in the Essedum sidebar
4. Monitor execution progress and view results in real-time

## 🔧 Configuration

Access settings via `File > Preferences > Settings` and search for "Essedum":

```json
{
    "essedum.auth.oauthPort": 8085,
    "essedum.auth.autoLogin": true,
    "essedum.auth.allowSelfSignedCertificates": true,
    "essedum.auth.showCertificateWarnings": true
}
```

### Setting Descriptions

- **`oauthPort`**: Port for OAuth callback server (default: 8085)
- **`autoLogin`**: Automatically login when extension starts (default: true)  
- **`allowSelfSignedCertificates`**: Accept self-signed SSL certificates (default: true)
- **`showCertificateWarnings`**: Show certificate-related warnings (default: true)

## 🛡️ Security Features

### OAuth 2.0 with PKCE
- **Secure Authorization**: Uses industry-standard OAuth 2.0 Authorization Code flow
- **PKCE Protection**: Implements Proof Key for Code Exchange (RFC 7636) for enhanced security
- **State Validation**: CSRF protection through state parameter validation
- **Secure Storage**: Tokens stored using VS Code's encrypted SecretStorage API

### Certificate Handling
- Configurable SSL certificate validation for development environments
- Self-signed certificate support with user consent
- Production-ready certificate validation options

## 📝 Available Commands

Access these commands via the Command Palette (`Ctrl+Shift+P`):

- **`Login to Essedum`**: Start the automatic OAuth authentication flow
- **`Logout from Essedum`**: Clear authentication and logout
- **`Check Authentication Status`**: View current token status and expiry information
- **`Open Essedum Panel`**: Open the main Essedum sidebar panel
- **`Debug Upload Endpoints`**: Test API connectivity and authentication

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```
Error: Port 8085 is already in use
```
**Solution**: Change the OAuth port in settings or close applications using port 8085.

#### Authentication Timeout
```
Authentication timed out. Please try again.
```
**Solution**: Complete the browser login within 5 minutes, or restart the authentication process.

#### SSL Certificate Errors
```
Certificate error: UNABLE_TO_GET_ISSUER_CERT_LOCALLY
```
**Solution**: Enable `allowSelfSignedCertificates` in settings and click "Continue" when prompted.

### Debug Steps

1. Run `Check Authentication Status` command to see current state
2. Check VS Code Output panel for detailed error messages
3. Ensure port 8085 is available
4. Verify network connectivity to the Keycloak server

## 🆕 What's New in OAuth 2.0 Authentication

### Upgraded from Manual Token Entry
- **Before**: Users had to manually copy tokens from browser developer tools
- **After**: Fully automated OAuth flow with browser redirect

### Enhanced Security
- **PKCE Implementation**: Protection against authorization code interception
- **State Parameter**: CSRF attack prevention
- **Automatic Token Refresh**: Seamless token renewal without user intervention

### Improved User Experience
- **One-Click Login**: Single command starts the entire authentication process
- **Visual Progress**: Real-time feedback during authentication steps
- **Auto-Close Browser**: Browser window closes automatically after successful authentication

## 🏗️ Keycloak Configuration

For system administrators, ensure your Keycloak client is configured with:

```yaml
Client ID: essedum-45
Client Type: Public
Valid Redirect URIs: 
  - http://localhost:8085/callback
Web Origins: 
  - http://localhost:8085
Authorization Code Flow: Enabled
PKCE Code Challenge Method: S256
```

## 📋 Known Issues

- **Port Conflicts**: OAuth callback server requires an available port (default: 8085)
- **Certificate Warnings**: Self-signed certificates require user confirmation
- **Browser Pop-up Blockers**: May prevent automatic browser opening

## 📈 Release Notes

### 0.0.2 (Latest)
- ✅ **New**: Automatic OAuth 2.0 Authentication with PKCE
- ✅ **New**: Configurable OAuth callback server port
- ✅ **New**: Automatic token refresh mechanism
- ✅ **New**: Enhanced security with state parameter validation
- ✅ **New**: Logout command and improved authentication status
- ✅ **Improved**: User experience with progress indicators
- ✅ **Improved**: Error handling and troubleshooting

### 0.0.1
Initial release with manual Keycloak authentication and basic script submission functionality.

---

## 🛠️ Development

### Building the Extension

1. Clone the repository
```bash
git clone <repository-url>
cd vs-extension
```

2. Install dependencies
```bash
npm install
```

3. Compile and watch for changes
```bash
npm run watch
```

4. Open in VS Code and press `F5` to launch Extension Development Host

### Testing

Run tests with:
```bash
npm test
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📧 Support

For technical support or feature requests:
- Check the [OAuth Authentication Guide](./OAUTH_AUTHENTICATION_GUIDE.md)
- Review troubleshooting steps above
- Contact your system administrator
- Submit an issue in the project repository

---

**Happy coding with Essedum AI Platform! 🚀**
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
