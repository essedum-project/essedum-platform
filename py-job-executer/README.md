# Python Job Executor

> Scope & requirements: [docs/SCOPE.md](docs/SCOPE.md)
> Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

General-purpose Python job executor for the Essedum platform. Runs pipeline scripts locally or with MinIO/S3 storage.

## Setup

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Edit `conf/conf.ini`:

```ini
[DEFAULT]
ThreadCount = 4
WorkingDirectory = /tmp/Jobs/
```

## Running

```bash
python app.py
```

Swagger UI available at `http://localhost:5000/swagger`.

## Registering pipeline output

A pipeline can record what it produced in the platform's Model Registry
(`mlfederatedmodels`) or Agent Registry (`agent_directory`) by calling the
registry API at the end of a successful run.

These endpoints are **unauthenticated and write directly to the platform
database**, because a pipeline subprocess has no JWT or `Project` header to
authenticate with. They are **disabled by default**. Enable them per deployment:

```ini
[REGISTRY_DB_CONFIGS]
enabled = True
username = registry_writer
host = mysql
port = 3306
database = 
coredb_schema =
connect_timeout = 10
```

The password comes from the `mysql_db_password` environment variable — the same
one the task retriever uses. Point `username` at a database user granted only
`INSERT`/`SELECT` on the registry tables.

Leave `coredb_schema` blank when the agent tables live in the main database
(which is what the Liquibase changesets create). Set it to `essedum_coredb` for
deployments where the tables really are in that schema, as the JPA entities
assume. Check with:

```sql
SELECT table_schema, table_name FROM information_schema.tables
WHERE table_name IN ('mlfederatedmodels', 'agent_directory', 'tools');
```

Verify the wiring without submitting a job:

```bash
curl -s localhost:5000/api/registry/v1/health
```

### From inside a pipeline script

Every job gets these environment variables injected, so a script never has to
hardcode the executor's address or re-derive its own identity:

| Variable | Value |
|---|---|
| `REGISTRY_API_URL` | `http://127.0.0.1:<port>/api/registry/v1` (loopback — the script runs in this container) |
| `PIPELINE_NAME` | the pipeline's name |
| `PIPELINE_ORG` | the organization the job was submitted for |
| `PIPELINE_VERSION` | the pipeline version |
| `TASK_ID` | this run's task id |

A job's own `environment` payload can override any of them.

Register a model:

```python
import os, requests

requests.post(f"{os.environ['REGISTRY_API_URL']}/models", json={
    "name": "churn-classifier",
    "organisation": os.environ["PIPELINE_ORG"],   # note the British spelling
    "version": os.environ["PIPELINE_VERSION"],
    "type": "sklearn",
    "dataSource": "minio",
    "createdBy": "pipeline",
}, timeout=30).raise_for_status()
```

Register an agent, with as many or as few child collections as apply:

```python
import os, requests

requests.post(f"{os.environ['REGISTRY_API_URL']}/agents", json={
    "alias": "churn-agent",
    "name": f"{os.environ['PIPELINE_ORG']}-churn-agent",
    "type": "pipeline",
    "interface_type": "REST",
    "organization": os.environ["PIPELINE_ORG"],
    "pipeline_name": os.environ["PIPELINE_NAME"],   # resolved to pipeline_id
    "skills": [{"name": "predict-churn"}],
    "tools": [{"name": "score", "parameters": [{"name": "customer_id",
                                                "type": "string"}]}],
}, timeout=30).raise_for_status()
```

An agent and all of its child rows are written in one transaction, so a failure
part-way through leaves nothing behind.

### Differences from the Java endpoints

| | Java | Here |
|---|---|---|
| Agent `name` | derived via `ncs.nameEncoder` when blank | **required** — that encoder cannot be called from Python |
| Agent `type`, `interface_type` | not validated (500 on omission) | validated → `422` |
| Duplicate alias in another org | not detected | `409` (aliases are globally unique) |
| Duplicate model name | `400` | `409` |

`organisation`/`organization` are accepted interchangeably on both endpoints,
since the two tables spell it differently.

Status codes: `201` created, `404` not found, `409` duplicate, `422` invalid
payload (with a `field` naming the offender), `503` feature disabled.
