#!/usr/bin/env python3
# file: src/validator_agent.py
"""
TMF 645 Service Qualification Request Validator Agent

Validates service qualification requests against TMF 645 standard format.
Ensures all necessary parameters are present and properly formatted.
"""

import logging
from typing import Dict, Any, Tuple, List
from datetime import datetime

logger = logging.getLogger(__name__)


class TMF645ValidatorAgent:
    """
    Agent responsible for validating TMF 645 Service Qualification requests
    """
    
    # Required fields for TMF 645 Service Qualification
    REQUIRED_TOP_LEVEL = [
        'instantSyncQualification',
        'serviceQualificationItem'
    ]
    
    REQUIRED_ITEM_FIELDS = [
        'id',
        'action',
        'service'
    ]
    
    REQUIRED_SERVICE_FIELDS = [
        'serviceType',
        'serviceSpecification'
    ]
    
    REQUIRED_SPEC_FIELDS = [
        'id',
        'name'
    ]
    
    VALID_ACTIONS = ['add', 'modify', 'delete', 'noChange']
    VALID_SERVICE_TYPES = ['broadband', 'mobile', 'IPTV', 'VoIP', 'fiber', 'URLLC', '5G', 'eMBB', 'mMTC']
    
    def __init__(self):
        """Initialize the validator agent"""
        logger.info("TMF645 Validator Agent initialized")
    
    def validate_request(self, request_data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Validate a TMF 645 service qualification request
        
        Args:
            request_data: The service qualification request to validate
            
        Returns:
            Tuple of (is_valid, message, validation_details)
        """
        try:
            validation_details = {
                'timestamp': datetime.now().isoformat(),
                'checks_performed': [],
                'errors': [],
                'warnings': []
            }
            
            # Check 1: Request data exists
            if not request_data or not isinstance(request_data, dict):
                return False, "Invalid request: Empty or non-dictionary request data", validation_details
            
            validation_details['checks_performed'].append('Request data structure check')
            
            # Check 2: Required top-level fields
            missing_top_level = []
            for field in self.REQUIRED_TOP_LEVEL:
                if field not in request_data:
                    missing_top_level.append(field)
            
            if missing_top_level:
                error_msg = f"Missing required top-level fields: {', '.join(missing_top_level)}"
                validation_details['errors'].append(error_msg)
                return False, error_msg, validation_details
            
            validation_details['checks_performed'].append('Top-level fields check')
            
            # Check 3: ServiceQualificationItem array validation
            items = request_data.get('serviceQualificationItem', [])
            if not isinstance(items, list) or len(items) == 0:
                error_msg = "serviceQualificationItem must be a non-empty array"
                validation_details['errors'].append(error_msg)
                return False, error_msg, validation_details
            
            validation_details['checks_performed'].append('ServiceQualificationItem array check')
            
            # Check 4: Validate each service qualification item
            for idx, item in enumerate(items):
                item_validation = self._validate_item(item, idx)
                
                if not item_validation['valid']:
                    validation_details['errors'].extend(item_validation['errors'])
                    return False, f"Item {idx} validation failed: {item_validation['errors'][0]}", validation_details
                
                validation_details['warnings'].extend(item_validation['warnings'])
            
            validation_details['checks_performed'].append(f'Validated {len(items)} service qualification item(s)')
            
            # Check 5: Optional but recommended fields
            self._check_optional_fields(request_data, validation_details)
            
            # All validations passed
            success_msg = f"TMF 645 validation successful: {len(items)} item(s) validated"
            logger.info(success_msg)
            
            return True, success_msg, validation_details
            
        except Exception as e:
            logger.error(f"Validation error: {e}", exc_info=True)
            return False, f"Validation exception: {str(e)}", validation_details
    
    def _validate_item(self, item: Dict[str, Any], idx: int) -> Dict[str, Any]:
        """
        Validate a single serviceQualificationItem
        
        Args:
            item: The service qualification item to validate
            idx: Index of the item in the array
            
        Returns:
            Dictionary with validation results
        """
        result = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        # Check required item fields
        for field in self.REQUIRED_ITEM_FIELDS:
            if field not in item:
                result['valid'] = False
                result['errors'].append(f"Item {idx}: Missing required field '{field}'")
                return result
        
        # Validate action
        action = item.get('action', '').lower()
        if action not in self.VALID_ACTIONS:
            result['valid'] = False
            result['errors'].append(f"Item {idx}: Invalid action '{action}'. Must be one of: {', '.join(self.VALID_ACTIONS)}")
            return result
        
        # Validate service object
        service = item.get('service', {})
        if not isinstance(service, dict):
            result['valid'] = False
            result['errors'].append(f"Item {idx}: 'service' must be an object")
            return result
        
        # Check required service fields
        for field in self.REQUIRED_SERVICE_FIELDS:
            if field not in service:
                result['valid'] = False
                result['errors'].append(f"Item {idx}: Missing required service field '{field}'")
                return result
        
        # Validate serviceType
        service_type = service.get('serviceType', '')
        if service_type not in self.VALID_SERVICE_TYPES:
            result['warnings'].append(f"Item {idx}: serviceType '{service_type}' is not in standard list: {', '.join(self.VALID_SERVICE_TYPES)}")
        
        # Validate serviceSpecification
        spec = service.get('serviceSpecification', {})
        if not isinstance(spec, dict):
            result['valid'] = False
            result['errors'].append(f"Item {idx}: 'serviceSpecification' must be an object")
            return result
        
        for field in self.REQUIRED_SPEC_FIELDS:
            if field not in spec:
                result['valid'] = False
                result['errors'].append(f"Item {idx}: Missing required serviceSpecification field '{field}'")
                return result
        
        # Validate place (if present)
        if 'place' in service:
            places = service['place']
            if not isinstance(places, list):
                result['warnings'].append(f"Item {idx}: 'place' should be an array")
            else:
                for pidx, place in enumerate(places):
                    if '@type' not in place:
                        result['warnings'].append(f"Item {idx}, place {pidx}: Missing '@type' field")
        
        # Validate serviceCharacteristic (if present)
        if 'serviceCharacteristic' in service:
            chars = service['serviceCharacteristic']
            if not isinstance(chars, list):
                result['warnings'].append(f"Item {idx}: 'serviceCharacteristic' should be an array")
            else:
                for cidx, char in enumerate(chars):
                    if 'name' not in char or 'value' not in char:
                        result['warnings'].append(f"Item {idx}, characteristic {cidx}: Missing 'name' or 'value'")
        
        return result
    
    def _check_optional_fields(self, request_data: Dict[str, Any], validation_details: Dict[str, Any]):
        """Check for optional but recommended fields"""
        
        # Check for relatedParty
        if 'relatedParty' not in request_data:
            validation_details['warnings'].append("Optional field 'relatedParty' not provided (recommended for customer identification)")
        else:
            parties = request_data['relatedParty']
            if isinstance(parties, list) and len(parties) > 0:
                for pidx, party in enumerate(parties):
                    if 'role' not in party:
                        validation_details['warnings'].append(f"relatedParty {pidx}: Missing 'role' field")
                    if 'id' not in party and 'name' not in party:
                        validation_details['warnings'].append(f"relatedParty {pidx}: Missing both 'id' and 'name' fields")
        
        # Check for provideAlternative
        if 'provideAlternative' not in request_data:
            validation_details['warnings'].append("Optional field 'provideAlternative' not specified")
        
        # Check for requestedCompletionDate
        if 'requestedCompletionDate' not in request_data:
            validation_details['warnings'].append("Optional field 'requestedCompletionDate' not specified")
    
    def validate_and_format_response(self, is_valid: bool, message: str, 
                                    validation_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the validation response
        
        Args:
            is_valid: Whether validation passed
            message: Validation message
            validation_details: Detailed validation information
            
        Returns:
            Formatted response dictionary
        """
        return {
            'validation_status': 'passed' if is_valid else 'failed',
            'message': message,
            'is_valid': is_valid,
            'details': validation_details,
            'timestamp': datetime.now().isoformat()
        }
