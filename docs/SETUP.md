# AgriShield AI - Complete Setup Guide

This guide walks you through setting up the complete AgriShield AI system from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Edge Device Setup](#edge-device-setup)
3. [Cloud Infrastructure Setup](#cloud-infrastructure-setup)
4. [Frontend Dashboard Setup](#frontend-dashboard-setup)
5. [Device Provisioning](#device-provisioning)
6. [Testing the System](#testing-the-system)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Hardware Requirements

- **Edge Device**: Raspberry Pi 4 (4GB RAM minimum)
- **Camera**: Raspberry Pi Camera Module v2 or compatible
- **Microphone**: USB microphone
- **Connectivity**: GSM HAT (SIM7600) or LoRa HAT (RAK2245)
- **Storage**: 32GB microSD card minimum
- **Power**: 5V 3A power supply (solar panel + battery recommended)

### Software Requirements

- **Development Machine**: macOS, Linux, or Windows with WSL2
- **Node.js**: 18.x or higher
- **Python**: 3.10 or higher
- **AWS CLI**: Latest version
- **AWS CDK**: Latest version
- **Git**: Latest version

### AWS Account Requirements

- Active AWS account with billing enabled
- IAM user with AdministratorAccess or equivalent permissions
- AWS CLI configured with credentials

## Edge Device Setup

### 1. Prepare Raspberry Pi

```bash
# Flash Raspberry Pi OS (64-bit) to SD card using Raspberry Pi Imager
# Boot the Raspberry Pi and complete initial setup

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install system dependencies
sudo apt-get install -y \
  python3-pip \
  python3-venv \
  libatlas-base-dev \
  libopenblas-dev \
  libopencv-dev \
  python3-opencv \
  portaudio19-dev \
  sqlcipher \
  libsqlcipher-dev \
  git

# Enable camera interface
sudo raspi-config
# Navigate to: Interface Options > Camera > Enable
# Reboot when prompted
```

### 2. Clone Repository

```bash
cd ~
git clone https://github.com/your-org/agrishield-ai.git
cd agrishield-ai
```

### 3. Set Up Python Environment

```bash
cd edge
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Device

```bash
# Copy example configuration
cp config.example.yaml config.yaml

# Edit configuration with your settings
nano config.yaml
```

Update the following in `config.yaml`:
- `device.device_id`: Unique identifier for this device
- `device.location`: GPS coordinates and location name
- `aws.iot_endpoint`: Your AWS IoT Core endpoint (will be provided after cloud setup)
- `connectivity.wifi`: Your WiFi credentials

### 5. Create Required Directories

```bash
mkdir -p certs models sounds cache logs
```

### 6. Test Hardware

```bash
# Test camera
raspistill -o test.jpg

# Test microphone
arecord -d 5 test.wav
aplay test.wav

# Test GPIO (if deterrence hardware connected)
python3 -c "import RPi.GPIO as GPIO; GPIO.setmode(GPIO.BCM); print('GPIO OK')"
```

## Cloud Infrastructure Setup

### 1. Install Prerequisites

```bash
# Install Node.js (if not already installed)
# Visit https://nodejs.org/ or use nvm

# Install AWS CLI
# Visit https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and Output format

# Install AWS CDK
npm install -g aws-cdk

# Verify installations
node --version  # Should be 18.x or higher
aws --version
cdk --version
```

### 2. Set Up Cloud Project

```bash
cd cloud

# Install dependencies
npm install

# Install Python dependencies for Lambda functions
cd lambda
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Update the following in `.env`:
- `AWS_ACCOUNT_ID`: Your AWS account ID (12-digit number)
- `AWS_REGION`: Your preferred AWS region (e.g., us-east-1)
- `ENVIRONMENT`: dev, staging, or prod
- `ALERT_PHONE_NUMBERS`: Comma-separated admin phone numbers for alerts

### 4. Bootstrap CDK (First Time Only)

```bash
# Bootstrap CDK in your AWS account
cdk bootstrap aws://ACCOUNT-ID/REGION

# Example:
# cdk bootstrap aws://123456789012/us-east-1
```

### 5. Deploy Infrastructure

```bash
# Synthesize CloudFormation templates (optional, for review)
cdk synth

# Deploy all stacks
cdk deploy --all

# Or deploy specific stacks in order
cdk deploy AgriShieldIoTStack
cdk deploy AgriShieldStorageStack
cdk deploy AgriShieldLambdaStack
cdk deploy AgriShieldApiStack
cdk deploy AgriShieldAuthStack
cdk deploy AgriShieldMonitoringStack
```

**Note**: Deployment will take 10-15 minutes. Save the outputs, especially:
- IoT Core endpoint
- Cognito User Pool ID
- Cognito Client ID
- API Gateway URL

### 6. Create Cognito Users

```bash
# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true \
  --temporary-password TempPassword123!

# Add user to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id YOUR_USER_POOL_ID \
  --username admin@example.com \
  --group-name admin

# Create ranger user
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username ranger@example.com \
  --user-attributes Name=email,Value=ranger@example.com Name=email_verified,Value=true \
  --temporary-password TempPassword123!

# Add user to ranger group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id YOUR_USER_POOL_ID \
  --username ranger@example.com \
  --group-name ranger
```

## Frontend Dashboard Setup

### 1. Set Up Frontend Project

```bash
cd frontend

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Update the following in `.env`:
- `VITE_API_BASE_URL`: API Gateway URL from cloud deployment
- `VITE_AWS_REGION`: Same region as cloud infrastructure
- `VITE_COGNITO_USER_POOL_ID`: From cloud deployment outputs
- `VITE_COGNITO_CLIENT_ID`: From cloud deployment outputs
- `VITE_MAP_DEFAULT_CENTER_LAT`: Default map center latitude
- `VITE_MAP_DEFAULT_CENTER_LNG`: Default map center longitude

### 3. Run Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Device Provisioning

### 1. Generate Device Certificates

On your development machine:

```bash
cd cloud/scripts

# Make provisioning script executable
chmod +x provision-device.sh

# Provision a device
./provision-device.sh agrishield-device-001

# This will:
# - Create an IoT Thing
# - Generate and download certificates
# - Attach IoT Policy
# - Output certificate files
```

### 2. Transfer Certificates to Edge Device

```bash
# Copy certificates to edge device
scp device-certificate.pem.crt pi@raspberrypi.local:~/agrishield-ai/edge/certs/
scp device-private.pem.key pi@raspberrypi.local:~/agrishield-ai/edge/certs/
scp root-ca.pem pi@raspberrypi.local:~/agrishield-ai/edge/certs/

# SSH to edge device and set permissions
ssh pi@raspberrypi.local
cd ~/agrishield-ai/edge/certs
chmod 600 device-private.pem.key
chmod 644 device-certificate.pem.crt
chmod 644 root-ca.pem
```

### 3. Update Edge Device Configuration

```bash
# On the edge device
cd ~/agrishield-ai/edge
nano config.yaml
```

Update:
- `aws.iot_endpoint`: From cloud deployment outputs
- `aws.certificates`: Paths to certificate files

### 4. Download ML Models

```bash
# On the edge device
cd ~/agrishield-ai/edge/models

# Download vision model (replace with actual S3 URL from deployment)
aws s3 cp s3://agrishield-models-ACCOUNT-ID/vision/model-v1.tflite vision-model.tflite

# Download audio model
aws s3 cp s3://agrishield-models-ACCOUNT-ID/audio/model-v1.tflite audio-model.tflite
```

## Testing the System

### 1. Test Edge Device

```bash
# On the edge device
cd ~/agrishield-ai/edge
source venv/bin/activate

# Run tests
pytest tests/ -v

# Start the application
python src/main.py
```

### 2. Test Cloud Functions

```bash
# On your development machine
cd cloud/lambda
source venv/bin/activate

# Run tests
pytest tests/ -v
```

### 3. Test Frontend

```bash
# On your development machine
cd frontend

# Run tests
npm test

# Start development server
npm run dev
```

### 4. End-to-End Test

1. **Trigger Detection**: Place an object in front of the camera on the edge device
2. **Verify Incident**: Check CloudWatch Logs for incident processing
3. **Check DynamoDB**: Verify incident stored in DynamoDB table
4. **View Dashboard**: Log in to dashboard and verify incident appears on map
5. **Test Alert**: For HIGH threat, verify SMS alert received

## Troubleshooting

### Edge Device Issues

**Camera not detected:**
```bash
# Check camera connection
vcgencmd get_camera

# Enable camera interface
sudo raspi-config
# Interface Options > Camera > Enable
```

**MQTT connection fails:**
```bash
# Test IoT endpoint
ping your-endpoint.iot.region.amazonaws.com

# Check certificates
ls -la certs/

# Test MQTT connection
python3 -c "from src.mqtt.client import MQTTClient; client = MQTTClient(); print(client.connect())"
```

**Import errors:**
```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

### Cloud Issues

**CDK deployment fails:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check CDK bootstrap
cdk bootstrap --show-template

# View detailed error
cdk deploy --verbose
```

**Lambda function errors:**
```bash
# View logs
aws logs tail /aws/lambda/AgriShield-IncidentProcessor --follow

# Test function
aws lambda invoke \
  --function-name AgriShield-IncidentProcessor \
  --payload '{"test": true}' \
  response.json
```

### Frontend Issues

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API connection fails:**
```bash
# Check API Gateway URL
echo $VITE_API_BASE_URL

# Test API endpoint
curl $VITE_API_BASE_URL/health
```

**Authentication fails:**
```bash
# Verify Cognito configuration
aws cognito-idp describe-user-pool --user-pool-id YOUR_USER_POOL_ID
```

## Next Steps

1. **Add More Devices**: Repeat device provisioning for additional edge devices
2. **Upload ML Models**: Train and upload custom models to S3
3. **Configure Alerts**: Add phone numbers for SMS alerts
4. **Set Up Monitoring**: Configure CloudWatch alarms and dashboards
5. **Enable Backups**: Set up automated backups for DynamoDB and S3
6. **Production Deployment**: Deploy frontend to S3 + CloudFront

## Support

For issues and questions:
- Check the component-specific README files
- Review CloudWatch Logs for errors
- Contact support@agrishield.ai

## Security Checklist

- [ ] Changed default encryption keys in edge config
- [ ] Rotated AWS access keys
- [ ] Enabled MFA on AWS account
- [ ] Reviewed IAM policies for least privilege
- [ ] Enabled CloudTrail logging
- [ ] Set up AWS Config rules
- [ ] Configured VPC security groups (if applicable)
- [ ] Enabled S3 bucket versioning
- [ ] Set up DynamoDB point-in-time recovery
- [ ] Configured CloudWatch alarms for security events
