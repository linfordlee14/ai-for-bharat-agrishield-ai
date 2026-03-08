# Query Devices API Lambda
# Handles GET /devices and GET /devices/{id}

import json
import os

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'shared', 'python'))

from db import get_db
from models import Device
from utils import format_api_response, parse_query_params


def lambda_handler(event, context):
    """
    Query devices
    """
    print(f"Received event: {json.dumps(event)}")

    path_params = event.get('pathParameters') or {}
    device_id = path_params.get('id')
    params = parse_query_params(event)

    try:
        with get_db() as db:
            if device_id:
                row = db.query(Device).filter(Device.id == device_id).first()
                if not row:
                    return format_api_response(404, {'error': 'Device not found'})
                return format_api_response(200, _serialize(row))

            query = db.query(Device)

            if params.get('status'):
                query = query.filter(Device.status == params['status'])

            rows = query.order_by(Device.last_seen.desc()).all()
            return format_api_response(200, {
                'items': [_serialize(r) for r in rows],
                'total': len(rows),
            })

    except Exception as e:
        print(f"Error querying devices: {e}")
        return format_api_response(500, {'error': str(e)})


def _serialize(row: Device) -> dict:
    return {
        'id': row.id,
        'name': row.name,
        'location': row.location,
        'status': row.status,
        'last_seen': row.last_seen.isoformat() if row.last_seen else None,
    }
