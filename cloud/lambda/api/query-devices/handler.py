# Query Devices API Lambda
# Handles GET /devices and GET /devices/{id}

import json
import os

def lambda_handler(event, context):
    """
    Query devices
    """
    print(f"Received event: {json.dumps(event)}")
    
    # TODO: Implement device query logic
    # - Query DynamoDB devices table
    # - Calculate device status based on last_seen
    # - Return device list or single device
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'message': 'Query devices placeholder'})
    }
