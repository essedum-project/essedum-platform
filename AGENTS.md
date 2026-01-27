# AGENTS.md

This document provides guidance for AI agents working with the Essedum codebase.

## Project Overview

Essedum is a modular, microservices-based framework designed to simplify the development, training, and deployment of AI-powered applications. It enables seamless connectivity between systems via REST APIs, Azure OpenAI, and AWS Bedrock, and supports data ingestion from sources like PostgreSQL, MySQL, S3, and Azure Blob Storage. Users can build and execute training and inference pipelines using Python-based services, manage models across platforms like SageMaker, Azure ML, and GCP Vertex AI, and deploy them as endpoints.

The platform is composed of four main components:

*   **Backend (`sv/`)**: A Java Spring Boot application that forms the core of the Essedum platform. It provides RESTful APIs for the frontend, manages business logic, and handles data persistence.
*   **Frontend (`essedum-ui/`)**: An Angular-based single-page application that provides the user interface for the Essedum platform.
*   **Nginx (`nginx/`)**: Used as a reverse proxy to serve the frontend application and route API requests to the backend services.
*   **Python Job Executors**:
    *   **Standard Executor (`py-job-executer/`)**: Executes general Python-based jobs.
    *   **SageMaker Executor (`py-job-sagemaker-executer/`)**: Specialized executor for AWS SageMaker jobs.
    *   **Vertex AI Executor (`py-job-vertex-executer/`)**: Specialized executor for GCP Vertex AI jobs.
    *   **Azure Executor (`py-job-azure-executer/`)**: Specialized executor for Azure jobs.
*   **VS Code Extension (`vs-extension/`)**: A Visual Studio Code extension for interacting with the Essedum platform.
*   **Langflow Integration**: Integrated UI for designing AI agents.

## Build and Test Commands

### Backend (`sv/`)

To build the backend services, navigate to the `sv/` directory and run:

```bash
mvn clean install
```

To skip tests during the build, you can use:

```bash
mvn clean install -Dmaven.test.skip=true
```

### Frontend (`essedum-ui/`)

The frontend consists of two applications: `aip-app-ui` and `shell-app-ui`. To build them, navigate to their respective directories and run:

```bash
# In essedum-ui/aip-app-ui/
npm install
npm run build

# In essedum-ui/shell-app-ui/
npm install
npm run build
```

### Python Job Executors

To set up any of the job executors (`py-job-executer/`, `py-job-sagemaker-executer/`, `py-job-vertex-executer/`, `py-job-azure-executer/`), navigate to the respective directory and run:

```bash
# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

To run the service:

```bash
python app.py
```

## Code Style Guidelines

*   **Java**: Follow standard Java coding conventions. Use a consistent formatting style, preferably enforced by an IDE or a build tool plugin.
*   **Angular/TypeScript**: Adhere to the official Angular style guide. Use a linter like ESLint to enforce consistent code style.
*   **Python**: Follow the PEP 8 style guide for Python code. Use a linter like Flake8 or a formatter like Black to maintain consistency.

## Testing Instructions

*   **Backend**: Run the tests using the Maven command:
    ```bash
    mvn test
    ```
*   **Frontend**: No specific test commands are provided in the documentation. However, you should run any existing tests and add new ones for new features.
*   **Python Job Executor**: No specific test commands are provided in the documentation. However, you should run any existing tests and add new ones for new features.

## Security Considerations

*   **Secrets Management**: Never hardcode secrets like API keys, passwords, or database credentials in the source code. Use environment variables or a secrets management tool to handle sensitive information. The `docker/.env.sample` file provides a template for the required environment variables.
*   **Dependency Management**: Regularly check for and update outdated dependencies to mitigate security vulnerabilities.
*   **Input Validation**: Always validate and sanitize user input to prevent common security threats like SQL injection and cross-site scripting (XSS).

## Dev Environment Tips

### Docker Compose Setup

For a quick and easy setup, you can use Docker Compose to run the entire platform. Navigate to the `docker/` directory and follow these steps:

1.  Create a `.env` file from the `.env.sample` template:
    ```bash
    cp .env.sample .env
    ```
2.  Customize the environment variables in the `.env` file as needed.
3.  Build and run the services:
    ```bash
    docker-compose up --build
    ```

### Manual Developer Setup

For more control over the development environment, you can set up each component manually. Refer to the "Build and Test Commands" section for instructions on how to build and run each service.

### Nginx Configuration

When running the frontend manually, you will need to configure an Nginx reverse proxy to serve the Angular applications. A sample configuration file is available at `essedum-ui/nginx_ui.conf`. Make sure to update the paths to the `dist` folders of the `aip-app-ui` and `shell-app-ui` applications.
