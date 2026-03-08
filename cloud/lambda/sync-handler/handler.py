# Sync Handler Lambda
# Handles batch synchronization from edge devices

import json
import os
import uuid
from datetime import datetime

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'shared', 'python'))

from db import get_db
from models import Incident, Device


def lambda_handler(event, context):
    """
    Process batch sync from edge device
    Event: Array of incident objects
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        if isinstance(event, str):
            event = json.loads(event)

        incidents = event if isinstance(event, list) else event.get('incidents', [])
        results = []

        with get_db() as db:
            for item in incidents:
                try:
                    incident = Incident(
                        id=uuid.uuid4(),
                        timestamp=datetime.fromisoformat(item['timestamp']) if isinstance(item.get('timestamp'), str) else datetime.utcnow(),
                        species=item.get('species'),
                        location=item.get('location'),
                        threat_level=item.get('threat_level'),
                        device_id=item.get('device_id'),
                        confidence=item.get('confidence'),
                        latitude=item.get('latitude'),
                        longitude=item.get('longitude'),
                        media_url=item.get('media_url'),
                    )
                    db.add(incident)
                    results.append({'id': str(incident.id), 'status': 'ok'})
                except Exception as e:
                    results.append({'error': str(e), 'status': 'failed'})

            # Update device last_seen for all unique device_ids
            device_ids = set(item.get('device_id') for item in incidents if item.get('device_id'))
            for did in device_ids:
                device = db.query(Device).filter(Device.id == did).first()
                if device:
                    device.last_seen = datetime.utcnow()
                    device.status = 'ONLINE'

        return {
            'statusCode': 200,
            'body': json.dumps({
                'processed': len(results),
                'results': results,
            })
        }

    except Exception as e:
        print(f"Error in batch sync: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
