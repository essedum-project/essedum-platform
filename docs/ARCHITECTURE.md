# Essedum Platform — Full Architecture

> **Version:** 3.2.x  
> **Last Updated:** 2026-07-13

---

## Table of Contents

1. [Platform Overview — Functional Blocks + Detailed Diagram](#1-platform-overview)
2. [Frontend Architecture — Micro-Frontend Shell](#2-frontend-architecture--micro-frontend-shell)
3. [Backend Microservices Architecture](#3-backend-microservices-architecture)
4. [Authentication & Authorization Flow](#4-authentication--authorization-flow)
5. [AI/ML Infrastructure](#5-aiml-infrastructure)
6. [Python Job Executor Layer](#6-python-job-executor-layer)
7. [Data & Storage Layer](#7-data--storage-layer)
8. [Developer Tooling & Code Build Pipeline](#8-developer-tooling--code-build-pipeline)
9. [Deployment Topology (Docker Compose)](#9-deployment-topology-docker-compose)
10. [Kubernetes / AKS Deployment](#10-kubernetes--aks-deployment)
11. [End-to-End Request Flow](#11-end-to-end-request-flow)
12. [Cross-Service Interaction Flows](#12-cross-service-interaction-flows)
13. [Service Architecture Index](#service-architecture-index)

---

## 1. Platform Overview

### 1.1 Functional Architecture

The platform is organised into eight functional blocks. Understanding these before diving into individual services is the fastest way to grasp the system.

```mermaid
graph TB
    subgraph Clients["Clients"]
        C1["Browser\nAngular MFE Shell"]
        C2["VS Code Extension\nPipeline submit + monitoring"]
        C3["REST / External APIs"]
    end

    subgraph Presentation["Presentation Layer\nAngular 18 · React · Nginx"]
        P1["Pipeline Studio\nBuild & run ML pipelines"]
        P2["Data Ops\nDatasets · Datasources · Models"]
        P3["Agent Studio\nAI agent authoring · LangFuse · LiteLLM views"]
        P4["Vibe Studio\nAI coding interface"]
        P5["Agent Designer UI\nVisual LangGraph canvas (React)"]
        P6["Embedded Tools\nLangflow · LangFuse · LiteLLM (iframes)"]
    end

    subgraph APIGateway["API Gateway & Auth\nSingle entry point"]
        G1["API Gateway\nJWT validation · routing · rate limiting"]
        G2["Keycloak\nOIDC/OAuth2 identity provider"]
    end

    subgraph CoreServices["Core Platform Services\nJava Spring Boot microservices"]
        S1["User & Access Management\nUsers · Roles · Orgs · RBAC"]
        S2["AI/ML Pipeline Engine\nJobs · Pipelines · Model Registry · Events"]
        S3["Data & Storage Service\nFiles · Datasets · Adapters · Search"]
        S4["AI Coding Service\nVibe sessions · Goose AI relay · GitHub sync"]
    end

    subgraph AgentPlatform["Agent & Code Build Platform"]
        A1["Agent Designer Backend\nLangGraph execution · RAG · MCP tools · Memory"]
        A2["Vibe Code Builder\nBuild container image → deploy to K8s (Vibe sessions)"]
        A3["ADK Code Builder\nBuild container image → deploy to K8s (ADK agents)"]
        A4["Vibe Pod Watcher\nMonitor · stream logs · manage K8s pods"]
        A5["Proxy Service\nRoute HTTP & WebSocket to dynamic K8s pods"]
    end

    subgraph LLMInfra["LLM Infrastructure"]
        L1["LiteLLM Proxy\nUnified API to 100+ LLM providers"]
        L2["LangFuse\nLLM tracing · cost · evaluation"]
        L3["Langflow\nVisual agent pipeline builder"]
        L4["Ollama\nLocal open-source LLM runner"]
    end

    subgraph CloudExec["Cloud ML Execution\nPython executor microservices"]
        E1["General Python Executor\nLocal scripts · MinIO storage"]
        E2["AWS SageMaker Executor\nTraining · inference · endpoints"]
        E3["GCP Vertex AI Executor\nTraining · inference · endpoints"]
        E4["Azure ML Executor\nTraining · inference · endpoints"]
    end

    subgraph DataLayer["Data Layer"]
        D1[("MySQL\nRelational state")]
        D2[("Qdrant\nVector embeddings")]
        D3[("MinIO / S3 / Azure Blob\nObject storage")]
        D4[("PostgreSQL\nLangFuse · Langflow · LiteLLM")]
        D5[("ClickHouse + Redis\nAnalytics + cache")]
    end

    Clients --> Presentation
    Presentation --> APIGateway
    APIGateway --> CoreServices
    CoreServices --> AgentPlatform
    CoreServices --> LLMInfra
    CoreServices --> CloudExec
    CoreServices & AgentPlatform & LLMInfra & CloudExec --> DataLayer
```

### Functional Block Descriptions

| Block | What it does |
|---|---|
| **Clients** | Three entry points: browser (Angular MFE shell), VS Code extension (pipeline submit + job monitoring), and direct REST API clients. |
| **Presentation Layer** | Angular 18 micro-frontend shell loading five feature modules. The Agent Designer is a separate React/Vite app. Langflow, LangFuse, and LiteLLM UIs are embedded as iframes. |
| **API Gateway & Auth** | All external traffic enters through a single API Gateway. Keycloak handles OIDC identity; the gateway validates tokens before forwarding to any service. |
| **Core Platform Services** | Four Spring Boot microservices covering the platform's core domains: identity/access, AI/ML pipeline execution, data management, and AI-assisted coding. |
| **Agent & Code Build Platform** | Services that design, build, and operate AI agents and coding sessions: the Agent Designer Backend runs LangGraph flows; the Vibe and ADK Code Builders compile source into container images and deploy them to Kubernetes; the Pod Watcher monitors those pods; the Proxy Service routes HTTP/WebSocket traffic to them. |
| **LLM Infrastructure** | LiteLLM provides a unified API to all LLM providers. LangFuse traces every LLM call. Langflow provides a visual drag-and-drop agent builder. Ollama runs open-source models locally. |
| **Cloud ML Execution** | Four Python executor services — each specialised for a target platform (local, SageMaker, Vertex AI, Azure ML). The Core Pipeline Engine submits jobs to them over HTTP. |
| **Data Layer** | MySQL for relational state, Qdrant for vector search, MinIO/S3/Azure Blob for object storage, PostgreSQL for LLM tooling metadata, ClickHouse + Redis for LangFuse analytics. |

---

### 1.2 Detailed Component Diagram

```mermaid
graph TB
    subgraph Users["👤 Users / Clients"]
        BROWSER["Browser\nAngular Shell UI"]
        VSCODE["VS Code Extension\n· authenticate\n· browse pipelines\n· submit & monitor jobs"]
        EXTAPI["External REST\nClients / APIs"]
    end

    subgraph FrontendLayer["🖥️ Frontend Layer  (Nginx :8084)"]
        NGINX_FE["Nginx Reverse Proxy\n· Shell App + MFE Modules\n· Agent Designer UI (React)\n· Route /api → Backend\n· Route /realms → Keycloak"]
    end

    subgraph BackendLayer["⚙️ Backend Layer"]
        GW["API Gateway :8080\nSpring Cloud Gateway"]
        USM["USM Service :8081\nUser & Security Mgmt"]
        ICIP["ICIP Service :8082\nAI/ML Pipelines"]
        DATA["Data Service :8083\nFiles & Adapters"]
        VIBE["Vibe Service :8084\nAI-Assisted Coding"]
        EUR["Eureka Discovery :8761"]
    end

    subgraph Auth["🔐 Authentication"]
        KC["Keycloak :8180\nOIDC Identity Provider\nRealm: ESSEDUM"]
    end

    subgraph AgentPlatformLayer["🤖 Agent & Code Build Platform"]
        AGENTBE["Agent Designer Backend\nFastAPI + LangGraph\nRAG · MCP tools · Memory"]
        VIBE_CB["Vibe Code Builder\n· Download source from MinIO\n· Build image via BuildKit\n· Deploy to vibe-apps K8s namespace"]
        ADK_CB["ADK Code Builder :5003\n· Build image via BuildKit\n· Deploy to vibe-agents K8s namespace"]
        VPW["Vibe Pod Watcher\n· Monitor vibe-apps / vibe-agents pods\n· Stream logs via Socket.IO\n· Delete deployments"]
        PROXY_SVC["Proxy Service :8000\n· HTTP + WebSocket proxy\n· Routes to K8s pod services\n· DNS-label SSRF protection"]
        BUILDKIT["BuildKit :1234\nOCI image build daemon"]
    end

    subgraph PyJobLayer["🐍 Python Job Executors"]
        PYJOB["py-job-executer :5000\nGeneral Python Jobs"]
        PYSM["py-job-sagemaker :5002\nAWS SageMaker Jobs"]
        PYVERTEX["py-job-vertex :5007\nGCP Vertex AI Jobs"]
        PYAZURE["py-job-azure\nAzure ML Jobs"]
    end

    subgraph AIInfra["🧠 LLM Infrastructure"]
        LITELLM["LiteLLM :4000\nUnified LLM Proxy"]
        LANGFLOW["Langflow\nVisual AI Pipeline Builder"]
        LANGFUSE["LangFuse\nLLM Observability"]
        OLLAMA["Ollama :11434\nLocal LLM Runner"]
    end

    subgraph DataLayer["🗄️ Data Layer"]
        MYSQL[("MySQL :3306\nMain DB")]
        QDRANT[("Qdrant :6333\nVector DB")]
        MINIO[("MinIO :9000\nObject Storage")]
        POSTGRES_LF[("PostgreSQL\nLangFuse / Langflow / LiteLLM")]
        CLICKHOUSE[("ClickHouse\nLangFuse Analytics")]
        REDIS[("Redis\nLangFuse Cache")]
    end

    subgraph CloudAPIs["☁️ External Cloud APIs"]
        AWS_SM["AWS SageMaker"]
        GCP_V["GCP Vertex AI"]
        AZ_ML["Azure ML"]
        GITHUB["GitHub API"]
        GOOSE["Goose AI\nCoding Agent"]
    end

    subgraph K8sPods["☸️ Dynamic Kubernetes Pods"]
        VIBE_PODS["vibe-apps namespace\nVibe coding session pods"]
        AGENT_PODS["vibe-agents namespace\nADK / LangGraph agent pods"]
        MCP_PODS["vibe-mcp namespace\nMCP server pods"]
    end

    BROWSER & VSCODE & EXTAPI --> NGINX_FE

    NGINX_FE -->|"/api/**"| GW
    NGINX_FE -->|"/realms/**"| KC
    VSCODE -->|"REST API (Bearer token)"| GW

    GW -->|"/api/users/** /api/authenticate"| USM
    GW -->|"/api/aip/** /api/event/** /api/modelservice/**"| ICIP
    GW -->|"/api/file/** /api/datasets/** /api/adapters/**"| DATA
    GW -->|"/api/vibe/** /api/goose/** /api/github/**"| VIBE
    GW <-->|register/discover| EUR
    USM & ICIP & DATA & VIBE <-->|register/discover| EUR
    USM & ICIP & DATA & VIBE --> KC
    USM & ICIP & DATA & VIBE --- MYSQL

    ICIP -->|"POST /execute"| PYJOB & PYSM & PYVERTEX & PYAZURE
    PYSM --> AWS_SM
    PYVERTEX --> GCP_V
    PYAZURE --> AZ_ML

    DATA --> MINIO
    ICIP --> MINIO
    ICIP --> QDRANT
    VIBE --> GOOSE & GITHUB

    VIBE_CB --> BUILDKIT --> VIBE_PODS
    ADK_CB --> BUILDKIT --> AGENT_PODS
    VIBE_CB & ADK_CB --> MINIO

    VPW -->|watch · log stream · delete| VIBE_PODS & AGENT_PODS & MCP_PODS
    PROXY_SVC -->|HTTP/WS proxy| VIBE_PODS & AGENT_PODS & MCP_PODS

    AGENTBE --> QDRANT & MINIO

    LITELLM --> OLLAMA
    LITELLM --> AWS_SM & GCP_V & AZ_ML
    LITELLM --> LANGFUSE
    LANGFLOW --- POSTGRES_LF
    LANGFUSE --- POSTGRES_LF & CLICKHOUSE & REDIS
    LITELLM --- POSTGRES_LF
    KC --- MYSQL

    classDef fe       fill:#457b9d,stroke:#1d3557,color:#fff
    classDef be       fill:#2a9d8f,stroke:#264653,color:#fff
    classDef auth     fill:#e76f51,stroke:#c14b2a,color:#fff,font-weight:bold
    classDef agent    fill:#6a4c93,stroke:#4a2c73,color:#fff
    classDef py       fill:#8ecae6,stroke:#457b9d,color:#000
    classDef ai       fill:#a8dadc,stroke:#457b9d,color:#000
    classDef db       fill:#e9c46a,stroke:#f4a261,color:#000
    classDef cloud    fill:#d4e09b,stroke:#7db87a,color:#000
    classDef k8s      fill:#f1faee,stroke:#2a9d8f,color:#000
    classDef user     fill:#e8e8e8,stroke:#888,color:#000

    class NGINX_FE fe
    class GW,USM,ICIP,DATA,VIBE,EUR be
    class KC auth
    class AGENTBE,VIBE_CB,ADK_CB,VPW,PROXY_SVC,BUILDKIT agent
    class PYJOB,PYSM,PYVERTEX,PYAZURE py
    class LITELLM,LANGFLOW,LANGFUSE,OLLAMA ai
    class MYSQL,QDRANT,MINIO,POSTGRES_LF,CLICKHOUSE,REDIS db
    class AWS_SM,GCP_V,AZ_ML,GITHUB,GOOSE cloud
    class VIBE_PODS,AGENT_PODS,MCP_PODS k8s
    class BROWSER,VSCODE,EXTAPI user
```

---

## 2. Frontend Architecture — Micro-Frontend Shell

> Full frontend architecture — MFE composition, Module Federation, OIDC auth, component diagram, and key flows — is documented in **[essedum-ui/docs/ARCHITECTURE.md](../essedum-ui/docs/ARCHITECTURE.md)**.

The frontend is an Angular 18 **Module Federation shell** hosting four independently deployed MFE remotes, one embedded React/Vite application, and three iframed external UIs. Nginx serves all artefacts on port 8084 and proxies API traffic to the backend.

| Application | Technology | Purpose |
|---|---|---|
| Shell (`shell/`) | Angular 18 · Module Federation host | Main layout, routing, OIDC auth, HTTP interceptor |
| Agent Studio MFE | Angular 18 · MFE remote | AI pipelines, agent directory, dataset, LangFuse/LiteLLM integration |
| Data Ops MFE | Angular 18 · MFE remote | Dataset, datasource, model, and schema management |
| Integration Hub MFE | Angular 18 · MFE remote | Pipeline design & execution, job monitoring, adapters |
| Vibe Studio MFE | Angular 18 · MFE remote | Vibe AI coding interface |
| Agent Designer (`agent-designer-frontend/`) | React 18 · Vite | LangGraph visual agent design canvas |
| Langflow / LangFuse / LiteLLM | iframed | Third-party platform UIs embedded within the shell |

---

## 3. Backend Microservices Architecture

> Full backend architecture — service internals, dependency maps, architectural decisions, and sequence diagrams for each service — is documented in **[sv/docs/ARCHITECTURE.md](../sv/docs/ARCHITECTURE.md)**.

The backend is a Java 21 / Spring Boot 3.x microservices system. All external traffic enters through a single API Gateway on port 8080 and is routed to one of four domain services via path prefix.

| Service | Port | Domain | Architecture Doc |
|---|---|---|---|
| API Gateway | 8080 | Routing · JWT validation · Rate limiting | [api-gateway](../sv/api-gateway/docs/ARCHITECTURE.md) |
| USM Service | 8081 | Users · Roles · Organisations | [usm-service](../sv/usm-service/docs/ARCHITECTURE.md) |
| ICIP Service | 8082 | AI/ML Pipelines · Jobs · Models | [icip-service](../sv/icip-service/docs/ARCHITECTURE.md) |
| Data Service | 8083 | Files · Datasets · Adapters · Search | [data-service](../sv/data-service/docs/ARCHITECTURE.md) |
| Vibe Service | 8084 | AI-Assisted Coding · GitHub Sync | [vibe-service](../sv/vibe-service/docs/ARCHITECTURE.md) |
| Eureka | 8761 | Service discovery | — |

---

## 4. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    actor User
    participant Shell as Angular Shell UI
    participant Nginx as Nginx Proxy :8084
    participant KC as Keycloak :8180<br/>(OIDC / PKCE)
    participant GW as API Gateway :8080
    participant USM as USM Service :8081
    participant MySQL as MySQL

    User->>Shell: Open browser
    Shell->>Nginx: GET /api/getConfigDetails
    Nginx->>GW: forward
    GW->>USM: GET /api/getConfigDetails
    USM-->>Shell: issuerUri, clientId, scope, theme…

    Shell->>KC: PKCE Authorization Request<br/>/realms/ESSEDUM/protocol/openid-connect/auth
    KC-->>User: Login page
    User->>KC: Credentials
    KC-->>Shell: Authorization Code
    Shell->>KC: Token Exchange (code + PKCE verifier)
    KC-->>Shell: access_token + refresh_token (JWT)

    Shell->>Nginx: GET /api/userInfo<br/>Authorization: Bearer <JWT>
    Nginx->>GW: forward
    GW->>KC: Validate JWT (JWK Set URI)
    KC-->>GW: Valid ✔
    GW->>USM: GET /api/userInfo
    USM->>MySQL: SELECT user + portfolios + roles
    MySQL-->>USM: user data (AES-GCM encrypted)
    USM-->>Shell: Encrypted user payload

    Shell->>Shell: Decrypt payload (AES-GCM, encDefault key)
    Shell->>Shell: Store project / role / portfolio in sessionStorage

    Note over Shell,USM: All subsequent API calls include<br/>Authorization: Bearer <JWT><br/>validated at Gateway level
```

---

## 5. AI/ML Infrastructure

```mermaid
graph LR
    subgraph LLMProxy["LLM Proxy Layer"]
        LITELLM["LiteLLM :4000\nUnified LLM API\n100+ model providers"]
        LITELLM_PG[("PostgreSQL\nlitellm DB")]
        LITELLM --> LITELLM_PG
    end

    subgraph LocalLLM["Local LLM"]
        OLLAMA["Ollama :11434\nLocal model runner\nLlama · Mistral · etc."]
        OLLAMA_VOL[("Volume\n/root/.ollama\nmodel weights")]
        OLLAMA --- OLLAMA_VOL
    end

    subgraph VisualPipeline["Visual AI Pipeline Builder"]
        LANGFLOW["Langflow\nDrag-and-drop\nAI agent design"]
        LANGFLOW_PG[("PostgreSQL\nlangflow DB")]
        LANGFLOW_VOL[("Volume\nflow definitions")]
        LANGFLOW --- LANGFLOW_PG & LANGFLOW_VOL
    end

    subgraph Observability["LLM Observability"]
        LANGFUSE["LangFuse\nTracing · Scoring\nPrompt Management"]
        LF_PG[("PostgreSQL\nlangfuse DB")]
        LF_CH[("ClickHouse\nanalytics events")]
        LF_REDIS[("Redis\ncaching / queues")]
        LF_MINIO[("MinIO\nevent file storage")]
        LF_WORKER["LangFuse Worker\nasync event processor"]
        LANGFUSE --- LF_PG
        LF_WORKER --- LF_CH & LF_REDIS & LF_MINIO
    end

    subgraph AgentDesign["Agent Designer"]
        AGENTBE["Agent Designer Backend\nFastAPI + LangGraph\nMulti-agent orchestration"]
        AGENTFE["Agent Designer Frontend\nAngular UI"]
        AGENTFE --> AGENTBE
    end

    subgraph CloudLLMs["Cloud LLM Providers"]
        OPENAI["Azure OpenAI"]
        BEDROCK["AWS Bedrock"]
        GCP_LLM["GCP Vertex AI\n(Gemini)"]
        ANTHROPIC["Anthropic Claude"]
    end

    LITELLM --> OLLAMA
    LITELLM --> OPENAI & BEDROCK & GCP_LLM & ANTHROPIC
    LITELLM --> LANGFUSE

    LANGFLOW --> LITELLM
    AGENTBE --> LITELLM & OLLAMA

    classDef proxy   fill:#f4a261,stroke:#e76f51,color:#000
    classDef local   fill:#2a9d8f,stroke:#264653,color:#fff
    classDef visual  fill:#457b9d,stroke:#1d3557,color:#fff
    classDef obs     fill:#a8dadc,stroke:#457b9d,color:#000
    classDef cloud   fill:#d4e09b,stroke:#7db87a,color:#000
    classDef db      fill:#e9c46a,stroke:#f4a261,color:#000
    classDef agent   fill:#8ecae6,stroke:#457b9d,color:#000

    class LITELLM proxy
    class OLLAMA local
    class LANGFLOW visual
    class LANGFUSE,LF_WORKER obs
    class OPENAI,BEDROCK,GCP_LLM,ANTHROPIC cloud
    class LITELLM_PG,LANGFLOW_PG,LANGFLOW_VOL,LF_PG,LF_CH,LF_REDIS,LF_MINIO,OLLAMA_VOL db
    class AGENTBE,AGENTFE agent
```

---

## 6. Python Job Executor Layer

```mermaid
graph TB
    subgraph ICIP["ICIP Service :8082"]
        JOB_SCHED["Job Scheduler\nQuartz-based\nICIPJobsController"]
    end

    subgraph Executors["Python Job Executors"]
        PYJOB["py-job-executer :5000\nGeneral Python jobs\nCustom scripts · ML models\nLocal / MinIO storage"]
        PYSM["py-job-sagemaker :5002\nAWS SageMaker jobs\nTraining · Inference\nSageMaker Pipelines"]
        PYVERTEX["py-job-vertex :5007\nGCP Vertex AI jobs\nTraining · Endpoints\nVertex Pipelines"]
        PYAZURE["py-job-azure\nAzure ML jobs\nAzure ML Pipelines\nAzure Compute Clusters"]
    end

    subgraph CloudML["Cloud ML Platforms"]
        AWS_SM["AWS SageMaker\nManaged Training\nEndpoint Hosting"]
        GCP_V["GCP Vertex AI\nCustom Training\nModel Registry"]
        AZ_ML["Azure Machine Learning\nCompute Clusters\nAzure ML Experiments"]
    end

    subgraph Storage["Object Storage"]
        MINIO["MinIO :9000\nmodel artifacts\ntraining data\njob outputs"]
        S3["AWS S3\nSageMaker input/output"]
        AZBLOB["Azure Blob\nAzure ML input/output"]
        GCS["GCS\nVertex AI input/output"]
    end

    subgraph DB["Database"]
        MYSQL[("MySQL :3306\njob status\njob logs\npipeline state")]
    end

    JOB_SCHED -->|"HTTP trigger\nPOST /execute"| PYJOB & PYSM & PYVERTEX & PYAZURE

    PYJOB --> MINIO & MYSQL
    PYSM --> AWS_SM & S3 & MINIO & MYSQL
    PYVERTEX --> GCP_V & GCS & MINIO & MYSQL
    PYAZURE --> AZ_ML & AZBLOB & MINIO & MYSQL

    classDef icip  fill:#2a9d8f,stroke:#264653,color:#fff
    classDef exec  fill:#457b9d,stroke:#1d3557,color:#fff
    classDef cloud fill:#d4e09b,stroke:#7db87a,color:#000
    classDef store fill:#e9c46a,stroke:#f4a261,color:#000
    classDef db    fill:#f4a261,stroke:#e76f51,color:#000

    class JOB_SCHED icip
    class PYJOB,PYSM,PYVERTEX,PYAZURE exec
    class AWS_SM,GCP_V,AZ_ML cloud
    class MINIO,S3,AZBLOB,GCS store
    class MYSQL db
```

---

## 7. Data & Storage Layer

```mermaid
graph TB
    subgraph Services["Backend Services"]
        ICIP["ICIP Service"]
        DATA["Data Service"]
        USM["USM Service"]
        VIBE["Vibe Service"]
        KC["Keycloak"]
    end

    subgraph RelationalDB["Relational Databases  (MySQL :3306)"]
        DB_USM[("essedum_usm\nusers · roles · perms\norgs · projects")]
        DB_CORE[("essedum_coredb\njobs · pipelines\nevents · models")]
        DB_QUARTZ[("essedum_quartzdb\nqrtz_job_details\nqrtz_triggers…")]
        DB_DATA[("essedum_data\nfiles · datasets\nadapters · search_idx")]
        DB_VIBE[("essedum_vibe\nvibe_sessions\ngoose_configs · recipes")]
        DB_KC[("keycloak DB\nrealms · users\nclient sessions")]
    end

    subgraph VectorDB["Vector Database"]
        QDRANT[("Qdrant :6333\nembeddings\nvector search\ncollections")]
    end

    subgraph ObjectStorage["Object Storage"]
        MINIO_MAIN["MinIO :9000\nMain Object Store\nmodel artifacts\ntraining data\nuploaded files"]
        MINIO_LF["MinIO (LangFuse)\nLLM trace files\nevent exports"]
    end

    subgraph ExternalStorage["External Cloud Storage"]
        S3["AWS S3"]
        AZBLOB["Azure Blob Storage"]
        LOCAL_FS["Local Filesystem\n/app/files"]
    end

    subgraph AnalyticsDB["Analytics & Observability DBs"]
        PG_LF[("PostgreSQL\nLangFuse metadata\nLangflow flows\nLiteLLM config")]
        CH[("ClickHouse\nLangFuse analytics\nLLM call events")]
        REDIS_LF[("Redis\nLangFuse queue cache")]
        PG_LITELLM[("PostgreSQL\nLiteLLM routing config")]
    end

    USM --- DB_USM
    ICIP --- DB_CORE & DB_QUARTZ
    DATA --- DB_DATA
    VIBE --- DB_VIBE
    KC --- DB_KC

    ICIP --> QDRANT
    ICIP --> MINIO_MAIN
    DATA --> MINIO_MAIN & S3 & AZBLOB & LOCAL_FS

    classDef svc  fill:#457b9d,stroke:#1d3557,color:#fff
    classDef rdb  fill:#e9c46a,stroke:#f4a261,color:#000
    classDef vec  fill:#a8dadc,stroke:#457b9d,color:#000
    classDef obj  fill:#2a9d8f,stroke:#264653,color:#fff
    classDef ext  fill:#d4e09b,stroke:#7db87a,color:#000
    classDef ana  fill:#f1faee,stroke:#999,color:#000

    class ICIP,DATA,USM,VIBE,KC svc
    class DB_USM,DB_CORE,DB_QUARTZ,DB_DATA,DB_VIBE,DB_KC rdb
    class QDRANT vec
    class MINIO_MAIN,MINIO_LF obj
    class S3,AZBLOB,LOCAL_FS ext
    class PG_LF,CH,REDIS_LF,PG_LITELLM ana
```

---

## 8. Developer Tooling & Code Build Pipeline

```mermaid
graph LR
    subgraph DevTools["Developer Tools"]
        VSCODE_EXT["VS Code Extension\nvs-extension/\n· Essedum platform integration\n· Job submission\n· Pipeline management"]
        PROXY_SVC["Proxy Service :8000\nproxy-service/\nPython aiohttp\nK8s service HTTP/WS proxy"]
    end

    subgraph CodeBuildPipeline["AI Code Build & Deploy Pipeline"]
        VIBE_SVC["Vibe Service :8084\n/api/vibe/**  /api/goose/**"]
        GOOSE["Goose AI Agent\n:30132\nCode generation"]
        VIBE_CB["Vibe Code Builder\nDeployer\nvibe-code-builder-deployer/"]
        ADK_CB["ADK Code Builder\nDeployer :5003\nadk-code-builder-deployer/"]
        BUILDKIT["BuildKit :1234\nmoby/buildkit\nImage build daemon"]
        VIBE_POD["Vibe Pod Watcher\nvibe-pod-watcher/\nK8s pod lifecycle events"]
    end

    subgraph ContainerRegistry["Container Registries"]
        ECR["AWS ECR"]
        ACR["Azure Container Registry"]
        DOCKERHUB["Docker Hub"]
    end

    subgraph DeployTargets["Deploy Targets"]
        DOCKER_ENV["Docker / Docker Compose\nLocal / dev environment"]
        K8S_AKS["AKS Kubernetes\naks-deployment/\nHelm + YAML manifests"]
    end

    VSCODE_EXT -->|"REST API"| VIBE_SVC
    VIBE_SVC --> GOOSE
    GOOSE -->|"generated code"| VIBE_CB & ADK_CB
    ADK_CB -->|"docker build"| BUILDKIT
    BUILDKIT -->|"push image"| ECR & ACR & DOCKERHUB
    VIBE_CB -->|"push image"| ECR & ACR

    ECR & ACR -->|"pull & deploy"| DOCKER_ENV & K8S_AKS

    VIBE_POD -->|"watch pod events"| K8S_AKS
    PROXY_SVC -->|"route HTTP/WS to pods"| K8S_AKS

    classDef dev    fill:#8ecae6,stroke:#457b9d,color:#000
    classDef build  fill:#f4a261,stroke:#e76f51,color:#000
    classDef reg    fill:#d4e09b,stroke:#7db87a,color:#000
    classDef deploy fill:#2a9d8f,stroke:#264653,color:#fff

    class VSCODE_EXT,PROXY_SVC dev
    class VIBE_SVC,GOOSE,VIBE_CB,ADK_CB,BUILDKIT,VIBE_POD build
    class ECR,ACR,DOCKERHUB reg
    class DOCKER_ENV,K8S_AKS deploy
```

---

## 9. Deployment Topology (Docker Compose)

> Full Docker Compose deployment details — all services, images, ports, volumes, networks, startup order, and access URLs — are documented in **[DOCKERDEPLOYMENT.md](DOCKERDEPLOYMENT.md)**.

```mermaid
graph TB
    subgraph DockerCompose["docker-compose.yml  (docker/)"]

        subgraph CoreStack["Core Application Stack"]
            FE["frontend\nNginx :8084/:8086/:8087/:4000"]
            BE["leap-app-backend-service\nSpring Boot :8082"]
            KC["keycloak\n:8180"]
            PROXY["proxy-service\n:8000"]
        end

        subgraph JobStack["Job Executor Stack"]
            PYJOB["py-job-executor\n:5000"]
            PYSM["py-job-sagemaker\n:5002"]
            PYVERTEX["py-job-vertex\n:5007"]
        end

        subgraph BuildStack["Build & Deploy Stack"]
            BUILDKIT["buildkitd\n:1234\nmoby/buildkit"]
            ADK["adk-code-builder\n:5003"]
        end

        subgraph DataStack["Data Infrastructure"]
            MYSQL["mysql:8.0\n:3306"]
            QDRANT["qdrant/qdrant\n:6333"]
            MINIO_SVC["minio\n:9000 / :9001"]
        end

        subgraph LLMStack["LLM Infrastructure"]
            OLLAMA_SVC["ollama/ollama\n:11434"]
            LITELLM_SVC["litellm\n:4000"]
            LITELLM_PG["litellm-postgres\nPostgreSQL :5432"]
            LANGFLOW_SVC["langflow-stable\n:7860"]
            LANGFLOW_PG["langflow-stable-postgres\nPostgreSQL"]
        end

        subgraph ObsStack["Observability Stack  (LangFuse)"]
            LANGFUSE_WEB["langfuse-web\n:3000"]
            LANGFUSE_WRK["langfuse-worker"]
            LF_PG["langfuse-postgres\nPostgreSQL :5434"]
            LF_CH["clickhouse\n:8123 / :9000"]
            LF_REDIS["redis:7-alpine\n:6379"]
            LF_MINIO["langfuse-minio\n:9100 / :9101"]
        end
    end

    subgraph External["External Access"]
        BROWSER_DC["Browser / Client"]
    end

    BROWSER_DC --> FE

    FE -->|"ESSEDUM_BACKEND_UPSTREAM"| BE
    FE -->|"ESSEDUM_KEYCLOAK_UPSTREAM"| KC

    BE --> MYSQL & QDRANT & MINIO_SVC
    KC --> MYSQL

    PYJOB & PYSM & PYVERTEX --> MYSQL & MINIO_SVC

    ADK --> BUILDKIT

    LITELLM_SVC --> OLLAMA_SVC & LITELLM_PG
    LITELLM_SVC --> LANGFUSE_WEB

    LANGFLOW_SVC --> LANGFLOW_PG

    LANGFUSE_WEB --> LF_PG
    LANGFUSE_WRK --> LF_CH & LF_REDIS & LF_MINIO

    classDef core  fill:#457b9d,stroke:#1d3557,color:#fff
    classDef job   fill:#8ecae6,stroke:#457b9d,color:#000
    classDef build fill:#f4a261,stroke:#e76f51,color:#000
    classDef data  fill:#e9c46a,stroke:#f4a261,color:#000
    classDef llm   fill:#a8dadc,stroke:#457b9d,color:#000
    classDef obs   fill:#d4e09b,stroke:#7db87a,color:#000

    class FE,BE,KC,PROXY core
    class PYJOB,PYSM,PYVERTEX job
    class BUILDKIT,ADK build
    class MYSQL,QDRANT,MINIO_SVC data
    class OLLAMA_SVC,LITELLM_SVC,LITELLM_PG,LANGFLOW_SVC,LANGFLOW_PG llm
    class LANGFUSE_WEB,LANGFUSE_WRK,LF_PG,LF_CH,LF_REDIS,LF_MINIO obs
```

---

## 10. Kubernetes / AKS Deployment

> Full deployment details — namespace topology, ingress routing, HPA config, persistent volumes, secrets, and container registry — are documented in **[K8DEPLOYMENT.md](K8DEPLOYMENT.md)**.
> AKS manifest inventory and startup order: **[AKSDEPLOYMENT.md](AKSDEPLOYMENT.md)**.

The platform runs in a single AKS cluster across 6 namespaces:

| Namespace | Role |
|---|---|
| `aipns` | All platform services — frontend, backend, auth, data, Vibe, Python executor |
| `vibe-apps` | Dynamically spawned Vibe coding session pods |
| `vibe-mcp` | Dynamically spawned MCP server pods |
| `vibe-agents` | Dynamically spawned ADK / LangGraph agent pods |
| `ingress-nginx` | Nginx Ingress Controller |
| `metallb-system` | MetalLB load balancer (bare-metal / on-prem clusters) |

External traffic enters through **ingress-nginx** → reaches the appropriate service by hostname and path. Four HPAs (API Gateway, Frontend, Python Executor, Keycloak) provide automatic horizontal scaling. All workloads pull images from an in-cluster registry at `localhost:5000`.

---

## 11. End-to-End Request Flow

```mermaid
flowchart TD
    U(["👤 User\nBrowser"]) -->|"1. HTTPS request"| NX["Nginx :8084\nReverse Proxy"]

    NX -->|"2a. /api/**"| GW["API Gateway :8080"]
    NX -->|"2b. /realms/**"| KC["Keycloak :8180\nOIDC"]
    NX -->|"2c. static"| SHELL["Angular Shell\nStatic Assets"]

    GW -->|"3. validate JWT\nJWK Set URI"| KC
    KC -->|"4. token valid ✔"| GW

    GW -->|"5. route by path"| ROUTER{Route}

    ROUTER -->|"/api/users/**\n/api/authenticate"| USM["USM Service :8081"]
    ROUTER -->|"/api/aip/**\n/api/event/**"| ICIP["ICIP Service :8082"]
    ROUTER -->|"/api/file/**\n/api/datasets/**"| DATA["Data Service :8083"]
    ROUTER -->|"/api/vibe/**\n/api/goose/**"| VIBE["Vibe Service :8084"]

    USM -->|"6. query"| MYSQL[("MySQL")]
    ICIP -->|"6a. query"| MYSQL
    ICIP -->|"6b. schedule job"| PYJOB["Python Job\nExecutor :5000"]
    PYJOB -->|"7. run on"| CLOUD["SageMaker /\nVertex AI /\nAzure ML"]
    CLOUD -->|"8. artifacts"| MINIO[("MinIO :9000")]
    DATA -->|"6c. read/write"| MINIO
    VIBE -->|"6d. prompt"| GOOSE["Goose AI :30132"]
    GOOSE -->|"7. generated code"| VIBE

    USM & ICIP & DATA & VIBE -->|"9. response"| GW
    GW -->|"10. response"| NX
    NX -->|"11. response"| U

    style ROUTER fill:#f4a261,stroke:#e76f51,color:#000
    style GW fill:#2a9d8f,stroke:#264653,color:#fff
    style KC fill:#e76f51,stroke:#c14b2a,color:#fff
    style MYSQL fill:#e9c46a,stroke:#f4a261,color:#000
    style MINIO fill:#e9c46a,stroke:#f4a261,color:#000
```

---

## 12. Cross-Service Interaction Flows

These flows document how services collaborate to deliver the platform's key capabilities. Each service's internal steps are intentionally abbreviated here — refer to the [Service Architecture Index](#service-architecture-index) for what happens inside each service.

---

### Flow 1 — User Login and First Authenticated API Call

Covers: Browser → Nginx → Keycloak → Gateway → USM

```mermaid
sequenceDiagram
    participant B as Browser
    participant NGX as Nginx
    participant KC as Keycloak
    participant GW as API Gateway
    participant USM as USM Service

    B->>NGX: Navigate to app (unauthenticated)
    NGX->>B: Serve Angular shell (index.html)
    B->>NGX: GET /realms/ESSEDUM/.well-known/openid-configuration
    NGX->>KC: Forward (KC proxy route)
    KC-->>B: OIDC discovery document
    B->>KC: PKCE auth request → login page
    KC-->>B: Redirect with auth code
    B->>KC: Exchange code for tokens
    KC-->>B: access_token + refresh_token
    Note over B: Angular stores token, all subsequent calls carry Bearer header
    B->>NGX: GET /api/usm/users (Bearer token)
    NGX->>GW: Forward
    GW->>KC: Validate token (JWK Set URI — cached)
    KC-->>GW: Token valid + claims
    GW->>USM: Forward + user claims in headers
    USM->>USM: Resolve permissions for user roles
    USM-->>GW: 200 OK [users]
    GW-->>NGX: 200 OK [users]
    NGX-->>B: 200 OK [users]
```

---

### Flow 2 — Pipeline Execution End-to-End

Covers: ICIP → Python Executor → Data Service → MinIO → ICIP (completion)

```mermaid
sequenceDiagram
    participant UI as Browser (UI)
    participant GW as API Gateway
    participant ICIP as ICIP Service
    participant EXEC as Python Executor
    participant DATA as Data Service
    participant MINIO as MinIO

    UI->>GW: POST /api/aip/jobs/run {pipelineId, executionContainerId}
    GW->>ICIP: Forward
    ICIP->>ICIP: Resolve execution container (cloud target + credentials)
    ICIP->>ICIP: Create Job record (QUEUED)
    ICIP-->>UI: 202 Accepted {jobId}
    Note over UI: Subscribes to WebSocket /api/aip/ws/{jobId}
    ICIP->>EXEC: POST /execute {command, bucket, credentials, storage}
    EXEC-->>ICIP: 200 OK {task_id}
    EXEC->>DATA: GET /api/data/files/{inputArtifactId} (download input)
    DATA->>MINIO: Fetch object
    MINIO-->>DATA: Input file bytes
    DATA-->>EXEC: Input file bytes
    EXEC->>EXEC: Run pipeline subprocess
    EXEC->>MINIO: Upload output artifacts
    EXEC->>ICIP: Status poll response: COMPLETED
    ICIP->>DATA: Register output artifact (POST /api/data/files)
    ICIP->>ICIP: Update Job record (COMPLETED)
    ICIP->>UI: WebSocket push: {status: COMPLETED, outputArtifacts}
```

---

### Flow 3 — Agent Design to Kubernetes Deployment

Covers: Agent Designer Backend → Vibe Code Builder Deployer → BuildKit → Kubernetes → Proxy Service + Vibe Pod Watcher

```mermaid
sequenceDiagram
    participant UI as Browser (UI)
    participant ADB as Agent Designer Backend
    participant DATA as Data Service
    participant VCB as Vibe Code Builder Deployer
    participant BK as BuildKit
    participant K8S as Kubernetes API
    participant PROXY as Proxy Service
    participant VPW as Vibe Pod Watcher

    UI->>ADB: POST /api/v1/flows/{id}/run (execute agent flow)
    ADB->>ADB: Compile flow → LangGraph graph
    ADB-->>UI: WebSocket: execution events
    UI->>GW: POST /api/vibe/build-deploy {agentCode, config}
    GW->>VCB: Socket.IO start_pipeline
    VCB->>DATA: GET source archive from MinIO
    DATA->>VCB: Archive bytes
    VCB->>BK: buildctl build (Dockerfile + source)
    BK->>VCB: Build logs (streamed)
    VCB->>UI: pipeline_update events
    BK->>K8S: Push image to in-cluster registry
    VCB->>K8S: Create Deployment + Service + Secret
    K8S-->>VCB: Resources created
    VCB->>UI: pipeline_update {status: done}
    Note over VPW: Detects new pod via K8s watch
    VPW->>UI: Socket.IO pod_ready event
    UI->>PROXY: HTTP /apps/{agent-service}/* (interact with deployed agent)
    PROXY->>K8S: Route to agent-service.aipns.svc.cluster.local
```

---

### Flow 4 — RAG Pipeline (Document Ingestion → Query)

Covers: Data Service → Qdrant → ICIP → LiteLLM → LLM provider

```mermaid
sequenceDiagram
    participant UI as Browser (UI)
    participant GW as API Gateway
    participant DATA as Data Service
    participant QDRANT as Qdrant
    participant ICIP as ICIP Service
    participant LITELLM as LiteLLM
    participant LLM as LLM Provider

    Note over UI,LLM: Part 1 - Document Ingestion
    UI->>GW: POST /api/data/knowledge-bases/{kb}/documents (file upload)
    GW->>DATA: Forward
    DATA->>DATA: Chunk document (background task)
    DATA->>LITELLM: POST /embeddings {chunks}
    LITELLM->>LLM: Embedding request
    LLM-->>LITELLM: Embedding vectors
    LITELLM-->>DATA: Vectors
    DATA->>QDRANT: Upsert vectors (collection=kb_id)
    DATA-->>UI: 202 Accepted

    Note over UI,LLM: Part 2 - RAG Query at Pipeline Execution
    ICIP->>ICIP: Execute RAG node in pipeline
    ICIP->>DATA: POST /api/data/rag/query {kb_id, query, top_k}
    DATA->>LITELLM: POST /embeddings {query_text}
    LITELLM->>LLM: Embedding request
    LLM-->>DATA: Query vector
    DATA->>QDRANT: Search(collection=kb_id, vector, top_k)
    QDRANT-->>DATA: Top-k chunks + scores
    DATA-->>ICIP: {chunks, sources}
    ICIP->>LITELLM: POST /chat/completions {prompt + chunks as context}
    LITELLM->>LLM: Chat completion
    LLM-->>LITELLM: LLM response
    LITELLM-->>ICIP: LLM response
    ICIP-->>UI: Pipeline output with RAG-grounded answer
```

---

### Flow 5 — Vibe AI Coding Session (Code Generation → GitHub Push)

Covers: Vibe Service → Goose AI → Vibe Service → GitHub

```mermaid
sequenceDiagram
    participant UI as Browser / VS Code Ext
    participant GW as API Gateway
    participant VIBE as Vibe Service
    participant GOOSE as Goose AI Engine
    participant GH as GitHub API

    UI->>GW: POST /api/vibe/coding/run {sessionId, prompt}
    GW->>VIBE: Forward
    VIBE->>VIBE: Load session + recipe context
    VIBE->>GOOSE: POST /run {prompt + context} (streaming)
    GOOSE-->>VIBE: Token stream
    VIBE-->>UI: SSE event stream (token by token)
    GOOSE-->>VIBE: [stream complete]
    VIBE->>VIBE: Persist full response to session history
    VIBE-->>UI: SSE done

    Note over UI,GH: User reviews code, clicks Push to GitHub
    UI->>GW: POST /api/vibe/github/push {sessionId, repo, branch}
    GW->>VIBE: Forward
    VIBE->>VIBE: Fetch GitHub OAuth token from Vault
    VIBE->>GH: PUT /repos/{owner}/{repo}/contents/{path} {content, sha?}
    GH-->>VIBE: 201 Created {commitUrl}
    VIBE-->>UI: 200 OK {commitUrl}
```

---

### Flow 6 — LLM Call with Observability (LiteLLM → LangFuse)

Covers: Any service → LiteLLM → LLM provider → LangFuse trace

```mermaid
sequenceDiagram
    participant SVC as Platform Service\n(ICIP / Data / Agent Designer)
    participant LITELLM as LiteLLM Proxy
    participant LLM as LLM Provider\n(OpenAI / Bedrock / Gemini)
    participant LF as LangFuse
    participant CH as ClickHouse

    SVC->>LITELLM: POST /chat/completions {model, messages, ...}
    LITELLM->>LITELLM: Route to configured provider
    LITELLM->>LLM: Provider-specific API call
    LLM-->>LITELLM: Response tokens
    LITELLM-->>SVC: 200 OK {choices}
    LITELLM->>LF: Async trace event {model, tokens, latency, cost}
    LF->>LF: Enrich trace (user, session, tags)
    LF->>CH: Persist trace to ClickHouse (analytics)
    Note over LF: Trace visible in LangFuse UI\n— token count, cost, latency, prompt
```

---

### Flow 7 — Model Training to Endpoint Deployment

Covers: ICIP → SageMaker Executor → AWS SageMaker → ICIP model registry → endpoint

```mermaid
sequenceDiagram
    participant UI as Browser (UI)
    participant GW as API Gateway
    participant ICIP as ICIP Service
    participant PYSM as SageMaker Executor
    participant SM as AWS SageMaker
    participant DATA as Data Service
    participant MINIO as MinIO

    UI->>GW: POST /api/aip/jobs/run {pipelineId, type: training}
    GW->>ICIP: Forward
    ICIP->>PYSM: POST /api/service/v1/pipelines/training/train {dataset, config}
    PYSM->>SM: CreateTrainingJob (SDK)
    SM-->>PYSM: Job ARN
    PYSM-->>ICIP: {job_id}
    loop Poll until terminal
        PYSM->>SM: DescribeTrainingJob
        SM-->>PYSM: Status
        PYSM->>ICIP: Status update
        ICIP->>UI: WebSocket push
    end
    SM->>MINIO: Upload trained model artifact (via S3 adapter)
    ICIP->>PYSM: POST /api/service/v1/models/register {s3_uri, metadata}
    PYSM->>SM: RegisterModel
    SM-->>PYSM: Model ARN
    ICIP->>ICIP: Register model in model registry (DB)
    ICIP->>UI: WebSocket: {status: COMPLETED, modelId}
    Note over UI,SM: User deploys model from UI
    UI->>GW: POST /api/modelservice/endpoints/{id}/deploy {modelId, instanceType}
    GW->>ICIP: Forward
    ICIP->>PYSM: POST /api/service/v1/endpoints/{id}/deploy_model
    PYSM->>SM: CreateEndpoint
    SM-->>PYSM: Endpoint ARN (Creating)
    ICIP-->>UI: 202 Accepted — endpoint deploying
```

---

## Component Port Reference

| Component | Port | Technology | Purpose |
|---|---|---|---|
| Nginx (Frontend) | 8084 | Nginx | Reverse proxy + static serving |
| API Gateway | 8080 | Spring Cloud Gateway | Backend routing + JWT validation |
| Eureka Discovery | 8761 | Spring Cloud Eureka | Service registry |
| USM Service | 8081 | Spring Boot | User & security management |
| ICIP Service | 8082 | Spring Boot | AI/ML pipelines & jobs |
| Data Service | 8083 | Spring Boot | Files & data adapters |
| Vibe Service | 8084 | Spring Boot | AI-assisted coding |
| Keycloak | 8180 | Keycloak 25 | OIDC identity provider |
| Proxy Service | 8000 | Python/aiohttp | K8s service proxy |
| py-job-executer | 5000 | Python/Flask | General Python job executor |
| py-job-sagemaker | 5002 | Python/Flask | AWS SageMaker executor |
| py-job-vertex | 5007 | Python/Flask | GCP Vertex AI executor |
| ADK Code Builder | 5003 | Python | Container image builder |
| BuildKit | 1234 | moby/buildkit | Image build daemon |
| MySQL | 3306 | MySQL 8.0 | Relational data store |
| Qdrant | 6333 | Qdrant | Vector database |
| MinIO (main) | 9000 | MinIO | Object storage |
| MinIO Console | 9001 | MinIO | Object storage UI |
| Ollama | 11434 | Ollama | Local LLM runner |
| LiteLLM | 4000 | LiteLLM | Unified LLM proxy |
| Langflow | 7860 | Langflow | Visual AI pipeline builder |
| LangFuse | 3000 | LangFuse | LLM observability |
| ClickHouse | 8123 | ClickHouse | Analytics events store |
| Redis | 6379 | Redis 7 | Cache / message queue |

---

*Document auto-generated from codebase analysis — 2026-07-13*

---

## Service Architecture Index

Detailed architecture for each service — internal component diagrams, dependency maps, architectural decisions, and significant flows.

### Java Backend

| Service | Architecture Doc |
|---|---|
| Backend Overview | [sv/docs/ARCHITECTURE.md](../sv/docs/ARCHITECTURE.md) |
| API Gateway | [sv/api-gateway/docs/ARCHITECTURE.md](../sv/api-gateway/docs/ARCHITECTURE.md) |
| USM Service | [sv/usm-service/docs/ARCHITECTURE.md](../sv/usm-service/docs/ARCHITECTURE.md) |
| ICIP Service | [sv/icip-service/docs/ARCHITECTURE.md](../sv/icip-service/docs/ARCHITECTURE.md) |
| Data Service | [sv/data-service/docs/ARCHITECTURE.md](../sv/data-service/docs/ARCHITECTURE.md) · [OpenAPI Spec](../sv/data-service/docs/openapi.yaml) |
| Vibe Service | [sv/vibe-service/docs/ARCHITECTURE.md](../sv/vibe-service/docs/ARCHITECTURE.md) |

### AI / Agent Backend

| Service | Architecture Doc |
|---|---|
| Agent Designer Backend | [agent-designer-backend/docs/ARCHITECTURE.md](../agent-designer-backend/docs/ARCHITECTURE.md) |

### Python Job Executors

| Service | Architecture Doc |
|---|---|
| General Python Executor | [py-job-executer/docs/ARCHITECTURE.md](../py-job-executer/docs/ARCHITECTURE.md) |
| SageMaker Executor | [py-job-sagemaker-executer/docs/ARCHITECTURE.md](../py-job-sagemaker-executer/docs/ARCHITECTURE.md) |
| Vertex AI Executor | [py-job-vertex-executer/docs/ARCHITECTURE.md](../py-job-vertex-executer/docs/ARCHITECTURE.md) |
| Azure ML Executor | [py-job-azure-executer/docs/ARCHITECTURE.md](../py-job-azure-executer/docs/ARCHITECTURE.md) |

### Infrastructure & Developer Tools

| Service | Architecture Doc |
|---|---|
| Nginx | [nginx/docs/ARCHITECTURE.md](../nginx/docs/ARCHITECTURE.md) |
| Proxy Service | [proxy-service/docs/ARCHITECTURE.md](../proxy-service/docs/ARCHITECTURE.md) |
| S3Proxy | [s3proxy/docs/ARCHITECTURE.md](../s3proxy/docs/ARCHITECTURE.md) |
| Vibe Pod Watcher | [vibe-pod-watcher/docs/ARCHITECTURE.md](../vibe-pod-watcher/docs/ARCHITECTURE.md) |
| Vibe Code Builder Deployer | [vibe-code-builder-deployer/docs/ARCHITECTURE.md](../vibe-code-builder-deployer/docs/ARCHITECTURE.md) |
| ADK Code Builder Deployer | [adk-code-builder-deployer/docs/ARCHITECTURE.md](../adk-code-builder-deployer/docs/ARCHITECTURE.md) |
| VS Code Extension | [vs-extension/docs/ARCHITECTURE.md](../vs-extension/docs/ARCHITECTURE.md) |
