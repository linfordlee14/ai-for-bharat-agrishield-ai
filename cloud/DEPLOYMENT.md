# AgriShield AI - Cloud Infrastructure Deployment Guide

This guide provides step-by-step instructions for deploying the AgriShield AI cloud infrastructure using AWS CDK.

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js** 18.x or higher
4. **Python** 3.10 or higher
5. **AWS CDK CLI** installed globally: `npm install -g aws-cdk`

## Architecture Overview

The infrastructure is organized into four CDK stacks:

1. **Storage Stack** - DynamoDB tables, S3 buckets, SNS topics
2. **IoT Stack** - IoT Core, Thing Types, Policies, Rules
3. **Lambda Stack** - Lambda functions for event processing
4. **Frontend Stack** - Cognito User Pool, API Gateway

Stack dependencies:
```
Storage Stack (no dependencies)
    ↓
IoT Stack (depends on Storage)
    ↓
Lambda Stack (depends on Storage + IoT)
    ↓
Frontend Stack (depends on Lambda)
```

## Initial Setup

### 1. Install Dependencies

```bash
cd cloud
npm install
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# AWS Configuration
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1

# Environment (dev, staging, prod)
ENVIRONMENT=dev

# Alert Configuration (comma-separated phone numbers)
ALERT_PHONE_NUMBERS=+1234567890,+0987654321
```

### 3. Bootstrap CDK (First Time Only)

Bootstrap CDK in your AWS account and region:

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

Example:
```bash
cdk bootstrap aws://123456789012/us-east-1
```

This creates the necessary S3 bucket and IAM roles for CDK deployments.

## Deployment

### Development Environment

Deploy all stacks to development environment:

```bash
npm run deploy:dev
```

Or use the deployment script:

```bash
./scripts/deploy.sh dev
```

### Staging Environment

Deploy to staging:

```bash
npm run deploy:staging
```

### Production Environment

Production deployments require approval for security-sensitive changes:

```bash
npm run deploy:prod
```

This will prompt for approval before:
- Creating IAM roles or policies
- Modifying security groups
- Changing encryption settings

## Stack-by-Stack Deployment

You can deploy individual stacks:

```bash
# Deploy only Storage Stack
cdk deploy AgriShield-Dev-Storage --context environment=dev

# Deploy only IoT Stack
cdk deploy AgriShield-Dev-IoT --context environment=dev

# Deploy only Lambda Stack
cdk deploy AgriShield-Dev-Lambda --context environment=dev

# Deploy only Frontend Stack
cdk deploy AgriShield-Dev-Frontend --context environment=dev
```

## Post-Deployment Configuration

### 1. Provision IoT Devices

After deployment, provision edge devices:

```bash
./scripts/provision-device.sh agrishield-device-001 dev
```

This creates:
- IoT Thing
- X.509 certificate and private key
- Policy attachment
- Device configuration file

Copy the generated certificates to your edge device:

```bash
scp -r ./certs/agrishield-device-001 pi@<device-ip>:~/agrishield/certs/
```

### 2. Create Cognito Users

Create users for dashboard access:

```bash
# Get User Pool ID from stack outputs
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name AgriShield-Dev-Frontend \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolIdOutput'].OutputValue" \
  --output text)

# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com \
  --temporary-password TempPassword123! \
  --message-action SUPPRESS

# Add user to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username admin@example.com \
  --group-name admin

# Create ranger user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username ranger@example.com \
  --user-attributes Name=email,Value=ranger@example.com \
  --temporary-password TempPassword123! \
  --message-action SUPPRESS

# Add user to ranger group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username ranger@example.com \
  --group-name ranger
```

### 3. Register Devices in DynamoDB

Add device metadata to the Devices table:

```bash
aws dynamodb put-item \
  --table-name agrishield-devices-dev \
  --item '{
    "device_id": {"S": "agrishield-device-001"},
    "location_name": {"S": "Farm Block A"},
    "latitude": {"N": "-1.2921"},
    "longitude": {"N": "36.8219"},
    "status": {"S": "Online"},
    "firmware_version": {"S": "1.0.0"},
    "model_version": {"S": "1.0.0"},
    "phone_numbers": {"L": [
      {"S": "+1234567890"},
      {"S": "+0987654321"}
    ]},
    "created_at": {"N": "'$(date +%s)'"},
    "updated_at": {"N": "'$(date +%s)'"}
  }'
```

### 4. Configure Frontend

Update frontend configuration with API endpoint and User Pool ID:

```bash
# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name AgriShield-Dev-Frontend \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpointOutput'].OutputValue" \
  --output text)

# Get User Pool ID
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name AgriShield-Dev-Frontend \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolIdOutput'].OutputValue" \
  --output text)

# Get User Pool Client ID
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name AgriShield-Dev-Frontend \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" \
  --output text)

echo "API_ENDPOINT=$API_ENDPOINT"
echo "USER_POOL_ID=$USER_POOL_ID"
echo "USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID"
```

Add these values to your frontend `.env` file.

## Verification

### Test IoT Connectivity

Subscribe to incident topic:

```bash
aws iot-data subscribe \
  --topic "agrishield/incidents/+" \
  --region us-east-1
```

Publish test message:

```bash
aws iot-data publish \
  --topic "agrishield/incidents/agrishield-device-001" \
  --payload '{"device_id":"agrishield-device-001","species":"Elephant","confidence":0.92,"threat_level":"HIGH","timestamp":1704067200,"latitude":-1.2921,"longitude":36.8219}' \
  --region us-east-1
```

### Check Lambda Logs

View Lambda function logs:

```bash
aws logs tail /aws/lambda/agrishield-incident-processor-dev --follow
```

### Query DynamoDB

Check if incident was stored:

```bash
aws dynamodb scan \
  --table-name agrishield-incidents-dev \
  --limit 10
```

## Monitoring

### CloudWatch Dashboard

Access the CloudWatch dashboard:

```
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:
```

### CloudWatch Alarms

View configured alarms:

```bash
aws cloudwatch describe-alarms \
  --alarm-name-prefix AgriShield
```

### Lambda Metrics

View Lambda invocation metrics:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=agrishield-incident-processor-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

## Updating Infrastructure

### Update Stack

After making changes to CDK code:

```bash
# Build TypeScript
npm run build

# View changes
cdk diff --context environment=dev

# Deploy changes
npm run deploy:dev
```

### Update Lambda Functions

Lambda function code is deployed with the stack. To update:

1. Modify Lambda function code in `lambda/` directory
2. Run `npm run deploy:dev`

CDK will automatically detect changes and update the Lambda functions.

## Rollback

If deployment fails or you need to rollback:

```bash
# Rollback to previous version
aws cloudformation cancel-update-stack \
  --stack-name AgriShield-Dev-Lambda

# Or delete and redeploy
cdk destroy AgriShield-Dev-Lambda --context environment=dev
cdk deploy AgriShield-Dev-Lambda --context environment=dev
```

## Cleanup

To remove all infrastructure:

```bash
# Destroy all stacks
npm run destroy

# Or destroy specific environment
cdk destroy --all --context environment=dev
```

**Warning:** This will delete all data in DynamoDB tables and S3 buckets (except production with RETAIN policy).

## Troubleshooting

### CDK Bootstrap Issues

If you see "CDK bootstrap stack not found":

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION --force
```

### Permission Errors

Ensure your AWS credentials have the following permissions:
- CloudFormation full access
- IAM role creation
- Lambda function management
- DynamoDB table management
- S3 bucket management
- IoT Core management
- Cognito management

### Stack Dependency Errors

Deploy stacks in order:

```bash
cdk deploy AgriShield-Dev-Storage --context environment=dev
cdk deploy AgriShield-Dev-IoT --context environment=dev
cdk deploy AgriShield-Dev-Lambda --context environment=dev
cdk deploy AgriShield-Dev-Frontend --context environment=dev
```

### Lambda Function Errors

Check CloudWatch Logs:

```bash
aws logs tail /aws/lambda/FUNCTION-NAME --follow
```

## Cost Estimation

Estimated monthly costs for 100 devices:

| Service | Cost |
|---------|------|
| IoT Core (messages) | $5 |
| Lambda (invocations) | $10 |
| DynamoDB (on-demand) | $15 |
| S3 (storage + requests) | $5 |
| SNS (SMS) | $10 |
| CloudWatch (logs + metrics) | $5 |
| **Total** | **~$50/month** |

Costs scale linearly with number of devices and incident frequency.

## Support

For issues or questions:
1. Check CloudWatch Logs for error messages
2. Review CDK synthesis output: `cdk synth`
3. Validate environment configuration in `.env`
4. Ensure AWS credentials are properly configured

## Next Steps

After successful deployment:
1. Deploy edge device software to Raspberry Pi devices
2. Configure frontend application with API endpoints
3. Set up monitoring alerts and dashboards
4. Test end-to-end incident flow
5. Train ML models and upload to S3 models bucket
