# IMPLEMENTATION.md

This document explains how to set up, configure, and run the AgriShield AI system in a prototype environment.

---

## 1. Prerequisites

### Hardware

| Component | Specification | Notes |
|-----------|---------------|-------|
| Raspberry Pi 4 | 2GB+ RAM | 4GB recommended for smoother inference |
| Camera | Pi Camera Module v2 or USB webcam | 1080p preferred |
| Microphone | USB or I2S MEMS mic | For audio-based detection |
| Connectivity | GSM/4G HAT or LoRaWAN module | SIM7600 or RAK2245 recommended |
| Storage | 32GB+ MicroSD (Class 10) | For OS, models, and local cache |
| Power | 5V 3A USB-C adapter | Solar panel + battery for field deployment |

### Software & Accounts

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Raspberry Pi OS | 64-bit (Bookworm) | Edge device operating system |
| Python | 3.10+ | Edge application runtime |
| Node.js | 18+ | Dashboard development |
| AWS CLI | 2.x | Cloud resource management |
| Git | Latest | Version control |

### AWS Permissions

Your AWS account needs access to:
- AWS IoT Core (device provisioning, MQTT)
- AWS Lambda (event processing)
- Amazon SNS (SMS alerts)
- Amazon DynamoDB (data storage)
- Amazon S3 (media storage)
- Amazon Cognito (dashboard auth)
- AWS CloudFormation / CDK (infrastructure deployment)

---

## 2. Clone the Repository

```bash
git clone https://github.com/<your-user>/agrishield-ai.git
cd agrishield-ai
```

---

## 3. AWS Infrastructure Setup

### Option A: Using AWS CDK (Recommended)

```bash
# Navigate to infrastructure directory
cd infrastructure

# Install CDK dependencies
npm install

# Bootstrap CDK (first time only)
npx cdk bootstrap aws://<ACCOUNT_ID>/<REGION>

# Deploy all stacks
npx cdk deploy --all
```

### Option B: Manual Setup via Console

If you prefer manual setup, create the following resources:

#### 3.1 IoT Core

1. **Create IoT Thing**
   ```
   AWS Console → IoT Core → Manage → Things → Create thing
   Name: agrishield-device-001
   ```

2. **Generate Certificates**
   ```
   Create certificate → Download all files:
   - device-certificate.pem.crt
   - private.pem.key
   - AmazonRootCA1.pem
   ```

3. **Create IoT Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["iot:Connect"],
         "Resource": "arn:aws:iot:<region>:<account>:client/${iot:ClientId}"
       },
       {
         "Effect": "Allow",
         "Action": ["iot:Publish"],
         "Resource": [
           "arn:aws:iot:<region>:<account>:topic/agrishield/incidents/*",
           "arn:aws:iot:<region>:<account>:topic/agrishield/telemetry/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": ["iot:Subscribe"],
         "Resource": "arn:aws:iot:<region>:<account>:topicfilter/agrishield/commands/*"
       }
     ]
   }
   ```

4. **Attach Policy to Certificate**

#### 3.2 DynamoDB Tables

Create two tables:

**Incidents Table**
```
Table name: agrishield-incidents
Partition key: device_id (String)
Sort key: timestamp (Number)
```

**Devices Table**
```
Table name: agrishield-devices
Partition key: device_id (String)
```

#### 3.3 S3 Bucket

```
Bucket name: agrishield-media-<account-id>
Enable versioning: Yes
Encryption: SSE-S3
```

#### 3.4 SNS Topic

```
Topic name: agrishield-alerts
Protocol: SMS
Add subscriptions for farmer/ranger phone numbers
```

#### 3.5 Lambda Functions

Deploy the Lambda functions from `cloud/lambda/`:

```bash
cd cloud/lambda

# Package and deploy incident processor
zip -r incident-processor.zip incident_processor/
aws lambda create-function \
  --function-name agrishield-incident-processor \
  --runtime python3.10 \
  --handler handler.lambda_handler \
  --zip-file fileb://incident-processor.zip \
  --role arn:aws:iam::<account>:role/agrishield-lambda-role
```

---

## 4. Edge Device Setup

### 4.1 Flash Raspberry Pi OS

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Flash Raspberry Pi OS (64-bit) to MicroSD
3. Enable SSH and configure WiFi in Imager settings
4. Boot the Pi and SSH in:
   ```bash
   ssh pi@raspberrypi.local
   ```

### 4.2 System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install system packages
sudo apt install -y \
  python3-pip \
  python3-venv \
  libatlas-base-dev \
  libopenjp2-7 \
  libtiff5 \
  libcamera-apps \
  portaudio19-dev

# Enable camera interface
sudo raspi-config nonint do_camera 0
```

### 4.3 Install Edge Application

```bash
# Clone repo (if not already done)
git clone https://github.com/<your-user>/agrishield-ai.git
cd agrishield-ai/edge-device

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 4.4 Download ML Model

```bash
# Create models directory
mkdir -p models

# Download pre-trained model from S3
aws s3 cp s3://agrishield-models/wildlife-detector-v1.tflite models/

# Or use the included model
cp ../models/wildlife-detector-v1.tflite models/
```

### 4.5 Configure Device

Copy and edit the configuration file:

```bash
cp config.example.yaml config.yaml
nano config.yaml
```

**config.yaml**
```yaml
# Device identification
device:
  id: "agrishield-device-001"
  location:
    name: "Farm Block A"
    lat: -1.2921
    lng: 36.8219

# AWS IoT Core settings
aws_iot:
  endpoint: "<your-iot-endpoint>.iot.<region>.amazonaws.com"
  port: 8883
  cert_path: "certs/device-certificate.pem.crt"
  key_path: "certs/private.pem.key"
  ca_path: "certs/AmazonRootCA1.pem"

# Detection settings
detection:
  model_path: "models/wildlife-detector-v1.tflite"
  confidence_threshold: 0.7
  frame_rate: 15
  resolution: [640, 480]

# Deterrence settings
deterrence:
  enabled: true
  sound_patterns:
    elephant: "sounds/elephant-deterrent.wav"
    boar: "sounds/boar-deterrent.wav"
    default: "sounds/general-alarm.wav"
  light_gpio_pin: 18

# Connectivity
connectivity:
  mode: "gsm"  # gsm, lora, or wifi
  gsm:
    apn: "internet"
    port: "/dev/ttyUSB0"
  sync_interval_seconds: 900  # 15 minutes

# Local cache
cache:
  database_path: "data/events.db"
  max_events: 1000
```

### 4.6 Copy IoT Certificates

```bash
mkdir -p certs
# Copy downloaded certificates to certs/ directory
cp ~/Downloads/device-certificate.pem.crt certs/
cp ~/Downloads/private.pem.key certs/
cp ~/Downloads/AmazonRootCA1.pem certs/

# Secure permissions
chmod 600 certs/*
```

### 4.7 Test the Setup

```bash
# Activate virtual environment
source venv/bin/activate

# Run connectivity test
python -m agrishield.test_connection

# Run camera test
python -m agrishield.test_camera

# Run single detection (no deterrence)
python -m agrishield.detect --test-mode
```

---

## 5. Running the Edge Application

### Development Mode

```bash
cd edge-device
source venv/bin/activate

# Run with verbose logging
python main.py --log-level DEBUG
```

### Production Mode (systemd Service)

Create a systemd service for auto-start:

```bash
sudo nano /etc/systemd/system/agrishield.service
```

```ini
[Unit]
Description=AgriShield AI Wildlife Detection
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/agrishield-ai/edge-device
Environment=PATH=/home/pi/agrishield-ai/edge-device/venv/bin
ExecStart=/home/pi/agrishield-ai/edge-device/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable agrishield
sudo systemctl start agrishield

# Check status
sudo systemctl status agrishield

# View logs
journalctl -u agrishield -f
```

---

## 6. Dashboard Setup

### 6.1 Install Dependencies

```bash
cd dashboard
npm install
```

### 6.2 Configure Environment

```bash
cp .env.example .env
nano .env
```

**.env**
```bash
# AWS Region
VITE_AWS_REGION=us-east-1

# Cognito
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# API Gateway
VITE_API_ENDPOINT=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

# Map settings
VITE_MAP_CENTER_LAT=-1.2921
VITE_MAP_CENTER_LNG=36.8219
VITE_MAP_DEFAULT_ZOOM=12
```

### 6.3 Run Development Server

```bash
npm run dev
```

Dashboard available at `http://localhost:5173`

### 6.4 Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

### 6.5 Deploy to S3 + CloudFront

```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://agrishield-dashboard-<account-id> --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

---

## 7. Testing the Full System

### 7.1 End-to-End Test

1. **Start edge device** in test mode:
   ```bash
   python main.py --test-mode --log-level DEBUG
   ```

2. **Simulate detection** by placing a test image:
   ```bash
   python -m agrishield.simulate --species elephant --threat-level high
   ```

3. **Verify in AWS**:
   - Check IoT Core MQTT test client for messages
   - Check DynamoDB for new incident record
   - Check phone for SMS alert

4. **Verify in Dashboard**:
   - Login to Ranger Dashboard
   - Check incident appears on heatmap
   - Verify device status shows "Online"

### 7.2 Load Testing

```bash
# Simulate multiple devices
python scripts/load_test.py --devices 10 --events-per-device 100
```

---

## 8. Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Camera not detected | Interface disabled | Run `sudo raspi-config` → Interface Options → Camera → Enable |
| IoT connection failed | Certificate mismatch | Verify cert paths in config.yaml match actual files |
| SMS not received | SNS subscription pending | Confirm subscription in SNS console |
| Model inference slow | CPU throttling | Check `vcgencmd measure_temp` and add heatsink |
| GSM module not responding | Wrong serial port | Check `ls /dev/ttyUSB*` and update config |

### Useful Commands

```bash
# Check device temperature
vcgencmd measure_temp

# Monitor system resources
htop

# Test MQTT connection
mosquitto_pub -h <iot-endpoint> -p 8883 \
  --cafile certs/AmazonRootCA1.pem \
  --cert certs/device-certificate.pem.crt \
  --key certs/private.pem.key \
  -t "agrishield/test" -m "hello"

# View local cache
sqlite3 data/events.db "SELECT * FROM incidents ORDER BY timestamp DESC LIMIT 10;"

# Check GSM signal strength
echo -e "AT+CSQ\r" > /dev/ttyUSB0
```

### Logs Location

| Component | Log Location |
|-----------|--------------|
| Edge application | `journalctl -u agrishield` |
| Lambda functions | CloudWatch Logs → `/aws/lambda/agrishield-*` |
| IoT Core | CloudWatch Logs → `AWSIotLogsV2` |
| Dashboard | Browser console |

---

## 9. Updating the System

### Edge Device

```bash
cd ~/agrishield-ai
git pull origin main

cd edge-device
source venv/bin/activate
pip install -r requirements.txt

sudo systemctl restart agrishield
```

### ML Model

```bash
# Download new model
aws s3 cp s3://agrishield-models/wildlife-detector-v2.tflite models/

# Update config.yaml
# detection.model_path: "models/wildlife-detector-v2.tflite"

sudo systemctl restart agrishield
```

### Cloud Infrastructure

```bash
cd infrastructure
git pull origin main
npm install
npx cdk deploy --all
```

---

## 10. Field Deployment Checklist

Before deploying to the field:

- [ ] Device ID configured and unique
- [ ] GPS coordinates set correctly
- [ ] IoT certificates installed and tested
- [ ] GSM SIM card activated with data plan
- [ ] Solar panel and battery connected
- [ ] Weatherproof enclosure sealed
- [ ] Deterrence sounds tested at appropriate volume
- [ ] Local cache cleared (`rm data/events.db`)
- [ ] systemd service enabled
- [ ] Remote SSH access configured (optional)
- [ ] Farmer/ranger phone numbers added to SNS

---

## Appendix: Project Structure

```
agrishield-ai/
├── edge-device/
│   ├── agrishield/
│   │   ├── __init__.py
│   │   ├── detector.py       # ML inference
│   │   ├── camera.py         # Camera capture
│   │   ├── audio.py          # Audio capture
│   │   ├── deterrence.py     # Light/sound control
│   │   ├── connectivity.py   # GSM/LoRa/WiFi
│   │   ├── cache.py          # SQLite local cache
│   │   └── iot_client.py     # AWS IoT MQTT
│   ├── models/               # TFLite models
│   ├── sounds/               # Deterrence audio files
│   ├── certs/                # IoT certificates
│   ├── data/                 # Local SQLite cache
│   ├── config.yaml           # Device configuration
│   ├── main.py               # Entry point
│   └── requirements.txt
├── dashboard/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Dashboard views
│   │   ├── hooks/            # Custom React hooks
│   │   └── services/         # API clients
│   ├── .env                  # Environment config
│   └── package.json
├── infrastructure/
│   ├── lib/
│   │   ├── iot-stack.ts
│   │   ├── lambda-stack.ts
│   │   ├── storage-stack.ts
│   │   └── dashboard-stack.ts
│   └── package.json
├── cloud/
│   └── lambda/
│       ├── incident_processor/
│       ├── alert_router/
│       └── sync_handler/
├── scripts/
│   ├── provision_device.py
│   ├── load_test.py
│   └── export_data.py
├── README.md
├── ARCHITECTURE.md
└── IMPLEMENTATION.md          # You are here
```

---

*Last updated: January 2026*
