# Telemetry Processor Lambda
# Processes device telemetry and health metrics

import json
import os
import uuid
from datetime import datetime

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'shared', 'python'))

from db import get_db
from models import Telemetry, Device
from utils import publish_sns

MONITORING_TOPIC_ARN = os.getenv('MONITORING_TOPIC_ARN', '')

# Thresholds
CPU_TEMP_WARN = 75.0
BATTERY_LOW = 20.0


def lambda_handler(event, context):
    """
    Process device telemetry
    Event: MQTT message from agrishield/telemetry/{device_id}
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        payload = event if isinstance(event, dict) else json.loads(event)
        device_id = payload.get('device_id')

        if not device_id:
            return {'statusCode': 400, 'body': json.dumps({'error': 'device_id required'})}

        with get_db() as db:
            # Store telemetry
            telemetry = Telemetry(
                id=uuid.uuid4(),
                device_id=device_id,
                timestamp=datetime.utcnow(),
                cpu_temp=payload.get('cpu_temp'),
                battery_level=payload.get('battery_level'),
                signal_strength=payload.get('signal_strength'),
                memory_usage=payload.get('memory_usage'),
                disk_usage=payload.get('disk_usage'),
                uptime_seconds=payload.get('uptime_seconds'),
            )
            db.add(telemetry)

            # Update device last_seen
            device = db.query(Device).filter(Device.id == device_id).first()
            if device:
                device.last_seen = datetime.utcnow()
                device.status = 'ONLINE'

        # Check thresholds
        warnings = []
        if payload.get('cpu_temp') and payload['cpu_temp'] > CPU_TEMP_WARN:
            warnings.append(f"CPU temp {payload['cpu_temp']}°C exceeds {CPU_TEMP_WARN}°C")
        if payload.get('battery_level') and payload['battery_level'] < BATTERY_LOW:
            warnings.append(f"Battery {payload['battery_level']}% below {BATTERY_LOW}%")

        if warnings and MONITORING_TOPIC_ARN:
            msg = f"Device {device_id} warnings:\n" + "\n".join(warnings)
            publish_sns(MONITORING_TOPIC_ARN, msg, subject=f'AgriShield Device Warning: {device_id}')

        return {
            'statusCode': 200,
            'body': json.dumps({'status': 'stored', 'warnings': warnings})
        }

    except Exception as e:
        print(f"Error processing telemetry: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
