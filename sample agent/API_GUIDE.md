# API Usage Guide

## Telecom Multi-Agent Q&A REST API

Flask REST API server with two agents:
1. **Validation Agent**: Validates if questions are telecom-related
2. **Answering Agent**: Provides answers to valid telecom questions

---

## Installation

```bash
pip install flask flask-cors
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

---

## Starting the Server

```bash
python app.py
```

Server runs on: `http://localhost:5000`

---

## API Endpoints

### 1. Health Check
**GET** `/health`

Check if the API and agents are running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-20T15:30:00",
  "agents": {
    "validation_agent": "active",
    "answering_agent": "active"
  },
  "vllm_endpoint": "http://localhost:30858/v1/completions"
}
```

---

### 2. Ask Question (Main Endpoint)
**POST** `/api/ask`

Submit a question for validation and answering.

**Request:**
```json
{
  "question": "What is 5G technology?",
  "session_id": "optional-session-123"
}
```

**Success Response (Valid Question):**
```json
{
  "status": "success",
  "question": "What is 5G technology?",
  "validation": {
    "passed": true,
    "reason": "Question is about 5G mobile technology"
  },
  "answer": "5G is the fifth generation of cellular network technology...",
  "timestamp": "2026-01-20T15:30:00"
}
```

**Rejected Response (Non-Telecom Question):**
```json
{
  "status": "rejected",
  "question": "What is the capital of France?",
  "validation": {
    "passed": false,
    "reason": "Question is not related to telecommunications"
  },
  "message": "This question is not telecom-related. Please ask questions about...",
  "timestamp": "2026-01-20T15:30:00"
}
```

---

### 3. Validate Only
**POST** `/api/validate`

Validate a question without generating an answer.

**Request:**
```json
{
  "question": "How does fiber optic internet work?"
}
```

**Response:**
```json
{
  "status": "valid",
  "question": "How does fiber optic internet work?",
  "reason": "Question is about fiber optic technology",
  "timestamp": "2026-01-20T15:30:00"
}
```

---

## Example Usage

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Ask a question
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is 5G technology?", "session_id": "user-123"}'

# Validate only
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"question": "Explain fiber optic internet"}'
```

### Using Python requests

```python
import requests

# Ask a question
response = requests.post(
    'http://localhost:5000/api/ask',
    json={
        'question': 'What is the difference between 4G and 5G?',
        'session_id': 'user-123'
    }
)

result = response.json()
if result['status'] == 'success':
    print(f"Answer: {result['answer']}")
elif result['status'] == 'rejected':
    print(f"Rejected: {result['message']}")
```

### Using PowerShell

```powershell
# Ask a question
$body = @{
    question = "What is fiber optic internet?"
    session_id = "user-123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ask" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## Telecom Topics Accepted

The validation agent accepts questions about:
- Internet services (broadband, fiber, DSL)
- Mobile networks (5G, 4G, LTE, 3G)
- Telecom providers and carriers
- Network infrastructure
- Telecommunications equipment
- VoIP and calling services
- Satellite communications
- Cable services
- Telecom billing and plans
- Network troubleshooting
- Wireless technology

---

## Error Responses

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Missing 'question' field in request body",
  "timestamp": "2026-01-20T15:30:00"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Error details...",
  "timestamp": "2026-01-20T15:30:00"
}
```

**503 Service Unavailable:**
```json
{
  "status": "error",
  "message": "Validation service unavailable",
  "timestamp": "2026-01-20T15:30:00"
}
```

---

## Configuration

The API uses settings from `src/config.py` and `.env` file:

```env
# LiteLLM Configuration
VLLM_URL=http://litellm:4000/chat/completions
VLLM_MODEL_NAME=Llama-3.2-3B-Instruct
VLLM_API_KEY=sk-1234
USE_VLLM=True

# Model Settings
TEMPERATURE=0.7
MAX_TOKENS=500
TIMEOUT_SECONDS=120
```

---

## Architecture

```
User Request → Flask API → Validation Agent → Answering Agent → Response
                              ↓                      ↓
                         vLLM Service          vLLM Service
```

1. User sends POST request to `/api/ask`
2. Validation Agent checks if question is telecom-related
3. If valid, Answering Agent generates response
4. If invalid, returns rejection message
5. JSON response returned to user
