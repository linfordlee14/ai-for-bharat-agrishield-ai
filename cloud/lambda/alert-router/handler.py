# Alert Router Lambda
# Routes SMS alerts to nearby farmers and rangers

import json
import os

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'shared', 'python'))

from db import get_db
from models import Device
from utils import publish_sns

ALERTS_TOPIC_ARN = os.getenv('ALERTS_TOPIC_ARN', '')


def lambda_handler(event, context):
    """
    Route alerts to nearby farmers and rangers
    Event: Incident object from Incident Processor
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        payload = event if isinstance(event, dict) else json.loads(event)
        device_id = payload.get('device_id')
        species = payload.get('species', 'Unknown')
        threat_level = payload.get('threat_level', 'MEDIUM')
        location = payload.get('location', 'unknown')

        if threat_level != 'HIGH':
            return {'statusCode': 200, 'body': json.dumps({'status': 'skipped', 'reason': 'Not HIGH threat'})}

        # Retrieve device info
        device_name = device_id
        with get_db() as db:
            device = db.query(Device).filter(Device.id == device_id).first()
            if device:
                device_name = device.name or device_id

        # Format and send alert
        message = (
            f"ALERT — {species} detected\n"
            f"Threat: {threat_level}\n"
            f"Location: {location}\n"
            f"Device: {device_name}\n"
            f"Time: {payload.get('timestamp', 'N/A')}"
        )

        if ALERTS_TOPIC_ARN:
            publish_sns(ALERTS_TOPIC_ARN, message, subject=f'AgriShield Alert: {species} at {location}')

        return {
            'statusCode': 200,
            'body': json.dumps({'status': 'alert_sent', 'message': message})
        }

    except Exception as e:
        print(f"Error routing alert: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
