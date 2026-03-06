# AgriShield AI - Deployment Guide

This guide walks you through deploying the complete AgriShield AI system to AWS.

---

## Prerequisites

### Required Tools
- Node.js 18+ and npm
- Python 3.9+
- AWS CLI configured with appropriate credentials
- AWS CDK CLI: `npm install -g aws-cdk`
- Git

### AWS Account Requirements
- Active AWS account
- IAM user with administrator access (or specific permissions for CDK deployment)
- AWS CLI configured: `aws configure`

### Estimated Costs
- **Development/Testing**: ~$50-100/month
- **Production (500 devices)**: ~$500-1000/month
- Main costs: DynamoDB, S3 storage, Lambda invocations, IoT Core messages

---

## Phase 1: Cloud Infrastructure Deployment

### Step 1: Prepare CDK Project

```bash
cd cloud
npm install
```

### Step 2: Bootstrap CDK (First Time Only)

```bash
# Bootstrap CDK in your AWS account/region
cdk bootstrap aws://ACCOUNT-ID/REGION

# Example:
cdk bootstrap aws://123456789012/us-east-1
```

### Step 3: Review Configuration

Edit `cloud/bin/app.ts` to configure:
- Stack names
- AWS region
- Environment (dev/staging/prod)

```typescript
const app = new cdk.App()

// Configure your environment
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
}

// Deploy stacks
new StorageStack(app, 'AgriShield-Storage-Dev', { env })
new IoTStack(app, 'AgriShield-IoT-Dev', { env })
new LambdaStack(app, 'AgriShield-Lambda-Dev', { env })
new FrontendStack(app, 'AgriShield-Frontend-Dev', { env })
```

### Step 4: Synthesize CloudFormation Templates

```bash
# Generate CloudFormation templates
cdk synth

# Review what will be deployed
cdk diff
```

### Step 5: Deploy All Stacks

```bash
# Deploy all stacks
cdk deploy --all

# Or deploy individually
cdk deploy AgriShield-Storage-Dev
cdk deploy AgriShield-IoT-Dev
cdk deploy AgriShield-Lambda-Dev
cdk deploy AgriShield-Frontend-Dev
```

**Note**: Deployment takes 10-15 minutes. CDK will show progress and ask for confirmation before creating resources.

### Step 6: Capture Output Values

After deployment, CDK will output important values:

```
Outputs:
AgriShield-IoT-Dev.IoTEndpoint = xxxxx.iot.us-east-1.amazonaws.com
AgriShield-Lambda-Dev.ApiGatewayUrl = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
AgriShield-Frontend-Dev.CognitoUserPoolId = us-east-1_XXXXXXXXX
AgriShield-Frontend-Dev.CognitoClientId = XXXXXXXXXXXXXXXXXXXXXXXXXX
AgriShield-Frontend-Dev.CloudFrontUrl = https://xxxxx.cloudfront.net
```

**Save these values** - you'll need them for configuration.

---

## Phase 2: Cognito User Setup

### Step 1: Get Cognito Details

```bash
# List User Pools
aws cognito-idp list-user-pools --max-results 10

# Get User Pool ID (from CDK output or above command)
USER_POOL_ID="us-east-1_XXXXXXXXX"

# List User Pool Clients
aws cognito-idp list-user-pool-clients --user-pool-id $USER_POOL_ID
```

### Step 2: Create Admin User

```bash
# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username admin@agrishield.ai \
  --user-attributes \
    Name=email,Value=admin@agrishield.ai \
    Name=email_verified,Value=true \
    Name=custom:role,Value=admin \
    Name=name,Value="Admin User" \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username admin@agrishield.ai \
  --password "YourSecurePassword123!" \
  --permanent
```

### Step 3: Create Ranger User

```bash
# Create ranger user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username ranger@agrishield.ai \
  --user-attributes \
    Name=email,Value=ranger@agrishield.ai \
    Name=email_verified,Value=true \
    Name=custom:role,Value=ranger \
    Name=name,Value="Ranger User" \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username ranger@agrishield.ai \
  --password "YourSecurePassword123!" \
  --permanent
```

### Step 4: Add Users to Groups

```bash
# Add admin to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username admin@agrishield.ai \
  --group-name admin

# Add ranger to ranger group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username ranger@agrishield.ai \
  --group-name ranger
```

---

## Phase 3: Frontend Configuration

### Step 1: Update Environment Variables

Create `frontend/.env` with production values:

```bash
cd frontend
cp .env.production .env
```

Edit `frontend/.env`:

```env
# IMPORTANT: Set to false for production
VITE_MOCK_API=false

# API Gateway URL from CDK output
VITE_API_BASE_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod

# AWS Region
VITE_AWS_REGION=us-east-1

# Cognito values from CDK output
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX

# Map configuration (adjust for your region)
VITE_MAP_DEFAULT_CENTER_LAT=-1.2921
VITE_MAP_DEFAULT_CENTER_LNG=36.8219
VITE_MAP_DEFAULT_ZOOM=12

# Feature flags
VITE_ENABLE_MOVEMENT_TRACKING=true
VITE_ENABLE_AUDIO_DETECTION=true
VITE_ENABLE_DIAGNOSTICS=true
```

### Step 2: Build Frontend

```bash
npm install
npm run build
```

This creates optimized production files in `frontend/dist/`.

### Step 3: Deploy to S3/CloudFront

If using CDK Frontend Stack (recommended):

```bash
# Frontend is automatically deployed via CDK
# Access via CloudFront URL from CDK output
```

Manual deployment to S3:

```bash
# Create S3 bucket (if not using CDK)
aws s3 mb s3://agrishield-frontend-prod

# Enable static website hosting
aws s3 website s3://agrishield-frontend-prod \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://agrishield-frontend-prod/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# Make public (if not using CloudFront)
aws s3api put-bucket-policy \
  --bucket agrishield-frontend-prod \
  --policy file://bucket-policy.json
```

---

## Phase 4: Edge Device Setup

### Step 1: Provision IoT Device

```bash
cd cloud/scripts

# Run provisioning script
./provision-device.sh device-001 "Field Station Alpha"
```

This creates:
- IoT Thing in AWS IoT Core
- X.509 certificate and private key
- IoT Policy attached to certificate
- Downloads certificates to `edge/certs/`

### Step 2: Configure Edge Device

Copy files to Raspberry Pi:

```bash
# Copy entire edge directory
scp -r edge/ pi@raspberrypi.local:~/agrishield/

# SSH into device
ssh pi@raspberrypi.local
```

On the Raspberry Pi:

```bash
cd ~/agrishield/edge

# Install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure device
cp config.example.yaml config.yaml
nano config.yaml
```

Edit `config.yaml`:

```yaml
device:
  device_id: "device-001"
  location:
    name: "Field Station Alpha"
    latitude: -1.2921
    longitude: 36.8219

aws:
  region: "us-east-1"
  iot_endpoint: "xxxxx.iot.us-east-1.amazonaws.com"  # From CDK output
  
certificates:
  ca_cert: "certs/AmazonRootCA1.pem"
  device_cert: "certs/device-001-certificate.pem.crt"
  private_key: "certs/device-001-private.pem.key"
```

### Step 3: Test Edge Device

```bash
# Run in test mode
python3 src/main.py --test

# Check connectivity
python3 src/diagnostics.py
```

---

## Phase 5: Verification & Testing

### Test 1: Frontend Authentication

1. Open CloudFront URL in browser
2. Login with admin credentials
3. Verify dashboard loads
4. Check browser console for errors
5. Logout and login with ranger credentials
6. Verify ranger has read-only access

### Test 2: API Endpoints

```bash
# Get JWT token (login via frontend first, then check sessionStorage)
TOKEN="<your-jwt-token>"

# Test incidents endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/incidents

# Test devices endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/devices
```

### Test 3: Edge Device to Cloud

1. Trigger detection on edge device
2. Check CloudWatch Logs for Lambda invocations
3. Verify incident appears in DynamoDB
4. Verify incident appears in dashboard
5. Check S3 for uploaded media

### Test 4: Alerts

1. Trigger HIGH threat detection
2. Verify SMS alert sent (check SNS)
3. Verify alert appears in dashboard
4. Check alert deduplication (5-minute window)

---

## Phase 6: Monitoring Setup

### CloudWatch Alarms

```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name AgriShield-Lambda-Errors \
  --alarm-description "Alert when Lambda error rate > 1%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 0.01 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Create alarm for device offline
aws cloudwatch put-metric-alarm \
  --alarm-name AgriShield-Device-Offline \
  --alarm-description "Alert when device offline > 30 min" \
  --metric-name DeviceOffline \
  --namespace AgriShield \
  --statistic Maximum \
  --period 1800 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1
```

### CloudWatch Dashboard

Create dashboard in AWS Console:
- Incidents per hour
- Active devices count
- Lambda invocation count
- API Gateway latency
- DynamoDB read/write capacity

---

## Troubleshooting

### Frontend Issues

**Problem**: "Cognito not configured" error

**Solution**: Verify `.env` has correct Cognito values and `VITE_MOCK_API=false`

**Problem**: API calls fail with CORS error

**Solution**: Check API Gateway CORS configuration in CDK

### Edge Device Issues

**Problem**: Device can't connect to IoT Core

**Solution**: 
- Verify certificates are correct
- Check IoT endpoint URL
- Verify IoT Policy allows connection
- Check network connectivity

**Problem**: Incidents not appearing in dashboard

**Solution**:
- Check CloudWatch Logs for Lambda errors
- Verify DynamoDB table has data
- Check API Gateway logs

### Authentication Issues

**Problem**: Can't login with created users

**Solution**:
- Verify user exists: `aws cognito-idp admin-get-user --user-pool-id $USER_POOL_ID --username admin@agrishield.ai`
- Check user is in correct group
- Verify password is set correctly
- Check Cognito User Pool Client settings

---

## Rollback Procedure

If deployment fails or issues arise:

```bash
# Destroy all stacks
cdk destroy --all

# Or destroy individual stacks
cdk destroy AgriShield-Frontend-Dev
cdk destroy AgriShield-Lambda-Dev
cdk destroy AgriShield-IoT-Dev
cdk destroy AgriShield-Storage-Dev
```

**Warning**: This deletes all data. Backup DynamoDB tables first if needed.

---

## Cost Optimization

### Development Environment
- Use on-demand DynamoDB (not provisioned)
- Delete old S3 objects with lifecycle policies
- Stop edge devices when not testing
- Use CloudWatch Logs retention (7 days for dev)

### Production Environment
- Use DynamoDB reserved capacity for predictable workloads
- Enable S3 Intelligent-Tiering
- Use CloudFront caching
- Set up budget alerts

---

## Security Hardening

### Post-Deployment Security

1. **Enable MFA for AWS Console**
2. **Rotate IoT certificates regularly**
3. **Enable CloudTrail logging**
4. **Set up AWS Config rules**
5. **Enable GuardDuty**
6. **Regular security audits**

### Cognito Security

```bash
# Enable MFA for users
aws cognito-idp set-user-pool-mfa-config \
  --user-pool-id $USER_POOL_ID \
  --mfa-configuration OPTIONAL \
  --software-token-mfa-configuration Enabled=true
```

---

## Maintenance

### Regular Tasks

**Daily**:
- Check CloudWatch alarms
- Review error logs
- Monitor costs

**Weekly**:
- Review device connectivity
- Check storage usage
- Update dependencies

**Monthly**:
- Rotate credentials
- Review IAM permissions
- Update Lambda functions
- Backup DynamoDB tables

---

## Support & Resources

- **AWS Documentation**: https://docs.aws.amazon.com/
- **CDK Documentation**: https://docs.aws.amazon.com/cdk/
- **Project Repository**: [Your GitHub URL]
- **Issue Tracker**: [Your GitHub Issues URL]

---

**Last Updated**: Production readiness review  
**Version**: 1.0.0  
**Status**: Ready for deployment
