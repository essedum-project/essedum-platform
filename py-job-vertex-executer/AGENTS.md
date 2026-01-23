# AGENTS.md - Vertex AI Job Executor

This file provides instructions for agents working on the Python Vertex AI Job Executor.

## Purpose
This component is a Python Flask application responsible for executing machine learning pipelines and tasks on Google Cloud Vertex AI.

## Guidelines for Modification

### Environment Setup
*   **Dependencies**: Maintain `requirements.txt`.
*   **GCP Credentials**: Requires a Service Account key (JSON) with permissions for Vertex AI (AI Platform) and Cloud Storage.

### Code Structure
*   **`app.py`**: The Flask entry point.
*   **`mlops/vertex.py`**: The core logic for GCP interactions. It primarily uses `requests` to call the Vertex AI REST API directly, but also uses `google.cloud.aiplatform` and `google.cloud.storage`.
*   **`db.py`**: Handles local SQLite database operations for job tracking.

### GCP Integration
*   **Authentication**: Uses `google.oauth2.service_account` to generate bearer tokens from service account keys.
*   **API Usage**: The implementation heavily relies on direct HTTP calls to `https://{region}-aiplatform.googleapis.com`. Future improvements could leverage the official Python Client Library more extensively.

## Testing
*   **Unit Tests**: Create tests for new endpoints.
*   **Integration Tests**: require valid GCP Service Account credentials.
