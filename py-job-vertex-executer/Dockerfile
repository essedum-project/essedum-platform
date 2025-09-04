FROM python:3.11-slim

WORKDIR /py-job-vertex-executer

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5007

CMD ["python", "app.py"]