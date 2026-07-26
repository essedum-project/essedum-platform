# ESSEDUM

Essedum is an enterprise-grade, cloud-native platform for building, training, deploying, and monitoring AI-powered applications. It provides a unified workspace for connecting data sources, designing pipelines, executing ML jobs on cloud platforms, deploying models as endpoints, and building LLM-powered agents.

## Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Platform architecture — functional blocks, component diagrams, cross-service flows |
| [SCOPE.md](docs/SCOPE.md) | Business objectives, functional and non-functional requirements |
| [K8DEPLOYMENT.md](docs/K8DEPLOYMENT.md) | Kubernetes / AKS deployment — namespaces, ingress, HPA, PVs, secrets |
| [AKSDEPLOYMENT.md](docs/AKSDEPLOYMENT.md) | AKS manifest inventory and startup order |
| [DOCKERDEPLOYMENT.md](docs/DOCKERDEPLOYMENT.md) | Docker Compose deployment — all services, ports, volumes, networks |
| [JOB-EXECUTOR-ARCHITECTURE.md](docs/JOB-EXECUTOR-ARCHITECTURE.md) | Python job executor layer — all four executors, selection logic, artifact flow |
| [MICROSERVICES_DECOMPOSITION.md](MICROSERVICES_DECOMPOSITION.md) | Microservices decomposition strategy and service boundaries |
| [USER_GUIDE.md](USER_GUIDE.md) | Step-by-step guide to building AI applications on the platform |
| [CHANGELOG.md](CHANGELOG.md) | Release history and notable changes per version |

---

## Platform Components

| Component | Directory | README | Architecture |
|---|---|---|---|
| Backend (Java) | `sv/` | [sv/README.md](sv/README.md) | [sv/docs/ARCHITECTURE.md](sv/docs/ARCHITECTURE.md) |
| Frontend (Angular MFE) | `essedum-ui/` | [essedum-ui/README.md](essedum-ui/README.md) | [essedum-ui/docs/ARCHITECTURE.md](essedum-ui/docs/ARCHITECTURE.md) |
| Agent Designer Backend | `agent-designer-backend/` | [README.md](agent-designer-backend/README.md) | [docs/ARCHITECTURE.md](agent-designer-backend/docs/ARCHITECTURE.md) |
| Nginx | `nginx/` | [nginx/README.md](nginx/README.md) | [nginx/docs/ARCHITECTURE.md](nginx/docs/ARCHITECTURE.md) |
| Python Job Executor | `py-job-executer/` | [README.md](py-job-executer/README.md) | [docs/ARCHITECTURE.md](py-job-executer/docs/ARCHITECTURE.md) |
| SageMaker Executor | `py-job-sagemaker-executer/` | — | [docs/ARCHITECTURE.md](py-job-sagemaker-executer/docs/ARCHITECTURE.md) |
| Vertex AI Executor | `py-job-vertex-executer/` | — | [docs/ARCHITECTURE.md](py-job-vertex-executer/docs/ARCHITECTURE.md) |
| Azure ML Executor | `py-job-azure-executer/` | [README.md](py-job-azure-executer/README.md) | [docs/ARCHITECTURE.md](py-job-azure-executer/docs/ARCHITECTURE.md) |
| Proxy Service | `proxy-service/` | — | [docs/ARCHITECTURE.md](proxy-service/docs/ARCHITECTURE.md) |
| Vibe Code Builder | `vibe-code-builder-deployer/` | — | [docs/ARCHITECTURE.md](vibe-code-builder-deployer/docs/ARCHITECTURE.md) |
| ADK Code Builder | `adk-code-builder-deployer/` | — | [docs/ARCHITECTURE.md](adk-code-builder-deployer/docs/ARCHITECTURE.md) |
| Vibe Pod Watcher | `vibe-pod-watcher/` | — | [docs/ARCHITECTURE.md](vibe-pod-watcher/docs/ARCHITECTURE.md) |
| S3Proxy | `s3proxy/` | — | [docs/ARCHITECTURE.md](s3proxy/docs/ARCHITECTURE.md) |
| VS Code Extension | `vs-extension/` | [README.md](vs-extension/README.md) | [docs/ARCHITECTURE.md](vs-extension/docs/ARCHITECTURE.md) |

---

## Getting Started

### Docker Compose (recommended for local deployment)

```bash
cd docker
cp .env.sample .env   # configure credentials
docker compose up --build
```

See [docker/README.md](docker/README.md) and [docker/SETUP_GUIDE.md](docker/SETUP_GUIDE.md) for full setup instructions.

### Kubernetes (AKS)

```bash
cd aks-deployment
./deploy.sh
```

See [aks-deployment/README.md](aks-deployment/README.md) and [docs/AKSDEPLOYMENT.md](docs/AKSDEPLOYMENT.md).

### Developer Setup (manual)

See the component READMEs and docs linked in the table above.

---

## License

MIT License — see [LICENSE](LICENSE).

## Changelog

## 4. Installation

There are two ways to install and run the Essedum platform: a manual developer setup or a containerized setup using Docker.

### 4.1. Developer Setup

This setup is ideal for developers who want to work on the source code and contribute to the platform.

#### Prerequisites

- **Backend**:
  - JDK 21 or higher
  - Maven 3.9.6 or higher
  - MySQL Server 8.3 or higher
- **Frontend**:
  - Node.js and npm
- **Python Job Executor**:
  - Python 3.12 or higher

  **Command to Install prerequisites**

  ```bash
  chmod +x setup_prerequisites.sh
  ./setup_prerequisites.sh
  ```

#### Step-by-Step Guide

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd essedum-platform
   ```


2. **Backend Setup**:
   - Navigate to the `sv/` directory.
   - Configure your MySQL database credentials in `common-app/src/main/resources/application.yml`.
   - Build the backend services:
     ```bash
     cd sv
     mvn clean install -Dmaven.test.skip=true -Dlicense.skip=true
     ```
   - Run the main application from your IDE or using the generated JAR file.

3. **Frontend Setup**:
   - The frontend is a micro-frontend (MFE) application: a host app (`shell`) plus four child MFEs under `essedum-ui/modules/` (`agent-studio`, `data-ops`, `integration-hub`, `vibe-studio`). Build the `shell` first, since the MFEs reference its shared library.
   - From the `essedum-ui/` directory, install dependencies and build each application:
     ```bash
     # Host app (build first)
     cd shell
     npm install --legacy-peer-deps --force
     npm run build-prod
     cd ..

     # Child MFEs
     for mfe in agent-studio data-ops integration-hub vibe-studio; do
       (cd "modules/$mfe" && npm install --legacy-peer-deps --force && npm run build-prod)
     done
     ```
   - Each build outputs a `dist/` folder that Nginx serves (see `essedum-ui/nginx_ui_multi.conf`).

4. **Nginx Setup**:
   - Configure the `nginx/nginx.conf` file to point to the `dist` folders of the frontend applications.
   - Start the Nginx server.

5. **Python Job Executor Setup**:
   - Navigate to the `py-job-executer/` directory.
   - Install the required Python packages:
     ```bash
     pip install -r requirements.txt
     ```
   - Start the executor service:
     ```bash
     python app.py
     ```

### 4.2. Visual Studio Extension Setup

To install the VS Code extension, verify the requirements in `vs-extension/README.md` and install via the VS Code Marketplace or build from source using the instructions in the directory.

### 4.3. Containerized Setup

This section describes two ways to deploy the Essedum platform in a containerized environment: using Docker Compose for a simple, local setup, or using Kubernetes for a more robust, scalable deployment.

#### 4.3.1. Docker Compose Setup

This setup is recommended for users who want to quickly deploy and run the Essedum platform on a local machine.

##### Prerequisites

- Docker
- Docker Compose

##### Deployment Steps

1.  **Configure your environment**:
    *   Navigate to the `docker` directory.
    *   Create a copy of the `.env.sample` file and name it `.env`.
        ```bash
        cp .env.sample .env
        ```
    *   Open the `.env` file and customize the variables. The most important variables are:

| Variable                | Description                                          | Default                                                                                |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `BACKEND_PORT`          | External port for the backend service                | `8082`                                                                                 |
| `FRONTEND_PORT`         | External port for the frontend service               | `8084`                                                                                 |
| `PYJOB_EXECUTOR_PORT`   | External port for the Python Job Executor            | `5000`                                                                                 |
| `MYSQL_PORT`            | External port for the MySQL database                 | `3306`                                                                                 |
| `QDRANT_PORT`           | External port for the Qdrant vector database         | `6333`                                                                                 |
| `KEYCLOAK_PORT`         | External port for the Keycloak identity and access management | `8180`                                                                                 |
| `MYSQL_ROOT_PASSWORD`   | Root password for the MySQL database                 | `password`                                                                             |
| `KEYCLOAK_ADMIN_USER`   | Admin username for Keycloak                          | `admin`                                                                                |
| `KEYCLOAK_ADMIN_PASSWORD` | Admin password for Keycloak                          | `admin`                                                                                |
| `ENCRYPTION_KEY`        | Encryption key for the backend service               | `leap$123##`                                                                           |
| `ENCRYPTION_SALT`       | Encryption salt for the backend service              | `NB9+lv0guQXYrZYbTmcS20Vd5FxW1h75b8CaI8r+nnPvYrIIHfYu05JVQf9qtJNCS0Vznh692VhUW9HeCPd2IA==` |
| `LICENSE`               | License key for the backend service                  | `sOJDitKH4axL5syVqJDVXv4pmu3HZc4uzAwulC6cwf8mpNm9nWVvQA==`                               |
| `PUBLIC_KEY`            | Public key for the backend service                   | `3bQAP+ugsTVGLWdZ`                                                                     |

**Note**: The `ENCRYPTION_KEY`, `ENCRYPTION_SALT`, `LICENSE`, and `PUBLIC_KEY` variables are crucial for the backend service's security. It is highly recommended to change these default values for production deployments.

2.  **Build and run the services**:
    *   From the `docker` directory, run the following command to build and start the services in detached mode:
        ```bash
        docker-compose up -d --build
        ```
    *   This command will build the Docker images for all the services and start them in the correct order. The `mysql-init` directory is used to initialize the database with the required schema and data.

3.  **Accessing the application**:
    *   Once all the services are running, you can access the platform at the following URLs:
        *   **Frontend**: `http://localhost:8084`
        *   **Backend API**: `http://localhost:8082`
        *   **Keycloak Admin Console**: `http://localhost:8180`

4.  **Stopping the application**:
    *   To stop the services, run the following command from the `docker` directory:
        ```bash
        docker-compose down
        ```

#### 4.3.2. Kubernetes Setup

This setup is ideal for deploying the Essedum platform to a production-like environment.

##### Prerequisites

- Docker
- Kubernetes (e.g., Docker Desktop, Minikube, or a cloud-based provider like AKS)

##### Deployment Steps

1. **Build Docker Images**:
   - For each component (backend, frontend, py-job-executor), build the Docker image using the provided `Dockerfile`.
   - **Backend**:
     ```bash
     docker build -t essedum_app_backend:latest ./sv
     ```
   - **Frontend**:
     ```bash
     docker build -t essedum_app_ui:latest ./essedum-ui
     ```
   - **Python Job Executor**:
     ```bash
     docker build -t essedum_py_job_executor:latest ./py-job-executer
     ```

2. **Push Images to a Registry**:
   - Tag and push the images to a container registry (e.g., Docker Hub, Azure Container Registry).
     ```bash
     docker tag essedum_app_backend:latest <your-registry>/essedum_app_backend:latest
     docker push <your-registry>/essedum_app_backend:latest
     ```

3. **Deploy to Kubernetes**:
   - The `aks-deployment/` directory contains sample Kubernetes manifests for deploying the Essedum platform.
   - Update the manifests to use your container registry and image tags.
   - Apply the manifests to your Kubernetes cluster:
     ```bash
     kubectl apply -f aks-deployment/
     ```

## 5. Usage

Once the platform is up and running, you can access the frontend in your browser. The application allows you to:

- **Manage Connections**: Configure connections to data sources and execution environments.
- **Handle Datasets**: Create, upload, and manage datasets for your ML pipelines.
- **Build Pipelines**: Design and execute ML pipelines for training, inference, and deployment.
- **Interact with Apps**: Use Streamlit and Gradio applications to interact with your deployed models.

## 6. Getting Started


For a step-by-step guide on how to use the Essedum platform to create AI applications, please see our [User Guide](USER_GUIDE.md).

## 7. Change Log

See the [CHANGELOG.md](CHANGELOG.md) file for details.

## 8. License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
