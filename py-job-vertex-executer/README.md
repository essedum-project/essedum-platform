# py-job-executer
#to deploy on rancher
Image - infyartifactory.ad.infosys.com:443/docker-remote/python:3.11-buster
Port -5000
Commands to start 

echo "Start up script"
echo "-------------------------------"
cd /
git clone https://sarbajeet-pattanaik_infosys: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@github.com/Infosys-icets-leap/py-job-executer
pip install boto3 minio --index-url https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
cd /py-job-executer/
echo "requirements -------"
pip install -r requirements.txt --index-url https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
echo "Flask app----------"
cd /py-job-executer/
python app.py

create a persitent volume for  app.db
mount point - /data

Steps to follow for the setup of py-job executor on  windows machine
# GCP Vertex AI Job Executor

This component is responsible for executing machine learning pipelines on Google Cloud Platform (GCP) Vertex AI. It listens for job requests from the Essedum backend and orchestrates the execution on Vertex AI.

## Setup Instructions

Steps to follow for the setup of the Vertex AI executor:

. Have python installed on the system , set the path of exe in environment variables
. Create a virtuan env , activate the virtual env ,Install the req.txt with the extention of artifatory link(-i   https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi- remote/simple --trusted-host infyartifactory.ad.infosys.com)
. Once the installation is done , please run the app.py => which will start the service on mentioned ip
. To expose the ip , Go to the firewall advance settings>Inbound rule>add new rule> And expose a tcp connection for that sepcific port or all ports if  required ,follow the default settings of it , then give a name to that rule
. You will now be able to access that service outside the vm 
. To add it in service manager , you need to install nssm application , once done add the path in environment variables ,run it as admin =>which will open a cmd prompt => then run .\nssm.exe install =>nssm prompt opens up => which will allow you to add the bat file (bat file takes care of starting the service , whenever it has to restart on it's own),also create a txt file and add it's path in I/o tab of nssm @ both the fields (in and out), now you can check at services window ,The py-job executor is in runnning status (if not start it ,using right click) 
1.  **Prerequisites**:
    -   Python 3.12 or higher installed.
    -   Google Cloud SDK installed and authenticated.
    -   Appropriate IAM permissions for Vertex AI and Cloud Storage.

2.  **Installation**:
    -   Create a virtual environment:
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows: venv\Scripts\activate
        ```
    -   Install dependencies:
        ```bash
        pip install -r requirements.txt
        ```

3.  **Running the Service**:
    -   Run the application:
        ```bash
        python app.py
        ```
    -   The service will start on the configured port. Ensure the port is accessible if the backend is running on a different machine.

4.  **Service Management**:
    -   On Windows, you can use NSSM to run this as a service.
    -   On Linux, consider creating a Systemd service file.

## Design and Architecture

The Vertex AI Job Executor connects Essedum with Google Cloud Platform.

### Architecture Overview

1.  **Flask API**: Exposes REST endpoints compatible with the Essedum backend.
2.  **Job Queue**: Internal `Queue.py` manages asynchronous task execution.
3.  **Local Persistence**: SQLite (`db.py`) stores job metadata and status.
4.  **MLOps Adapter (`mlops/vertex.py`)**:
    *   **GCS Integration**: Uploads/Downloads datasets.
    *   **Vertex AI Training**: Submits custom training jobs and AutoML pipelines via REST API.
    *   **Vertex AI Prediction**: Deploys models to endpoints and handles batch/online prediction.

### GCP Interaction Flow

```mermaid
sequenceDiagram
    participant Backend
    participant Executor as VertexExecutor
    participant GCP as GCP Vertex AI

    Backend->>Executor: POST /api/service/v1/pipelines/training
    Executor->>Executor: Generate Auth Token
    Executor->>GCP: POST /v1/.../trainingPipelines
    GCP-->>Executor: Pipeline Resource
    Executor-->>Backend: 200 OK (Resource Name)

    Backend->>Executor: GET /status/{id}
    Executor->>GCP: GET /v1/.../trainingPipelines/{id}
    GCP-->>Executor: Status
    Executor-->>Backend: Status JSON
```
