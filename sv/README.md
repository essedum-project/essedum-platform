# Essedum Backend (sv)

This directory contains the source code for the Essedum platform's backend services. The backend is built using Java and the Spring Boot framework, providing a robust, scalable, and modular architecture for the platform's core functionalities.

## Overview

The backend is designed as a multi-module Maven project. This structure helps in organizing the codebase into logical components, making it easier to maintain and develop. Each module corresponds to a specific functionality or a shared library within the platform.

### Key Responsibilities

The backend services are responsible for:
-   **API Endpoints**: Providing RESTful APIs for the frontend to interact with.
-   **Business Logic**: Implementing the core business logic of the Essedum platform.
-   **Data Persistence**: Managing data storage and retrieval from the database (e.g., MySQL, PostgreSQL).
-   **Integration**: Connecting with external systems like Azure OpenAI, AWS Bedrock, and various data sources.
-   **Job Orchestration**: Managing and orchestrating the execution of jobs in the `py-job-executer`.

## Modules

The `sv` directory is organized into several modules, including:
-   `common-app`: The main application module that bootstraps the Spring Boot application.
-   `comm-lib-*`: Shared libraries for common functionalities like secrets management and utilities.
-   `icip-lib-*`: Libraries related to the core ICIP (Essedum Cognitive Insight Platform) functionalities.
-   `icip-adp-*`: Adapter modules for connecting to different data sources and services.

## Building the Backend

To build the backend services, you can use Maven. From the `sv` directory, run the following command:

```bash
mvn clean install
```

This will compile the code, run tests (if any), and package the application into JAR files. For more detailed setup instructions, please refer to the main `README.md` file in the root of the repository.
