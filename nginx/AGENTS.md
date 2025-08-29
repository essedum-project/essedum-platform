# AGENTS.md

This document provides guidance for AI agents working with the Nginx configuration for the Essedum platform.

## Project Overview

Nginx is used as a reverse proxy for the Essedum platform. Its primary responsibilities are:

*   **Serving the Frontend**: Serving the static files for the Angular frontend applications (`aip-app-ui` and `shell-app-ui`).
*   **Routing API Requests**: Routing API requests from the frontend to the appropriate backend services.

This setup decouples the frontend from the backend and simplifies deployment.

## Configuration

*   **Main Configuration**: The main Nginx configuration is in `nginx/nginx.conf`. This file sets up the server and includes the specific configurations for the backend and frontend.
*   **Backend Configuration**: The backend reverse proxy configuration can be found in `sv/nginx_backend.conf`.
*   **Frontend Configuration**: The frontend reverse proxy configuration is in `essedum-ui/nginx_ui.conf`. This file needs to be configured to point to the `dist` folders of the built Angular applications.

## Running Nginx

Nginx is typically run as a service or within a Docker container. In the context of this project, it is included in the Docker Compose setup.

When setting up a manual developer environment, you will need to install Nginx and configure it to use the `nginx.conf` file in this directory. Ensure that the paths in the configuration files are updated to match your local setup.
