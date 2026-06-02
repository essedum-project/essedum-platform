# ESSEDUM Platform - Complete Interview Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Main Task & Business Objective](#main-task--business-objective)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Module Breakdown](#module-breakdown)
6. [Key Concepts](#key-concepts)
7. [Important Interview Topics](#important-interview-topics)
8. [Current State vs Future State](#current-state-vs-future-state)

---

## Project Overview

**Project Name:** ESSEDUM Platform
**Full Form:** Essedum Cognitive Insight Platform  
**Type:** Enterprise-grade AI/ML Data Platform  
**Architecture:** Multi-module Maven project (Java 21 + Spring Boot 3.3.5)  
**Organization:** LFN AI  
**Status:** Currently monolithic, planning microservices migration  
**Version:** 3.3-SNAPSHOT  

### What is ESSEDUM?
ESSEDUM is a comprehensive platform that enables organizations to:
- Execute complex AI/ML pipelines and jobs
- Manage multiple data sources (S3, MySQL, PostgreSQL, Azure, GCP, AWS)
- Control user access, roles, and permissions
- Store and retrieve files from various cloud/local repositories
- Integrate with AI services (Azure OpenAI, AWS Bedrock, Google Vertex AI)
- Assist developers with AI-powered code generation (Vibe/Goose)

---

## Main Task & Business Objective

### **Primary Goal:**
Transform raw data into actionable insights by providing a **unified platform** that seamlessly integrates data sources, executes ML algorithms, and provides secure multi-tenant access control.

### **What the Application Helps Achieve:**

#### 1. **Data Democratization**
- Non-technical users can connect to multiple data sources without coding
- Provides REST, S3, MySQL, PostgreSQL, Azure, GCP, AWS adapters out-of-the-box
- Pre-built connectors reduce time-to-value for data projects

#### 2. **AI/ML Pipeline Orchestration**
- Job execution engine with Quartz scheduler (for distributed job scheduling)
- Real-time event streaming via WebSocket (Server-Sent Events / SSE)
- Pipeline definition and management system
- MLOps features for model deployment tracking
- Support for federated machine learning

#### 3. **Enterprise Security & Multi-Tenancy**
- Role-Based Access Control (RBAC) with granular permissions
- JWT-based authentication
- Organizational hierarchy (Organization → OrgUnit → Project)
- User delegation and approval workflows
- API permission management for third-party integrations

#### 4. **File & Asset Management**
- Multi-backend storage support (Local, MinIO, S3, Azure Blob)
- File upload/download with metadata tracking
- Dataset management and versioning
- Search functionality (Lucene-based)
- Integration with data adapters for seamless data ingestion

#### 5. **AI-Assisted Development**
- Vibe: AI-powered coding assistant integrated with Goose API
- GitHub integration for automated code pushes
- Session-based code generation with history tracking
- Multi-recipe support for different coding scenarios

#### 6. **Scalability & Performance**
- Designed for horizontal scaling
- Connection pooling optimization (reducing from 624 to 85 connections)
- Event-driven architecture for asynchronous processing
- Streaming support for real-time data processing

---

## Architecture

### **Current Monolithic Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                  ESSEDUM Monolithic Application             │
│                    (common-app: Spring Boot)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User & Auth │ AI/ML Jobs │ File Storage │ Vibe │ Adapters │
│   (USM)      │  (ICIP)    │  (FSVR)      │      │           │
│              │            │              │      │           │
│  • Auth      │ • Jobs     │ • Upload     │Goose │ • S3      │
│  • Roles     │ • Pipeline │ • Download   │APIs  │ • MySQL   │
│  • Perms     │ • Events   │ • Datasets   │GitHub│ • Azure   │
│  • Users     │ • Models   │ • Search     │Sync  │ • GCP     │
│  • Orgs      │ • MLOps    │              │      │ • REST    │
│              │ • Streams  │              │      │           │
│              │ • Quartz   │              │      │           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Multiple Databases (624 connections) │
        ├───────────────────────────────────────┤
        │ • Main DB (100 conn)                   │
        │ • ICIP DB (300 conn)                   │
        │ • SJS DB (200 conn)                    │
        │ • Model DB (8 conn)                    │
        │ • Quartz DB (8 conn)                   │
        │ • Experiment DB (8 conn)               │
        └───────────────────────────────────────┘
```

### **Proposed Microservices Architecture (Future)**

```
                    ┌──────────────────┐
                    │  API Gateway      │
                    │ (Spring Cloud     │
                    │  Gateway)         │
                    └─────────┬─────────┘
                              │
          ┌───────────────────┼───────────────────┬──────────────┐
          ▼                   ▼                   ▼              ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
    │ USM Service  │   │ ICIP Service │   │ Data Service │  │ Vibe Service │
    │ (port 8081)  │   │ (port 8082)  │   │ (port 8083)  │  │ (port 8084)  │
    ├──────────────┤   ├──────────────┤   ├──────────────┤  ├──────────────┤
    │              │   │              │   │              │  │              │
    │ • Auth       │   │ • Jobs       │   │ • Files      │  │ • Sessions   │
    │ • Roles      │   │ • Pipelines  │   │ • Datasets   │  │ • Goose API  │
    │ • Users      │   │ • Events     │   │ • Adapters   │  │ • GitHub     │
    │ • Orgs       │   │ • Models     │   │ • Search     │  │ • Code Gen   │
    │ • Perms      │   │ • MLOps      │   │              │  │              │
    │ • Delegates  │   │ • Streams    │   │              │  │              │
    │              │   │              │   │              │  │              │
    └────────┬─────┘   └────────┬─────┘   └────────┬────┘  └──────────┬───┘
             │                  │                  │                   │
             ▼                  ▼                  ▼                   ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
    │ essedum_usm  │   │essedum_core  │   │essedum_data  │  │essedum_vibe  │
    │   (MySQL)    │   │  (MySQL)     │   │  (MySQL)     │  │  (MySQL)     │
    │              │   │  + Quartz DB │   │              │  │              │
    └──────────────┘   └──────────────┘   └──────────────┘  └──────────────┘

Total Connections: 85 (vs 624 in monolith) = 86% reduction!
```

---

## Technology Stack

### **Core Framework & Languages**
| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Java | 21 |
| Framework | Spring Boot | 3.3.5 |
| Spring Cloud | Spring Cloud | 2022.0.5 |
| Build Tool | Maven | 3.x+ |
| Web Server | Tomcat (embedded) | 10.1.54 |

### **Databases & Data Access**
| Component | Technology | Version |
|-----------|-----------|---------|
| Primary DB | MySQL | 8.4.0 |
| Alternative DB | PostgreSQL | 42.7.11 |
| ORM/JPA | Spring Data JPA | 3.3.5 |
| Schema Management | Liquibase | 4.8.0 |
| Job Scheduling | Quartz Scheduler | JDBC-based |

### **Security & Authentication**
| Component | Technology | Version |
|-----------|-----------|---------|
| JWT | jjwt | 0.11.2 |
| OAuth2 | Spring Security | 6.4.3 |
| Key Management | HashiCorp Vault | Spring Cloud Config |
| Keys Vault | Azure Key Vault | 5.13.0 |

### **Cloud & Storage**
| Component | Technology | Version |
|-----------|-----------|---------|
| AWS S3 | AWS SDK v2 | 2.20.23 |
| AWS SageMaker | AWS SDK | 2.20.23 |
| Azure Storage | Azure SDK | 12.29.0 |
| Azure OpenAI | LangChain4j | 0.33.0 |
| GCP Vertex AI | LangChain4j | 0.35.0 |
| MinIO | MinIO SDK | 8.6.0 |
| Local Storage | File System | N/A |

### **AI/ML & LLM Integration**
| Component | Technology | Purpose |
|-----------|-----------|---------|
| AWS Bedrock | LangChain4j | LLM API access |
| Azure OpenAI | LangChain4j | OpenAI API integration |
| Google Vertex AI | LangChain4j / Native SDK | Gemini LLM access |
| Goose API | Custom Integration | AI-assisted coding |

### **Messaging & Events**
| Component | Technology | Version |
|-----------|-----------|---------|
| Message Queue | Kafka / RabbitMQ | Spring Cloud Stream |
| WebSocket | Spring WebSocket + STOMP | Latest |
| Real-time Updates | Server-Sent Events (SSE) | HTML5 Standard |

### **Search & Analytics**
| Component | Technology | Version |
|-----------|-----------|---------|
| Full-Text Search | Apache Lucene | 8.11.1 |
| Query Parser | Lucene QueryParser | 8.11.1 |
| Data Analysis | Apache POI (Excel) | 5.4.0 |
| PDF Processing | PDFBox | 3.0.3 |
| File Type Detection | Apache Tika | 3.2.2 |

### **Utilities & Logging**
| Component | Technology | Version |
|-----------|-----------|---------|
| Logging | SLF4j + Logback | 2.0.9 / 1.5.12 |
| JSON Serialization | Jackson | 2.17.2 |
| Json Processing | JSON-org | 20240303 |
| Model Mapping | ModelMapper | 2.3.0 |
| Lombok | Lombok | 1.18.30 |
| Caching | EHCache | 3.9.0 |
| HTTP Client | OkHttp3 / HttpClient5 | 4.9.2 / 5.2.1 |

### **Development & Testing**
| Component | Technology | Version |
|-----------|-----------|---------|
| Testing | JUnit5 / TestNG | 5.10.1 / 7.9.0 |
| Mocking | Mockito | 2.0.2-beta |
| Code Quality | SonarQube | Maven Plugin 3.7.0 |
| Coverage | Jacoco | 0.8.5 |
| Git Operations | JGit | 5.13.4 |

---

## Module Breakdown

### **Module Structure (15+ modules)**

```
sv/
├── comm-lib-*               (3 modules - Shared Libraries)
├── iamp-lib-usm             (1 module - User & Security)
├── icip-lib-*               (6 modules - Core ICIP)
├── icip-adp-*               (9 modules - Data Adapters)
├── common-app               (1 module - Main Entry Point)
└── common-lib-rest          (1 module - REST Utilities)
```

### **Detailed Module Breakdown**

#### **Shared Libraries (Foundation Modules)**

| Module | Purpose | Key Classes |
|--------|---------|-------------|
| `comm-lib-util` | Common utilities, helper functions, constants | Utility classes for string, collection, date operations |
| `comm-lib-secrets` | Secrets management integration | Vault, KeyVault connections |
| `comm-secrets-app` | Secrets service application | Key/secret provider endpoints |
| `common-lib-rest` | REST common utilities, DTOs | Response wrappers, API constants |

#### **User & Security Management (USM)**

| Module | Purpose | API Endpoints |
|--------|---------|---------------|
| `iamp-lib-usm` | Authentication, Authorization, User/Role/Org Management | 25+ endpoints for users, roles, permissions, orgs, delegations |

**Key Responsibilities:**
- JWT authentication & token validation
- Role-Based Access Control (RBAC)
- Organizational structure (Org → OrgUnit → Project)
- User delegation workflows
- Email notifications
- Timezone & locale management

#### **Core AI/ML Pipeline (ICIP - Essedum Cognitive Insight Platform)**

| Module | Purpose | Key Features |
|--------|---------|--------------|
| `icip-lib-iai` | AI/ML job execution engine | Job/pipeline definition, execution, monitoring |
| `icip-lib-jobs` | Quartz-based job scheduling | Distributed job execution, job history |
| `icip-lib-evt` | Event publishing & listening | Async event handling, event factory |
| `icip-lib-mod` | Model management & versioning | Model registry, deployment tracking |
| `icip-lib-mlops` | MLOps features | Model monitoring, performance tracking |
| `icip-lib-search` | Search functionality | Lucene-based document indexing |

**Key REST Endpoints:**
```
GET/POST   /api/aip/jobs              - List/Create jobs
POST       /api/aip/jobs/{id}/execute - Execute job
GET/POST   /api/aip/pipelines         - Manage pipelines
GET/POST   /api/aip/models            - Model registry
POST       /api/aip/events/trigger    - Publish events
GET        /api/aip/events            - Get event stream
```

#### **File Server & Data Handling (FSVR)**

| Module | Purpose | Supported Backends |
|--------|---------|-------------------|
| `icip-lib-fsvr` | Multi-backend file server | Local FS, MinIO, S3, Azure Blob |

**Features:**
- Abstract file server interface
- Factory pattern for backend selection
- File metadata tracking
- Directory structure support
- Async operations

#### **Data Adapters (9 adapter modules)**

| Adapter | Purpose | Use Case |
|---------|---------|----------|
| `icip-adp-rest` | REST API data source | Connect to any REST endpoint |
| `icip-adp-s3` | AWS S3 data access | Query S3 files as datasets |
| `icip-adp-mysql` | MySQL database connector | MySQL data sources |
| `icip-adp-postgresql` | PostgreSQL connector | PostgreSQL data sources |
| `icip-adp-azure` | Azure services | Azure Blob Storage, SQL |
| `icip-adp-aicloud` | AI Cloud services | Generic AI cloud platforms |
| `icip-adp-aws-sagemaker` | AWS SageMaker | Model training/inference |
| `icip-adp-gcp-vertex` | GCP Vertex AI | Google's ML platform |
| `icip-adp-remote` | Remote execution | SSH/RPC based execution |

**Each adapter provides:**
- Connection testing
- Query execution
- Data type mapping
- Credential management
- Error handling

#### **Vibe: AI-Assisted Coding**

| Component | Purpose |
|-----------|---------|
| `icip-lib-vibe` | Integration with Goose API for AI code generation |

**Features:**
- Session-based coding context
- Prompt-response management
- GitHub integration for code push
- Recipe system for code generation patterns
- Configuration management

#### **Main Application (common-app)**

**Responsibility:** Spring Boot entry point  
**Key Features:**
- Spring Boot autoconfiguration
- Distributed tracing
- Central logging setup
- GitHub OAuth integration
- Health checks & metrics

---

## Key Concepts

### **1. Job Orchestration & Execution**

**How it works:**
1. User creates a Job with parameters
2. Job is scheduled via Quartz Scheduler
3. Job executes in a distributed manner (Python py-job-executer)
4. Results are stored and events published
5. WebSocket notifies frontend of completion

**Quartz Database:** Stores job scheduling metadata in JDBC jobstore

### **2. Pipeline Definition**

A **Pipeline** is a DAG (Directed Acyclic Graph) of jobs:
```
Input Data → Job1 → Job2 → Job3 → Output Data
                ↓ Events ↓ WebSocket ↓ Real-time updates
```

### **3. Multi-Tenancy Architecture**

```
Organization
  └── Org Unit
        └── Project
              └── Users with specific roles
```

Each level has its own permissions and access controls.

### **4. Event-Driven Architecture**

- **Publishers:** Jobs publish events on completion
- **Listeners:** Services subscribe to event types
- **Asynchronous:** Non-blocking event handling
- **Kafka/RabbitMQ:** Message broker for event distribution

### **5. Data Adapter Pattern**

```
┌────────────────────────────────┐
│   Adapter Interface            │
├────────────────────────────────┤
│ • testConnection()             │
│ • executeQuery()               │
│ • getMetadata()                │
│ • getDataTypes()               │
└────────┬───────────────────────┘
         │
    ┌────┴────┬─────────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼         ▼
  Rest      S3      MySQL    Azure     GCP
```

Each adapter implements the interface, allowing seamless data source swapping.

### **6. Search Based on Lucene**

- **Index:** Full-text index of datasets/documents
- **Query Parser:** Natural language queries
- **Storage:** Persistent index files
- **Real-time:** Updates as data changes

### **7. JWT Authentication Flow**

```
1. User sends credentials
2. Server validates → Issues JWT token
3. Client stores token
4. All subsequent requests include token in Authorization header
5. Middleware validates token signature & expiry
6. Request proceeds if valid, denied if invalid/expired
```

### **8. WebSocket Real-Time Updates**

- **STOMP Protocol:** WebSocket messaging protocol
- **Server-Sent Events (SSE):** One-way server → client updates
- **Subscriptions:** Clients subscribe to job/event updates
- **Broadcasting:** Updates pushed instantly to all subscribers

### **9. File Storage Abstraction**

```
┌─────────────────────────┐
│  File Server (Interface)│
├─────────────────────────┤
│ • upload(file)          │
│ • download(id)          │
│ • delete(id)            │
│ • listFiles()           │
└──────────┬──────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    ▼             ▼          ▼          ▼
  Local FS      MinIO       S3       Azure
```

Allows switching storage backend without code changes.

### **10. Python Integration (py-job-executer)**

- **Bridge:** Java ↔ Python communication
- **Execution:** Python scripts for ML jobs
- **Libraries:** Python-specific ML libraries (scikit-learn, TensorFlow, etc.)
- **Environment:** Separate Python runtime with configured PYTHONPATH
- **Results:** Python scripts write results back to databases/files

---

## Important Interview Topics

### **Topic 1: System Design & Architecture**

**Questions you might get:**

Q: *"Explain the monolithic to microservices migration strategy."*
```
A: 
- Current: 15 modules in 1 Spring Boot app, 624 DB connections
- Target: 4 independent services, 85 DB connections
- Benefits: Independent scaling, fault isolation, faster deployments
- Phases:
  1. Set up API Gateway & Service Discovery (Eureka)
  2. Extract USM Service (User & Auth)
  3. Extract Data Service (Files & Adapters)
  4. Extract ICIP Service (Jobs & Pipelines)
  5. Extract Vibe Service (AI Coding)
  6. Decommission monolith
- Timeline: 14-17 weeks
```

Q: *"How do you ensure data consistency across microservices?"*
```
A:
- Saga pattern for distributed transactions
- Event-driven consistency (eventual consistency)
- Database per service principle
- Compensating transactions for rollback
- Cross-service communication via REST/Kafka
```

Q: *"What's the connection pooling strategy?"*
```
A:
- USM: 20 connections
- ICIP: 30 connections  
- Data: 20 connections
- Vibe: 15 connections
- Benefits: Reduced resource contention, better db performance
```

### **Topic 2: Data Integration & Adapters**

Q: *"How does the adapter pattern help with data integration?"*
```
A:
- Common interface for all data sources
- Easy to add new adapters without breaking existing code
- Each adapter handles connection, query, metadata separately
- Factory pattern for adapter instantiation
- Type mapping & error handling per adapter
```

Q: *"Walk us through querying data from S3 vs MySQL."*
```
A:
S3 Adapter:
- Connect via AWS SDK
- List files/folders
- Parse file format (CSV, JSON, Parquet)
- Stream data into memory/database

MySQL Adapter:
- Create JDBC connection
- Execute SQL query
- Map ResultSet to domain objects
- Handle transactions

Both implement same interface → seamless switching
```

### **Topic 3: Job Execution & Orchestration**

Q: *"Explain the job execution flow."*
```
A:
1. User defines job (parameters, data source, processing logic)
2. Job stored in icip_jobs table
3. Quartz picks up job at scheduled time
4. Job executor submits to py-job-executer
5. Python script executes ML algorithm
6. Results written back to database/files
7. Completion event published to Kafka
8. Frontend notified via WebSocket
9. User sees results in UI
```

Q: *"How do you handle job failures?"*
```
A:
- Quartz retry mechanism
- Max retry count + exponential backoff
- Failed job status stored (for audit)
- Error event published
- Notification sent to user
- Compensating actions triggered if needed
```

Q: *"What's the purpose of the event system?"*
```
A:
- Decouple job completion from downstream processing
- Kafka/RabbitMQ for message distribution
- Multiple listeners can react to same event
- Async, non-blocking processing
- Audit trail of all system events
- Real-time UI updates via WebSocket
```

### **Topic 4: Authentication & Authorization**

Q: *"Describe the authentication flow."*
```
A:
1. User sends credentials to /api/authenticate
2. USM service validates against users table
3. Password verified (bcrypt or similar)
4. JWT token generated (header.payload.signature)
5. Token includes user info, roles, permissions
6. Client stores token (localStorage/sessionStorage)
7. All requests include "Authorization: Bearer <token>" header
8. API Gateway validates token signature & expiry
9. Request routed to appropriate service
10. Service-level authorization checks roles/permissions
```

Q: *"How does RBAC (Role-Based Access Control) work?"*
```
A:
Structure:
- Users have Roles
- Roles have Permissions
- Permissions map to API endpoints/resources

Tables:
- users (id, username, email, org_id)
- roles (id, name, description, org_id)
- permissions (id, name, resource, action)
- user_roles (user_id, role_id)
- role_permissions (role_id, permission_id)

Check flow:
1. Extract user_id from JWT
2. Query user_roles for all roles
3. Query role_permissions for all permissions
4. Check if required permission in list
5. Allow/deny based on check result
```

Q: *"What's the purpose of user delegation?"*
```
A:
Use case: Manager on vacation, needs assistant to approve requests
Solution:
- Manager delegates role to assistant for time period
- Assistant can approve requests on behalf of manager
- Audit trail shows who actually approved
- Delegation expires after set time
- Compliant with financial/audit regulations
```

### **Topic 5: File Management & Storage**

Q: *"Explain the file server abstraction."*
```
A:
Interface allows switching backends transparently:
- Local FS: Development/testing
- MinIO: Self-hosted S3-compatible
- AWS S3: Production cloud storage
- Azure Blob: Azure ecosystem integration

Code never changes, only configuration.
Benefits: No vendor lock-in, easy testing, flexible deployment.
```

Q: *"How do you handle large file uploads?"*
```
A:
- Multipart upload support
- Chunk-based processing (avoid memory overload)
- Streaming to backend storage
- Checksum validation for integrity
- Resume capability for interrupted uploads
- Metadata stored in database (file table)
```

### **Topic 6: Search & Analytics**

Q: *"How does full-text search work?"*
```
A:
1. Data source indexed via Lucene
2. Inverted index created (word → documents)
3. Metadata indexed (author, date, type, etc.)
4. User sends query string
5. Query parsed & analyzed
6. Index searched for matches
7. Results ranked by relevance
8. Pagination for large result sets
```

### **Topic 7: Real-Time Features**

Q: *"How does real-time WebSocket communication work?"*
```
A:
Server side:
- Spring WebSocket endpoint configured
- STOMP message converter
- Message broker (in-memory or external)

Client side:
- WebSocket connection established
- Subscribe to specific topics (/queue/jobUpdates)
- Receive messages in real-time
- Handle reconnection logic

Flow:
1. Job starts
2. Server publishes event: /topic/job/123/update
3. All subscribers get message instantly
4. Frontend updates UI without polling
5. Better UX, reduced server load
```

### **Topic 8: Scaling & Performance**

Q: *"How do you scale this system?"*
```
A:
Horizontal:
- API Gateway distributes load across instances
- Database connection pooling
- Message queue (Kafka) for async work
- CDN for static files

Vertical:
- Optimize queries with indexes
- Cache frequently accessed data (Redis/EHCache)
- Connection pooling tuning
- JVM heap optimization

Deployment:
- Docker containers
- Kubernetes orchestration
- Service mesh (Istio) for routing
- Auto-scaling based on metrics
```

Q: *"Why the move from 624 to 85 connections?"*
```
A:
Current (Monolith):
- All modules in one app
- Each datasource has max pool size
- Unused connections for unused modules
- Connection exhaustion during peak load

Future (Microservices):
- Each service only needs connections it uses
- USM: 20 (only auth operations)
- ICIP: 30 (job-heavy, needs more)
- Data: 20 (adapter operations)
- Vibe: 15 (light sessions)

Result: 7x reduction in connection overhead
```

### **Topic 9: Cloud Integrations**

Q: *"How does Azure OpenAI integration work?"*
```
A:
1. LangChain4j library provides abstraction
2. Configuration stores API key in Key Vault
3. Service makes request to Azure OpenAI endpoint
4. Prompt sent with context
5. Model generates response
6. Response parsed and returned
7. Usage metrics tracked
8. Cost tracking for billing

Used in: Job parameters, Vibe code generation, data analysis
```

Q: *"Explain AWS SageMaker integration."*
```
A:
1. icip-adp-aws-sagemaker adapter
2. AWS SDK configured with credentials
3. Can trigger training jobs
4. Monitor job progress
5. Deploy trained models as endpoints
6. Invoke endpoints with input data
7. Get predictions

Integration points:
- ICIP jobs can call SageMaker
- Model registry tracks deployed models
- MLOps monitors performance
```

### **Topic 10: Database Design**

Q: *"Walk us through the database schema for USM."*
```
A:
users
- id (PK)
- username (unique)
- email
- password_hash
- org_id (FK)
- is_active
- created_at, updated_at

organizations
- id (PK)
- name
- created_at

roles
- id (PK)
- name
- org_id (FK)
- description

permissions
- id (PK)
- name
- resource
- action

user_roles
- user_id (FK)
- role_id (FK)
- PRIMARY KEY(user_id, role_id)

role_permissions
- role_id (FK)
- permission_id (FK)
- PRIMARY KEY(role_id, permission_id)

Queries:
- Get user permissions: 
  SELECT p.* FROM permissions p
  JOIN role_permissions rp ON p.id = rp.permission_id
  JOIN roles r ON rp.role_id = r.id
  JOIN user_roles ur ON r.id = ur.role_id
  JOIN users u ON ur.user_id = u.id
  WHERE u.id = ?
```

---

## Current State vs Future State

### **Current State (Monolithic)**

**Disadvantages:**
- ❌ Single point of failure (whole system down if one component fails)
- ❌ Can't scale individual components (scale everything or nothing)
- ❌ 624 database connections (resource waste)
- ❌ Deployment risk (any change requires full restart)
- ❌ Technology lock-in (all Java/Spring)
- ❌ Team scaling challenges (all teams touching same codebase)
- ❌ Testing complexity (need full stack running)
- ❌ Difficult to patch individual features

**Advantages:**
- ✅ Simpler development initially
- ✅ Unified codebase
- ✅ Transaction consistency (single database)
- ✅ Easier debugging (all in one process)
- ✅ Lower operational overhead (1 deployment unit)

### **Future State (Microservices)**

**Advantages:**
- ✅ Independent failure domains (USM down ≠ ICIP down)
- ✅ Horizontal scaling (scale only what needs scaling)
- ✅ 85 database connections (86% reduction)
- ✅ Faster deployments (only deploy changed service)
- ✅ Technology flexibility (each service picks its stack)
- ✅ Team autonomy (each team owns a service)
- ✅ Easier testing (service in isolation)
- ✅ Feature flag deployment (gradual rollout)

**Disadvantages:**
- ❌ Network latency (service-to-service calls)
- ❌ Distributed transaction complexity (saga pattern)
- ❌ Operations complexity (multiple deployment units)
- ❌ Data consistency challenges (eventual consistency)
- ❌ Monitoring/debugging across services (observability)
- ❌ Contract versioning (API changes)

### **Migration Roadmap**

| Phase | Duration | Work |
|-------|----------|------|
| Phase 1: Preparation | 2-3 weeks | Setup Eureka, API Gateway, databases |
| Phase 2: USM Service | 3-4 weeks | Extract auth service, setup JWT validation |
| Phase 3: Data Service | 3-4 weeks | Extract file storage and adapters |
| Phase 4: ICIP Service | 4-5 weeks | Extract jobs, pipelines, events |
| Phase 5: Vibe Service | 2-3 weeks | Extract AI coding features |
| Phase 6: Cutover | 2 weeks | Route traffic, monitor, decommission monolith |

---

## Common Interview Coding Questions

### **Question 1: Adapter Pattern Implementation**

```java
public interface DataAdapter {
    boolean testConnection();
    List<Map<String, Object>> executeQuery(String query);
    DataType mapType(DatabaseType type);
}

public class S3Adapter implements DataAdapter {
    private AmazonS3 s3Client;
    
    @Override
    public boolean testConnection() {
        try {
            s3Client.listBuckets();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public List<Map<String, Object>> executeQuery(String query) {
        // Parse S3 path from query
        // Read file (CSV/JSON/Parquet)
        // Convert to list of maps
    }
}

public class AdapterFactory {
    public static DataAdapter getAdapter(String type) {
        switch(type) {
            case "S3" -> return new S3Adapter();
            case "MySQL" -> return new MySQLAdapter();
            case "PostgreSQL" -> return new PostgresAdapter();
            default -> throw new IllegalArgumentException();
        }
    }
}
```

### **Question 2: JWT Token Validation**

```java
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 86400000); // 24hrs
        
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .claim("roles", userDetails.getAuthorities())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public String getUserIdFromJWT(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody();
        
        return claims.getSubject();
    }
}
```

### **Question 3: Job Executor with Quartz**

```java
@Component
public class MLJobExecutor implements Job {
    
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        JobDataMap dataMap = context.getJobDetail().getJobDataMap();
        Long jobId = (Long) dataMap.get("jobId");
        
        try {
            Job job = jobRepository.findById(jobId);
            job.setStatus("RUNNING");
            jobRepository.save(job);
            
            // Execute actual ML job
            Result result = executeMlAlgorithm(job);
            
            job.setStatus("COMPLETED");
            job.setResult(result.toString());
            jobRepository.save(job);
            
            // Publish event
            eventPublisher.publishEvent(new JobCompletedEvent(jobId));
            
        } catch (Exception e) {
            if (context.getRefireCount() < 3) {
                throw new JobExecutionException(e, true); // Refire
            } else {
                Job job = jobRepository.findById(jobId);
                job.setStatus("FAILED");
                jobRepository.save(job);
            }
        }
    }
}
```

---

## Key Statistics & Facts (For Interview)

| Metric | Value |
|--------|-------|
| Total modules | 15+ |
| Java version | 21 |
| Spring Boot version | 3.3.5 |
| Data sources supported | 9+ (S3, MySQL, PostgreSQL, Azure, GCP, REST, etc.) |
| LLM integrations | 3 (Azure OpenAI, AWS Bedrock, Google Vertex AI) |
| Current DB connections | 624 |
| Target DB connections | 85 |
| Connection reduction | 86% |
| Proposed microservices | 4 |
| Proposed migration timeline | 14-17 weeks |
| Max org hierarchy levels | 3 (Org → OrgUnit → Project) |
| Security framework | Spring Security + JWT |
| Distributed scheduling | Quartz Scheduler (JDBC jobstore) |
| Real-time protocol | WebSocket + STOMP + SSE |
| Full-text search | Apache Lucene |
| Container orchestration | Kubernetes (planned) |

---

## Deployment & Operations

### **Docker Setup**
- `Dockerfile_dbjwt`: Database + JWT service
- `Dockerfile_oauth2`: OAuth2 service
- NGINX reverse proxy config: `nginx_backend.conf`

### **Configuration Management**
- HashiCorp Vault for secrets
- Azure Key Vault integration
- Spring Cloud Config for centralized properties

### **Monitoring & Observability**
- Distributed tracing (Zipkin/Jaeger ready)
- SonarQube integration (code quality)
- JaCoCo code coverage
- Prometheus metrics (Spring Actuator)
- Grafana dashboards

---

## Preparation Tips for Interview

1. **Understand the problem:** Why monolith → microservices?
2. **Know the layers:** UI→ Gateway → Service → DB
3. **Draw diagrams:** Architect loves visual explanations
4. **Discuss trade-offs:** Scalability vs complexity
5. **Performance:** 86% DB connection reduction
6. **Security:** JWT, RBAC, multi-tenancy
7. **Integration:** Multiple cloud platforms + LLMs
8. **Be ready for:** "How would you handle X failure scenario?"

---

This guide covers everything you need to explain ESSEDUM in an interview confidently! 🚀

