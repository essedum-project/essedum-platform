FROM python:3.12-slim

WORKDIR /py-job-executer

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["python", "app.py"]