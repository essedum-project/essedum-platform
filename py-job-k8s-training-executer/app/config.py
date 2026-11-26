"""Runtime configuration, read from environment variables (never hardcode secrets)."""
import os


def service_token() -> str:
    """Shared secret ICIP must send in the X-Service-Token header."""
    return os.getenv("EXECUTOR_SERVICE_TOKEN", "")


def k8s_namespace() -> str:
    return os.getenv("K8S_NAMESPACE", "essedum-training")
