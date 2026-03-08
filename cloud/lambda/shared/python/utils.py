# Shared utilities for AgriShield Lambda functions

import json
import os
import boto3
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from db import get_db, engine
from models import Device, Incident, Telemetry, MovementEvent

# AWS clients (S3, SNS, IoT only — database is on external VPS)
s3 = boto3.client('s3')
sns = boto3.client('sns')
iot_data = boto3.client('iot-data')

def generate_presigned_url(bucket: str, key: str, expiration: int = 3600) -> str:
    """
    Generate presigned URL for S3 object
    
    Args:
        bucket: S3 bucket name
        key: S3 object key
        expiration: URL expiration in seconds (default 1 hour)
    
    Returns:
        Presigned URL string
    """
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': key},
            ExpiresIn=expiration
        )
        return url
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return ""

def publish_mqtt(topic: str, payload: Dict[str, Any]) -> bool:
    """
    Publish message to IoT Core MQTT topic
    
    Args:
        topic: MQTT topic
        payload: Message payload (will be JSON serialized)
    
    Returns:
        True if successful, False otherwise
    """
    try:
        iot_data.publish(
            topic=topic,
            qos=1,
            payload=json.dumps(payload)
        )
        return True
    except Exception as e:
        print(f"Error publishing to MQTT: {e}")
        return False

def publish_sns(topic_arn: str, message: str, subject: str = "", attributes: Optional[Dict] = None) -> bool:
    """
    Publish message to SNS topic
    
    Args:
        topic_arn: SNS topic ARN
        message: Message text
        subject: Message subject (optional)
        attributes: Message attributes for filtering (optional)
    
    Returns:
        True if successful, False otherwise
    """
    try:
        params = {
            'TopicArn': topic_arn,
            'Message': message,
        }
        if subject:
            params['Subject'] = subject
        if attributes:
            params['MessageAttributes'] = attributes
        
        sns.publish(**params)
        return True
    except Exception as e:
        print(f"Error publishing to SNS: {e}")
        return False

def validate_incident_payload(payload: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate incident payload structure
    
    Args:
        payload: Incident payload dictionary
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = [
        'device_id', 'timestamp', 'species', 'confidence',
        'threat_level', 'latitude', 'longitude'
    ]
    
    for field in required_fields:
        if field not in payload:
            return False, f"Missing required field: {field}"
    
    # Validate confidence range
    if not 0.0 <= payload['confidence'] <= 1.0:
        return False, "Confidence must be between 0.0 and 1.0"
    
    # Validate threat level
    valid_threat_levels = ['HIGH', 'MEDIUM', 'LOW']
    if payload['threat_level'] not in valid_threat_levels:
        return False, f"Invalid threat level: {payload['threat_level']}"
    
    # Validate species
    valid_species = ['Elephant', 'Boar', 'Deer', 'Leopard', 'Human', 'Unknown']
    if payload['species'] not in valid_species:
        return False, f"Invalid species: {payload['species']}"
    
    return True, None

def parse_query_params(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse query string parameters from API Gateway event
    
    Args:
        event: API Gateway event
    
    Returns:
        Dictionary of query parameters
    """
    return event.get('queryStringParameters') or {}

def extract_user_role(event: Dict[str, Any]) -> Optional[str]:
    """
    Extract user role from API Gateway event (Cognito claims)
    
    Args:
        event: API Gateway event
    
    Returns:
        User role string or None
    """
    try:
        claims = event['requestContext']['authorizer']['claims']
        groups = claims.get('cognito:groups', '')
        
        # Return highest priority role
        if 'admin' in groups:
            return 'admin'
        elif 'ranger' in groups:
            return 'ranger'
        
        return None
    except Exception as e:
        print(f"Error extracting user role: {e}")
        return None

def format_api_response(status_code: int, body: Any, headers: Optional[Dict] = None) -> Dict:
    """
    Format API Gateway response
    
    Args:
        status_code: HTTP status code
        body: Response body (will be JSON serialized)
        headers: Additional headers (optional)
    
    Returns:
        API Gateway response dictionary
    """
    default_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
    
    if headers:
        default_headers.update(headers)
    
    return {
        'statusCode': status_code,
        'headers': default_headers,
        'body': json.dumps(body) if not isinstance(body, str) else body
    }
