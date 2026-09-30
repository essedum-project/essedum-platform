FROM python:3.11-slim
WORKDIR /app
ENV PIP_NO_CACHE_DIR=1 \
    PRESIDIO_ENABLED=true \
    PRESIDIO_NLP_MODEL=en_core_web_sm
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
 && find /usr/local/lib/python3.11 -name "__pycache__" -type d -prune -exec rm -rf {} +
COPY main.py .
EXPOSE 30002
CMD ["python", "main.py"]
