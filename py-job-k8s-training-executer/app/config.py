"""Runtime configuration, read from environment variables (never hardcode secrets)."""
import os
from dataclasses import dataclass

SEVEN_DAYS = 7 * 24 * 3600


def service_token() -> str:
    """Shared secret ICIP must send in the X-Service-Token header."""
    return os.getenv("EXECUTOR_SERVICE_TOKEN", "")


@dataclass(frozen=True)
class Settings:
    namespace: str = "essedum-training"
    staging_image: str = "busybox:1.36"        # init container that prepares /workspace
    shm_size: str = "2Gi"                      # size of the /dev/shm memory volume
    gpu_resource_name: str = "nvidia.com/gpu"  # resource name used for GPU limits
    ttl_seconds_after_finished: int = SEVEN_DAYS

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            namespace=os.getenv("K8S_NAMESPACE", "essedum-training"),
            staging_image=os.getenv("TRAINING_STAGING_IMAGE", "busybox:1.36"),
            shm_size=os.getenv("TRAINING_SHM_SIZE", "2Gi"),
            gpu_resource_name=os.getenv("TRAINING_GPU_RESOURCE", "nvidia.com/gpu"),
            ttl_seconds_after_finished=int(os.getenv("TRAINING_JOB_TTL_SECONDS", str(SEVEN_DAYS))),
        )
