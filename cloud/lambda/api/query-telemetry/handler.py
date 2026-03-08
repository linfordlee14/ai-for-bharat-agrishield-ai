# Query Telemetry API Lambda
# Handles GET /telemetry/{device_id}

import json
import os
from datetime import datetime

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'shared', 'python'))

from db import get_db
from models import Telemetry
from utils import format_api_response, parse_query_params


def lambda_handler(event, context):
    """
    Query device telemetry history
    """
    print(f"Received event: {json.dumps(event)}")

    path_params = event.get('pathParameters') or {}
    device_id = path_params.get('device_id')
    params = parse_query_params(event)

    if not device_id:
        return format_api_response(400, {'error': 'device_id is required'})

    try:
        with get_db() as db:
            query = db.query(Telemetry).filter(Telemetry.device_id == device_id)

            if params.get('start_date'):
                query = query.filter(Telemetry.timestamp >= datetime.fromisoformat(params['start_date']))
            if params.get('end_date'):
                query = query.filter(Telemetry.timestamp <= datetime.fromisoformat(params['end_date']))

            limit = int(params.get('limit', 100))
            offset = int(params.get('offset', 0))

            total = query.count()
            rows = query.order_by(Telemetry.timestamp.desc()).offset(offset).limit(limit).all()

            return format_api_response(200, {
                'device_id': device_id,
                'items': [_serialize(r) for r in rows],
                'total': total,
                'limit': limit,
                'offset': offset,
            })

    except Exception as e:
        print(f"Error querying telemetry: {e}")
        return format_api_response(500, {'error': str(e)})


def _serialize(row: Telemetry) -> dict:
    return {
        'id': str(row.id),
        'device_id': row.device_id,
        'timestamp': row.timestamp.isoformat() if row.timestamp else None,
        'cpu_temp': row.cpu_temp,
        'battery_level': row.battery_level,
        'signal_strength': row.signal_strength,
        'memory_usage': row.memory_usage,
        'disk_usage': row.disk_usage,
        'uptime_seconds': row.uptime_seconds,
    }
