# Update Device Config API Lambda
# Handles PUT /devices/{id}/config (admin only)

import json
import os

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'shared', 'python'))

from db import get_db
from models import Device
from utils import format_api_response, extract_user_role, publish_mqtt


def lambda_handler(event, context):
    """
    Update device configuration
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        # Verify admin role
        role = extract_user_role(event)
        if role != 'admin':
            return format_api_response(403, {'error': 'Admin access required'})

        path_params = event.get('pathParameters') or {}
        device_id = path_params.get('id')
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event.get('body', {})
        config = body.get('config')

        if not device_id or not config:
            return format_api_response(400, {'error': 'device_id and config are required'})

        config_str = json.dumps(config) if isinstance(config, dict) else config

        with get_db() as db:
            device = db.query(Device).filter(Device.id == device_id).first()
            if not device:
                return format_api_response(404, {'error': 'Device not found'})
            device.config = config_str

        # Push config to device
        publish_mqtt(
            f"agrishield/config/{device_id}",
            {'config': config}
        )

        return format_api_response(200, {'status': 'config_updated', 'device_id': device_id})

    except Exception as e:
        print(f"Error updating device config: {e}")
        return format_api_response(500, {'error': str(e)})
