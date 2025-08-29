# AGENTS.md

This document provides guidance for AI agents working with the Python Job Executor codebase.

## Project Overview

The Python Job Executor is a service responsible for executing jobs written in Python. It runs as a separate service, listening for job requests from the backend and executing them in a controlled environment. This service is essential for running data processing, machine learning, and other Python-based tasks within the Essedum ecosystem.

## Setup and Execution

1.  **Create a Virtual Environment**:
    It is recommended to use a virtual environment to manage dependencies. From this directory, run:
    ```bash
    python -m venv venv
    ```

2.  **Activate the Virtual Environment**:
    *   **On Windows**: `.\venv\Scripts\activate`
    *   **On macOS and Linux**: `source venv/bin/activate`

3.  **Install Dependencies**:
    With the virtual environment activated, install the required packages:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Running the Service**:
    To start the service, run the main application file:
    ```bash
    python app.py
    ```

## Code Style Guidelines

*   **Python**: Follow the PEP 8 style guide for Python code. Use a linter like Flake8 or a formatter like Black to maintain consistency.

## Dev Environment Tips

*   **Prerequisites**:
    *   Python 3.12 or higher
*   **Virtual Environments**: Always use a virtual environment to isolate project dependencies and avoid conflicts with other projects.
*   **Running as a Service**: For production environments, consider running the executor as a background service using a tool like `NSSM` (on Windows) or `systemd` (on Linux).
