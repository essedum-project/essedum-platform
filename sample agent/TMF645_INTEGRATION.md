# TMF 645 Service Qualification - LangGraph Integration

## Overview

This integration combines the TMF 645 service qualification agents with the LangGraph workflow system to create a complete telecom service qualification pipeline.

## Architecture

### Workflow Components

```
┌─────────────────┐
│   Chat Input    │  Receives TMF 645 service qualification request
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ TMF645Validator │  Validates request format and required fields
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ServiceQualifier │  Qualifies service via API and checks network capacity
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Chat Output   │  Returns qualification result to user
└─────────────────┘
```

### State Management

The workflow uses `WorkflowState` (Pydantic BaseModel) to track:

- `tmf645_request`: TMF 645 service qualification request JSON
- `validation_result`: Result from validator agent
- `validation_passed`: Boolean flag for validation success
- `qualification_result`: Result from qualifier agent  
- `service_qualified`: Boolean flag for service qualification

## Components

### 1. TMF645 Validator Node

**File**: [src/nodes.py](src/nodes.py) - `node_tmf645_validator()`

**Purpose**: Validates TMF 645 service qualification request format

**Validation Checks**:
- Required fields: `instantSyncQualification`, `serviceQualificationItem`
- Service item structure: `id`, `service`, `action`
- Service details: `serviceType`, `serviceSpecification`, `serviceCharacteristic`
- Valid action types: "add", "modify", "delete", "noChange"
- Valid service types: "URLLC", "eMBB", "mMTC"

**Input**: `state.tmf645_request`

**Output**:
```python
{
    "validation_passed": bool,
    "validation_result": {
        "validation_status": "passed" | "failed" | "error",
        "message": str,
        "is_valid": bool,
        "details": dict
    }
}
```

### 2. Service Qualifier Node

**File**: [src/nodes.py](src/nodes.py) - `node_service_qualifier()`

**Purpose**: Qualifies service based on network capacity predictions from federated API

**Qualification Steps**:
1. Check if validation passed (skip if failed)
2. Extract service requirements (bandwidth, latency, service type)
3. Check network capacity via Federated API health endpoint
4. Analyze if network can support service requirements
5. Compare requirements against service type thresholds (URLLC, eMBB, mMTC)

**Input**: `state.tmf645_request`, `state.validation_passed`

**Output**:
```python
{
    "service_qualified": bool,
    "qualification_result": {
        "qualification_status": "qualified" | "not_qualified" | "error" | "skipped",
        "message": str,
        "is_qualified": bool,
        "details": dict
    }
}
```

### 3. Graph Builder

**File**: [src/graph_builder.py](src/graph_builder.py)

**Node Function Map**:
```python
node_function_map = {
    "ChatInput-viP4f": nodes.node_chatinput_vip4f,
    "TMF645Validator": nodes.node_tmf645_validator,
    "ServiceQualifier": nodes.node_service_qualifier,
    "ChatOutput-AVpjO": nodes.node_chatoutput_avpjo,
}
```

**Workflow Construction**:
- Parses design JSON
- Creates StateGraph with WorkflowState
- Adds nodes from node_function_map
- Adds edges between nodes
- Sets entry and exit points
- Compiles workflow

## Configuration

### AppConfig Settings

**File**: [src/config.py](src/config.py)

```python
config = AppConfig(
    federated_api_url="http://localhost:8092",
    azure_openai_endpoint="https://your-endpoint.openai.azure.com/",
    azure_openai_api_key="your-api-key",
    azure_openai_deployment="gpt-4o-mini"
)
```

### API Dependencies

1. **Federated Learning API** (Port 8092)
   - Endpoint: `/health` - Check model availability
   - Endpoint: `/features` - Get required feature names and order
   - Endpoint: `/predict` - Get network predictions (optional, for advanced capacity checks)
   - Input: Network traffic data (11 features × 11+ timesteps)
   - Output: Predicted network metrics

**Service qualification is determined by**:
- Checking federated API health status
- Analyzing service requirements (bandwidth, latency, service type)
- Comparing requirements against network capacity thresholds
- Service type specific limits (URLLC: 500 Mbps, eMBB: 1 Gbps)

## Usage

### 1. Setup

```bash
# Install dependencies
cd LEOSMPLG95195-leo1311
pip install -r requirements.txt

# Start federated API
python federatedapi.py
```

### 2. Run Test Script

```bash
python test_tmf645_workflow.py
```

### 3. Programmatic Usage

```python
from src.graph_builder import create_workflow
from src.config import AppConfig
from src.workflow_state import WorkflowState
import json

# Load design JSON
with open("TMF645_ServiceQual_Design.json", 'r') as f:
    design_json = json.load(f)

# Create config
config = AppConfig(
    federated_api_url="http://localhost:8092"
)

# Create workflow
workflow = create_workflow(design_json, config)

# Create TMF 645 request
tmf645_request = {
    "instantSyncQualification": True,
    "provideAlternative": True,
    "serviceQualificationItem": [
        {
            "id": "1",
            "service": {
                "serviceType": "URLLC",
                "serviceSpecification": {
                    "id": "urllc-spec-001",
                    "name": "Ultra-Reliable Low Latency Communication"
                },
                "serviceCharacteristic": [
                    {"name": "bandwidth", "value": "100 Mbps"},
                    {"name": "latency", "value": "5 ms"},
                    {"name": "reliability", "value": "99.999%"},
                    {"name": "duration", "value": "4 hours"},
                    {"name": "start_time", "value": "2024-12-20T14:00:00Z"}
                ]
            },
            "state": "acknowledged",
            "action": "add"
        }
    ],
    "relatedParty": [
        {
            "id": "customer-001",
            "name": "Enterprise Customer",
            "role": "Customer"
        }
    ]
}

# Create initial state
initial_state = WorkflowState(
    messages=[],
    user_input="TMF 645 service qualification request",
    tmf645_request=tmf645_request
)

# Execute workflow
result = workflow.invoke(initial_state)

# Check results
print(f"Validation Passed: {result['validation_passed']}")
print(f"Service Qualified: {result['service_qualified']}")
print(f"Validation Result: {result['validation_result']}")
print(f"Qualification Result: {result['qualification_result']}")
```

## TMF 645 Request Format

### Required Fields

```json
{
  "instantSyncQualification": true,
  "provideAlternative": false,
  "serviceQualificationItem": [
    {
      "id": "1",
      "service": {
        "serviceType": "URLLC",
        "serviceSpecification": {
          "id": "urllc-spec-001",
          "name": "Ultra-Reliable Low Latency Communication"
        },
        "serviceCharacteristic": [
          {"name": "bandwidth", "value": "100 Mbps"},
          {"name": "latency", "value": "5 ms"},
          {"name": "reliability", "value": "99.999%"}
        ]
      },
      "state": "acknowledged",
      "action": "add"
    }
  ],
  "relatedParty": [
    {
      "id": "customer-001",
      "name": "Enterprise Customer",
      "role": "Customer"
    }
  ]
}
```

### Service Types

- **URLLC**: Ultra-Reliable Low Latency Communication
  - Use cases: Industrial automation, remote surgery, autonomous vehicles
  - Key metrics: latency (<5ms), reliability (>99.999%)

- **eMBB**: Enhanced Mobile Broadband
  - Use cases: HD video streaming, AR/VR, large file transfers
  - Key metrics: bandwidth (>1 Gbps), throughput

- **mMTC**: Massive Machine Type Communication
  - Use cases: IoT sensors, smart cities, agricultural monitoring
  - Key metrics: device density (>1M devices/km²), coverage

### Action Types

- `add`: Add new service
- `modify`: Modify existing service
- `delete`: Delete service
- `noChange`: No changes to service

## Response Format

### Validation Response

```json
{
  "validation_status": "passed",
  "message": "TMF 645 request validation successful",
  "is_valid": true,
  "request_summary": {
    "instant_sync": true,
    "provide_alternative": true,
    "service_items_count": 1,
    "service_types": ["URLLC"],
    "actions": ["add"]
  },
  "details": {
    "service_items": [
      {
        "item_id": "1",
        "service_type": "URLLC",
        "action": "add",
        "has_specification": true,
        "characteristics_count": 5
      }
    ]
  }
}
```

### Qualification Response

```json
{
  "qualification_status": "qualified",
  "message": "Service is qualified and can be provisioned",
  "is_qualified": true,
  "request_summary": {
    "service_type": "URLLC",
    "requested_bandwidth": "100 Mbps",
    "requested_latency": "5 ms",
    "requested_duration": "4 hours"
  },
  "qualification_details": {
    "qualification_id": "qual-12345",
    "qualification_date": "2024-12-20T10:00:00Z",
    "qualification_items": [
      {
        "id": "1",
        "service_type": "URLLC",
        "state": "qualified",
        "qualifier_message": "Service meets all requirements"
      }
    ],
    "network_capacity_check": {
      "available": true,
      "predicted_metrics": {
        "throughput_down": 150.5,
        "throughput_up": 80.2,
        "latency": 4.5
      }
    }
  },
  "api_response": {
    "id": "qual-12345",
    "state": "done",
    "serviceQualificationItem": [...]
  }
}
```

## Error Handling

### Validation Errors

```json
{
  "validation_status": "failed",
  "message": "Validation failed: Missing required field 'service' in item 1",
  "is_valid": false,
  "details": {
    "missing_fields": ["service"],
    "invalid_actions": [],
    "invalid_service_types": []
  }
}
```

### Qualification Errors

```json
{
  "qualification_status": "error",
  "message": "Network capacity check failed: Connection refused",
  "is_qualified": false,
  "details": {
    "error_type": "ConnectionError",
    "error_message": "Failed to connect to http://localhost:8092"
  }
}
```

## Troubleshooting

### Common Issues

1. **Validation fails with "Missing required field"**
   - Check that your TMF 645 request includes all required fields
   - Verify service items have `id`, `service`, and `action` fields
   - Ensure service has `serviceType`, `serviceSpecification`, and `serviceCharacteristic`

2. **Qualification skipped**
   - This occurs when validation fails
   - Check validation_result for details on why validation failed

3. **API connection errors**
   - Verify Federated Learning API is running on port 8092
   - Check that model is loaded (call `/health` endpoint)
   - Check network connectivity and firewall settings

4. **Network capacity check fails**
   - Ensure Federated API has trained models loaded
   - Verify feature data format (11 features × 11+ timesteps)
   - Check that client name (ElBorn, LesCorts, PobleSec) exists

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

View detailed workflow execution:

```python
# Enable LangGraph debugging
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "your-key"
```

## Integration with Existing Workflows

### Adding TMF 645 Nodes to Existing Workflows

1. **Update design JSON** to include TMF645Validator and ServiceQualifier nodes
2. **Add edges** connecting TMF 645 nodes to existing nodes
3. **Update WorkflowState** if additional fields are needed
4. **Rebuild workflow** using `create_workflow()`

### Example: Combined Q&A + Service Qualification

```json
{
  "nodes": [
    {"id": "ChatInput-viP4f", "type": "ChatInput"},
    {"id": "RouterNode", "type": "Router"},
    {"id": "TMF645Validator", "type": "TMF645Validator"},
    {"id": "ServiceQualifier", "type": "ServiceQualifier"},
    {"id": "Agent-Zgq5D", "type": "Agent"},
    {"id": "ChatOutput-AVpjO", "type": "ChatOutput"}
  ],
  "edges": [
    {"source": "ChatInput-viP4f", "target": "RouterNode"},
    {"source": "RouterNode", "target": "TMF645Validator", "condition": "is_tmf645"},
    {"source": "RouterNode", "target": "Agent-Zgq5D", "condition": "is_qa"},
    {"source": "TMF645Validator", "target": "ServiceQualifier"},
    {"source": "ServiceQualifier", "target": "ChatOutput-AVpjO"},
    {"source": "Agent-Zgq5D", "target": "ChatOutput-AVpjO"}
  ]
}
```

## Files Modified

1. **[src/workflow_state.py](src/workflow_state.py)** - Added TMF 645 fields
2. **[src/nodes.py](src/nodes.py)** - Added `node_tmf645_validator()` and `node_service_qualifier()`
3. **[src/graph_builder.py](src/graph_builder.py)** - Added TMF 645 nodes to node_function_map

## Files Created

1. **[TMF645_ServiceQual_Design.json](TMF645_ServiceQual_Design.json)** - Workflow design
2. **[test_tmf645_workflow.py](test_tmf645_workflow.py)** - Integration test script
3. **[TMF645_INTEGRATION.md](TMF645_INTEGRATION.md)** - This documentation

## Next Steps

1. **Test the integration** with `python test_tmf645_workflow.py`
2. **Add conditional routing** to support both TMF 645 and Q&A workflows
3. **Implement feedback loop** for alternative service suggestions
4. **Add monitoring** for qualification success rates
5. **Create Streamlit UI** for visual workflow execution

## References

- [TMF 645 Service Qualification API](https://www.tmforum.org/resources/specification/tmf645-service-qualification-api-rest-specification-r19-0-1/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
