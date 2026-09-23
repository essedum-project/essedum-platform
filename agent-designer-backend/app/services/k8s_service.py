"""
Kubernetes helpers for deploying agent-designer pipeline runners.

Architecture:
  - Deployment + Service → vibe-agents namespace (pods appear there)
  - ExternalName Service + Ingress → aipns namespace (TLS secret lives in aipns)
"""
import re
import logging
import os

log = logging.getLogger(__name__)

RUNNER_IMAGE = os.environ.get(
    "RUNNER_IMAGE", "192.168.28.36:5000/agent-designer-runner:V-1.0"
)
AGENT_NS = "vibe-agents"
INGRESS_NS = "aipns"
BACKEND_URL = os.environ.get(
    "AGENT_DESIGNER_INTERNAL_URL",
    "http://agent-designer-backend.aipns.svc.cluster.local:8180",
)
HOST = os.environ.get("CLUSTER_HOST", "essedum-lfn.infosys.com")
TLS_SECRET = "essedum-lfn-tls"


def _deploy_name(pipeline) -> str:
    """Derive a valid RFC-1123 K8s name from the pipeline's display name."""
    slug = pipeline.name.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    slug = slug[:48] or "pipeline"
    return f"ad-{slug}"


def _k8s():
    from kubernetes import client, config
    try:
        config.load_incluster_config()
    except Exception:
        config.load_kube_config()
    return client.AppsV1Api(), client.CoreV1Api(), client.NetworkingV1Api(), client


def deploy_pipeline(pipeline) -> None:
    apps, core, net, client = _k8s()
    name = _deploy_name(pipeline)

    # ── Deployment in vibe-agents ──────────────────────────────────────────────
    dep = client.V1Deployment(
        metadata=client.V1ObjectMeta(name=name, namespace=AGENT_NS, labels={"app": name}),
        spec=client.V1DeploymentSpec(
            replicas=1,
            selector=client.V1LabelSelector(match_labels={"app": name}),
            template=client.V1PodTemplateSpec(
                metadata=client.V1ObjectMeta(labels={"app": name}),
                spec=client.V1PodSpec(
                    containers=[client.V1Container(
                        name="runner",
                        image=RUNNER_IMAGE,
                        ports=[client.V1ContainerPort(container_port=5000)],
                        env=[
                            client.V1EnvVar(name="FLOW_ID", value=str(pipeline.flow_id)),
                            client.V1EnvVar(name="AGENT_DESIGNER_URL", value=BACKEND_URL),
                        ],
                        liveness_probe=client.V1Probe(
                            http_get=client.V1HTTPGetAction(path="/health", port=5000),
                            initial_delay_seconds=15,
                            period_seconds=30,
                            failure_threshold=3,
                        ),
                    )],
                    image_pull_secrets=[client.V1LocalObjectReference(name="regcred")],
                ),
            ),
        ),
    )
    try:
        apps.create_namespaced_deployment(namespace=AGENT_NS, body=dep)
        log.info("Created deployment %s in %s", name, AGENT_NS)
    except client.exceptions.ApiException as e:
        if e.status == 409:
            apps.patch_namespaced_deployment(name=name, namespace=AGENT_NS, body=dep)
            log.info("Patched existing deployment %s", name)
        else:
            raise

    # ── Service in vibe-agents ─────────────────────────────────────────────────
    svc = client.V1Service(
        metadata=client.V1ObjectMeta(name=name, namespace=AGENT_NS),
        spec=client.V1ServiceSpec(
            selector={"app": name},
            ports=[client.V1ServicePort(port=80, target_port=5000)],
            type="ClusterIP",
        ),
    )
    try:
        core.create_namespaced_service(namespace=AGENT_NS, body=svc)
        log.info("Created service %s in %s", name, AGENT_NS)
    except client.exceptions.ApiException as e:
        if e.status != 409:
            raise

    # ── ExternalName service in aipns so the ingress can reach vibe-agents ─────
    ext_svc = client.V1Service(
        metadata=client.V1ObjectMeta(name=name, namespace=INGRESS_NS),
        spec=client.V1ServiceSpec(
            type="ExternalName",
            external_name=f"{name}.{AGENT_NS}.svc.cluster.local",
            ports=[client.V1ServicePort(port=80)],
        ),
    )
    try:
        core.create_namespaced_service(namespace=INGRESS_NS, body=ext_svc)
        log.info("Created ExternalName service %s in %s", name, INGRESS_NS)
    except client.exceptions.ApiException as e:
        if e.status != 409:
            log.warning("Could not create ExternalName service %s: %s — continuing", name, e)

    # ── Ingress in aipns ──────────────────────────────────────────────────────
    ingress = client.V1Ingress(
        metadata=client.V1ObjectMeta(
            name=name,
            namespace=INGRESS_NS,
            annotations={
                "nginx.ingress.kubernetes.io/rewrite-target": "/$2",
                "nginx.ingress.kubernetes.io/proxy-read-timeout": "300",
            },
        ),
        spec=client.V1IngressSpec(
            ingress_class_name="nginx",
            rules=[client.V1IngressRule(
                host=HOST,
                http=client.V1HTTPIngressRuleValue(
                    paths=[client.V1HTTPIngressPath(
                        path=f"/apps/{name}(/|$)(.*)",
                        path_type="ImplementationSpecific",
                        backend=client.V1IngressBackend(
                            service=client.V1IngressServiceBackend(
                                name=name,
                                port=client.V1ServiceBackendPort(number=80),
                            )
                        ),
                    )]
                ),
            )],
            tls=[client.V1IngressTLS(hosts=[HOST], secret_name=TLS_SECRET)],
        ),
    )
    try:
        net.create_namespaced_ingress(namespace=INGRESS_NS, body=ingress)
        log.info("Created ingress %s in %s", name, INGRESS_NS)
    except client.exceptions.ApiException as e:
        if e.status != 409:
            # Ingress admission webhook may be unavailable (e.g. ingress-nginx controller pending).
            # Log and continue — the Deployment + Service in vibe-agents are already running.
            log.warning("Could not create Ingress %s: %s — pipeline pod is still running", name, e)


def undeploy_pipeline(pipeline) -> None:
    apps, core, net, client = _k8s()
    name = _deploy_name(pipeline)

    for fn, kwargs in [
        (net.delete_namespaced_ingress,   {"name": name, "namespace": INGRESS_NS}),
        (core.delete_namespaced_service,  {"name": name, "namespace": INGRESS_NS}),
        (core.delete_namespaced_service,  {"name": name, "namespace": AGENT_NS}),
        (apps.delete_namespaced_deployment, {"name": name, "namespace": AGENT_NS}),
    ]:
        try:
            fn(**kwargs)
            log.info("Deleted %s / %s", name, kwargs["namespace"])
        except client.exceptions.ApiException as e:
            if e.status != 404:
                raise
