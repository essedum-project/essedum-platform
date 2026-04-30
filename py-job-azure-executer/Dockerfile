FROM python:3.11-slim

WORKDIR /py-job-azure-executer

COPY . .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

EXPOSE 5005

CMD ["python", "app.py"]