FROM langflowai/langflow:latest

# Create flows directory (optional)
RUN mkdir -p /app/flows

# Copy your flow JSON files (if any)
# COPY *.json /app/flows/

# Set env to load flows (optional)
ENV LANGFLOW_LOAD_FLOWS_PATH=/app/flows

EXPOSE 7866

CMD ["python", "-m", "langflow", "run", "--host", "0.0.0.0", "--port", "7866"]