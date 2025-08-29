# AGENTS.md

This document provides guidance for AI agents working with the Essedum backend codebase.

## Project Overview

The backend is a Java Spring Boot application that forms the core of the Essedum platform. It provides RESTful APIs for the frontend, manages business logic, and handles data persistence. It is a multi-module Maven project located in the `sv/` directory.

Key responsibilities include:
-   **API Endpoints**: Providing RESTful APIs for the frontend.
-   **Business Logic**: Implementing the core business logic.
-   **Data Persistence**: Managing data storage and retrieval.
-   **Integration**: Connecting with external systems.
-   **Job Orchestration**: Managing the execution of jobs in the `py-job-executer`.

## Build and Test Commands

To build the backend services, you can use Maven. From this `sv/` directory, run:

```bash
mvn clean install
```

To run the tests, use the following command:

```bash
mvn test
```

You can skip tests during the build with:

```bash
mvn clean install -Dmaven.test.skip=true
```

## Code Style Guidelines

*   **Java**: Follow standard Java coding conventions. Use a consistent formatting style, preferably enforced by an IDE or a build tool plugin.

## Dev Environment Tips

*   **Prerequisites**:
    *   JDK 21 or higher
    *   Maven 3.9.6 or higher
    *   MySQL Server 8.3 or higher
*   **Configuration**: Configure your MySQL database credentials in `common-app/src/main/resources/application.yml`.
*   **Running**: Run the main application from your IDE or by executing the generated JAR file.
