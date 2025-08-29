# AGENTS.md

This document provides guidance for AI agents working with the Essedum frontend codebase.

## Project Overview

The frontend is an Angular-based single-page application that provides the user interface for the Essedum platform. It is divided into two main applications:

*   **`aip-app-ui`**: This is the main application UI, which contains the core features of the platform.
*   **`shell-app-ui`**: This application acts as a shell or a container for the `aip-app-ui`, providing the main layout, navigation, and authentication handling.

The frontend communicates with the backend services through REST APIs.

## Build Commands

To build the frontend applications, you need to install the dependencies and then build each application separately.

1.  **Install Dependencies**:
    Navigate to both the `aip-app-ui` and `shell-app-ui` directories and run:
    ```bash
    npm install
    ```

2.  **Build the Applications**:
    After installing the dependencies, run the build command in each directory:
    ```bash
    npm run build
    ```
    This will generate a `dist` folder in each directory containing the compiled static files.

## Code Style Guidelines

*   **Angular/TypeScript**: Adhere to the official Angular style guide. Use a linter like ESLint to enforce consistent code style.

## Dev Environment Tips

*   **Prerequisites**:
    *   Node.js and npm
*   **Running the Frontend**: The frontend is served by an Nginx reverse proxy. You need to configure your Nginx server to point to the `dist` folders of the `aip-app-ui` and `shell-app-ui` applications. A sample configuration file is available at `essedum-ui/nginx_ui.conf`.
