# Essedum Frontend (essedum-ui)

This directory contains the source code for the Essedum platform's frontend. The frontend is built using Angular and is divided into two main applications: `aip-app-ui` and `shell-app-ui`.

## Overview

The frontend provides the user interface for the Essedum platform, allowing users to interact with its various features. It is designed as a single-page application (SPA) that communicates with the backend services through REST APIs.

### Components

-   **`aip-app-ui`**: This is the main application UI, which contains the core features of the platform, such as pipeline creation, dataset management, and model deployment.
-   **`shell-app-ui`**: This application acts as a shell or a container for the `aip-app-ui`. It provides the main layout, navigation, and authentication handling for the platform.
-   **Langflow Integration**: The frontend includes integration with Langflow, allowing users to access the Agent Designer and playground directly from the Essedum interface.
-   **`nginx_ui.conf`**: This is a sample Nginx configuration file for serving the frontend application. It defines how Nginx should handle requests and route them to the appropriate application.

## Building the Frontend

To build the frontend applications, you need to have Node.js and npm installed.

1.  **Install Dependencies**:
    -   Navigate to both the `aip-app-ui` and `shell-app-ui` directories and run `npm install` to install the required dependencies.

2.  **Build the Applications**:
    -   After installing the dependencies, run `npm run build` in each directory to build the applications. This will generate a `dist` folder in each directory containing the compiled static files.

## Running the Frontend

The frontend is served by an Nginx reverse proxy. To run the frontend, you need to:

1.  Configure your Nginx server to use the `nginx_ui.conf` file.
2.  Update the configuration to point to the `dist` folders of the `aip-app-ui` and `shell-app-ui` applications.
3.  Start the Nginx server.

For more detailed instructions on the overall platform setup, please refer to the main `README.md` file in the root of the repository.
