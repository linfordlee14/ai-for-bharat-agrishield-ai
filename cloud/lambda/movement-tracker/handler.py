# Movement Tracker Lambda
# Tracks wildlife movement across multiple devices

import json
import os
import uuid
import math
from datetime import datetime, timedelta

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'shared', 'python'))

from db import get_db
from models import Incident, MovementEvent

CORRELATION_WINDOW_MIN = 10
CORRELATION_DISTANCE_KM = 1.0


def _haversine(lat1, lng1, lat2, lng2):
    """Calculate distance in km between two coordinates"""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _classify_movement(from_lat, from_lng, to_lat, to_lng):
    """Simple movement classification"""
    # Placeholder logic — can be extended with zone definitions
    return "passing"


def lambda_handler(event, context):
    """
    Track wildlife movement
    Event: Detection broadcast messages
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        payload = event if isinstance(event, dict) else json.loads(event)
        species = payload.get('species')
        device_id = payload.get('device_id')
        latitude = payload.get('latitude')
        longitude = payload.get('longitude')
        timestamp = datetime.fromisoformat(payload['timestamp']) if isinstance(payload.get('timestamp'), str) else datetime.utcnow()

        if not all([species, device_id, latitude, longitude]):
            return {'statusCode': 400, 'body': json.dumps({'error': 'Missing required fields'})}

        with get_db() as db:
            # Find recent detections of same species from different devices
            window_start = timestamp - timedelta(minutes=CORRELATION_WINDOW_MIN)

            recent = db.query(Incident).filter(
                Incident.species == species,
                Incident.device_id != device_id,
                Incident.timestamp >= window_start,
                Incident.timestamp <= timestamp,
                Incident.latitude.isnot(None),
                Incident.longitude.isnot(None),
            ).order_by(Incident.timestamp.desc()).limit(10).all()

            for prev in recent:
                dist = _haversine(prev.latitude, prev.longitude, latitude, longitude)
                if dist <= CORRELATION_DISTANCE_KM:
                    movement = MovementEvent(
                        id=uuid.uuid4(),
                        species=species,
                        from_device_id=prev.device_id,
                        to_device_id=device_id,
                        from_lat=prev.latitude,
                        from_lng=prev.longitude,
                        to_lat=latitude,
                        to_lng=longitude,
                        first_seen=prev.timestamp,
                        last_seen=timestamp,
                        movement_type=_classify_movement(prev.latitude, prev.longitude, latitude, longitude),
                        distance_km=round(dist, 3),
                    )
                    db.add(movement)

        return {
            'statusCode': 200,
            'body': json.dumps({'status': 'tracked'})
        }

    except Exception as e:
        print(f"Error tracking movement: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
