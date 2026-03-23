"""
Test script for TMF 645 Service Qualification integrated with LangGraph

This script tests the integrated workflow that includes:
1. ChatInput - Receives TMF 645 request
2. TMF645Validator - Validates request format
3. ServiceQualifier - Qualifies service using Federated Learning API predictions
4. ChatOutput - Returns results

The ServiceQualifier now:
- Calls /health endpoint to verify API status
- Calls /predict endpoint with time series network metrics
- Uses real network capacity predictions to qualify services
"""

import json
import logging
from pathlib import Path

# Add parent directory to path
import sys
sys.path.insert(0, str(Path(__file__).parent))

from src.graph_builder import create_workflow
from src.config import AppConfig
from src.workflow_state import WorkflowState

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_design_json(filename: str) -> dict:
    """Load Langflow design JSON"""
    design_path = Path(__file__).parent / filename
    with open(design_path, 'r') as f:
        return json.load(f)


def test_tmf645_workflow():
    """Test TMF 645 service qualification workflow"""
    
    logger.info("="*70)
    logger.info("Testing TMF 645 Service Qualification Workflow")
    logger.info("="*70)
    
    # Load design JSON
    design_json = load_design_json("TMF645_ServiceQual_Design.json")
    logger.info(f"Loaded design: {design_json.get('name', 'Unknown')}")
    
    # Create config
    config = AppConfig(
        federated_api_url="http://192.168.14.119:8092",
        azure_openai_endpoint="https://your-endpoint.openai.azure.com/",
        azure_openai_api_key="your-key",
        azure_openai_deployment="gpt-4o-mini"
    )
    
    # Create workflow
    workflow = create_workflow(design_json, config)
    logger.info("Workflow created successfully")
    
    # Create sample TMF 645 request
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
                        {
                            "name": "bandwidth",
                            "value": "100 Mbps"
                        },
                        {
                            "name": "latency",
                            "value": "5 ms"
                        },
                        {
                            "name": "reliability",
                            "value": "99.999%"
                        },
                        {
                            "name": "duration",
                            "value": "4 hours"
                        },
                        {
                            "name": "start_time",
                            "value": "2024-12-20T14:00:00Z"
                        }
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
    
    logger.info("\n" + "="*70)
    logger.info("Executing workflow...")
    logger.info("="*70)
    
    try:
        # Run workflow
        result = workflow.invoke(initial_state)
        
        logger.info("\n" + "="*70)
        logger.info("Workflow Results:")
        logger.info("="*70)
        
        # Display validation result
        if result.get('validation_result'):
            logger.info("\nValidation Result:")
            logger.info(json.dumps(result['validation_result'], indent=2))
            logger.info(f"Validation Passed: {result.get('validation_passed', False)}")
        
        # Display qualification result
        if result.get('qualification_result'):
            logger.info("\nQualification Result:")
            qual_result = result['qualification_result']
            logger.info(f"  Status: {qual_result.get('qualification_status', 'unknown')}")
            logger.info(f"  Qualified: {qual_result.get('is_qualified', False)}")
            logger.info(f"  Message: {qual_result.get('message', 'N/A')}")
            
            # Display capacity check details
            if qual_result.get('qualification_details', {}).get('capacity_check'):
                capacity = qual_result['qualification_details']['capacity_check']
                logger.info("\n  Capacity Check:")
                logger.info(f"    API Status: {capacity.get('federated_api_status', 'unknown')}")
                
                # Display predictions used
                if capacity.get('predictions_used'):
                    pred = capacity['predictions_used']
                    logger.info(f"\n  Predictions Used:")
                    logger.info(f"    Client: {pred.get('client_id', 'N/A')}")
                    logger.info(f"    Downlink: {pred.get('downlink_mbps', 0):.2f} Mbps")
                    logger.info(f"    Uplink: {pred.get('uplink_mbps', 0):.2f} Mbps")
                    logger.info(f"    RB Down: {pred.get('rb_down', 0)}")
                    logger.info(f"    RB Up: {pred.get('rb_up', 0)}")
                
                # Display item results
                if capacity.get('item_results'):
                    logger.info("\n  Service Items:")
                    for item in capacity['item_results']:
                        logger.info(f"    - Item {item.get('item_id')}: {item.get('service_type')}")
                        logger.info(f"      Supported: {item.get('supported', False)}")
                        if item.get('requirements'):
                            req = item['requirements']
                            logger.info(f"      Required: {req.get('bandwidth_mbps', 0)} Mbps, {req.get('latency_ms', 0)} ms")
                        if item.get('predicted_metrics'):
                            metrics = item['predicted_metrics']
                            logger.info(f"      Metrics: {metrics.get('message', 'N/A')}")
            
            logger.info(f"\nService Qualified: {result.get('service_qualified', False)}")
        
        # Display final output
        if result.get('final_output'):
            logger.info("\nFinal Output:")
            logger.info(result['final_output'])
        
        # Display any errors
        if result.get('error'):
            logger.error(f"\nError: {result['error']}")
        
        logger.info("\n" + "="*70)
        logger.info("Test completed successfully")
        logger.info("="*70)
        
        return result
        
    except Exception as e:
        logger.error(f"Workflow execution failed: {e}", exc_info=True)
        raise


def test_validation_failure():
    """Test workflow with invalid TMF 645 request"""
    
    logger.info("\n\n" + "="*70)
    logger.info("Testing Validation Failure Scenario")
    logger.info("="*70)
    
    # Load design JSON
    design_json = load_design_json("TMF645_ServiceQual_Design.json")
    
    # Create config
    config = AppConfig(
        federated_api_url="http://192.168.14.119:8092"
    )
    
    # Create workflow
    workflow = create_workflow(design_json, config)
    
    # Create invalid TMF 645 request (missing required fields)
    invalid_request = {
        "serviceQualificationItem": [
            {
                "id": "1",
                # Missing 'service' field
                "action": "add"
            }
        ]
    }
    
    # Create initial state
    initial_state = WorkflowState(
        messages=[],
        user_input="Invalid TMF 645 request",
        tmf645_request=invalid_request
    )
    
    logger.info("Executing workflow with invalid request...")
    
    try:
        # Run workflow
        result = workflow.invoke(initial_state)
        
        logger.info("\nValidation Result:")
        logger.info(json.dumps(result.get('validation_result', {}), indent=2))
        logger.info(f"\nValidation Passed: {result.get('validation_passed', False)}")
        logger.info(f"Service Qualified: {result.get('service_qualified', 'N/A')}")
        
        logger.info("\n" + "="*70)
        logger.info("Validation failure test completed")
        logger.info("="*70)
        
    except Exception as e:
        logger.error(f"Test failed: {e}", exc_info=True)


if __name__ == "__main__":
    print("\n" + "="*70)
    print("TMF 645 Service Qualification - LangGraph Integration Test")
    print("="*70)
    print("\nThis test requires:")
    print("1. Federated Learning API running on localhost:8092")
    print("   - /health endpoint must be available")
    print("   - /predict endpoint must be available")
    print("2. Azure OpenAI credentials configured (optional)")
    print("\nThe test will:")
    print("  ✓ Validate TMF 645 request format")
    print("  ✓ Call federated API /health to check model status")
    print("  ✓ Call federated API /predict with time series data")
    print("  ✓ Use real network capacity predictions for qualification")
    print("\nPress Enter to continue or Ctrl+C to exit...")
    input()
    
    # Test 1: Valid request
    test_tmf645_workflow()
    
    # Test 2: Invalid request (validation failure)
    test_validation_failure()
    
    print("\n" + "="*70)
    print("All tests completed!")
    print("="*70)
