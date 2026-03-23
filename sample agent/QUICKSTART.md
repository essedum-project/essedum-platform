# TMF 645 Integration - Quick Start Guide

## What Was Integrated

The TMF 645 service qualification agents have been successfully integrated into the LangGraph workflow system at `LEOSMPLG95195-leo1311/`.

## Components Added

### 1. Node Functions ([src/nodes.py](src/nodes.py))

- **`node_tmf645_validator()`** - Validates TMF 645 request format
- **`node_service_qualifier()`** - Qualifies service via API

### 2. Graph Builder Update ([src/graph_builder.py](src/graph_builder.py))

Added to `node_function_map`:
```python
"TMF645Validator": nodes.node_tmf645_validator,
"ServiceQualifier": nodes.node_service_qualifier,
```

### 3. Workflow State ([src/workflow_state.py](src/workflow_state.py))

Added fields:
- `tmf645_request` - TMF 645 request JSON
- `validation_result` - Validation output
- `validation_passed` - Boolean flag
- `qualification_result` - Qualification output
- `service_qualified` - Boolean flag

### 4. Design JSON ([TMF645_ServiceQual_Design.json](TMF645_ServiceQual_Design.json))

Workflow: ChatInput → TMF645Validator → ServiceQualifier → ChatOutput

### 5. Test Script ([test_tmf645_workflow.py](test_tmf645_workflow.py))

Complete integration test with valid and invalid requests

### 6. Documentation ([TMF645_INTEGRATION.md](TMF645_INTEGRATION.md))

Comprehensive guide with examples and troubleshooting

## How to Use

### Quick Test

```bash
cd LEOSMPLG95195-leo1311
python test_tmf645_workflow.py
```

### Integration Example

```python
from src.graph_builder import create_workflow
from src.config import AppConfig
from src.workflow_state import WorkflowState
import json

# Load design
with open("TMF645_ServiceQual_Design.json") as f:
    design = json.load(f)

# Configure
config = AppConfig(
    federated_api_url="http://localhost:8092"
)

# Build workflow
workflow = create_workflow(design, config)

# Execute
result = workflow.invoke(WorkflowState(
    tmf645_request={...}
))
```

## TMF 645 Request Example

```json
{
  "instantSyncQualification": true,
  "serviceQualificationItem": [{
    "id": "1",
    "service": {
      "serviceType": "URLLC",
      "serviceSpecification": {
        "id": "urllc-spec-001",
        "name": "Ultra-Reliable Low Latency Communication"
      },
      "serviceCharacteristic": [
        {"name": "bandwidth", "value": "100 Mbps"},
        {"name": "latency", "value": "5 ms"}
      ]
    },
    "action": "add"
  }]
}
```

## API Dependencies

1. **Federated Learning API** - Port 8092
   ```bash
   python federatedapi.py
   ```

Service qualification is determined based on network capacity predictions from the federated API.

## Output Format

### Successful Qualification

```python
{
    "validation_passed": True,
    "service_qualified": True,
    "validation_result": {...},
    "qualification_result": {
        "qualification_status": "qualified",
        "message": "Service is qualified",
        "is_qualified": True,
        "details": {...}
    }
}
```

### Validation Failure

```python
{
    "validation_passed": False,
    "service_qualified": False,
    "validation_result": {
        "validation_status": "failed",
        "message": "Missing required field: service",
        "is_valid": False
    },
    "qualification_result": {
        "qualification_status": "skipped",
        "message": "Qualification skipped due to validation failure"
    }
}
```

## Workflow Flow

```
1. ChatInput receives TMF 645 request
   ↓
2. TMF645Validator validates format
   - Checks required fields
   - Validates service types
   - Validates action types
   ↓
3. ServiceQualifier qualifies service (if validation passed)
   - Calls Service Qualification API
   - Checks network capacity (optional)
   - Analyzes results
   ↓
4. ChatOutput returns results
   - Validation result
   - Qualification result
   - Success/failure status
```

## Key Features

✅ **Format Validation** - Ensures TMF 645 compliance  
✅ **API Integration** - Calls external qualification API  
✅ **Network Capacity Check** - Optional federated learning predictions  
✅ **Error Handling** - Graceful failures with detailed messages  
✅ **State Management** - Pydantic-based workflow state  
✅ **Extensible** - Easy to add to existing workflows  

## Next Steps

1. Run the test script to verify integration
2. Customize the workflow design for your needs
3. Add conditional routing for multiple workflow paths
4. Integrate with Streamlit UI for visual execution
5. Monitor qualification success rates

## Need Help?

See full documentation: [TMF645_INTEGRATION.md](TMF645_INTEGRATION.md)
