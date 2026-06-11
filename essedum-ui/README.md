# Essedum Frontend (essedum-ui)

This directory contains the source code for the Essedum platform's frontend. The frontend is built with Angular as a micro-frontend (MFE) application: a host app (`shell`) plus four child MFEs under `modules/` (`agent-studio`, `data-ops`, `integration-hub`, and `vibe-studio`).

## Overview

The frontend provides the user interface for the Essedum platform, allowing users to interact with its various features. It is designed as a single-page application (SPA) that communicates with the backend services through REST APIs.

### Components

-   **`shell`**: The host application. It provides the main layout, navigation, and authentication handling, and hosts the child MFEs. It also exposes the shared library the MFEs depend on, so it must be built first.
-   **`modules/`**: The child micro-frontends — `agent-studio`, `data-ops`, `integration-hub`, and `vibe-studio` — each a standalone Angular app contributing a feature area.
-   **Langflow Integration**: The frontend includes integration with Langflow, allowing users to access the Agent Designer and playground directly from the Essedum interface.
-   **`nginx_ui_multi.conf`**: A sample Nginx configuration for serving the shell and all MFEs together (`nginx_shell.conf` serves the shell on its own).

## Building the Frontend

To build the frontend applications, you need to have Node.js and npm installed.

Build the `shell` first (the MFEs reference its shared library), then each module:

```bash
# Host app (build first)
cd shell
npm install --legacy-peer-deps --force
npm run build-prod
cd ..

# Child MFEs
for mfe in agent-studio data-ops integration-hub vibe-studio; do
  (cd "modules/$mfe" && npm install --legacy-peer-deps --force && npm run build-prod)
done
```

Each build generates a `dist/` folder containing the compiled static files.

## Running the Frontend

The frontend is served by an Nginx reverse proxy. To run the frontend, you need to:

1.  Configure your Nginx server to use the `nginx_ui_multi.conf` file.
2.  Update the configuration to point to the `dist` folders of the `shell` and module applications.
3.  Start the Nginx server.

For more detailed instructions on the overall platform setup, please refer to the main `README.md` file in the root of the repository.
