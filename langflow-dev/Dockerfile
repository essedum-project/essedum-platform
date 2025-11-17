FROM langflowai/langflow:1.6.4
WORKDIR /app

# Switch to root for file operations during build
USER root

# 1) Discover the actual 'frontend' directory that FastAPI serves
RUN python - <<'PY' > /tmp/lf_path.txt
import importlib, pathlib
p = pathlib.Path(importlib.import_module("langflow").__file__).parent / "frontend"
print(p)
PY

# 2) Clean the target directory
RUN target="$(cat /tmp/lf_path.txt)" && rm -rf "$target"/* && mkdir -p "$target"

# 3) Copy your built SPA to a temp folder (no chmod here)
#    IMPORTANT: We copy the *contents* of build/, not another build/ level.
COPY src/frontend/build/ /tmp/build/

# 4) Fix perms in the temp folder so directories are traversable,
#    then copy into the actual serve dir; finally set readable perms in target.
RUN target="$(cat /tmp/lf_path.txt)" && \
    find /tmp/build -type d -exec chmod 755 {} \; && \
    find /tmp/build -type f -exec chmod 644 {} \; && \
    cp -r /tmp/build/* "$target"/ && \
    find "$target" -type d -exec chmod 755 {} \; && \
    find "$target" -type f -exec chmod 644 {} \;

# Return to the image's runtime user
USER user

EXPOSE 7860