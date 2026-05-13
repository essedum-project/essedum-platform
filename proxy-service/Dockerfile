# build trigger: pipeline recovery

FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY proxy_service.py .
ENV TARGET_NAMESPACE=aipns
EXPOSE 8080
CMD ["python", "proxy_service.py"]

