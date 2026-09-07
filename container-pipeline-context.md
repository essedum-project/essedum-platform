# Container-Based Pipeline Deployment — Session Context

## Goal

Convert native pipeline, data pipeline, and training pipeline to use the same container-based deployment model as app and MCP pipelines (which use `adk-code-builder-deployer` to build Docker images and deploy to Kubernetes).

**Phase 1:** Native pipeline  
**Phase 2:** Data pipeline + Training pipeline

**Key constraint from user:** Minimise Java changes — no new Java beans or files. All container-deploy orchestration logic lives in the existing `py-job-executer` Python microservice.

---

## Architecture Overview

```
Angular UI
    │
    ▼  GET /service/v1/pipeline/deploy/{cname}/{org}
Java (ICIPPipelineNewController)
    │
    ▼  if (runtime == "container") → deployPipelineAsContainer()
ICIPPipelineService.java
    │  POST /container-deploy-with-zip  (multipart: zip + form fields)
    ▼
py-job-executer (Flask)
    │  Uploads zip to MinIO via boto3
    │  Connects to adk-code-builder-deployer via SocketIO
    │  Emits: start_pipeline event
    ▼
adk-code-builder-deployer (Flask + SocketIO)
    │  Downloads zip from MinIO
    │  Builds Docker image via BuildKit
    │  Deploys to Kubernetes
    └─► Returns: pipeline_status event (SUCCESS / ERROR)
```

**Kubernetes namespaces:**
- Native pipeline → `vibe-pipelines`
- Data pipeline → `vibe-pipelines`
- Training pipeline → `vibe-training` (GPU nodeSelector support for LLM jobs)

**Script storage:** Native/data/training pipeline scripts are in the `ICIPNativeScript` DB table as Blob (not MinIO like app/mcp pipelines). Java fetches scripts, zips them with `ZipOutputStream`, and POSTs multipart to py-job-executer.

---

## Files Changed

### 1. `py-job-executer/app.py`

Added at top:
```python
import socketio as sio_module
```

Added global:
```python
container_deploy_results = {}
```

Added helper `_run_container_deploy(deploy_id, payload)`:
- Connects to `adk-code-builder-deployer` via SocketIO
- Emits `start_pipeline` event
- Waits for `pipeline_status` event (300s timeout)
- Stores result in `container_deploy_results[deploy_id]`

Added endpoints:
- `POST /container-deploy-with-zip` — accepts multipart zip + form fields, uploads to MinIO via boto3, delegates to `_run_container_deploy`
- `POST /container-deploy` — accepts JSON with MinIO path already set
- `GET /container-deploy/<deploy_id>/status` — polls result from `container_deploy_results`

### 2. `py-job-executer/requirements.txt`

Added:
```
python-socketio[client]
websocket-client
```

### 3. `sv/icip-service/src/main/java/com/lfn/icip/icipwebeditor/service/impl/ICIPPipelineService.java`

Added imports:
```java
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
```

Added `@Value` fields:
```java
@Value("${icip.container.pyjob.url:}") private String containerPyJobUrl;
@Value("${icip.container.deployer.url:}") private String containerDeployerUrl;
@Value("${icip.container.registry.prefix:}") private String containerRegistryPrefix;
@Value("${icip.container.namespace.pipeline:vibe-pipelines}") private String containerNamespacePipeline;
@Value("${icip.container.namespace.training:vibe-training}") private String containerNamespaceTraining;
@Value("${fileserver.minio.url:}") private String containerMinioEndpoint;
@Value("${fileserver.minio.access-key:}") private String containerMinioAccessKey;
@Value("${fileserver.minio.secret-key:}") private String containerMinioSecretKey;
@Value("${icip.container.minio.bucket:aiptest}") private String containerMinioBucket;
```

In `createJob()`, added as first line:
```java
if (runtime.equalsIgnoreCase("container")) {
    return deployPipelineAsContainer(jobType, cname, alias, org);
}
```

Added private method `deployPipelineAsContainer()`:
- Fetches `List<ICIPNativeScript>` via `nativeScriptService.findByOrgAndName()`
- Creates zip with `ZipOutputStream`
- POSTs multipart (zip + form fields) to `{containerPyJobUrl}/container-deploy-with-zip`

Added public method `getContainerDeployStatus(deployId)`:
- Proxies `GET {containerPyJobUrl}/container-deploy/{deployId}/status`

### 4. `sv/icip-service/src/main/java/com/lfn/icip/icipwebeditor/rest/ICIPPipelineNewController.java`

Added two endpoints:
```java
@GetMapping(value = "/deploy/{cname}/{org}")
public ResponseEntity<?> deployAsContainer(@PathVariable String cname, @PathVariable String org) {
    ICIPStreamingServices ss = streamingServicesService.getICIPStreamingServices(cname, org);
    return pipelineService.createJob(ss.getType(), cname, ss.getAlias(), org, "container", null,
            ICIPUtils.generateCorrelationId(), 0, null, "");
}

@GetMapping(value = "/container-status/{deployId}")
public ResponseEntity<?> getContainerDeployStatus(@PathVariable String deployId) {
    return pipelineService.getContainerDeployStatus(deployId);
}
```

### 5. `sv/icip-service/src/main/resources/application.yml`

Added:
```yaml
icip:
  container:
    pyjob:
      url: ${CONTAINER_PYJOB_URL:http://py-job-executer:5000}
    deployer:
      url: ${CONTAINER_DEPLOYER_URL:http://adk-code-builder-deployer:5000}
    registry:
      prefix: ${CONTAINER_REGISTRY_PREFIX:}
    namespace:
      pipeline: ${CONTAINER_NAMESPACE_PIPELINE:vibe-pipelines}
      training: ${CONTAINER_NAMESPACE_TRAINING:vibe-training}
    minio:
      bucket: ${CONTAINER_MINIO_BUCKET:aiptest}
```

### 6. Angular — `integration-hub` service

**File:** `essedum-ui/modules/integration-hub/projects/integration-hub/src/app/features/services/service.ts`

Added:
```typescript
deployPipelineAsContainer(cname: string): Observable<any> {
  const org = sessionStorage.getItem('organization');
  return this.https.get(this.dataUrl + '/service/v1/pipeline/deploy/' + cname + '/' + org, { responseType: 'text' })
    .pipe(map((response) => response))
    .pipe(catchError((error: any) => this.handleError(error)));
}

getContainerDeployStatus(deployId: string): Observable<any> {
  return this.https.get(this.dataUrl + '/service/v1/pipeline/container-status/' + deployId)
    .pipe(map((response) => response))
    .pipe(catchError((error: any) => this.handleError(error)));
}
```

### 7. Angular — NativeScriptComponent (Phase 1)

**Files:**
- `essedum-ui/modules/integration-hub/.../native-script/native-script.component.ts`
- `essedum-ui/modules/integration-hub/.../native-script/native-script.component.html`

Added state: `containerDeployStatus`, `containerDeployMessage`, `containerInternalDnsUrl`, `_containerPollInterval`

Added `deployAsContainer()` method:
- Calls `service.deployPipelineAsContainer()`
- Polls every 5s via `service.getContainerDeployStatus(deployId)`
- Updates state on SUCCESS/ERROR

Added UI:
- "Deploy as Container" button (with `inventory_2` icon) after existing Run button
- New "Container" `<mat-tab>` with status panels for idle/deploying/success/error states
- Shows internal DNS URL on success, Re-deploy/Retry buttons

### 8. Angular — pipeline-options.constants.ts (both copies, Phase 2)

**Files:**
- `essedum-ui/modules/agent-studio/.../wizard/pipeline-options.constants.ts`
- `essedum-ui/modules/integration-hub/.../wizard/shared/pipeline-options.constants.ts`

Added to `EXECUTORS`:
```typescript
{ value: 'container-executor', label: 'Container Executor', description: 'Build and deploy as a Docker container on Kubernetes' }
```

Added `ContainerConfig` interface:
```typescript
interface ContainerConfig {
  containerImage?: string;
  containerRegistry?: string;
  containerEnvVars?: { name: string; value: string }[];
  useGpu?: boolean;
}
```

### 9. Angular — Data Pipeline Wizard Step 3 (Phase 2)

**Files:**
- `essedum-ui/modules/agent-studio/.../data-pipeline-wizard/data-pipeline-wizard.component.ts`
- `essedum-ui/modules/agent-studio/.../data-pipeline-wizard/data-pipeline-wizard.component.html`

Added `containerImage` and `containerRegistry` to `executionForm` FormGroup.

In HTML, added conditional fields (`*ngIf="executionForm.value.executor === 'container-executor'"`):
- Custom Docker image input
- Registry URL input

Both saved to `pipeline_attributes` in `createPipeline()`.

### 10. Angular — Training Pipeline Wizard Step 3 (Phase 2)

**Files:**
- `essedum-ui/modules/agent-studio/.../training-pipeline-wizard/training-pipeline-wizard.component.ts`
- `essedum-ui/modules/agent-studio/.../training-pipeline-wizard/training-pipeline-wizard.component.html`

Added `containerImage`, `containerRegistry`, `useGpu` to `dataExecForm`.

In HTML, added (`*ngIf="dataExecForm.value.executor === 'container-executor'"`):
- Image field, registry field
- GPU `mat-slide-toggle` (shown only for LLM job types via `*ngIf="isLLM"`)

All three saved to `pipeline_attributes` in `createJob()`.

### 11. Angular — PipelineEditorComponent (Phase 2)

**Files:**
- `essedum-ui/modules/integration-hub/.../pipeline/wizard/editor/pipeline-editor.component.ts`
- `essedum-ui/modules/integration-hub/.../pipeline/wizard/editor/pipeline-editor.component.html`

Added state variables: `containerDeployStatus`, `containerDeployMessage`, `containerInternalDnsUrl`, `_containerPollInterval`

Added `deployAsContainer()` method (same polling pattern as NativeScriptComponent).

Added "Container" `<mat-tab>` guarded by `*ngIf="model.pipelineAttrs?.executor === 'container-executor'"`:
- Shows deploy status, internal DNS URL
- "Deploy as Container" button

### 12. Angular — ConfigTabComponent (Phase 2)

**File:** `essedum-ui/modules/integration-hub/.../pipeline/wizard/editor/tabs/config-tab.component.ts`

Extended `rows` getter with:
```typescript
{ label: 'Container image',    value: a.containerImage },
{ label: 'Container registry', value: a.containerRegistry },
{ label: 'GPU requested',      value: a.useGpu === true ? 'Yes' : undefined },
```

---

## What Was NOT Changed

- `adk-code-builder-deployer/app.py` — no changes needed (already accepts `namespace` in `start_pipeline` payload). Optional: add `node_selector` support for GPU training jobs (3–4 lines in `create_k8s_deployment()`).
- `ICIPNativeServiceJob.java`, `ICIPRemoteExecutorJob.java` — untouched
- Existing pipeline flows for non-container runtimes — unaffected

---

## Remaining Optional Task

Add `node_selector` support to `adk-code-builder-deployer/app.py`'s `create_k8s_deployment()` function so GPU training pods are scheduled on GPU nodes:

```python
# In create_k8s_deployment(), when building the pod spec:
node_selector = payload.get('node_selector', {})
if node_selector:
    pod_spec['nodeSelector'] = node_selector
```

The `node_selector` value (`{"accelerator": "nvidia-gpu"}`) is already passed through by py-job-executer when `useGpu: true` is in `pipeline_attributes`.

---

## Branch

`container-based-pipelines`

## Repo

`c:\Essedum\essedum-platform`
