FROM langflowai/langflow:1.6.4

# Switch to root for system-level fixes and file operations
USER root

# --- OS-level vulnerability fix (SQLite) + CA bundle ---
RUN apt-get update && \
    apt-get install --only-upgrade -y libsqlite3-0 sqlite3 && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# --- Python-level fix (DeepDiff) ---
RUN python -m ensurepip --upgrade && \
    python -m pip install --no-cache-dir deepdiff==8.6.1 && \
    python -m pip check

# --- Discover the actual 'frontend' directory that Langflow serves ---
RUN python - <<'PY' > /tmp/lf_path.txt
import importlib, pathlib
p = pathlib.Path(importlib.import_module("langflow").__file__).parent / "frontend"
print(p)
PY

# --- Clean target directory and ensure it exists ---
RUN target="$(cat /tmp/lf_path.txt)" && rm -rf "$target"/* && mkdir -p "$target"

# --- Copy your built SPA contents to a temp folder ---
COPY src/frontend/build/ /tmp/build/

# --- Fix perms and move into the actual served directory ---
RUN target="$(cat /tmp/lf_path.txt)" && \
    find /tmp/build -type d -exec chmod 755 {} \; && \
    find /tmp/build -type f -exec chmod 644 {} \; && \
    cp -r /tmp/build/* "$target"/ && \
    find "$target" -type d -exec chmod 755 {} \; && \
    find "$target" -type f -exec chmod 644 {} \;

# Return to runtime user
USER user

EXPOSE 7860

CMD ["langflow", "run"]