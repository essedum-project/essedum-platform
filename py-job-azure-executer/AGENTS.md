# AGENTS.md - Azure Job Executor

This file provides instructions for agents working on the Python Azure Job Executor.

## Purpose
This component is a Python Flask application responsible for executing machine learning pipelines and tasks on Microsoft Azure. It acts as an adapter between the Essedum platform and Azure Machine Learning services.

## Guidelines for Modification

### Environment Setup
*   **Dependencies**: Maintain `requirements.txt`. If you add a library, ensure it's pinned.
*   **Virtual Environment**: Always use a venv when developing locally.

### Code Structure
*   **`app.py`**: The Flask entry point. Defines API routes (`/execute`, `/api/service/v1/...`).
*   **`mlops/azure.py`**: The core logic for Azure interactions. Use the Azure SDK for Python (`azure-ai-ml`, `azureml-core`) here.
*   **`db.py`**: Handles local SQLite database operations for job tracking.
*   **`utils.py`**: Helper functions and logging setup.

### Azure Integration
*   **Authentication**: Uses Service Principal authentication. Credentials are passed via connection objects or environment variables.
*   **SDK Usage**: Prefer the newer `azure-ai-ml` SDK over `azureml-core` where possible, as the latter is legacy (though both are currently used).

## Testing
*   **Unit Tests**: Create tests for new endpoints.
*   **Integration Tests**: require valid Azure credentials. Mocking `boto3` (AWS) or `azure.ai.ml` calls is recommended for CI.
