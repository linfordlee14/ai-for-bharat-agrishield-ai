# Query Movements API Lambda
# Handles GET /movements

import json
import os
from datetime import datetime

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'shared', 'python'))

from db import get_db
from models import MovementEvent
from utils import format_api_response, parse_query_params


def lambda_handler(event, context):
    """
    Query movement events
    """
    print(f"Received event: {json.dumps(event)}")

    params = parse_query_params(event)

    try:
        with get_db() as db:
            query = db.query(MovementEvent)

            if params.get('species'):
                query = query.filter(MovementEvent.species == params['species'])
            if params.get('movement_type'):
                query = query.filter(MovementEvent.movement_type == params['movement_type'])
            if params.get('start_date'):
                query = query.filter(MovementEvent.first_seen >= datetime.fromisoformat(params['start_date']))
            if params.get('end_date'):
                query = query.filter(MovementEvent.last_seen <= datetime.fromisoformat(params['end_date']))

            limit = int(params.get('limit', 50))
            offset = int(params.get('offset', 0))

            total = query.count()
            rows = query.order_by(MovementEvent.last_seen.desc()).offset(offset).limit(limit).all()

            return format_api_response(200, {
                'items': [_serialize(r) for r in rows],
                'total': total,
                'limit': limit,
                'offset': offset,
            })

    except Exception as e:
        print(f"Error querying movements: {e}")
        return format_api_response(500, {'error': str(e)})


def _serialize(row: MovementEvent) -> dict:
    return {
        'id': str(row.id),
        'species': row.species,
        'from_device_id': row.from_device_id,
        'to_device_id': row.to_device_id,
        'from_lat': row.from_lat,
        'from_lng': row.from_lng,
        'to_lat': row.to_lat,
        'to_lng': row.to_lng,
        'first_seen': row.first_seen.isoformat() if row.first_seen else None,
        'last_seen': row.last_seen.isoformat() if row.last_seen else None,
        'movement_type': row.movement_type,
        'distance_km': row.distance_km,
    }
