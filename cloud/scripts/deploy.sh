#!/bin/bash

# AgriShield AI Cloud Infrastructure Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-dev}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AgriShield AI Cloud Deployment${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create .env file from .env.example${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}Error: AWS_ACCOUNT_ID not set in .env${NC}"
    exit 1
fi

if [ -z "$AWS_REGION" ]; then
    echo -e "${RED}Error: AWS_REGION not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}Building TypeScript...${NC}"
npm run build

echo -e "${GREEN}Synthesizing CDK stacks...${NC}"
cdk synth --context environment=$ENVIRONMENT

echo -e "${GREEN}Deploying stacks...${NC}"
if [ "$ENVIRONMENT" = "prod" ]; then
    echo -e "${YELLOW}Production deployment requires approval for security changes${NC}"
    cdk deploy --all --context environment=$ENVIRONMENT --require-approval broadening
else
    cdk deploy --all --context environment=$ENVIRONMENT
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

# Display outputs
echo -e "${GREEN}Stack Outputs:${NC}"
aws cloudformation describe-stacks \
    --region $AWS_REGION \
    --query "Stacks[?contains(StackName, 'AgriShield')].Outputs" \
    --output table

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Provision IoT devices using: ./scripts/provision-device.sh <device-id>"
echo "2. Create Cognito users for dashboard access"
echo "3. Configure frontend with API endpoint and User Pool ID"
