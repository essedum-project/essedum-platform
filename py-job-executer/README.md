# Python Job Executor

> Scope & requirements: [docs/SCOPE.md](docs/SCOPE.md)
> Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

General-purpose Python job executor for the Essedum platform. Runs pipeline scripts locally or with MinIO/S3 storage.

## Setup

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Edit `conf/conf.ini`:

```ini
[DEFAULT]
ThreadCount = 4
WorkingDirectory = /tmp/Jobs/
```

## Running

```bash
python app.py
```

Swagger UI available at `http://localhost:5000/swagger`.
