#!/bin/bash

# AgriShield AI Device Provisioning Script
# Creates IoT Thing, certificate, and policy attachment for edge devices

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <device-id> [environment]${NC}"
    echo "Example: $0 agrishield-device-001 dev"
    exit 1
fi

DEVICE_ID=$1
ENVIRONMENT=${2:-dev}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AgriShield Device Provisioning${NC}"
echo -e "${GREEN}Device ID: ${DEVICE_ID}${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}========================================${NC}"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

AWS_REGION=${AWS_REGION:-us-east-1}
THING_TYPE="agrishield-edge-device-${ENVIRONMENT}"
POLICY_NAME="agrishield-device-policy-${ENVIRONMENT}"
CERT_DIR="./certs/${DEVICE_ID}"

# Create certificate directory
mkdir -p $CERT_DIR

echo -e "${GREEN}Creating IoT Thing...${NC}"
aws iot create-thing \
    --thing-name $DEVICE_ID \
    --thing-type-name $THING_TYPE \
    --region $AWS_REGION \
    --attribute-payload attributes={environment=$ENVIRONMENT} \
    || echo -e "${YELLOW}Thing may already exist${NC}"

echo -e "${GREEN}Creating device certificate...${NC}"
CERT_OUTPUT=$(aws iot create-keys-and-certificate \
    --set-as-active \
    --region $AWS_REGION \
    --output json)

CERT_ARN=$(echo $CERT_OUTPUT | jq -r '.certificateArn')
CERT_ID=$(echo $CERT_OUTPUT | jq -r '.certificateId')
CERT_PEM=$(echo $CERT_OUTPUT | jq -r '.certificatePem')
PRIVATE_KEY=$(echo $CERT_OUTPUT | jq -r '.keyPair.PrivateKey')
PUBLIC_KEY=$(echo $CERT_OUTPUT | jq -r '.keyPair.PublicKey')

# Save certificate and keys
echo "$CERT_PEM" > $CERT_DIR/certificate.pem.crt
echo "$PRIVATE_KEY" > $CERT_DIR/private.pem.key
echo "$PUBLIC_KEY" > $CERT_DIR/public.pem.key

# Set secure permissions
chmod 600 $CERT_DIR/private.pem.key
chmod 644 $CERT_DIR/certificate.pem.crt
chmod 644 $CERT_DIR/public.pem.key

echo -e "${GREEN}Downloading root CA certificate...${NC}"
curl -o $CERT_DIR/AmazonRootCA1.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem

echo -e "${GREEN}Attaching certificate to thing...${NC}"
aws iot attach-thing-principal \
    --thing-name $DEVICE_ID \
    --principal $CERT_ARN \
    --region $AWS_REGION

echo -e "${GREEN}Attaching policy to certificate...${NC}"
aws iot attach-policy \
    --policy-name $POLICY_NAME \
    --target $CERT_ARN \
    --region $AWS_REGION

# Get IoT endpoint
IOT_ENDPOINT=$(aws iot describe-endpoint \
    --endpoint-type iot:Data-ATS \
    --region $AWS_REGION \
    --query 'endpointAddress' \
    --output text)

# Create device configuration file
cat > $CERT_DIR/device-config.yaml <<EOF
# AgriShield Edge Device Configuration
device_id: $DEVICE_ID
environment: $ENVIRONMENT

# AWS IoT Core Configuration
iot:
  endpoint: $IOT_ENDPOINT
  port: 8883
  cert_path: ./certs/${DEVICE_ID}/certificate.pem.crt
  key_path: ./certs/${DEVICE_ID}/private.pem.key
  ca_path: ./certs/${DEVICE_ID}/AmazonRootCA1.pem

# MQTT Topics
topics:
  incidents: agrishield/incidents/${DEVICE_ID}
  telemetry: agrishield/telemetry/${DEVICE_ID}
  alerts: agrishield/alerts/${DEVICE_ID}
  sync: agrishield/sync/${DEVICE_ID}
  commands: agrishield/commands/${DEVICE_ID}/#
  acks: agrishield/acks/${DEVICE_ID}

# Detection Configuration
detection:
  confidence_threshold: 0.7
  frame_rate: 15
  resolution: [640, 480]
  model_path: ./models/wildlife-detection-v1.tflite

# Deterrence Configuration
deterrence:
  enabled: true
  duration_seconds: 30
  cooldown_seconds: 60
  volume_db: 100

# Sync Configuration
sync:
  interval_seconds: 900  # 15 minutes
  batch_size: 50

# Monitoring Configuration
monitoring:
  telemetry_interval_seconds: 300  # 5 minutes
  log_level: INFO
EOF

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Device Provisioning Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Certificate ID: ${CERT_ID}${NC}"
echo -e "${GREEN}IoT Endpoint: ${IOT_ENDPOINT}${NC}"
echo -e "${GREEN}Certificates saved to: ${CERT_DIR}${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Copy certificates to edge device:"
echo "   scp -r ${CERT_DIR} pi@<device-ip>:~/agrishield/certs/"
echo ""
echo "2. Copy device configuration:"
echo "   scp ${CERT_DIR}/device-config.yaml pi@<device-ip>:~/agrishield/config.yaml"
echo ""
echo "3. Register device in DynamoDB devices table with location and phone numbers"
