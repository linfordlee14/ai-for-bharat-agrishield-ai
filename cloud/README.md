# AgriShield AI - Cloud Infrastructure

AWS cloud infrastructure for AgriShield AI system using AWS CDK and Lambda functions.

## Architecture

The cloud infrastructure consists of:

- **AWS IoT Core**: MQTT broker for device communication
- **AWS Lambda**: Serverless functions for event processing
- **Amazon DynamoDB**: NoSQL database for incidents, devices, and telemetry
- **Amazon S3**: Object storage for media files, ML models, and firmware
- **Amazon SNS**: SMS alerting service
- **Amazon Cognito**: User authentication for dashboard
- **Amazon CloudWatch**: Monitoring, logging, and alarms
- **AWS Secrets Manager**: Secure storage for API keys and secrets

## Prerequisites

- Node.js 18.x or higher
- Python 3.10 or higher
- AWS CLI configured with appropriate credentials
- AWS CDK CLI: `npm install -g aws-cdk`

## Setup Instructions

### 1. Install Dependencies

```bash
cd cloud
npm install
```

### 2. Install Python Dependencies for Lambda Functions

```bash
cd lambda
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 3. Configure Environment

Create a `.env` file with your configuration:

```bash
cp .env.example .env
nano .env
```

Required environment variables:
- `AWS_ACCOUNT_ID`: Your AWS account ID
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `ENVIRONMENT`: dev, staging, or prod
- `ALERT_PHONE_NUMBERS`: Comma-separated admin phone numbers

### 4. Bootstrap CDK (first time only)

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### 5. Deploy Infrastructure

```bash
# Deploy all stacks
cdk deploy --all

# Or deploy specific stacks
cdk deploy AgriShieldIoTStack
cdk deploy AgriShieldStorageStack
cdk deploy AgriShieldLambdaStack
cdk deploy AgriShieldFrontendStack
```

### 6. Provision IoT Device

After deployment, provision a new device:

```bash
# Generate device certificates
./scripts/provision-device.sh agrishield-device-001

# This will create:
# - Device certificate
# - Private key
# - IoT Thing
# - IoT Policy attachment
```

## Project Structure

```
cloud/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   ├── iot-stack.ts        # IoT Core infrastructure
│   ├── storage-stack.ts    # DynamoDB and S3
│   ├── lambda-stack.ts     # Lambda functions
│   ├── api-stack.ts        # API Gateway
│   ├── auth-stack.ts       # Cognito User Pool
│   └── monitoring-stack.ts # CloudWatch dashboards and alarms
├── lambda/
│   ├── incident-processor/ # Process incoming incidents
│   ├── alert-router/       # Route SMS alerts
│   ├── telemetry-processor/# Process device telemetry
│   ├── sync-handler/       # Handle batch sync
│   ├── config-manager/     # Manage device configuration
│   ├── model-manager/      # Manage ML models
│   ├── movement-tracker/   # Track wildlife movement
│   └── shared/             # Shared utilities
├── scripts/
│   ├── provision-device.sh # Device provisioning script
│   └── deploy.sh           # Deployment script
├── test/
│   └── *.test.ts           # CDK infrastructure tests
├── cdk.json                # CDK configuration
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md
```

## Lambda Functions

### Incident Processor

Processes incoming wildlife detection incidents from edge devices.

**Trigger**: IoT Rule on topic `agrishield/incidents/*`

**Actions**:
- Parse and validate incident payload
- Store incident in DynamoDB
- Upload media to S3
- Generate presigned URLs
- Invoke Alert Router for HIGH threats
- Send acknowledgment to device

### Alert Router

Routes SMS alerts to nearby farmers and rangers.

**Trigger**: Invoked by Incident Processor for HIGH threats

**Actions**:
- Query devices within 5km radius
- Format SMS message
- Check deduplication window
- Publish to SNS topic
- Log delivery status

### Telemetry Processor

Processes device telemetry and health metrics.

**Trigger**: IoT Rule on topic `agrishield/telemetry/*`

**Actions**:
- Store telemetry in DynamoDB
- Check threshold warnings
- Update device last_seen timestamp
- Publish warnings to monitoring SNS

### Sync Handler

Handles batch synchronization from edge devices.

**Trigger**: IoT Rule on topic `agrishield/sync/*`

**Actions**:
- Process batch of incidents
- Store in DynamoDB using BatchWriteItem
- Upload media files
- Return batch acknowledgment

### Configuration Manager

Manages remote device configuration updates.

**Trigger**: API Gateway POST /devices/{id}/config

**Actions**:
- Validate configuration schema
- Store in DynamoDB for audit
- Publish to device MQTT topic
- Return success/failure response

### Model Manager

Manages ML model deployments to edge devices.

**Trigger**: S3 upload event or API Gateway

**Actions**:
- Calculate model checksum
- Store model metadata in DynamoDB
- Publish update notification to all devices
- Generate presigned download URLs

### Movement Tracker

Tracks wildlife movement across multiple devices.

**Trigger**: IoT Rule on topic `agrishield/detections/broadcast`

**Actions**:
- Correlate detections within 10 min and 1km
- Calculate movement vector
- Classify movement type
- Store movement event in DynamoDB

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token

### Incidents

- `GET /incidents` - Query incidents with filters
- `GET /incidents/{id}` - Get single incident
- `GET /export/incidents` - Export incidents to CSV

### Devices

- `GET /devices` - List all devices
- `GET /devices/{id}` - Get device details
- `PUT /devices/{id}/config` - Update device configuration (admin only)
- `POST /diagnostics/{id}` - Trigger device diagnostics (admin only)

### Telemetry

- `GET /telemetry/{device_id}` - Get device telemetry history

### Movements

- `GET /movements` - Query movement events

## Monitoring

### CloudWatch Dashboards

Access the monitoring dashboard:
```
https://console.aws.amazon.com/cloudwatch/home?region=REGION#dashboards:name=AgriShield
```

Metrics displayed:
- Active device count
- Incidents per hour
- Alert delivery rate
- Lambda performance (P50, P99 latency)
- Error rates

### CloudWatch Alarms

Configured alarms:
- Lambda error rate > 1%
- SMS delivery rate < 95%
- Device offline > 30 minutes
- DynamoDB throttling
- S3 storage > 80% capacity

Alarms send notifications to the monitoring SNS topic.

## Testing

### Unit Tests

```bash
# Test CDK infrastructure
npm test

# Test Lambda functions
cd lambda
pytest tests/ -v
```

### Integration Tests

```bash
# Deploy to test environment
cdk deploy --all --context environment=test

# Run integration tests
npm run test:integration
```

## Deployment

### Development Environment

```bash
cdk deploy --all --context environment=dev
```

### Staging Environment

```bash
cdk deploy --all --context environment=staging
```

### Production Environment

```bash
# Requires approval for security-sensitive changes
cdk deploy --all --context environment=prod --require-approval broadening
```

## Troubleshooting

### View Lambda logs

```bash
# List log groups
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/AgriShield

# Tail logs
aws logs tail /aws/lambda/AgriShield-IncidentProcessor --follow
```

### Test MQTT connectivity

```bash
# Subscribe to topic
aws iot-data subscribe --topic "agrishield/incidents/+" --region REGION

# Publish test message
aws iot-data publish \
  --topic "agrishield/incidents/test-device" \
  --payload '{"device_id":"test","species":"Elephant"}' \
  --region REGION
```

### Check DynamoDB tables

```bash
# List tables
aws dynamodb list-tables

# Scan incidents table
aws dynamodb scan --table-name AgriShield-Incidents --limit 10
```

### View CloudWatch metrics

```bash
# Get Lambda invocation count
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=AgriShield-IncidentProcessor \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## Cost Optimization

- DynamoDB uses on-demand capacity mode (pay per request)
- Lambda functions have appropriate memory and timeout settings
- S3 lifecycle policies move old media to Glacier
- CloudWatch log retention set to 30 days
- IoT Core message size optimized with compression

Estimated monthly cost for 100 devices:
- IoT Core: $5
- Lambda: $10
- DynamoDB: $15
- S3: $5
- SNS: $10
- Total: ~$45/month

## Security

- All data encrypted at rest (DynamoDB, S3)
- All data encrypted in transit (TLS 1.2+)
- IoT devices use X.509 certificate authentication
- API uses Cognito JWT tokens
- IAM roles follow least privilege principle
- Secrets stored in AWS Secrets Manager
- CloudWatch logs enabled for audit trail

## License

Copyright © 2024 AgriShield AI. All rights reserved.
