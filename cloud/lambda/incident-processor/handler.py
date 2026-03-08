# Incident Processor Lambda
# Processes incoming wildlife detection incidents from edge devices

import json
import os
import uuid
from datetime import datetime

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'shared', 'python'))

from db import get_db
from models import Incident, Device
from utils import (
    validate_incident_payload,
    format_api_response,
    publish_mqtt,
    publish_sns,
)

ALERTS_TOPIC_ARN = os.getenv('ALERTS_TOPIC_ARN', '')


def lambda_handler(event, context):
    """
    Process incident from IoT Core
    Event: MQTT message from agrishield/incidents/{device_id}
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        payload = event if isinstance(event, dict) else json.loads(event)

        # Validate
        is_valid, error = validate_incident_payload(payload)
        if not is_valid:
            print(f"Invalid payload: {error}")
            return {'statusCode': 400, 'body': json.dumps({'error': error})}

        incident_id = uuid.uuid4()

        with get_db() as db:
            # Store incident
            incident = Incident(
                id=incident_id,
                timestamp=datetime.fromisoformat(payload['timestamp']) if isinstance(payload['timestamp'], str) else payload['timestamp'],
                species=payload['species'],
                location=payload.get('location'),
                threat_level=payload['threat_level'],
                device_id=payload['device_id'],
                confidence=payload['confidence'],
                latitude=payload.get('latitude'),
                longitude=payload.get('longitude'),
                media_url=payload.get('media_url'),
            )
            db.add(incident)

            # Update device last_seen
            device = db.query(Device).filter(Device.id == payload['device_id']).first()
            if device:
                device.last_seen = datetime.utcnow()
                device.status = 'ONLINE'

        # Alert for HIGH threats
        if payload['threat_level'] == 'HIGH' and ALERTS_TOPIC_ARN:
            msg = (
                f"⚠️ HIGH THREAT: {payload['species']} detected "
                f"at {payload.get('location', 'unknown')} "
                f"by device {payload['device_id']}"
            )
            publish_sns(ALERTS_TOPIC_ARN, msg, subject='AgriShield HIGH Threat Alert')

        # Acknowledge to device
        publish_mqtt(
            f"agrishield/ack/{payload['device_id']}",
            {'incident_id': str(incident_id), 'status': 'processed'}
        )

        return {
            'statusCode': 200,
            'body': json.dumps({
                'incident_id': str(incident_id),
                'status': 'processed',
            })
        }

    except Exception as e:
        print(f"Error processing incident: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
