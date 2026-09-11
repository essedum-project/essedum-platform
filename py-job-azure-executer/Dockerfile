FROM python:3.10-slim

WORKDIR /py-job-azure-executer

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5005

CMD ["python", "app.py"]