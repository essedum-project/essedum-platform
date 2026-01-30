# AGENTS.md - SageMaker Job Executor

This file provides instructions for agents working on the Python SageMaker Job Executor.

## Purpose
This component is a Python Flask application responsible for executing machine learning pipelines and tasks on AWS SageMaker. It acts as an adapter between the Essedum platform and AWS services.

## Guidelines for Modification

### Environment Setup
*   **Dependencies**: Maintain `requirements.txt`.
*   **AWS Credentials**: Development requires AWS credentials (access key, secret key) with permissions for SageMaker and S3.

### Code Structure
*   **`app.py`**: The Flask entry point.
*   **`mlops/aws.py`**: The core logic for AWS interactions. Uses `boto3` and `sagemaker` python SDK.
*   **`db.py`**: Handles local SQLite database operations for job tracking.
*   **`utils.py`**: Helper functions and logging setup.

### AWS Integration
*   **Authentication**: Uses `boto3.Session` with credentials passed in the request or environment variables.
*   **SDK Usage**: Uses both `boto3` (for S3, low-level SageMaker calls) and `sagemaker` high-level SDK (for estimators/predictors).

## Testing
*   **Unit Tests**: Create tests for new endpoints.
*   **Integration Tests**: Mock AWS calls using `moto` or `unittest.mock` to avoid real cloud charges during testing.
