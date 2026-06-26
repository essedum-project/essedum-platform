import os
import threading
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, disconnect
from kubernetes import client, config

app = Flask(__name__)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="eventlet",
    ping_interval=25,
    ping_timeout=300,
    logger=False,
    engineio_logger=False,
)

WATCHED_NAMESPACES = ["vibe-apps", "vibe-mcp", "vibe-agents"]

# Active log-stream threads keyed by socket sid
_active_streams: dict[str, threading.Event] = {}


def _load_k8s():
    try:
        config.load_incluster_config()
    except Exception:
        config.load_kube_config()


def _age(creation_timestamp) -> str:
    if creation_timestamp is None:
        return "unknown"
    now = datetime.now(timezone.utc)
    delta = now - creation_timestamp.replace(tzinfo=timezone.utc) if creation_timestamp.tzinfo is None else now - creation_timestamp
    seconds = int(delta.total_seconds())
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        return f"{seconds // 60}m"
    elif seconds < 86400:
        return f"{seconds // 3600}h"
    return f"{seconds // 86400}d"


def _resolve_namespaces(ns_param: str) -> list[str]:
    if ns_param in ("all", "", None):
        return WATCHED_NAMESPACES
    return [n.strip() for n in ns_param.split(",") if n.strip()]


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.route("/health")
def health():
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
# REST: Namespaces
# ---------------------------------------------------------------------------

@app.route("/api/namespaces")
def list_namespaces():
    return jsonify(WATCHED_NAMESPACES)


# ---------------------------------------------------------------------------
# REST: Pods
# ---------------------------------------------------------------------------

@app.route("/api/pods")
def list_pods():
    ns_param = request.args.get("namespace", "all")
    namespaces = _resolve_namespaces(ns_param)

    _load_k8s()
    core = client.CoreV1Api()

    results = []
    for ns in namespaces:
        try:
            pod_list = core.list_namespaced_pod(namespace=ns)
            for pod in pod_list.items:
                containers = pod.status.container_statuses or []
                ready_count = sum(1 for c in containers if c.ready)
                total_count = len(containers)
                restarts = sum(c.restart_count for c in containers)

                results.append({
                    "namespace": ns,
                    "name": pod.metadata.name,
                    "phase": pod.status.phase,
                    "ready": f"{ready_count}/{total_count}",
                    "restarts": restarts,
                    "age": _age(pod.metadata.creation_timestamp),
                    "node": pod.spec.node_name,
                    "ip": pod.status.pod_ip,
                })
        except client.exceptions.ApiException as e:
            results.append({"namespace": ns, "error": str(e.reason)})

    return jsonify(results)


# ---------------------------------------------------------------------------
# REST: Pod Logs
# ---------------------------------------------------------------------------

@app.route("/api/pods/<pod_name>/logs")
def pod_logs(pod_name: str):
    ns = request.args.get("namespace", "aipns")
    tail = int(request.args.get("tail", 200))
    container = request.args.get("container") or None

    _load_k8s()
    core = client.CoreV1Api()

    try:
        kwargs = dict(namespace=ns, name=pod_name, tail_lines=tail, timestamps=True)
        if container:
            kwargs["container"] = container
        logs = core.read_namespaced_pod_log(**kwargs)
        return jsonify({"namespace": ns, "pod": pod_name, "logs": logs.splitlines()})
    except client.exceptions.ApiException as e:
        return jsonify({"error": str(e.reason)}), e.status


# ---------------------------------------------------------------------------
# REST: Deployments
# ---------------------------------------------------------------------------

@app.route("/api/deployments")
def list_deployments():
    ns_param = request.args.get("namespace", "all")
    namespaces = _resolve_namespaces(ns_param)

    _load_k8s()
    apps = client.AppsV1Api()

    results = []
    for ns in namespaces:
        try:
            dep_list = apps.list_namespaced_deployment(namespace=ns)
            for dep in dep_list.items:
                desired = dep.spec.replicas or 0
                ready = dep.status.ready_replicas or 0
                available = dep.status.available_replicas or 0
                results.append({
                    "namespace": ns,
                    "name": dep.metadata.name,
                    "desired": desired,
                    "ready": ready,
                    "available": available,
                    "age": _age(dep.metadata.creation_timestamp),
                    "images": [c.image for c in dep.spec.template.spec.containers],
                })
        except client.exceptions.ApiException as e:
            results.append({"namespace": ns, "error": str(e.reason)})

    return jsonify(results)


# ---------------------------------------------------------------------------
# REST: Delete Pod
# ---------------------------------------------------------------------------

@app.route("/api/pods/<pod_name>", methods=["DELETE"])
def delete_pod(pod_name: str):
    """
    DELETE /api/pods/{pod_name}?namespace=vibe-mcp
    Deletes a pod — K8s automatically recreates it via the ReplicaSet.
    namespace param is required and must be one of the watched namespaces.
    """
    ns = request.args.get("namespace", "").strip()

    if not ns:
        return jsonify({"status": "ERROR", "message": "namespace query param is required"}), 400
    if ns not in WATCHED_NAMESPACES:
        return jsonify({
            "status": "ERROR",
            "message": f"namespace '{ns}' not allowed. Must be one of: {WATCHED_NAMESPACES}"
        }), 400

    _load_k8s()
    core = client.CoreV1Api()

    try:
        core.delete_namespaced_pod(
            name=pod_name,
            namespace=ns,
            body=client.V1DeleteOptions(grace_period_seconds=0)
        )
        return jsonify({
            "status": "SUCCESS",
            "message": f"Pod {pod_name} deleted from {ns}",
            "pod": pod_name,
            "namespace": ns,
        })
    except client.exceptions.ApiException as e:
        if e.status == 404:
            return jsonify({"status": "ERROR", "message": f"Pod '{pod_name}' not found in {ns}"}), 404
        return jsonify({"status": "ERROR", "message": str(e.reason)}), e.status


# ---------------------------------------------------------------------------
# REST: Delete Deployment (+ Service + Secret)
# ---------------------------------------------------------------------------

@app.route("/api/deployments/<deployment_name>", methods=["DELETE"])
def delete_deployment(deployment_name: str):
    """
    DELETE /api/deployments/{deployment_name}?namespace=vibe-mcp
    Deletes a deployment, its matching Service, and its {name}-secrets Secret.
    namespace param is required and must be one of the watched namespaces.
    """
    ns = request.args.get("namespace", "").strip()

    if not ns:
        return jsonify({"status": "ERROR", "message": "namespace query param is required"}), 400
    if ns not in WATCHED_NAMESPACES:
        return jsonify({
            "status": "ERROR",
            "message": f"namespace '{ns}' not allowed. Must be one of: {WATCHED_NAMESPACES}"
        }), 400

    _load_k8s()
    apps_api = client.AppsV1Api()
    core_api = client.CoreV1Api()

    deleted = {"deployment": False, "service": False, "secret": False}
    errors = []

    # Delete Deployment
    try:
        apps_api.delete_namespaced_deployment(
            name=deployment_name,
            namespace=ns,
            body=client.V1DeleteOptions(propagation_policy="Foreground")
        )
        deleted["deployment"] = True
    except client.exceptions.ApiException as e:
        if e.status == 404:
            return jsonify({
                "status": "ERROR",
                "message": f"Deployment '{deployment_name}' not found in {ns}"
            }), 404
        errors.append(f"deployment: {e.reason}")

    # Delete Service (same name as deployment — ignore 404)
    try:
        core_api.delete_namespaced_service(name=deployment_name, namespace=ns)
        deleted["service"] = True
    except client.exceptions.ApiException as e:
        if e.status != 404:
            errors.append(f"service: {e.reason}")

    # Delete Secret ({name}-secrets — ignore 404)
    secret_name = f"{deployment_name}-secrets"
    try:
        core_api.delete_namespaced_secret(name=secret_name, namespace=ns)
        deleted["secret"] = True
    except client.exceptions.ApiException as e:
        if e.status != 404:
            errors.append(f"secret: {e.reason}")

    status = "SUCCESS" if not errors else "PARTIAL"
    return jsonify({
        "status": status,
        "message": f"Deployment {deployment_name} deleted from {ns}",
        "deployment": deployment_name,
        "namespace": ns,
        "deleted": deleted,
        "errors": errors,
    })


# ---------------------------------------------------------------------------
# WebSocket: Live Log Streaming
# ---------------------------------------------------------------------------

@socketio.on("stream_logs")
def handle_stream_logs(data):
    """
    Expects: { pod: str, namespace: str, container: str (optional), tail: int (optional) }
    Emits: log_line events with { line: str }
    """
    sid = request.sid
    pod_name = data.get("pod")
    ns = data.get("namespace", "aipns")
    container = data.get("container") or None
    tail = int(data.get("tail", 50))

    if not pod_name:
        emit("log_error", {"error": "pod name is required"})
        return

    # Cancel any existing stream for this client
    if sid in _active_streams:
        _active_streams[sid].set()

    stop_event = threading.Event()
    _active_streams[sid] = stop_event

    def _stream():
        _load_k8s()
        core = client.CoreV1Api()
        try:
            kwargs = dict(
                namespace=ns,
                name=pod_name,
                follow=True,
                tail_lines=tail,
                timestamps=True,
                _preload_content=False,
            )
            if container:
                kwargs["container"] = container

            resp = core.read_namespaced_pod_log(**kwargs)
            for raw_line in resp:
                if stop_event.is_set():
                    break
                line = raw_line.decode("utf-8", errors="replace").rstrip()
                socketio.emit("log_line", {"line": line}, to=sid)
        except Exception as exc:
            socketio.emit("log_error", {"error": str(exc)}, to=sid)
        finally:
            _active_streams.pop(sid, None)
            socketio.emit("log_stream_end", {}, to=sid)

    t = threading.Thread(target=_stream, daemon=True)
    t.start()


@socketio.on("stop_log_stream")
def handle_stop_log_stream(_data=None):
    sid = request.sid
    if sid in _active_streams:
        _active_streams[sid].set()


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    if sid in _active_streams:
        _active_streams[sid].set()
        _active_streams.pop(sid, None)


# ---------------------------------------------------------------------------
# Pipeline-Pods helpers
# ---------------------------------------------------------------------------

_NS_TO_TYPE = {
    "vibe-agents": "Agent",
    "vibe-mcp":    "MCP",
    "vibe-apps":   "App",
}

_EXECUTION_STATUS_RANK = ["Running", "Pending", "Failed", "Success", "Unknown", "Inactive"]


def _namespace_to_type(ns: str) -> str:
    return _NS_TO_TYPE.get(ns, "System")


def _iso(ts) -> str | None:
    """Convert a K8s timestamp to ISO-8601 string, or None."""
    if ts is None:
        return None
    if hasattr(ts, "isoformat"):
        # Make timezone-aware
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return ts.isoformat()
    return str(ts)


def _container_execution_status(pod, cs) -> tuple[str, str]:
    """
    Returns (execution_status, container_status_str).
    cs: a container_status object (may be None for pending containers).
    """
    pod_phase = (pod.status.phase or "Unknown").lower()

    if cs is None:
        if pod_phase == "pending":
            return "Pending", "waiting"
        return "Unknown", "unknown"

    state = cs.state
    if state.running:
        if cs.ready:
            return "Running", "running"
        else:
            return "Pending", "running"
    if state.waiting:
        reason = state.waiting.reason or ""
        if "CrashLoop" in reason or "Error" in reason or "OOMKilled" in reason:
            return "Failed", "waiting"
        return "Pending", "waiting"
    if state.terminated:
        exit_code = state.terminated.exit_code or 0
        if exit_code == 0:
            return "Success", "terminated"
        return "Failed", "terminated"

    if pod_phase == "pending":
        return "Pending", "waiting"
    if pod_phase in ("succeeded",):
        return "Success", "terminated"
    if pod_phase in ("failed",):
        return "Failed", "terminated"
    return "Unknown", "unknown"


def _pod_updated_at(pod, cs) -> str | None:
    """Best-effort 'last updated' timestamp from container state transitions."""
    candidates = []

    # From container state
    if cs and cs.state:
        if cs.state.running and cs.state.running.started_at:
            candidates.append(cs.state.running.started_at)
        if cs.state.terminated:
            t = cs.state.terminated
            if t.finished_at:
                candidates.append(t.finished_at)
            elif t.started_at:
                candidates.append(t.started_at)

    # From pod conditions
    if pod.status.conditions:
        for cond in pod.status.conditions:
            if cond.last_transition_time:
                candidates.append(cond.last_transition_time)

    if not candidates:
        return _iso(pod.metadata.creation_timestamp)

    # Return the most recent
    def _to_dt(ts):
        if hasattr(ts, "tzinfo"):
            return ts.replace(tzinfo=timezone.utc) if ts.tzinfo is None else ts
        return datetime.min.replace(tzinfo=timezone.utc)

    latest = max(candidates, key=_to_dt)
    return _iso(latest)


def _get_owner_deployment(pod) -> str:
    """Derive deployment name from pod owner references or labels."""
    # Try owner reference chain: Pod → ReplicaSet → Deployment
    # We can only see the immediate owner here (ReplicaSet), so strip the rs hash
    if pod.metadata.owner_references:
        for ref in pod.metadata.owner_references:
            if ref.kind == "ReplicaSet":
                # ReplicaSet name = deployment-name + "-" + rs-hash (9 chars)
                parts = ref.name.rsplit("-", 1)
                if len(parts) == 2 and len(parts[1]) <= 10:
                    return parts[0]
                return ref.name
            if ref.kind == "Deployment":
                return ref.name
            if ref.kind == "StatefulSet":
                return ref.name

    # Fallback: strip the two trailing hash segments from pod name
    parts = pod.metadata.name.rsplit("-", 2)
    if len(parts) == 3:
        return parts[0]
    return pod.metadata.name


def _build_pipeline_record(pod, cs, container_spec) -> dict:
    """Assemble one unified record per container."""
    exec_status, cont_status_str = _container_execution_status(pod, cs)
    ns = pod.metadata.namespace
    labels = pod.metadata.labels or {}
    annotations = pod.metadata.annotations or {}

    description = (
        annotations.get("description")
        or annotations.get("app.kubernetes.io/description")
        or labels.get("app.kubernetes.io/component")
        or ""
    )

    deployment_name = _get_owner_deployment(pod)

    return {
        "pod_name":         pod.metadata.name,
        "container_name":   container_spec.name if container_spec else (cs.name if cs else ""),
        "deployment_name":  deployment_name,
        "namespace":        ns,
        "type":             _namespace_to_type(ns),
        "description":      description,
        "execution_status": exec_status,
        "container_status": cont_status_str,
        "pod_phase":        pod.status.phase or "Unknown",
        "ready":            cs.ready if cs else False,
        "restarts":         cs.restart_count if cs else 0,
        "image":            container_spec.image if container_spec else (cs.image if cs else ""),
        "node":             pod.spec.node_name,
        "pod_ip":           pod.status.pod_ip,
        "created_at":       _iso(pod.metadata.creation_timestamp),
        "updated_at":       _pod_updated_at(pod, cs),
        "age":              _age(pod.metadata.creation_timestamp),
    }


def _collect_pipeline_records(namespaces: list[str]) -> list[dict]:
    """Fetch pods from given namespaces and build one record per container."""
    _load_k8s()
    core = client.CoreV1Api()
    records = []

    for ns in namespaces:
        try:
            pod_list = core.list_namespaced_pod(namespace=ns)
        except client.exceptions.ApiException:
            continue

        for pod in pod_list.items:
            container_statuses = {cs.name: cs for cs in (pod.status.container_statuses or [])}
            spec_containers = pod.spec.containers or []

            if not spec_containers:
                continue

            for container_spec in spec_containers:
                cs = container_statuses.get(container_spec.name)
                records.append(_build_pipeline_record(pod, cs, container_spec))

    return records


def _summary_counts(records: list[dict]) -> dict:
    counts = {"Running": 0, "Pending": 0, "Success": 0, "Failed": 0, "Inactive": 0, "Unknown": 0}
    for r in records:
        key = r["execution_status"]
        counts[key] = counts.get(key, 0) + 1
    return counts


def _paginate(records: list[dict], page: int, size: int) -> list[dict]:
    start = (page - 1) * size
    return records[start: start + size]


def _pipeline_pods_response(
    ns_param: str,
    status_filter: str | None = None,
    type_filter: str | None = None,
    page: int = 1,
    size: int = 50,
) -> dict:
    namespaces = _resolve_namespaces(ns_param)
    records = _collect_pipeline_records(namespaces)

    # Always compute summary on unfiltered set (per namespace scope)
    summary = _summary_counts(records)

    # Apply status filter
    if status_filter:
        sf = status_filter.lower()
        status_map = {
            "running": "Running",
            "pending": "Pending",
            "queued":  "Pending",
            "success": "Success",
            "succeeded": "Success",
            "failed":  "Failed",
            "inactive": "Inactive",
            "unknown": "Unknown",
        }
        canonical = status_map.get(sf)
        if canonical:
            records = [r for r in records if r["execution_status"] == canonical]

    # Apply type filter
    if type_filter:
        tf = type_filter.strip().lower()
        records = [r for r in records if r["type"].lower() == tf]

    total = len(records)
    paginated = _paginate(records, page, size)

    return {
        "status":    "SUCCESS",
        "total":     total,
        "namespace": ns_param or "all",
        "filter":    status_filter or "all",
        "type":      type_filter or "all",
        "page":      page,
        "size":      size,
        "records":   paginated,
        "summary":   summary,
    }


# ---------------------------------------------------------------------------
# REST: Pipeline-Pods — overall + filtered
# ---------------------------------------------------------------------------

@app.route("/api/pipeline-pods")
def pipeline_pods_all():
    """
    GET /api/pipeline-pods
    Query params:
      namespace  – vibe-agents|vibe-mcp|vibe-apps|aipns|all  (default: all)
      status     – running|pending|success|failed|inactive|unknown
      type       – Agent|MCP|App|System
      page       – 1-based page number  (default: 1)
      size       – page size            (default: 50)
    """
    ns_param     = request.args.get("namespace", "all")
    status_f     = request.args.get("status") or None
    type_f       = request.args.get("type") or None
    page         = max(1, int(request.args.get("page", 1)))
    size         = max(1, min(200, int(request.args.get("size", 50))))
    return jsonify(_pipeline_pods_response(ns_param, status_f, type_f, page, size))


@app.route("/api/pipeline-pods/running")
def pipeline_pods_running():
    """GET /api/pipeline-pods/running — containers with execution_status=Running"""
    ns_param = request.args.get("namespace", "all")
    type_f   = request.args.get("type") or None
    page     = max(1, int(request.args.get("page", 1)))
    size     = max(1, min(200, int(request.args.get("size", 50))))
    return jsonify(_pipeline_pods_response(ns_param, "running", type_f, page, size))


@app.route("/api/pipeline-pods/pending")
def pipeline_pods_pending():
    """GET /api/pipeline-pods/pending — containers with execution_status=Pending"""
    ns_param = request.args.get("namespace", "all")
    type_f   = request.args.get("type") or None
    page     = max(1, int(request.args.get("page", 1)))
    size     = max(1, min(200, int(request.args.get("size", 50))))
    return jsonify(_pipeline_pods_response(ns_param, "pending", type_f, page, size))


@app.route("/api/pipeline-pods/success")
def pipeline_pods_success():
    """GET /api/pipeline-pods/success — containers with execution_status=Success"""
    ns_param = request.args.get("namespace", "all")
    type_f   = request.args.get("type") or None
    page     = max(1, int(request.args.get("page", 1)))
    size     = max(1, min(200, int(request.args.get("size", 50))))
    return jsonify(_pipeline_pods_response(ns_param, "success", type_f, page, size))


@app.route("/api/pipeline-pods/failed")
def pipeline_pods_failed():
    """GET /api/pipeline-pods/failed — containers with execution_status=Failed"""
    ns_param = request.args.get("namespace", "all")
    type_f   = request.args.get("type") or None
    page     = max(1, int(request.args.get("page", 1)))
    size     = max(1, min(200, int(request.args.get("size", 50))))
    return jsonify(_pipeline_pods_response(ns_param, "failed", type_f, page, size))


@app.route("/api/pipeline-pods/inactive")
def pipeline_pods_inactive():
    """GET /api/pipeline-pods/inactive — containers with execution_status=Inactive"""
    ns_param = request.args.get("namespace", "all")
    type_f   = request.args.get("type") or None
    page     = max(1, int(request.args.get("page", 1)))
    size     = max(1, min(200, int(request.args.get("size", 50))))
    return jsonify(_pipeline_pods_response(ns_param, "inactive", type_f, page, size))


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)
