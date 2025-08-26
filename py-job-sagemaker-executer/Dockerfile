FROM python:3.11-slim

WORKDIR /py-job-sagemaker-executer

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5002

CMD ["python", "app.py"]