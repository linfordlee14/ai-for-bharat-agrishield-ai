# Configuration Manager Lambda
# Manages remote device configuration updates

import json
import os

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'shared', 'python'))

from db import get_db
from models import Device
from utils import format_api_response, publish_mqtt


def lambda_handler(event, context):
    """
    Update device configuration
    Event: API Gateway request with device_id and config updates
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event.get('body', {})
        path_params = event.get('pathParameters') or {}
        device_id = path_params.get('id') or body.get('device_id')
        config = body.get('config')

        if not device_id or not config:
            return format_api_response(400, {'error': 'device_id and config are required'})

        config_str = json.dumps(config) if isinstance(config, dict) else config

        with get_db() as db:
            device = db.query(Device).filter(Device.id == device_id).first()
            if not device:
                return format_api_response(404, {'error': 'Device not found'})

            device.config = config_str

        # Publish config update to device via MQTT
        publish_mqtt(
            f"agrishield/config/{device_id}",
            {'config': config, 'updated_at': json.dumps(str(__import__('datetime').datetime.utcnow()))}
        )

        return format_api_response(200, {'status': 'config_updated', 'device_id': device_id})

    except Exception as e:
        print(f"Error updating config: {e}")
        return format_api_response(500, {'error': str(e)})
