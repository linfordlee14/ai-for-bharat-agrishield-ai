# AWS Deployment Guide for Hoang

**Project**: AgriShield AI  
**Purpose**: Complete AWS deployment instructions after cloning the repository  
**Audience**: Hoang (DevOps/Deployment Engineer)

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [AWS Account Configuration](#aws-account-configuration)
4. [Backend Lambda Implementation](#backend-lambda-implementation)
5. [AWS CDK Deployment](#aws-cdk-deployment)
6. [Frontend Configuration](#frontend-configuration)
7. [Testing the Deployment](#testing-the-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
Install these tools before starting:

```bash
# Node.js 18+ and npm
node --version  # Should be 18.x or higher
npm --version

# AWS CLI v2
aws --version  # Should be 2.x

# AWS CDK
npm install -g aws-cdk
cdk --version  # Should be 2.x

# Python 3.9+
python3 --version  # Should be 3.9 or higher
pip3 --version

# Git
git --version
```

### AWS Account Requirements
- Active AWS account with admin access
- AWS CLI configured with credentials
- Sufficient service limits for:
  - Lambda functions (12 needed)
  - DynamoDB tables (4 needed)
  - S3 buckets (2 needed)
  - IoT Core
  - API Gateway
  - Cognito User Pool
  - CloudFront distribution

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd agrishield-ai

# Verify the structure
ls -la
# You should see: cloud/, edge/, frontend/, docs/, README.md, etc.
```

### 2. Install Dependencies

```bash
# Install cloud/CDK dependencies
cd cloud
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install edge device dependencies (optional for deployment)
cd ../edge
pip3 install -r requirements.txt

# Return to root
cd ..
```

---

## AWS Account Configuration

### 1. Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Enter when prompted:
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: us-east-1  # or your preferred region
# Default output format: json

# Verify configuration
aws sts get-caller-identity
# Should show your account ID and user ARN
```

### 2. Set Environment Variables

Create a `.env` file in the `cloud/` directory:

```bash
cd cloud
cat > .env << 'EOF'
# AWS Configuration
AWS_ACCOUNT_ID=123456789012  # Replace with your AWS account ID
AWS_REGION=us-east-1         # Replace with your preferred region

# Application Configuration
ENVIRONMENT=production
PROJECT_NAME=agrishield-ai

# SNS Configuration (for SMS alerts)
SMS_SENDER_ID=AgriShield
SMS_PHONE_NUMBERS=+919876543210,+919876543211  # Comma-separated list

# DynamoDB Configuration
INCIDENTS_TABLE_NAME=agrishield-incidents
DEVICES_TABLE_NAME=agrishield-devices
TELEMETRY_TABLE_NAME=agrishield-telemetry
MOVEMENTS_TABLE_NAME=agrishield-movements

# S3 Configuration
MEDIA_BUCKET_NAME=agrishield-media-${AWS_ACCOUNT_ID}
MODELS_BUCKET_NAME=agrishield-models-${AWS_ACCOUNT_ID}

# IoT Configuration
IOT_ENDPOINT=  # Will be populated after deployment

# API Configuration
API_STAGE=prod
EOF

# Replace AWS_ACCOUNT_ID with your actual account ID
# Get your account ID:
aws sts get-caller-identity --query Account --output text
```

### 3. Bootstrap AWS CDK (First Time Only)

```bash
# Bootstrap CDK in your AWS account
cd cloud
cdk bootstrap aws://ACCOUNT-ID/REGION

# Example:
# cdk bootstrap aws://123456789012/us-east-1

# Verify bootstrap
aws cloudformation describe-stacks --stack-name CDKToolkit
```

---

## Backend Lambda Implementation

**IMPORTANT**: The Lambda functions currently have placeholder code. You need to implement them before deployment.

### Lambda Functions to Implement

Navigate to `cloud/lambda/` and implement these 12 functions:

#### 1. Incident Processor (`incident-processor/handler.py`)
```python
# TODO: Implement incident processing logic
# - Parse and validate incident JSON from IoT Core
# - Store in DynamoDB incidents table
# - Upload media to S3
# - Generate presigned URLs
# - Invoke alert router for HIGH threats
# - Publish acknowledgment to device
```

#### 2. Alert Router (`alert-router/handler.py`)
```python
# TODO: Implement alert routing logic
# - Retrieve device location from DynamoDB
# - Query for phone numbers within 5km radius
# - Format SMS message
# - Check deduplication window (5 minutes)
# - Publish to SNS topic for SMS delivery
```

#### 3. Telemetry Processor (`telemetry-processor/handler.py`)
```python
# TODO: Implement telemetry processing
# - Store telemetry data in DynamoDB
# - Check thresholds for warnings
# - Update device status
```

#### 4. Movement Tracker (`movement-tracker/handler.py`)
```python
# TODO: Implement movement tracking
# - Correlate detections within 10min/1km
# - Calculate movement vector
# - Store movement events
```

#### 5. Sync Handler (`sync-handler/handler.py`)
```python
# TODO: Implement batch sync
# - Process batch incidents from edge devices
# - Store using BatchWriteItem
# - Handle offline sync
```

#### 6-9. API Query Endpoints
```python
# query-incidents/handler.py - Query incidents with filters
# query-devices/handler.py - Query device status
# query-movements/handler.py - Query movement events
# query-telemetry/handler.py - Query telemetry data
```

#### 10-12. Configuration Management
```python
# config-manager/handler.py - Manage device configuration
# model-manager/handler.py - Manage ML model updates
# update-device-config/handler.py - Update device settings via MQTT
```

### Quick Implementation Template

For each Lambda function, use this template:

```python
import json
import os
import boto3
from datetime import datetime

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
sns = boto3.client('sns')
iot = boto3.client('iot-data')

# Environment variables
TABLE_NAME = os.environ.get('TABLE_NAME')
BUCKET_NAME = os.environ.get('BUCKET_NAME')

def lambda_handler(event, context):
    """
    Main Lambda handler
    """
    try:
        print(f"Received event: {json.dumps(event)}")
        
        # TODO: Implement your logic here
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': 'Success'})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

---

## AWS CDK Deployment

### 1. Review CDK Stacks

```bash
cd cloud

# List all stacks
cdk list

# You should see:
# AgriShieldStorageStack
# AgriShieldLambdaStack
# AgriShieldIoTStack
# AgriShieldFrontendStack
```

### 2. Synthesize CloudFormation Templates

```bash
# Generate CloudFormation templates
cdk synth

# Review the generated templates in cdk.out/
ls -la cdk.out/
```

### 3. Deploy Stacks in Order

```bash
# Deploy storage stack first (DynamoDB, S3)
cdk deploy AgriShieldStorageStack

# Wait for completion, then deploy Lambda stack
cdk deploy AgriShieldLambdaStack

# Deploy IoT stack
cdk deploy AgriShieldIoTStack

# Finally, deploy frontend stack
cdk deploy AgriShieldFrontendStack

# Or deploy all at once:
cdk deploy --all
```

### 4. Note the Outputs

After deployment, CDK will output important values. **Save these**:

```
Outputs:
AgriShieldStorageStack.IncidentsTableName = agrishield-incidents
AgriShieldStorageStack.DevicesTableName = agrishield-devices
AgriShieldStorageStack.MediaBucketName = agrishield-media-123456789012

AgriShieldLambdaStack.ApiGatewayUrl = https://abc123.execute-api.us-east-1.amazonaws.com/prod

AgriShieldIoTStack.IoTEndpoint = abc123-ats.iot.us-east-1.amazonaws.com

AgriShieldFrontendStack.CloudFrontUrl = https://d123456.cloudfront.net
AgriShieldFrontendStack.CognitoUserPoolId = us-east-1_ABC123
AgriShieldFrontendStack.CognitoClientId = 1234567890abcdef
```

---

## Frontend Configuration

### 1. Update Frontend Environment Variables

```bash
cd frontend

# Create production environment file
cat > .env.production << 'EOF'
# API Configuration
VITE_API_BASE_URL=https://YOUR_API_GATEWAY_URL/prod

# AWS Configuration
VITE_AWS_REGION=us-east-1

# Cognito Configuration
VITE_COGNITO_USER_POOL_ID=YOUR_USER_POOL_ID
VITE_COGNITO_CLIENT_ID=YOUR_CLIENT_ID

# Map Configuration (India)
VITE_MAP_DEFAULT_CENTER_LAT=20.5937
VITE_MAP_DEFAULT_CENTER_LNG=78.9629
VITE_MAP_DEFAULT_ZOOM=5
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Feature Flags
VITE_ENABLE_MOVEMENT_TRACKING=true
VITE_ENABLE_AUDIO_DETECTION=true
VITE_ENABLE_DIAGNOSTICS=true

# Refresh Intervals (milliseconds)
VITE_INCIDENTS_REFRESH_INTERVAL=30000
VITE_DEVICES_REFRESH_INTERVAL=60000
VITE_TELEMETRY_REFRESH_INTERVAL=60000

# Application
VITE_APP_NAME=AgriShield AI
VITE_APP_VERSION=1.0.0

# IMPORTANT: Disable mock mode for production
VITE_MOCK_API=false
EOF

# Replace placeholders with actual values from CDK outputs
# Use sed or manually edit the file
```

### 2. Build Frontend

```bash
# Build for production
npm run build

# Verify build
ls -la dist/
```

### 3. Deploy Frontend to S3/CloudFront

```bash
# Get the S3 bucket name from CDK outputs
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name AgriShieldFrontendStack \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

# Upload build to S3
aws s3 sync dist/ s3://${FRONTEND_BUCKET}/ --delete

# Invalidate CloudFront cache
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name AgriShieldFrontendStack \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"
```

---

## Testing the Deployment

### 1. Create Cognito Users

```bash
# Get User Pool ID
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name AgriShieldFrontendStack \
  --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPoolId`].OutputValue' \
  --output text)

# Create ranger user
aws cognito-idp admin-create-user \
  --user-pool-id ${USER_POOL_ID} \
  --username ranger@agrishield.ai \
  --user-attributes Name=email,Value=ranger@agrishield.ai Name=name,Value="John Ranger" \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id ${USER_POOL_ID} \
  --username ranger@agrishield.ai \
  --password Ranger123! \
  --permanent

# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id ${USER_POOL_ID} \
  --username admin@agrishield.ai \
  --user-attributes Name=email,Value=admin@agrishield.ai Name=name,Value="Sarah Admin" \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id ${USER_POOL_ID} \
  --username admin@agrishield.ai \
  --password Admin123! \
  --permanent
```

### 2. Test API Endpoints

```bash
# Get API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name AgriShieldLambdaStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text)

# Test devices endpoint
curl ${API_URL}/devices

# Test incidents endpoint
curl ${API_URL}/incidents
```

### 3. Test Frontend

```bash
# Get CloudFront URL
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
  --stack-name AgriShieldFrontendStack \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
  --output text)

echo "Frontend URL: ${CLOUDFRONT_URL}"

# Open in browser
open ${CLOUDFRONT_URL}  # macOS
# or
xdg-open ${CLOUDFRONT_URL}  # Linux
```

### 4. Provision Test Device

```bash
cd cloud/scripts

# Make script executable
chmod +x provision-device.sh

# Provision a test device
./provision-device.sh agrishield-device-001

# This will create:
# - IoT Thing
# - IoT Certificate
# - IoT Policy
# - Device entry in DynamoDB
```

---

## Post-Deployment Configuration

### 1. Configure SNS for SMS

```bash
# Request SMS spending limit increase (if needed)
# Go to AWS Console > SNS > Text messaging (SMS) > Spending limits

# Set SMS attributes
aws sns set-sms-attributes \
  --attributes DefaultSenderID=AgriShield,DefaultSMSType=Transactional
```

### 2. Add Device Records to DynamoDB

```bash
# Get table name
DEVICES_TABLE=$(aws cloudformation describe-stacks \
  --stack-name AgriShieldStorageStack \
  --query 'Stacks[0].Outputs[?OutputKey==`DevicesTableName`].OutputValue' \
  --output text)

# Add a device record
aws dynamodb put-item \
  --table-name ${DEVICES_TABLE} \
  --item '{
    "device_id": {"S": "agrishield-device-001"},
    "location_name": {"S": "Farm Block A - North Sector"},
    "latitude": {"N": "15.3647"},
    "longitude": {"N": "75.1240"},
    "status": {"S": "Online"},
    "phone_numbers": {"L": [{"S": "+919876543210"}]},
    "configuration": {"M": {
      "confidence_threshold": {"N": "0.7"},
      "frame_rate": {"N": "15"},
      "deterrence_enabled": {"BOOL": true}
    }}
  }'
```

### 3. Upload ML Model to S3

```bash
# Get models bucket name
MODELS_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name AgriShieldStorageStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ModelsBucketName`].OutputValue' \
  --output text)

# Upload model file (if you have one)
aws s3 cp path/to/model.tflite s3://${MODELS_BUCKET}/models/wildlife-detection-v2.1.0.tflite
```

---

## Monitoring and Logs

### 1. View Lambda Logs

```bash
# List log groups
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/agrishield

# Tail logs for incident processor
aws logs tail /aws/lambda/agrishield-incident-processor --follow

# View recent errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/agrishield-incident-processor \
  --filter-pattern "ERROR"
```

### 2. Monitor DynamoDB

```bash
# Check table metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=agrishield-incidents \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### 3. Check API Gateway Metrics

```bash
# Get API ID
API_ID=$(aws apigateway get-rest-apis \
  --query 'items[?name==`AgriShield API`].id' \
  --output text)

# View API metrics in CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=AgriShield \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

---

## Troubleshooting

### Common Issues

#### 1. CDK Bootstrap Failed
```bash
# Error: Unable to resolve AWS account
# Solution: Ensure AWS CLI is configured
aws configure list
aws sts get-caller-identity
```

#### 2. Lambda Deployment Failed
```bash
# Error: Code size too large
# Solution: Check Lambda layer usage and dependencies
cd cloud/lambda
du -sh */
```

#### 3. Frontend Not Loading
```bash
# Check CloudFront distribution status
aws cloudfront get-distribution --id ${DISTRIBUTION_ID}

# Check S3 bucket contents
aws s3 ls s3://${FRONTEND_BUCKET}/

# Check browser console for CORS errors
```

#### 4. API Gateway 403 Errors
```bash
# Check Cognito authentication
# Verify JWT token in browser developer tools
# Check API Gateway authorizer configuration
```

#### 5. IoT Device Connection Failed
```bash
# Check IoT endpoint
aws iot describe-endpoint --endpoint-type iot:Data-ATS

# Verify certificate is attached to thing
aws iot list-thing-principals --thing-name agrishield-device-001

# Check IoT policy
aws iot get-policy --policy-name AgriShieldDevicePolicy
```

### Useful Commands

```bash
# View all CloudFormation stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Delete a stack (if needed)
cdk destroy AgriShieldFrontendStack

# View CDK diff before deployment
cdk diff

# Force redeploy Lambda
cdk deploy AgriShieldLambdaStack --force

# Export CloudFormation template
cdk synth AgriShieldStorageStack > storage-stack.yaml
```

---

## Cost Estimation

### Expected Monthly Costs (Low Traffic)
- **Lambda**: $5-10 (1M requests)
- **DynamoDB**: $5-15 (on-demand pricing)
- **S3**: $5-10 (100GB storage)
- **IoT Core**: $10-20 (5 devices, 1M messages)
- **API Gateway**: $3-5 (1M requests)
- **CloudFront**: $5-10 (100GB transfer)
- **Cognito**: Free (< 50,000 MAU)
- **SNS SMS**: Variable (depends on SMS volume)

**Total**: ~$40-80/month for development/testing

### Cost Optimization Tips
- Use DynamoDB on-demand pricing for variable workloads
- Enable S3 lifecycle policies for old media
- Use CloudFront caching to reduce origin requests
- Set up billing alerts in AWS Console

---

## Security Checklist

- [ ] Enable MFA on AWS root account
- [ ] Use IAM roles instead of access keys where possible
- [ ] Enable CloudTrail for audit logging
- [ ] Enable AWS Config for compliance
- [ ] Set up AWS GuardDuty for threat detection
- [ ] Enable S3 bucket encryption
- [ ] Enable DynamoDB encryption at rest
- [ ] Use Secrets Manager for sensitive data
- [ ] Enable VPC Flow Logs (if using VPC)
- [ ] Set up AWS WAF for API Gateway
- [ ] Enable CloudFront HTTPS only
- [ ] Rotate IoT certificates regularly

---

## Next Steps After Deployment

1. **Test with Real Device**: Connect an edge device and verify end-to-end flow
2. **Load Testing**: Use tools like Artillery or Locust to test API performance
3. **Set Up CI/CD**: Configure GitHub Actions or AWS CodePipeline for automated deployments
4. **Enable Monitoring**: Set up CloudWatch dashboards and alarms
5. **Documentation**: Update API documentation with actual endpoints
6. **User Training**: Train rangers and admins on using the system

---

## Support and Resources

### AWS Documentation
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [IoT Core Developer Guide](https://docs.aws.amazon.com/iot/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)

### Project Documentation
- `COMPLETION_SUMMARY.md` - Feature overview
- `DEMO_INSTRUCTIONS.md` - Demo guide
- `cloud/DEPLOYMENT.md` - Detailed deployment docs
- `cloud/README.md` - Cloud infrastructure overview

### Contact
For deployment issues or questions, contact the development team.

---

**Good luck with the deployment, Hoang! 🚀**
