import os
import boto3
import subprocess
import shutil
import random
import string
from datetime import datetime
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from kubernetes import client, config
import json, base64, requests

app = Flask(__name__)
#socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet", ping_interval=25, ping_timeout=60,)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="eventlet",
    ping_interval=25,
    ping_timeout=60,
    logger=True,           # <--- add
    engineio_logger=True   # <--- add
)



DOWNLOAD_DIR = "/tmp/downloads"
EXTRACT_DIR = "/tmp/source_code"
BUILDKIT_ADDR = os.getenv("BUILDKIT_ADDR", "tcp://buildkitd:1234")

os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(EXTRACT_DIR, exist_ok=True)


def iso_utc_now():
    return subprocess.check_output(
        ["date", "-u", "+%Y-%m-%dT%H:%M:%SZ"], text=True
    ).strip()


def log_to_client(message, step="info"):
    print(f"[{step}] {message}")
    socketio.emit(
        "pipeline_update", {"step": step, "message": message, "timestamp": iso_utc_now()}
    )


# REST API endpoint for deleting deployments
@app.route('/api/delete-deployment', methods=['POST', 'DELETE'])
def delete_deployment_rest():
    """
    REST API endpoint to delete a deployment, service, and associated secrets.
    Expected JSON body:
    {
      "deployment_name": "runner-service",
      "namespace": "aipns"   # optional, defaults to "aipns"
    }
    """
    try:
        data = request.get_json()
        deploy_name = data.get("deployment_name")
        target_namespace = data.get("namespace", "aipns")

        if not deploy_name:
            return jsonify({"status": "ERROR", "message": "deployment_name is required"}), 400

        # Sanitize deployment name to match what was used during creation
        import re
        deploy_name = deploy_name.lower()
        deploy_name = re.sub(r'[^a-z0-9-]', '-', deploy_name)
        if deploy_name[0].isdigit() or deploy_name[0] == '-':
            deploy_name = 'app-' + deploy_name
        deploy_name = re.sub(r'-+', '-', deploy_name)
        deploy_name = deploy_name.strip('-')

        # Load Kubernetes config
        try:
            config.load_incluster_config()
        except Exception:
            config.load_kube_config()

        k8s_apps = client.AppsV1Api()
        k8s_core = client.CoreV1Api()

        deletion_results = {
            "deployment": False,
            "service": False,
            "secret": False
        }
        errors = []

        # Delete Deployment
        try:
            k8s_apps.delete_namespaced_deployment(
                name=deploy_name,
                namespace=target_namespace,
                body=client.V1DeleteOptions(propagation_policy='Foreground')
            )
            deletion_results["deployment"] = True
        except client.exceptions.ApiException as e:
            if e.status != 404:
                errors.append(f"Deployment deletion error: {str(e)}")

        # Delete Service
        try:
            k8s_core.delete_namespaced_service(
                name=deploy_name,
                namespace=target_namespace
            )
            deletion_results["service"] = True
        except client.exceptions.ApiException as e:
            if e.status != 404:
                errors.append(f"Service deletion error: {str(e)}")

        # Delete associated Secret
        secret_name = f"{deploy_name}-secrets"
        try:
            k8s_core.delete_namespaced_secret(
                name=secret_name,
                namespace=target_namespace
            )
            deletion_results["secret"] = True
        except client.exceptions.ApiException as e:
            if e.status != 404:
                errors.append(f"Secret deletion error: {str(e)}")

        # Determine response
        if errors:
            return jsonify({
                "status": "PARTIAL",
                "deployment_name": deploy_name,
                "namespace": target_namespace,
                "deleted": deletion_results,
                "errors": errors,
                "message": "Some resources were deleted, but errors occurred"
            }), 207  # Multi-Status
        elif deletion_results["deployment"] or deletion_results["service"]:
            return jsonify({
                "status": "SUCCESS",
                "deployment_name": deploy_name,
                "namespace": target_namespace,
                "deleted": deletion_results,
                "message": f"Successfully deleted resources for {deploy_name}"
            }), 200
        else:
            return jsonify({
                "status": "NOT_FOUND",
                "deployment_name": deploy_name,
                "namespace": target_namespace,
                "message": f"No resources found for {deploy_name}"
            }), 404

    except Exception as e:
        return jsonify({
            "status": "ERROR",
            "message": f"Deletion failed: {str(e)}"
        }), 500


# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "builder-service"}), 200


# List deployments endpoint
@app.route('/api/list-deployments', methods=['GET'])
def list_deployments_rest():
    """
    REST API endpoint to list all deployments in a namespace.
    Query parameters:
    - namespace: optional, defaults to "aipns"
    """
    try:
        target_namespace = request.args.get("namespace", "aipns")

        # Load Kubernetes config
        try:
            config.load_incluster_config()
        except Exception:
            config.load_kube_config()

        k8s_apps = client.AppsV1Api()
        k8s_core = client.CoreV1Api()

        # List all deployments in namespace
        deployments = k8s_apps.list_namespaced_deployment(namespace=target_namespace)

        result = []
        for dep in deployments.items:
            # Get associated service if exists
            service_exists = False
            service_url = None
            try:
                svc = k8s_core.read_namespaced_service(name=dep.metadata.name, namespace=target_namespace)
                service_exists = True
                service_url = f"http://{dep.metadata.name}.{target_namespace}.svc.cluster.local"
            except client.exceptions.ApiException:
                pass

            # Check for associated secret
            secret_name = f"{dep.metadata.name}-secrets"
            secret_exists = False
            try:
                k8s_core.read_namespaced_secret(name=secret_name, namespace=target_namespace)
                secret_exists = True
            except client.exceptions.ApiException:
                pass

            result.append({
                "name": dep.metadata.name,
                "namespace": dep.metadata.namespace,
                "replicas": dep.status.replicas or 0,
                "ready_replicas": dep.status.ready_replicas or 0,
                "available_replicas": dep.status.available_replicas or 0,
                "unavailable_replicas": dep.status.unavailable_replicas or 0,
                "image": dep.spec.template.spec.containers[0].image if dep.spec.template.spec.containers else None,
                "created_at": dep.metadata.creation_timestamp.isoformat() if dep.metadata.creation_timestamp else None,
                "service_exists": service_exists,
                "service_url": service_url,
                "secret_exists": secret_exists,
                "status": "Ready" if (dep.status.ready_replicas or 0) == (dep.status.replicas or 0) and (dep.status.replicas or 0) > 0 else "Not Ready"
            })

        return jsonify({
            "status": "SUCCESS",
            "namespace": target_namespace,
            "deployments": result,
            "count": len(result)
        }), 200

    except Exception as e:
        return jsonify({
            "status": "ERROR",
            "message": f"Failed to list deployments: {str(e)}"
        }), 500


@socketio.on("connect")
def handle_connect():
    print("Client connected")
    emit("connection_response", {"data": "Connected to Builder service"})


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


@socketio.on("delete_deployment")
def handle_delete_deployment(data):
    """
    Delete a deployment, service, and associated secrets.
    Expected JSON 'data':
    {
      "deployment_name": "runner-service",
      "namespace": "aipns"   # optional, defaults to "aipns"
    }
    """
    try:
        deploy_name = data.get("deployment_name")
        target_namespace = data.get("namespace", "aipns")

        if not deploy_name:
            error_msg = "deployment_name is required"
            log_to_client(error_msg, step="ERROR")
            socketio.emit("delete_status", {"status": "ERROR", "message": error_msg})
            return

        # Sanitize deployment name to match what was used during creation
        import re
        deploy_name = deploy_name.lower()
        deploy_name = re.sub(r'[^a-z0-9-]', '-', deploy_name)
        if deploy_name[0].isdigit() or deploy_name[0] == '-':
            deploy_name = 'app-' + deploy_name
        deploy_name = re.sub(r'-+', '-', deploy_name)
        deploy_name = deploy_name.strip('-')

        log_to_client(f"Starting deletion of {deploy_name} in namespace {target_namespace}...", step="DELETE_INIT")

        # Load Kubernetes config
        try:
            config.load_incluster_config()
        except Exception:
            config.load_kube_config()

        k8s_apps = client.AppsV1Api()
        k8s_core = client.CoreV1Api()

        deletion_results = {
            "deployment": False,
            "service": False,
            "secret": False
        }

        # Delete Deployment
        try:
            k8s_apps.delete_namespaced_deployment(
                name=deploy_name,
                namespace=target_namespace,
                body=client.V1DeleteOptions(propagation_policy='Foreground')
            )
            deletion_results["deployment"] = True
            log_to_client(f"✓ Deployment '{deploy_name}' deleted successfully", step="DELETE")
        except client.exceptions.ApiException as e:
            if e.status == 404:
                log_to_client(f"⚠ Deployment '{deploy_name}' not found (already deleted?)", step="DELETE")
            else:
                log_to_client(f"✗ Failed to delete deployment: {str(e)}", step="DELETE_ERROR")

        # Delete Service
        try:
            k8s_core.delete_namespaced_service(
                name=deploy_name,
                namespace=target_namespace
            )
            deletion_results["service"] = True
            log_to_client(f"✓ Service '{deploy_name}' deleted successfully", step="DELETE")
        except client.exceptions.ApiException as e:
            if e.status == 404:
                log_to_client(f"⚠ Service '{deploy_name}' not found (already deleted?)", step="DELETE")
            else:
                log_to_client(f"✗ Failed to delete service: {str(e)}", step="DELETE_ERROR")

        # Delete associated Secret (if exists)
        secret_name = f"{deploy_name}-secrets"
        try:
            k8s_core.delete_namespaced_secret(
                name=secret_name,
                namespace=target_namespace
            )
            deletion_results["secret"] = True
            log_to_client(f"✓ Secret '{secret_name}' deleted successfully", step="DELETE")
        except client.exceptions.ApiException as e:
            if e.status == 404:
                log_to_client(f"⚠ Secret '{secret_name}' not found (no secrets to clean up)", step="DELETE")
            else:
                log_to_client(f"✗ Failed to delete secret: {str(e)}", step="DELETE_ERROR")

        # Send final status
        if deletion_results["deployment"] or deletion_results["service"]:
            log_to_client(f"Deletion completed for {deploy_name}", step="DELETE_COMPLETE")
            socketio.emit("delete_status", {
                "status": "SUCCESS",
                "deployment_name": deploy_name,
                "namespace": target_namespace,
                "deleted": deletion_results,
                "message": f"Successfully deleted resources for {deploy_name}"
            })
        else:
            log_to_client(f"No resources found to delete for {deploy_name}", step="DELETE_COMPLETE")
            socketio.emit("delete_status", {
                "status": "NOT_FOUND",
                "deployment_name": deploy_name,
                "namespace": target_namespace,
                "message": f"No resources found for {deploy_name}"
            })

    except Exception as e:
        error_msg = f"Deletion failed: {str(e)}"
        log_to_client(error_msg, step="DELETE_ERROR")
        socketio.emit("delete_status", {"status": "ERROR", "message": error_msg})


@socketio.on("start_pipeline")
def handle_pipeline_trigger(data):
    """
    Expected JSON 'data':
    {
      "minio_endpoint": "...", "access_key": "...", "secret_key": "...",
      "bucket_name": "...", "file_path": "...",
      "target_image_tag": "acrreq0762935.azurecr.io/app:v1",
      "deployment_name": "runner-service",
      "namespace": "aipns"   # optional
    }
    """
    try:
        log_to_client("Pipeline Triggered. Validating inputs...", step="INIT")

        # 1) CLEANUP
        if os.path.exists(EXTRACT_DIR):
            shutil.rmtree(EXTRACT_DIR)
        os.makedirs(EXTRACT_DIR, exist_ok=True)

        # 2) DOWNLOAD (S3/MinIO)
        log_to_client(
            f"Downloading {data['file_path']} from {data.get('minio_endpoint', 's3')}",
            step="DOWNLOAD",
        )
        s3 = boto3.client(
            "s3",
            endpoint_url= os.getenv("MINIO_ENDPOINT"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key= os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1"),
        )
        local_zip = os.path.join(DOWNLOAD_DIR, "source.zip")
        s3.download_file(data["bucket_name"], data["file_path"], local_zip)
        log_to_client("Download complete.", step="DOWNLOAD")
        #suffix = ''.join(random.choices(string.ascii_lowercase, k=5))
        deploy_name = data["deployment_name"]

        # Sanitize deployment name to meet Kubernetes DNS-1035 requirements:
        # - Must start with alphabetic character
        # - Only lowercase alphanumeric and hyphens
        # - End with alphanumeric character
        import re
        deploy_name = deploy_name.lower()
        deploy_name = re.sub(r'[^a-z0-9-]', '-', deploy_name)  # Replace invalid chars with hyphen
        if deploy_name[0].isdigit() or deploy_name[0] == '-':
            deploy_name = 'app-' + deploy_name  # Prepend 'app-' if starts with digit or hyphen
        deploy_name = re.sub(r'-+', '-', deploy_name)  # Remove consecutive hyphens
        deploy_name = deploy_name.strip('-')  # Remove leading/trailing hyphens

        target_namespace = data.get("namespace", "aipns")


        # Replace localhost:5000 with the cluster-internal registry (using ClusterIP for kubelet compatibility)
        base_repo = data["target_image_tag"].rsplit(":", 1)[0]  # e.g., localhost:5000/test-adk-app
        base_repo = base_repo.replace("localhost:5000", "10.104.220.183:5000")
        # Normalize any DNS or NodePort references to ClusterIP
        base_repo = base_repo.replace("192.168.28.41:32000", "10.104.220.183:5000")
        base_repo = base_repo.replace("registry.container-registry.svc.cluster.local:5000", "10.104.220.183:5000")
        #tag  =  data["target_image_tag"].split(":")[1]
        #if not acr_tag_exists("acrreq0762935.azurecr.io", base_repo, tag, "/root/.docker/config.json"):
         #raise Exception(f"Push check failed: {image_tag} not present in ACR")

        uniq_tag  = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        image_tag = f"{base_repo}:v1-{uniq_tag}"            # e.g., registry.container-registry.svc.cluster.local:5000/test-adk-app:v1-20251217-1905


        # 3) UNZIP
        log_to_client("Extracting code...", step="EXTRACT")
        subprocess.run(["unzip", "-o", local_zip, "-d", EXTRACT_DIR], check=True)


        # 4) DETECT PROJECT ROOT
        build_context_path = EXTRACT_DIR
        dockerfile_exists = False
        for root, _, files in os.walk(EXTRACT_DIR):
            if "Dockerfile" in files:
                build_context_path = root
                dockerfile_exists = True
                break

        if not dockerfile_exists:
            req_path = None
            for root, _, files in os.walk(EXTRACT_DIR):
                if "requirements.txt" in files:
                    req_path = root
                    break
            if not req_path:
                raise Exception("Dockerfile and requirements.txt missing; cannot proceed.")
            build_context_path = req_path
            fallback_dockerfile = "/opt/fallback/Dockerfile"
            if os.path.exists(fallback_dockerfile):
                shutil.copy(fallback_dockerfile, os.path.join(build_context_path, "Dockerfile"))
                log_to_client("Dockerfile missing; fallback applied.", step="PREP")
            else:
                raise Exception("Fallback Dockerfile not found in /opt/fallback.")


        log_to_client(f"Project root detected at {build_context_path}", step="PREP")


        # 5) --- NEW STEP: HANDLE SECRETS ---
        env_file_path = os.path.join(build_context_path, ".env")
        secret_name = f"{deploy_name}-secrets"
        has_secrets = False

        try:
            config.load_incluster_config()
        except Exception:
            # Fallback for local testing
            config.load_kube_config()

        k8s_core = client.CoreV1Api()

        # Check if .env exists in the root of extracted code
        if os.path.exists(env_file_path):
            log_to_client(f"Found .env file. Creating Secret {secret_name}...", step="SECRET")
            secret_obj = create_env_secret(secret_name, target_namespace, env_file_path)

            if secret_obj:
                try:
                    # Upsert Logic for Secret
                    k8s_core.delete_namespaced_secret(name=secret_name, namespace=target_namespace)
                except:
                    pass # Ignore if it didn't exist

                k8s_core.create_namespaced_secret(namespace=target_namespace, body=secret_obj)
                has_secrets = True
                log_to_client("Secret created successfully.", step="SECRET")

        else:
             # Fallback order: explicit 'secret_name' from client payload -> "{deploy_name}-secrets" -> "adk-global-secrets"
             fallback_candidates = [
                     data.get("secret_name"),
                     secret_name,
                     "adk-global-secrets",
                     ]

        # 6) BUILD & PUSH (BuildKit)
        log_to_client(f"Starting BuildKit for {image_tag}...", step="BUILD")

        cmd = [
            "buildctl",
            "--addr",
            BUILDKIT_ADDR,
            "build",
            "--frontend",
            "dockerfile.v0",
            "--local",
            f"context={build_context_path}",
            "--local",
            f"dockerfile={build_context_path}",
            "--output",
            f"type=image,name={image_tag},push=true",
            "--no-cache",
        ]

        process = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
        )

        for line in iter(process.stdout.readline, ""):
            if line:
                socketio.emit("build_log", {"log": line.rstrip()})

        process.stdout.close()
        return_code = process.wait()

        if return_code != 0:
            raise Exception("Buildctl failed. Check build logs.")

        log_to_client("Build and Push to ACR Registry Successful", step="BUILD")

        # 7) DEPLOY TO K8S
        secret_to_use = secret_name if has_secrets else None

        log_to_client(
            f"Deploying {image_tag} to {deploy_name} in {target_namespace}...",
            step="DEPLOY",
        )


        k8s_apps = client.AppsV1Api()

        try:
            # If it exists, PATCH
            k8s_apps.read_namespaced_deployment(
                name=deploy_name, namespace=target_namespace
            )
            log_to_client("Deployment exists. Updating image...", step="DEPLOY")
            patch = {
                "spec": {
                    "template": {
                        "spec": {
                            "containers": [{"name": "app-container", "image": image_tag}]
                        }
                    }
                }
            }
            k8s_apps.patch_namespaced_deployment(
                name=deploy_name, namespace=target_namespace, body=patch
            )
            log_to_client("Update successful.", step="COMPLETE")
        except client.exceptions.ApiException as e:
            if e.status == 404:
                log_to_client(
                    "Deployment not found. Creating new deployment...", step="DEPLOY"
                )
                deployment_obj = create_deployment_object(
                    deploy_name, image_tag, target_namespace, secret_to_use
                )
                k8s_apps.create_namespaced_deployment(
                    namespace=target_namespace, body=deployment_obj
                )
                log_to_client("Creation successful.", step="COMPLETE")
            else:
                raise Exception("Deployment failed. Check build logs.")

        # --- STEP 9: ENSURE SERVICE EXISTS ---
        try:
            k8s_core.read_namespaced_service(name=deploy_name, namespace=target_namespace)
            # Optional: patch to correct targetPort if needed
            k8s_core.patch_namespaced_service(
                name=deploy_name, namespace=target_namespace,
                body={"spec": {"ports": [{"name":"http","port":80,"targetPort":5000}],
                               "selector": {"app": deploy_name}}}
            )

        except client.exceptions.ApiException as e:
            if e.status == 404:
                # Create a simple ClusterIP service (Internal Only)
                svc = client.V1Service(
                    metadata=client.V1ObjectMeta(name=deploy_name, namespace=target_namespace),
                    spec=client.V1ServiceSpec(
                        selector={"app": deploy_name},
                        ports=[client.V1ServicePort(port=80, target_port=5000)],
                        type="ClusterIP" #
                    )
                )
                k8s_core.create_namespaced_service(namespace=target_namespace, body=svc)



        ok = wait_for_deployment_ready(k8s_apps, deploy_name, target_namespace, 180)
        if not ok:
            raise Exception("Deployment did not become Ready within timeout")


        # --- STEP 8: CONSTRUCT DNS LINK ---
        # Format: http://{service_name}.{namespace}.svc.cluster.local
        internal_dns_url = f"http://{deploy_name}.{target_namespace}.svc.cluster.local"

        log_to_client(f"App deployed internally at: {internal_dns_url}", step="COMPLETE")

        emit('pipeline_status', {
            'status': 'SUCCESS',
            'url': internal_dns_url,
            'message': 'App accessible via UI Proxy'
            })
            #socketio.emit("pipeline_status", {"status": "SUCCESS"})

    except Exception as e:
        log_to_client(f"Pipeline failed: {e}", step="ERROR")
        socketio.emit("pipeline_status", {"status": "ERROR", "message": str(e)})


def create_deployment_object(name, image, namespace, secret_name=None):
    """Creates a V1Deployment object for the runner"""

    env_from = []
    if secret_name:
        env_from = [
                client.V1EnvFromSource(secret_ref=client.V1SecretEnvSource(name=secret_name))
                ]


    container = client.V1Container(
        name="app-container",
        image=image,
        image_pull_policy="Always",
        ports=[client.V1ContainerPort(container_port=5000)],
        env_from=env_from,
        readiness_probe=client.V1Probe(
            tcp_socket=client.V1TCPSocketAction(port=5000),
            period_seconds=10,
            timeout_seconds=5,
            failure_threshold=6
        ),
    )

    template = client.V1PodTemplateSpec(
        metadata=client.V1ObjectMeta(labels={"app": name}),
        spec=client.V1PodSpec(
            containers=[container],
            image_pull_secrets=[client.V1LocalObjectReference(name="regcred")],  # << add
        ),
    )


    spec = client.V1DeploymentSpec(
        replicas=1,
        selector=client.V1LabelSelector(match_labels={"app": name}),
        template=template,
    )

    deployment = client.V1Deployment(
        api_version="apps/v1",
        kind="Deployment",
        metadata=client.V1ObjectMeta(name=name, namespace=namespace),
        spec=spec,
    )
    return deployment



def find_existing_secret(k8s_core, namespace, candidates):
    """Return the first existing Secret name from the ordered candidates list."""
    for name in [c for c in candidates if c]:
        try:
            k8s_core.read_namespaced_secret(name=name, namespace=namespace)
            return name
        except client.exceptions.ApiException as e:
            if e.status == 404:
                continue
            else:
                raise
    return None


def create_env_secret(secret_name, namespace, env_file_path):
    """Reads a .env file and creates a Kubernetes Secret"""
    data = {}

    if not os.path.exists(env_file_path):
        return None

    with open(env_file_path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()

            # Skip empty or commented lines
            if not line or line.startswith("#"):
                continue

            # Optional 'export ' prefix
            if line.lower().startswith("export "):
                line = line[7:].lstrip()

            # Must contain '='
            if "=" not in line:
                # Safely ignore malformed lines instead of crashing
                continue

            key, value = line.split("=", 1)

            key = key.strip()
            value = value.strip()

            # Trim surrounding quotes if present
            if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                value = value[1:-1]

            # Skip if key is empty
            if not key:
                continue

            data[key] = value

    if not data:
        return None

    # Use string_data so client handles base64 encoding for us
    secret = client.V1Secret(
        metadata=client.V1ObjectMeta(name=secret_name, namespace=namespace),
        string_data=data,
        type="Opaque",
    )
    return secret



def wait_for_deployment_ready(api, name, namespace, timeout_seconds=120):
    import time
    start = time.time()
    while time.time() - start < timeout_seconds:
        dep = api.read_namespaced_deployment(name=name, namespace=namespace)
        desired = dep.status.replicas or 0
        ready   = dep.status.ready_replicas or 0
        if desired > 0 and ready == desired:
            return True
        time.sleep(2)
    return False


def acr_tag_exists(registry, repo, tag, dockerconfigjson_path="/root/.docker/config.json"):
    with open(dockerconfigjson_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    cred = cfg["auths"][registry]
    username = cred.get("username", "")
    password = cred.get("password", "")
    # 1) Get bearer token
    r = requests.get(
        f"https://{registry}/oauth2/token",
        params={"service": registry, "scope": f"repository:{repo}:pull"},
        auth=(username, password),
        timeout=10,
    )
    r.raise_for_status()
    token = r.json()["access_token"]
    # 2) Query manifest
    h = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.docker.distribution.manifest.v2+json",
    }
    r = requests.get(f"https://{registry}/v2/{repo}/manifests/{tag}", headers=h, timeout=10)
    return r.status_code == 200



if __name__ == "__main__":
    print("Starting WebSocket Server on 0.0.0.0:5000...")
    socketio.run(app, host="0.0.0.0", port=5000)