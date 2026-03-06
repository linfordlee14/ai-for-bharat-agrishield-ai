# AgriShield AI - Edge Device

Edge device software for wildlife detection and deterrence running on Raspberry Pi 4.

## Hardware Requirements

- Raspberry Pi 4 (4GB RAM minimum)
- Raspberry Pi Camera Module v2 or compatible
- USB Microphone
- GSM HAT (SIM7600) or LoRa HAT (RAK2245)
- GPIO-controlled lights and speakers for deterrence
- SD Card (32GB minimum)
- Power supply (solar panel + battery recommended)

## Software Requirements

- Raspberry Pi OS (64-bit)
- Python 3.10 or higher
- TensorFlow Lite 2.x
- OpenCV 4.x
- SQLite 3.x with SQLCipher

## Setup Instructions

### 1. Install System Dependencies

```bash
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv
sudo apt-get install -y libatlas-base-dev libopenblas-dev
sudo apt-get install -y libopencv-dev python3-opencv
sudo apt-get install -y portaudio19-dev
sudo apt-get install -y sqlcipher libsqlcipher-dev
```

### 2. Create Virtual Environment

```bash
cd edge
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Device

Copy the example configuration and edit with your device settings:

```bash
cp config.example.yaml config.yaml
nano config.yaml
```

Required configuration:
- `device_id`: Unique device identifier
- `location`: GPS coordinates and location name
- `aws_iot_endpoint`: AWS IoT Core endpoint
- `certificates`: Paths to device certificates
- `monitoring_hours`: Start and end times for detection

### 5. Install Certificates

Place your AWS IoT device certificates in the `certs/` directory:

```bash
mkdir -p certs
# Copy your certificates:
# - device-certificate.pem.crt
# - device-private.pem.key
# - root-ca.pem
chmod 600 certs/device-private.pem.key
```

### 6. Download ML Models

Download the TensorFlow Lite models and place them in the `models/` directory:

```bash
mkdir -p models
# Download vision model
# Download audio model
```

### 7. Run Tests

```bash
pytest tests/ -v
```

### 8. Start the Application

```bash
python src/main.py
```

For production deployment with auto-restart:

```bash
sudo systemctl enable agrishield
sudo systemctl start agrishield
```

## Project Structure

```
edge/
├── src/
│   ├── detection/          # Detection engine and ML inference
│   ├── deterrence/         # Deterrence controller
│   ├── cache/              # Local SQLite cache
│   ├── connectivity/       # Network management
│   ├── mqtt/               # MQTT client
│   ├── config/             # Configuration management
│   ├── battery/            # Battery and power management
│   ├── firmware/           # Firmware updater
│   ├── telemetry/          # Telemetry collection
│   ├── diagnostics/        # System diagnostics
│   └── main.py             # Main application entry point
├── tests/                  # Unit and property-based tests
├── models/                 # TensorFlow Lite models
├── certs/                  # AWS IoT certificates
├── logs/                   # Application logs
├── cache/                  # Local SQLite database
├── config.yaml             # Device configuration
├── requirements.txt        # Python dependencies
└── README.md
```

## Configuration

### config.yaml

```yaml
device:
  device_id: "agrishield-device-001"
  location:
    name: "Farm Block A"
    latitude: -1.2921
    longitude: 36.8219

detection:
  confidence_threshold: 0.7
  frame_rate: 15
  resolution: [640, 480]
  model_path: "models/vision-model.tflite"
  audio_model_path: "models/audio-model.tflite"

monitoring:
  start_time: "06:00"
  end_time: "20:00"

deterrence:
  enabled: true
  volume_db: 100
  duration_seconds: 30
  cooldown_seconds: 60
  sound_patterns:
    Elephant: "sounds/elephant-deterrent.wav"
    Boar: "sounds/boar-deterrent.wav"
    default: "sounds/general-alarm.wav"

connectivity:
  wifi:
    enabled: true
    ssid: "YourWiFiSSID"
    password: "YourPassword"
  gsm:
    enabled: true
    apn: "internet"
  lora:
    enabled: false

aws:
  iot_endpoint: "your-endpoint.iot.region.amazonaws.com"
  certificates:
    ca: "certs/root-ca.pem"
    cert: "certs/device-certificate.pem.crt"
    key: "certs/device-private.pem.key"

cache:
  max_incidents: 1000
  db_path: "cache/incidents.db"

sync:
  interval_seconds: 900  # 15 minutes
  batch_size: 50

telemetry:
  interval_seconds: 300  # 5 minutes

battery:
  enabled: true
  saving_threshold: 30
  critical_threshold: 15
```

## Troubleshooting

### Camera not detected

```bash
# Enable camera interface
sudo raspi-config
# Navigate to Interface Options > Camera > Enable

# Test camera
raspistill -o test.jpg
```

### Audio not working

```bash
# List audio devices
arecord -l

# Test microphone
arecord -d 5 test.wav
aplay test.wav
```

### Network connectivity issues

```bash
# Check WiFi status
iwconfig

# Check GSM modem
sudo minicom -D /dev/ttyUSB0

# Test MQTT connection
python -c "from src.mqtt.client import MQTTClient; client = MQTTClient(); client.connect()"
```

### View logs

```bash
tail -f logs/agrishield.log
```

## Development

### Running in development mode

```bash
# Activate virtual environment
source venv/bin/activate

# Run with debug logging
python src/main.py --debug

# Run specific component tests
pytest tests/test_detection.py -v
```

### Code formatting

```bash
# Format code
black src/ tests/

# Check linting
flake8 src/ tests/

# Type checking
mypy src/
```

## License

Copyright © 2024 AgriShield AI. All rights reserved.
