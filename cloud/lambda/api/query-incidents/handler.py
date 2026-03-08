# Query Incidents API Lambda
# Handles GET /incidents and GET /incidents/{id}

import json
import os
from datetime import datetime

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'shared', 'python'))

from db import get_db
from models import Incident
from utils import format_api_response, parse_query_params


def lambda_handler(event, context):
    """
    Query incidents with filters
    """
    print(f"Received event: {json.dumps(event)}")

    path_params = event.get('pathParameters') or {}
    incident_id = path_params.get('id')
    params = parse_query_params(event)

    try:
        with get_db() as db:
            # Single incident by ID
            if incident_id:
                row = db.query(Incident).filter(Incident.id == incident_id).first()
                if not row:
                    return format_api_response(404, {'error': 'Incident not found'})
                return format_api_response(200, _serialize(row))

            # List with filters
            query = db.query(Incident)

            if params.get('device_id'):
                query = query.filter(Incident.device_id == params['device_id'])
            if params.get('species'):
                query = query.filter(Incident.species == params['species'])
            if params.get('threat_level'):
                query = query.filter(Incident.threat_level == params['threat_level'])
            if params.get('start_date'):
                query = query.filter(Incident.timestamp >= datetime.fromisoformat(params['start_date']))
            if params.get('end_date'):
                query = query.filter(Incident.timestamp <= datetime.fromisoformat(params['end_date']))

            # Pagination
            limit = int(params.get('limit', 50))
            offset = int(params.get('offset', 0))

            total = query.count()
            rows = query.order_by(Incident.timestamp.desc()).offset(offset).limit(limit).all()

            return format_api_response(200, {
                'items': [_serialize(r) for r in rows],
                'total': total,
                'limit': limit,
                'offset': offset,
            })

    except Exception as e:
        print(f"Error querying incidents: {e}")
        return format_api_response(500, {'error': str(e)})


def _serialize(row: Incident) -> dict:
    return {
        'id': str(row.id),
        'timestamp': row.timestamp.isoformat() if row.timestamp else None,
        'species': row.species,
        'location': row.location,
        'threat_level': row.threat_level,
        'device_id': row.device_id,
        'confidence': row.confidence,
        'latitude': row.latitude,
        'longitude': row.longitude,
        'media_url': row.media_url,
    }
