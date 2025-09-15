# Nginx Configuration for Essedum Platform

This directory contains the Nginx configuration for the Essedum platform. Nginx is used as a reverse proxy to serve the frontend application and route API requests to the backend services.

## Overview

In the Essedum architecture, Nginx plays a crucial role in decoupling the frontend from the backend. It serves the static files of the Angular-based frontend and forwards all API calls to the appropriate backend service. This setup simplifies the deployment and scaling of the platform.

### Key Responsibilities

-   **Serving Frontend Application**: Nginx serves the static HTML, CSS, and JavaScript files of the frontend application.
-   **Reverse Proxy**: It acts as a reverse proxy, forwarding requests from the client to the backend services. This helps in load balancing and securing the backend.
-   **Request Routing**: The `nginx.conf` file contains rules for routing different requests to their respective services. For example, all requests with the `/api` prefix are routed to the backend API server.

## Configuration

The main configuration file is `nginx.conf`. This file defines the server blocks, locations, and proxy settings. When deploying the Essedum platform, this configuration is used to run an Nginx container that serves the frontend and proxies the backend.

For local development, you may need to adjust the `proxy_pass` directive in `nginx.conf` to point to the correct address of your backend service.
