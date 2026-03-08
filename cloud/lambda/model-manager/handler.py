# Model Manager Lambda
# Manages ML model deployments to edge devices

import json
import os

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'shared', 'python'))

from db import get_db
from models import Device
from utils import format_api_response, generate_presigned_url, publish_mqtt

MODELS_BUCKET = os.getenv('MODELS_BUCKET', '')


def lambda_handler(event, context):
    """
    Manage ML model deployments
    Event: S3 upload event or API Gateway request
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        # Handle S3 trigger (new model uploaded)
        if 'Records' in event:
            record = event['Records'][0]
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            size = record['s3']['object'].get('size', 0)

            download_url = generate_presigned_url(bucket, key, expiration=86400)

            # Notify all online devices
            with get_db() as db:
                devices = db.query(Device).filter(Device.status == 'ONLINE').all()
                for device in devices:
                    publish_mqtt(
                        f"agrishield/model-update/{device.id}",
                        {
                            'model_key': key,
                            'download_url': download_url,
                            'size_bytes': size,
                        }
                    )

            return {
                'statusCode': 200,
                'body': json.dumps({
                    'status': 'notified',
                    'model_key': key,
                    'devices_notified': len(devices) if 'devices' in dir() else 0,
                })
            }

        # Handle API request (get model download URL)
        params = event.get('queryStringParameters') or {}
        model_key = params.get('model_key')

        if not model_key:
            return format_api_response(400, {'error': 'model_key is required'})

        download_url = generate_presigned_url(MODELS_BUCKET, model_key, expiration=86400)
        return format_api_response(200, {'model_key': model_key, 'download_url': download_url})

    except Exception as e:
        print(f"Error managing model: {e}")
        return format_api_response(500, {'error': str(e)})
