
# Use the official LiteLLM stable image — Prisma query engine is pre-compiled
# correctly for this architecture. We only add our config on top.
FROM ghcr.io/berriai/litellm:main-stable

# Copy config
COPY lite-llm/config /app/config

# Default port
EXPOSE 4000

# Entrypoint runs the LiteLLM proxy with our config
CMD ["litellm", "--config", "/app/config/config.yaml", "--host", "0.0.0.0", "--port", "4000"]
