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
- Network access to the Essedum AI Platform server
- Available port 8085 (configurable) for OAuth callback server

## Installation

1. Install the extension via VS Code Extensions Marketplace
2. Reload VS Code
3. The Essedum icon will appear in the Activity Bar

## 📚 Complete Documentation

This extension includes comprehensive documentation for all use cases:

### For End Users
- **[Visual User Guide](EXTENSION-USAGE-README.md)** - Complete screenshot-based guide with 40+ images covering all features
- **This README** - Quick start and basic usage

### For Deployment & Operations
- **[Deployment Guide](DEPLOYMENT-GUIDE.md)** - Complete guide for deploying in new environments with configuration examples
- **[Environment Setup Checklist](ENVIRONMENT-SETUP-CHECKLIST.md)** - Interactive step-by-step checklist ensuring nothing is missed
- **[Keycloak Integration Guide](KEYCLOAK-INTEGRATION-GUIDE.md)** - Deep dive into OAuth 2.0 with PKCE and Keycloak configuration

### For Architects & Developers
- **[Design & Implementation](DESIGN-AND-IMPLEMENTATION.md)** - System architecture, design patterns, and technical implementation details
- **[Technical Demo Walkthrough](DEMO-WALKTHROUGH.md)** - Technical deep dive with implementation insights

### For Training & Demos
- **[Demo Recording Script](DEMO-RECORDING-SCRIPT.md)** - Complete script with talking points for creating demo videos (~30 min)

### Navigation
- **[Documentation Index](DOCUMENTATION-INDEX.md)** - Master index with learning paths and topic-based navigation

**Quick Links**:
- 🚀 [Quick Start](#installation) (This page)
- 📖 [Visual Guide](EXTENSION-USAGE-README.md) - See screenshots
- 🏗️ [Deploy in Your Environment](DEPLOYMENT-GUIDE.md)
- 🔐 [Configure Keycloak](KEYCLOAK-INTEGRATION-GUIDE.md)
- ✅ [Deployment Checklist](ENVIRONMENT-SETUP-CHECKLIST.md)

## Quick Start

### First Time Setup

1. **Install the Extension**
   - Open VS Code Extensions Marketplace (Ctrl+Shift+X)
   - Search for "Essedum"
   - Click "Install"

2. **Authenticate**
   - Click the Essedum icon in the Activity Bar
   - Select your network environment
   - Click "Login" - your browser will open
   - Enter your credentials in Keycloak
   - Return to VS Code - you're authenticated!

3. **Start Using**
   - Browse pipelines
   - Edit pipeline scripts
   - Execute jobs
   - Monitor logs in real-time

For detailed instructions with screenshots, see the [Visual User Guide](EXTENSION-USAGE-README.md).

## For Deployment Teams

If you need to deploy this extension in your organization:

1. **Read the [Deployment Guide](DEPLOYMENT-GUIDE.md)** - Understand requirements and architecture
2. **Follow the [Setup Checklist](ENVIRONMENT-SETUP-CHECKLIST.md)** - Step-by-step deployment process
3. **Configure [Keycloak](KEYCLOAK-INTEGRATION-GUIDE.md)** - Set up OAuth authentication
4. **Customize** - Configure for your environment using the guides

**Estimated Deployment Time**: 2-3 hours for first deployment

## Architecture Overview

The extension integrates with:
- **Keycloak** - OAuth 2.0 authentication with PKCE
- **Essedum AI Platform APIs** - Pipeline management, job execution, file operations
- **VS Code APIs** - Custom webviews, file system provider, secret storage

For complete architecture details, see [Design & Implementation](DESIGN-AND-IMPLEMENTATION.md).

## Troubleshooting

### Common Issues

**Authentication fails**: Check Keycloak configuration and network connectivity. See [Keycloak Integration Guide](KEYCLOAK-INTEGRATION-GUIDE.md#troubleshooting).

**Port 8085 in use**: Configure a different port in VS Code settings: `"essedum.auth.oauthPort": 8086`

**SSL certificate errors**: For self-signed certificates, see SSL configuration in [Deployment Guide](DEPLOYMENT-GUIDE.md#72-customizing-ssl-validation).

**API calls fail**: Verify the base URL in environment configuration and network connectivity.

For more issues and solutions, see the troubleshooting sections in:
- [Deployment Guide](DEPLOYMENT-GUIDE.md#8-troubleshooting)
- [Keycloak Integration Guide](KEYCLOAK-INTEGRATION-GUIDE.md#8-troubleshooting)

