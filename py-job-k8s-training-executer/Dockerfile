FROM python:3.11-slim

WORKDIR /py-job-k8s-training-executer

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 5010

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5010"]
