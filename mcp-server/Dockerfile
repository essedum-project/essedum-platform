#Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose MCP server port
EXPOSE 8000

# Command to run MCP server
CMD ["python", "mcp_server.py"]
