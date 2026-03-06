# Design Document: AgriShield AI System

## Overview

AgriShield AI is a distributed wildlife detection and deterrence system designed to protect rural farmland from crop-raiding animals while preserving endangered species. The system addresses human-wildlife conflict in regions like India and Sub-Saharan Africa where farmers lose significant portions of their harvest to elephants, boars, deer, and other wildlife.

### System Objectives

The system provides:
- Real-time wildlife detection using computer vision and audio analysis
- Non-lethal deterrence through species-specific sounds and lights
- Offline-first operation with local caching for unreliable connectivity
- Cloud-based incident storage, analysis, and alerting
- Web dashboard for rangers and administrators to monitor and manage devices

### Key Design Principles

1. **Offline-First Architecture**: Edge devices operate autonomously without cloud connectivity, caching data locally and syncing when connectivity is available
2. **Low-Cost Hardware**: Raspberry Pi-based edge devices keep deployment costs under $100 per unit
3. **Low-Bandwidth Communication**: MQTT protocol with compression and batching minimizes data transmission costs
4. **Non-Lethal Approach**: Species-specific deterrence protects both crops and wildlife
5. **Scalable Cloud Infrastructure**: Serverless AWS architecture supports hundreds of devices per region
6. **Security by Design**: Mutual TLS, certificate-based authentication, and encryption at rest and in transit

### System Boundaries

**In Scope:**
- Wildlife detection (Elephant, Boar, Deer, Leopard, Human, Unknown)
- Non-lethal deterrence (lights and sounds)
- Incident logging and cloud synchronization
- SMS alerting for high-threat detections
- Web dashboard for incident visualization and device management
- Remote configuration and firmware updates

**Out of Scope:**
- Lethal deterrence methods
- Real-time video streaming (bandwidth constraints)
- Mobile native applications (web-first approach)
- Integration with third-party conservation databases (future enhancement)

## Architecture

### High-Level Architecture

The system consists of three primary layers:

1. **Edge Layer**: Raspberry Pi devices with camera, microphone, and GSM/LoRa connectivity
2. **Cloud Layer**: AWS services for event processing, storage, and alerting
3. **Frontend Layer**: React web application for visualization and management

```
┌─────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Raspberry Pi 4                                          │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐ │  │
│  │  │  Camera    │  │  Microphone  │  │  GSM/LoRa HAT   │ │  │
│  │  └─────┬──────┘  └──────┬───────┘  └────────┬────────┘ │  │
│  │        │                │                    │          │  │
│  │  ┌─────▼────────────────▼────────────────────▼────────┐ │  │
│  │  │         Detection & Deterrence Engine             │ │  │
│  │  │  • TensorFlow Lite (Vision + Audio)               │ │  │
│  │  │  • Threat Assessment                              │ │  │
│  │  │  • Deterrence Controller                          │ │  │
│  │  │  • Local SQLite Cache                             │ │  │
│  │  │  • MQTT Client                                    │ │  │
│  │  └───────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ MQTT over TLS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        CLOUD LAYER (AWS)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AWS IoT Core (MQTT Broker)                             │  │
│  └────┬─────────────────────────────────────────────────────┘  │
│       │                                                         │
│  ┌────▼──────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Lambda        │  │ Lambda       │  │ Lambda           │   │
│  │ Incident      │  │ Alert        │  │ Telemetry        │   │
│  │ Processor     │  │ Router       │  │ Processor        │   │
│  └────┬──────────┘  └──────┬───────┘  └────┬─────────────┘   │
│       │                    │               │                   │
│  ┌────▼────────────────────▼───────────────▼─────────────┐   │
│  │  DynamoDB (Incidents, Devices, Telemetry)             │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  S3 (Media Files, ML Models, Firmware)                │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  SNS (SMS Alerts)                                      │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      FRONTEND LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Ranger Dashboard (React)                               │  │
│  │  • Cognito Authentication                               │  │
│  │  • Leaflet Map Visualization                            │  │
│  │  • Device Management                                    │  │
│  │  • Incident Reporting                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Patterns

#### Real-Time Detection Flow

```
Camera/Mic → Detection Engine → Threat Assessment → Deterrence System
                    ↓
              Local Cache → MQTT Client → IoT Core → Lambda → DynamoDB/S3
                                                        ↓
                                                      SNS → SMS Alert
```

#### Periodic Sync Flow

```
Local Cache → Sync Manager → MQTT Client → IoT Core → Lambda → DynamoDB/S3
                                                          ↓
                                                    Acknowledgment
                                                          ↓
                                              Mark as Synced in Cache
```

#### Configuration Update Flow

```
Dashboard → API Gateway → Lambda → IoT Core → MQTT → Edge Device
                                                         ↓
                                                   Apply Config
                                                         ↓
                                                   Confirmation
```

### Technology Stack

| Layer | Component | Technology |
|-------|-----------|------------|
| **Edge** | Operating System | Raspberry Pi OS (64-bit) |
| | Runtime | Python 3.10+ |
| | ML Framework | TensorFlow Lite 2.x |
| | Computer Vision | OpenCV 4.x |
| | Local Storage | SQLite 3.x with SQLCipher |
| | MQTT Client | Paho MQTT |
| | Connectivity | GSM (SIM7600), LoRa (RAK2245) |
| **Cloud** | Message Broker | AWS IoT Core |
| | Compute | AWS Lambda (Python 3.10) |
| | Storage | Amazon DynamoDB, Amazon S3 |
| | Messaging | Amazon SNS |
| | Authentication | Amazon Cognito |
| | Monitoring | Amazon CloudWatch |
| | Secrets | AWS Secrets Manager |
| **Frontend** | Framework | React 18 |
| | Build Tool | Vite |
| | Mapping | Leaflet.js |
| | Styling | Tailwind CSS |
| | State Management | React Query |
| | HTTP Client | Axios |

## Components and Interfaces

### Edge Device Components

#### 1. Detection Engine

**Responsibilities:**
- Capture video frames from camera at configured frame rate
- Preprocess frames for ML inference (resize, normalize)
- Run TensorFlow Lite inference for species classification
- Output species classification and confidence score
- Capture still images and audio clips for valid detections

**Interfaces:**
```python
class DetectionEngine:
    def __init__(self, model_path: str, confidence_threshold: float):
        """Initialize detection engine with ML model"""
        
    def process_frame(self, frame: np.ndarray) -> Detection:
        """
        Process a single video frame
        Returns: Detection object with species, confidence, bounding_box
        """
        
    def capture_evidence(self) -> Tuple[bytes, bytes]:
        """
        Capture still image and audio clip
        Returns: (image_bytes, audio_bytes)
        """
```

**Configuration:**
- `model_path`: Path to TensorFlow Lite model file
- `confidence_threshold`: Minimum confidence for valid detection (default: 0.7)
- `frame_rate`: Frames per second to process (default: 15)
- `resolution`: Camera resolution (default: 640x480)
- `input_size`: ML model input size (default: 224x224)

#### 2. Audio Detection Engine

**Responsibilities:**
- Continuously capture audio at 16kHz sample rate
- Analyze audio in 1-second windows
- Classify animal vocalizations using audio ML model
- Merge audio and visual detections when they occur within 5 seconds

**Interfaces:**
```python
class AudioDetectionEngine:
    def __init__(self, model_path: str, confidence_threshold: float):
        """Initialize audio detection engine"""
        
    def process_audio_window(self, audio_data: np.ndarray) -> AudioDetection:
        """
        Process 1-second audio window
        Returns: AudioDetection with species and confidence
        """
        
    def merge_detections(self, visual: Detection, audio: AudioDetection) -> Detection:
        """
        Merge visual and audio detections
        Returns: Combined detection with higher confidence
        """
```

#### 3. Threat Assessment Module

**Responsibilities:**
- Assign threat level based on species and confidence score
- Apply threat level reduction for confidence between 0.5-0.7
- Include threat level in incident record

**Interfaces:**
```python
class ThreatAssessor:
    def assess_threat(self, species: str, confidence: float) -> ThreatLevel:
        """
        Determine threat level based on species and confidence
        Returns: ThreatLevel enum (HIGH, MEDIUM, LOW)
        """
```

**Threat Level Rules:**
- Elephant (confidence > 0.7): HIGH
- Leopard (confidence > 0.7): HIGH
- Boar (confidence > 0.7): MEDIUM
- Deer (confidence > 0.7): LOW
- Human (confidence > 0.7): LOW
- Confidence 0.5-0.7: Reduce threat level by one

#### 4. Deterrence Controller

**Responsibilities:**
- Activate deterrence within 500ms of HIGH/MEDIUM threat detection
- Play species-specific deterrent sounds
- Control deterrent lights
- Enforce 30-second deterrence duration and 60-second cooldown

**Interfaces:**
```python
class DeterrenceController:
    def __init__(self, sound_patterns: Dict[str, str], light_gpio_pin: int):
        """Initialize deterrence hardware"""
        
    def activate(self, species: str, threat_level: ThreatLevel) -> bool:
        """
        Activate deterrence for detected species
        Returns: True if activated, False if on cooldown or disabled
        """
        
    def is_on_cooldown(self) -> bool:
        """Check if deterrence is in cooldown period"""
```

**Configuration:**
- `enabled`: Enable/disable deterrence (default: true)
- `sound_patterns`: Map of species to audio file paths
- `light_gpio_pin`: GPIO pin for deterrent lights
- `volume_db`: Sound volume in decibels (90-110)
- `duration_seconds`: Deterrence duration (default: 30)
- `cooldown_seconds`: Cooldown between activations (default: 60)

#### 5. Local Cache Manager

**Responsibilities:**
- Store incidents in SQLite database when offline
- Maintain up to 1000 incidents with FIFO eviction
- Mark incidents as synced after cloud acknowledgment
- Provide batch retrieval for sync process

**Interfaces:**
```python
class LocalCacheManager:
    def __init__(self, db_path: str, max_events: int):
        """Initialize SQLite cache"""
        
    def store_incident(self, incident: Incident) -> bool:
        """Store incident in local cache"""
        
    def get_unsent_batch(self, limit: int) -> List[Incident]:
        """Retrieve up to limit unsent incidents"""
        
    def mark_synced(self, incident_ids: List[str]) -> None:
        """Mark incidents as successfully synced"""
        
    def evict_oldest_low_priority(self) -> None:
        """Evict oldest LOW threat incidents when cache is full"""
```

**Schema:**
```sql
CREATE TABLE incidents (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    species TEXT NOT NULL,
    confidence REAL NOT NULL,
    threat_level TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    image_path TEXT,
    audio_path TEXT,
    synced INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
);

CREATE INDEX idx_synced ON incidents(synced);
CREATE INDEX idx_timestamp ON incidents(timestamp);
CREATE INDEX idx_threat_level ON incidents(threat_level);
```

#### 6. Connectivity Manager

**Responsibilities:**
- Manage multiple connectivity modes (WiFi, GSM, LoRa)
- Automatically select best available network
- Monitor connection quality and switch networks when needed
- Handle network-specific protocols and limitations

**Interfaces:**
```python
class ConnectivityManager:
    def __init__(self, config: ConnectivityConfig):
        """Initialize connectivity with WiFi, GSM, and LoRa support"""
        
    def connect(self) -> ConnectionStatus:
        """
        Attempt connection in priority order: WiFi → GSM → LoRa
        Returns: ConnectionStatus with active network type
        """
        
    def get_connection_quality(self) -> float:
        """
        Get current connection quality (0.0 to 1.0)
        """
        
    def switch_network(self) -> bool:
        """
        Switch to alternative network if quality degrades
        Returns: True if switch successful
        """
```

#### 7. MQTT Client

**Responsibilities:**
- Establish secure MQTT connection to AWS IoT Core
- Publish incidents, alerts, and telemetry
- Subscribe to command topics for configuration and firmware updates
- Handle connection failures with retry logic

**Interfaces:**
```python
class MQTTClient:
    def __init__(self, endpoint: str, cert_path: str, key_path: str, ca_path: str):
        """Initialize MQTT client with TLS certificates"""
        
    def connect(self) -> bool:
        """Establish MQTT connection with mutual TLS"""
        
    def publish_incident(self, incident: Incident) -> bool:
        """Publish incident to agrishield/incidents/{device_id}"""
        
    def publish_alert(self, alert: Alert) -> bool:
        """Publish alert to agrishield/alerts/{device_id}"""
        
    def publish_telemetry(self, telemetry: Telemetry) -> bool:
        """Publish telemetry to agrishield/telemetry/{device_id}"""
        
    def subscribe_commands(self, callback: Callable) -> None:
        """Subscribe to agrishield/commands/{device_id}/*"""
```

#### 8. Configuration Manager

**Responsibilities:**
- Load configuration from local YAML file
- Apply remote configuration updates from cloud
- Validate configuration schema
- Persist configuration changes to disk

**Interfaces:**
```python
class ConfigurationManager:
    def __init__(self, config_path: str):
        """Load configuration from YAML file"""
        
    def get(self, key: str) -> Any:
        """Get configuration value by key"""
        
    def update(self, updates: Dict[str, Any]) -> bool:
        """
        Apply configuration updates
        Returns: True if valid and applied, False if validation fails
        """
        
    def persist(self) -> None:
        """Save configuration to disk"""
```

#### 9. Battery Manager

**Responsibilities:**
- Monitor battery level every 60 seconds
- Enter power-saving mode when battery < 30%
- Enter critical mode when battery < 15%
- Adjust frame rate, sync interval, and deterrence based on power mode

**Interfaces:**
```python
class BatteryManager:
    def __init__(self):
        """Initialize battery monitoring"""
        
    def get_battery_level(self) -> float:
        """Get current battery level (0.0 to 1.0)"""
        
    def get_power_mode(self) -> PowerMode:
        """Get current power mode (NORMAL, SAVING, CRITICAL)"""
        
    def apply_power_mode(self, mode: PowerMode) -> None:
        """Apply power-saving adjustments"""
```

#### 10. Firmware Updater

**Responsibilities:**
- Download firmware images from S3
- Verify digital signatures
- Install firmware updates
- Rollback on boot failure

**Interfaces:**
```python
class FirmwareUpdater:
    def __init__(self, public_key_path: str):
        """Initialize firmware updater with verification key"""
        
    def download_firmware(self, url: str) -> bytes:
        """Download firmware image from S3"""
        
    def verify_signature(self, firmware: bytes, signature: bytes) -> bool:
        """Verify firmware digital signature"""
        
    def install_firmware(self, firmware: bytes) -> bool:
        """Install firmware and reboot"""
        
    def rollback(self) -> None:
        """Rollback to previous firmware version"""
```

### Cloud Components

#### 1. Incident Processor Lambda

**Responsibilities:**
- Receive incident messages from IoT Core
- Parse and validate JSON payload
- Enrich with server-side timestamp and message ID
- Store incident in DynamoDB
- Upload media files to S3
- Invoke Alert Router for HIGH threat incidents
- Publish acknowledgment back to device

**Handler:**
```python
def lambda_handler(event, context):
    """
    Process incident from IoT Core
    Event: MQTT message from agrishield/incidents/{device_id}
    """
```

**Input Schema:**
```json
{
  "device_id": "agrishield-device-001",
  "timestamp": 1704067200,
  "species": "Elephant",
  "confidence": 0.92,
  "threat_level": "HIGH",
  "latitude": -1.2921,
  "longitude": 36.8219,
  "image_base64": "...",
  "audio_base64": "..."
}
```

**Output:**
- DynamoDB record in `agrishield-incidents` table
- S3 objects for image and audio
- MQTT acknowledgment to `agrishield/acks/{device_id}`

#### 2. Alert Router Lambda

**Responsibilities:**
- Receive HIGH threat incidents from Incident Processor
- Retrieve device location from DynamoDB
- Query for phone numbers within 5km alert radius
- Format SMS message with species, location, and timestamp
- Publish to SNS topic
- Deduplicate alerts within 5-minute window

**Handler:**
```python
def lambda_handler(event, context):
    """
    Route alerts to nearby farmers and rangers
    Event: Incident object from Incident Processor
    """
```

**SMS Format:**
```
⚠️ AgriShield Alert
Elephant detected at Farm Block A
Time: 2024-01-01 14:30
Location: -1.2921, 36.8219
```

#### 3. Telemetry Processor Lambda

**Responsibilities:**
- Receive telemetry messages from IoT Core
- Store telemetry in DynamoDB
- Check thresholds for warnings (CPU temp, battery, disk usage)
- Publish warnings to monitoring SNS topic
- Calculate device uptime percentage

**Handler:**
```python
def lambda_handler(event, context):
    """
    Process device telemetry
    Event: MQTT message from agrishield/telemetry/{device_id}
    """
```

**Input Schema:**
```json
{
  "device_id": "agrishield-device-001",
  "timestamp": 1704067200,
  "cpu_temperature": 65.5,
  "disk_usage_percent": 45.2,
  "battery_level_percent": 85.0,
  "uptime_seconds": 86400
}
```

#### 4. Sync Handler Lambda

**Responsibilities:**
- Receive batch sync messages from devices
- Process multiple incidents in a single invocation
- Store all incidents in DynamoDB using BatchWriteItem
- Upload media files to S3
- Return batch acknowledgment

**Handler:**
```python
def lambda_handler(event, context):
    """
    Process batch sync from edge device
    Event: Array of incident objects
    """
```

#### 5. Configuration Manager Lambda

**Responsibilities:**
- Receive configuration updates from dashboard
- Validate configuration schema
- Publish configuration to device-specific MQTT topic
- Store configuration in DynamoDB for audit trail

**Handler:**
```python
def lambda_handler(event, context):
    """
    Update device configuration
    Event: API Gateway request with device_id and config updates
    """
```

#### 6. Model Manager Lambda

**Responsibilities:**
- Handle ML model uploads to S3
- Publish model update notifications to all devices
- Track model versions in DynamoDB
- Generate presigned URLs for model downloads

**Handler:**
```python
def lambda_handler(event, context):
    """
    Manage ML model deployments
    Event: S3 upload event or API Gateway request
    """
```

### Frontend Components

#### 1. Authentication Module

**Responsibilities:**
- Integrate with Amazon Cognito User Pool
- Handle login/logout flows
- Store JWT tokens in session storage
- Refresh tokens before expiration
- Enforce role-based access control

**Components:**
```typescript
// Login component
function Login() {
  const handleLogin = async (username: string, password: string) => {
    // Authenticate with Cognito
  }
}

// Protected route wrapper
function ProtectedRoute({ children, requiredRole }) {
  // Check JWT token and role
}
```

#### 2. Map Visualization

**Responsibilities:**
- Display incidents on interactive Leaflet map
- Color-code markers by threat level
- Cluster markers for dense areas
- Show heatmap layer for incident density
- Display movement vectors for coordinated detections

**Components:**
```typescript
function IncidentMap({ incidents, filters }) {
  // Render Leaflet map with markers
}

function IncidentMarker({ incident }) {
  // Render marker with popup
}

function HeatmapLayer({ incidents }) {
  // Render heatmap overlay
}
```

#### 3. Device Management

**Responsibilities:**
- Display list of all registered devices
- Show device status (Online/Offline)
- Display device telemetry (CPU temp, battery, disk usage)
- Allow admins to edit device configuration
- Send configuration updates via API

**Components:**
```typescript
function DeviceList({ devices }) {
  // Render device table
}

function DeviceDetail({ deviceId }) {
  // Show device details and telemetry
}

function DeviceConfigEditor({ deviceId, config }) {
  // Edit and save device configuration
}
```

#### 4. Incident Reporting

**Responsibilities:**
- Provide date range and filter selection
- Query incidents from API
- Display summary statistics and charts
- Export data to CSV
- Generate PDF reports with maps

**Components:**
```typescript
function ReportingDashboard() {
  // Main reporting interface
}

function IncidentStats({ incidents }) {
  // Display summary statistics
}

function IncidentCharts({ incidents }) {
  // Render time-series, bar, and pie charts
}

function ExportButtons({ incidents }) {
  // CSV and PDF export
}
```

## Data Models

### Edge Device Data Models

#### Incident
```python
@dataclass
class Incident:
    id: str                    # UUID
    device_id: str             # Device identifier
    timestamp: int             # Unix timestamp
    species: str               # Elephant, Boar, Deer, Leopard, Human, Unknown
    confidence: float          # 0.0 to 1.0
    threat_level: str          # HIGH, MEDIUM, LOW
    latitude: float            # GPS latitude
    longitude: float           # GPS longitude
    image_path: str            # Local path to image file
    audio_path: str            # Local path to audio file
    synced: bool               # Sync status
    created_at: int            # Unix timestamp
```

#### Detection
```python
@dataclass
class Detection:
    species: str               # Detected species
    confidence: float          # Confidence score
    bounding_box: Tuple[int, int, int, int]  # (x, y, width, height)
    timestamp: int             # Unix timestamp
```

#### Telemetry
```python
@dataclass
class Telemetry:
    device_id: str             # Device identifier
    timestamp: int             # Unix timestamp
    cpu_temperature: float     # Celsius
    disk_usage_percent: float  # 0.0 to 100.0
    battery_level_percent: float  # 0.0 to 100.0
    uptime_seconds: int        # Seconds since boot
    network_type: str          # WiFi, GSM, LoRa
    connection_quality: float  # 0.0 to 1.0
```

### Cloud Data Models

#### DynamoDB: Incidents Table
```
Table: agrishield-incidents
Partition Key: device_id (String)
Sort Key: timestamp (Number)

Attributes:
- id (String): UUID
- device_id (String): Device identifier
- timestamp (Number): Unix timestamp
- species (String): Detected species
- confidence (Number): Confidence score
- threat_level (String): HIGH, MEDIUM, LOW
- latitude (Number): GPS latitude
- longitude (Number): GPS longitude
- image_url (String): S3 presigned URL
- audio_url (String): S3 presigned URL
- server_timestamp (Number): Server-side timestamp
- message_id (String): MQTT message ID

GSI: species-timestamp-index
- Partition Key: species
- Sort Key: timestamp
```

#### DynamoDB: Devices Table
```
Table: agrishield-devices
Partition Key: device_id (String)

Attributes:
- device_id (String): Device identifier
- location_name (String): Human-readable location
- latitude (Number): GPS latitude
- longitude (Number): GPS longitude
- status (String): Online, Offline
- last_seen (Number): Unix timestamp
- firmware_version (String): Current firmware version
- model_version (String): Current ML model version
- configuration (Map): Device configuration
- phone_numbers (List): Alert recipient phone numbers
- created_at (Number): Unix timestamp
- updated_at (Number): Unix timestamp
```

#### DynamoDB: Telemetry Table
```
Table: agrishield-telemetry
Partition Key: device_id (String)
Sort Key: timestamp (Number)
TTL: 90 days

Attributes:
- device_id (String): Device identifier
- timestamp (Number): Unix timestamp
- cpu_temperature (Number): Celsius
- disk_usage_percent (Number): Percentage
- battery_level_percent (Number): Percentage
- uptime_seconds (Number): Seconds
- network_type (String): WiFi, GSM, LoRa
- connection_quality (Number): 0.0 to 1.0
```

#### DynamoDB: Movement Events Table
```
Table: agrishield-movements
Partition Key: species (String)
Sort Key: timestamp (Number)

Attributes:
- movement_id (String): UUID
- species (String): Detected species
- timestamp (Number): Unix timestamp
- incident_ids (List): Linked incident IDs
- start_location (Map): {lat, lng, device_id}
- end_location (Map): {lat, lng, device_id}
- distance_km (Number): Distance traveled
- speed_kmh (Number): Movement speed
- movement_type (String): migrating, foraging
- duration_seconds (Number): Time between detections
```

#### S3: Media Storage
```
Bucket: agrishield-media-{account-id}
Versioning: Enabled
Encryption: SSE-S3

Key Pattern:
- incidents/{device_id}/{timestamp}/image.jpg
- incidents/{device_id}/{timestamp}/audio.wav

Lifecycle Policy:
- Transition to Glacier after 180 days
- Delete after 730 days (2 years)
```

#### S3: Model Storage
```
Bucket: agrishield-models-{account-id}
Versioning: Enabled
Encryption: SSE-S3

Key Pattern:
- vision/{model_name}-v{version}.tflite
- audio/{model_name}-v{version}.tflite

Metadata:
- model-version: Version number
- model-checksum: SHA256 hash
- model-signature: Digital signature
```

### API Data Models

#### API Request: Update Device Configuration
```json
{
  "device_id": "agrishield-device-001",
  "configuration": {
    "confidence_threshold": 0.75,
    "frame_rate": 10,
    "monitoring_hours": {
      "start": "06:00",
      "end": "20:00"
    },
    "deterrence_enabled": true,
    "sync_interval_seconds": 600
  }
}
```

#### API Response: Incident Query
```json
{
  "incidents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "device_id": "agrishield-device-001",
      "timestamp": 1704067200,
      "species": "Elephant",
      "confidence": 0.92,
      "threat_level": "HIGH",
      "latitude": -1.2921,
      "longitude": 36.8219,
      "image_url": "https://s3.amazonaws.com/...",
      "audio_url": "https://s3.amazonaws.com/..."
    }
  ],
  "next_token": "eyJsYXN0X2V2YWx1YXRlZF9rZXkiOi4uLn0="
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

- **Threat Assessment Rules (2.1-2.5)**: These five separate rules for different species can be combined into a single comprehensive property that validates the threat assessment logic for all species.
- **S3 Key Patterns (8.1-8.2)**: Image and audio key patterns can be combined into a single property about media storage conventions.
- **IoT Policy Restrictions (9.5-9.6)**: Publish and subscribe restrictions can be combined into a single property about topic access control.
- **Device Status Calculation (12.3-12.4)**: Online and offline status rules can be combined into a single property about status determination.
- **Power Mode Transitions (24.2, 24.5, 24.8)**: These three separate battery threshold rules can be combined into a single property about power mode state machine.
- **Encryption Configuration (16.1, 16.2, 16.8)**: These are deployment configuration checks rather than runtime properties, so they're better tested as examples.

### Property 1: Detection Output Domain Validity

*For any* video frame processed by the Detection_System, the output species SHALL be one of the valid species: Elephant, Boar, Deer, Leopard, Human, or Unknown.

**Validates: Requirements 1.2**

### Property 2: Confidence Score Range

*For any* classification performed by the Detection_System, the Confidence_Score SHALL be in the range [0.0, 1.0].

**Validates: Requirements 1.3**

### Property 3: Valid Detection Threshold

*For any* detection with Confidence_Score exceeding 0.7, the Detection_System SHALL classify it as valid and trigger evidence capture (still image and audio clip).

**Validates: Requirements 1.6, 1.7, 1.8**

### Property 4: Threat Assessment Correctness

*For any* valid detection, the assigned Threat_Level SHALL match the species-confidence mapping:
- Elephant with confidence > 0.7 → HIGH
- Leopard with confidence > 0.7 → HIGH  
- Boar with confidence > 0.7 → MEDIUM
- Deer with confidence > 0.7 → LOW
- Human with confidence > 0.7 → LOW
- Any species with confidence 0.5-0.7 → One level lower than base threat

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 5: Deterrence Cooldown Enforcement

*For any* deterrence activation, subsequent activation attempts within 60 seconds SHALL be blocked, regardless of threat level.

**Validates: Requirements 3.8**

### Property 6: Offline Detection Continuity

*For any* network connectivity state change to offline, wildlife detection SHALL continue without interruption and incidents SHALL be stored in Local_Cache.

**Validates: Requirements 4.1, 4.2**

### Property 7: Cache Eviction Policy

*For any* Local_Cache at capacity (1000 incidents), adding a new incident SHALL evict the oldest LOW Threat_Level incident first, preserving HIGH and MEDIUM threats longer.

**Validates: Requirements 4.4**

### Property 8: Sync Acknowledgment State Update

*For any* incident that receives a sync acknowledgment from the cloud, the incident SHALL be marked as synced in the Local_Cache.

**Validates: Requirements 5.6**

### Property 9: Sync Retry with Exponential Backoff

*For any* failed sync attempt, the Edge_Device SHALL retry up to 3 times with exponentially increasing delays before giving up.

**Validates: Requirements 5.7**

### Property 10: Alert Deduplication Window

*For any* device, if an alert was sent within the last 5 minutes, subsequent alerts for the same device SHALL be suppressed.

**Validates: Requirements 6.6, 14.9**

### Property 11: Incident Storage Completeness

*For any* incident stored in DynamoDB, all required fields SHALL be present: device_id, timestamp, species, Confidence_Score, Threat_Level, latitude, longitude, image_url, and audio_url.

**Validates: Requirements 7.3**

### Property 12: Media Storage Key Convention

*For any* incident with media files, the S3 keys SHALL follow the pattern "incidents/{device_id}/{timestamp}/image.jpg" for images and "incidents/{device_id}/{timestamp}/audio.wav" for audio.

**Validates: Requirements 8.1, 8.2**

### Property 13: IoT Topic Access Control

*For any* Edge_Device with device_id X, the IoT Policy SHALL allow publishing only to topics "agrishield/incidents/X" and "agrishield/telemetry/X", and subscribing only to "agrishield/commands/X/*".

**Validates: Requirements 9.5, 9.6, 17.9**

### Property 14: Role-Based Access Control

*For any* user with role "ranger", attempts to modify device settings SHALL be denied, while users with role "admin" SHALL be allowed.

**Validates: Requirements 10.7, 10.8**

### Property 15: Threat Level Marker Color Mapping

*For any* incident displayed on the map, the marker color SHALL be red for HIGH threat, orange for MEDIUM threat, and yellow for LOW threat.

**Validates: Requirements 11.5**

### Property 16: Device Status Determination

*For any* device, the status SHALL be "Online" if telemetry was received within the last 5 minutes, and "Offline" if no telemetry for more than 30 minutes.

**Validates: Requirements 12.3, 12.4**

### Property 17: Invalid JSON Error Handling

*For any* Lambda invocation with invalid JSON payload, the Lambda SHALL log the error and return a failure response without processing.

**Validates: Requirements 13.3**

### Property 18: Incident Enrichment

*For any* valid incident payload processed by Lambda, the output SHALL include server-side timestamp and message_id in addition to the original fields.

**Validates: Requirements 13.4**

### Property 19: Configuration Recovery After Reboot

*For any* Edge_Device that loses power and reboots, the device SHALL load configuration from local storage and sync unsent incidents from Local_Cache.

**Validates: Requirements 20.1, 20.2, 20.3**

### Property 20: Model Checksum Verification

*For any* model download, the Edge_Device SHALL verify the file checksum matches the expected value before installation, rejecting mismatched files.

**Validates: Requirements 21.4**

### Property 21: Model Rollback on Failure

*For any* newly installed model that causes 3 consecutive inference failures, the Edge_Device SHALL automatically rollback to the previous model version.

**Validates: Requirements 21.10**

### Property 22: Configuration Schema Validation

*For any* configuration update received by the Edge_Device, the device SHALL validate against the schema and reject invalid configurations with an error message.

**Validates: Requirements 22.4, 22.8**

### Property 23: Power Mode State Machine

*For any* Edge_Device, the power mode SHALL transition based on battery level:
- Battery < 15% → CRITICAL mode
- Battery 15-30% → SAVING mode  
- Battery > 40% → NORMAL mode
And each mode SHALL apply appropriate resource constraints (frame rate, sync interval, deterrence).

**Validates: Requirements 24.2, 24.5, 24.8**

### Property 24: Multi-Modal Detection Fusion

*For any* visual detection and audio detection that occur within 5 seconds of each other for the same species, the Edge_Device SHALL merge them into a single incident with confidence higher than either individual detection.

**Validates: Requirements 25.5**

### Property 25: Movement Event Correlation

*For any* two detections of the same species within 10 minutes and 1 kilometer, the system SHALL link them as a movement event and calculate the movement vector (direction and speed).

**Validates: Requirements 26.3, 26.4**

### Property 26: Firmware Signature Verification

*For any* firmware download, the Edge_Device SHALL verify the digital signature using the public key before installation, rejecting unsigned or incorrectly signed firmware.

**Validates: Requirements 27.4**

### Property 27: Firmware Rollback on Boot Failure

*For any* firmware update that fails boot verification within 120 seconds, the Edge_Device SHALL automatically rollback to the previous firmware version.

**Validates: Requirements 27.9**

### Property 28: Location Anonymization

*For any* location data shared with third parties, the Cloud_Platform SHALL round coordinates to 100-meter precision (approximately 3 decimal places).

**Validates: Requirements 28.1**

### Property 29: Network Connection Priority

*For any* Edge_Device boot sequence, connection attempts SHALL be made in priority order: WiFi first, then GSM, then LoRa, using the first successful connection.

**Validates: Requirements 29.2**

### Property 30: Network Quality-Based Switching

*For any* active network connection with quality below 50%, the Edge_Device SHALL attempt to switch to an alternative network with better quality.

**Validates: Requirements 29.9**

### Property 31: Diagnostic Test Completeness

*For any* diagnostic mode activation, the Edge_Device SHALL execute all required self-tests (camera, microphone, deterrence hardware, network connectivity, ML model) and report pass/fail status for each.

**Validates: Requirements 30.2, 30.3**

## Error Handling

### Edge Device Error Handling

#### Detection Errors

**Scenario**: ML inference fails due to corrupted model or hardware issue

**Handling**:
1. Log error with timestamp and error details
2. Continue monitoring with next frame
3. After 3 consecutive failures, attempt model reload
4. After 10 consecutive failures, send diagnostic alert to cloud
5. If model reload fails, attempt rollback to previous model version

**Recovery**: Automatic model rollback ensures system continues operating

#### Camera/Microphone Errors

**Scenario**: Camera or microphone hardware failure

**Handling**:
1. Log hardware error with device identifier
2. Attempt device reset (close and reopen)
3. If reset fails, disable affected sensor and continue with remaining sensors
4. Send telemetry alert indicating hardware failure
5. Continue detection with available sensors (vision-only or audio-only mode)

**Recovery**: Graceful degradation allows partial functionality

#### Deterrence Hardware Errors

**Scenario**: Deterrence lights or speakers fail to activate

**Handling**:
1. Log deterrence error
2. Continue detection and alerting (deterrence is non-critical)
3. Send telemetry warning to cloud
4. Mark device as "degraded" in dashboard

**Recovery**: Detection and alerting continue normally

#### Storage Errors

**Scenario**: Local cache disk full or SQLite corruption

**Handling**:
1. Attempt to free space by deleting oldest LOW threat incidents
2. If still full, delete MEDIUM threat incidents older than 7 days
3. If corruption detected, attempt database repair
4. If repair fails, recreate database (data loss acceptable for local cache)
5. Send critical alert to cloud

**Recovery**: Database recreation ensures system continues operating

#### Connectivity Errors

**Scenario**: All network interfaces fail (WiFi, GSM, LoRa)

**Handling**:
1. Log connectivity failure
2. Continue detection and deterrence locally
3. Cache all incidents in local storage
4. Retry connection every 5 minutes
5. When connectivity restored, sync all cached data

**Recovery**: Offline-first design ensures no functionality loss

### Cloud Error Handling

#### Lambda Invocation Errors

**Scenario**: Lambda function throws unhandled exception

**Handling**:
1. CloudWatch logs capture full stack trace
2. Lambda automatic retry (up to 2 times)
3. If all retries fail, send event to Dead Letter Queue (DLQ)
4. CloudWatch alarm triggers on error rate > 1%
5. Admin receives SNS notification

**Recovery**: DLQ allows manual inspection and reprocessing

#### DynamoDB Errors

**Scenario**: DynamoDB write fails due to throttling or service issue

**Handling**:
1. Lambda implements exponential backoff retry
2. If write fails after retries, return failure acknowledgment to device
3. Device keeps incident in local cache for next sync
4. CloudWatch alarm on write failure rate

**Recovery**: Device retry ensures no data loss

#### S3 Upload Errors

**Scenario**: Media file upload to S3 fails

**Handling**:
1. Lambda retries upload up to 3 times
2. If upload fails, store incident metadata without media URLs
3. Return partial success acknowledgment to device
4. Device retains media files for next sync attempt

**Recovery**: Incident metadata preserved, media can be re-uploaded

#### SNS Delivery Errors

**Scenario**: SMS delivery fails (invalid number, carrier issue)

**Handling**:
1. SNS automatic retry after 30 seconds
2. If retry fails, log delivery failure
3. Store failed delivery in DynamoDB for audit
4. Send notification to admin dashboard
5. Do not retry indefinitely (avoid alert fatigue)

**Recovery**: Admin can manually investigate and resend if needed

### Frontend Error Handling

#### Authentication Errors

**Scenario**: JWT token expired or invalid

**Handling**:
1. Detect 401 Unauthorized response
2. Clear session storage
3. Redirect to login page
4. Display "Session expired, please log in again" message

**Recovery**: User re-authenticates

#### API Request Errors

**Scenario**: API Gateway returns 500 Internal Server Error

**Handling**:
1. Display user-friendly error message
2. Retry request with exponential backoff (up to 3 times)
3. If all retries fail, show "Service temporarily unavailable" message
4. Log error to browser console for debugging

**Recovery**: User can manually retry or wait for service recovery

#### Map Rendering Errors

**Scenario**: Leaflet fails to load map tiles

**Handling**:
1. Display fallback message "Map unavailable"
2. Show incident list view as alternative
3. Retry tile loading in background
4. Log error for debugging

**Recovery**: Incident data still accessible via list view

## Testing Strategy

### Dual Testing Approach

The AgriShield AI system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific detection scenarios (e.g., elephant at 0.92 confidence)
- Edge cases (e.g., empty cache, full cache, corrupted data)
- Error conditions (e.g., network timeout, invalid JSON)
- Integration between components (e.g., detection → deterrence flow)

**Property-Based Tests**: Verify universal properties across all inputs
- Detection output always in valid range
- Threat assessment follows rules for all species/confidence combinations
- Cache eviction maintains priority order for all cache states
- Configuration validation rejects all invalid schemas

Together, these approaches provide:
- Unit tests catch concrete bugs in specific scenarios
- Property tests verify correctness across the entire input space
- Both are necessary for production-ready software

### Property-Based Testing Configuration

**Framework Selection**:
- **Edge Device (Python)**: Hypothesis library
- **Cloud Lambda (Python)**: Hypothesis library
- **Frontend (TypeScript)**: fast-check library

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test tagged with comment referencing design property
- Tag format: `# Feature: agrishield-ai-system, Property {number}: {property_text}`

**Example Property Test**:
```python
from hypothesis import given, strategies as st
import hypothesis

# Feature: agrishield-ai-system, Property 2: Confidence Score Range
@given(frame=st.binary(min_size=640*480*3, max_size=640*480*3))
@hypothesis.settings(max_examples=100)
def test_confidence_score_range(frame):
    """For any frame, confidence score must be in [0.0, 1.0]"""
    detection = detection_engine.process_frame(frame)
    assert 0.0 <= detection.confidence <= 1.0
```

### Unit Testing Strategy

**Edge Device Tests**:
- Detection engine: Test with sample images of each species
- Threat assessment: Test all species/confidence combinations
- Deterrence: Test activation, cooldown, and disable scenarios
- Local cache: Test CRUD operations, eviction, and sync marking
- Connectivity: Test WiFi/GSM/LoRa fallback with mocked interfaces
- Configuration: Test load, update, and validation

**Cloud Lambda Tests**:
- Incident processor: Test valid/invalid payloads, enrichment, storage
- Alert router: Test geofencing, deduplication, SMS formatting
- Telemetry processor: Test threshold warnings, uptime calculation
- Sync handler: Test batch processing, partial failures

**Frontend Tests**:
- Authentication: Test login/logout, token refresh, role enforcement
- Map visualization: Test marker rendering, clustering, heatmap
- Device management: Test status calculation, configuration updates
- Reporting: Test filtering, statistics, CSV/PDF export

### Integration Testing

**End-to-End Scenarios**:
1. **Detection to Alert Flow**: Simulate elephant detection → verify SMS received
2. **Offline Sync Flow**: Disconnect device → generate incidents → reconnect → verify sync
3. **Configuration Update Flow**: Update config in dashboard → verify applied on device
4. **Firmware Update Flow**: Upload firmware → verify device downloads and installs
5. **Multi-Device Coordination**: Simulate detections on multiple devices → verify movement tracking

**Test Environment**:
- Edge device: Raspberry Pi with test images/audio
- Cloud: Separate AWS account with test infrastructure
- Frontend: Staging environment with test data

### Performance Testing

**Edge Device Performance**:
- Detection latency: < 100ms per frame (P99)
- Deterrence activation: < 500ms from detection
- Configuration load: < 10 seconds on boot
- Sync throughput: 50 incidents per batch

**Cloud Performance**:
- Lambda processing: < 3 seconds per incident (P99)
- DynamoDB write: < 1 second per incident
- SMS delivery: < 2 seconds from alert trigger
- API response: < 500ms for dashboard queries

**Load Testing**:
- Simulate 500 devices with 10 events/day each
- Peak load: 3x average (dawn/dusk activity)
- Verify no throttling or errors under load

### Security Testing

**Penetration Testing**:
- Attempt to publish to other device topics
- Attempt to access incidents without authentication
- Attempt SQL injection in dashboard filters
- Attempt to upload malicious firmware

**Vulnerability Scanning**:
- Scan edge device for open ports and services
- Scan Lambda dependencies for known CVEs
- Scan frontend dependencies for known vulnerabilities

**Compliance Testing**:
- Verify encryption at rest (DynamoDB, S3, SQLite)
- Verify encryption in transit (TLS 1.2+)
- Verify access logs capture all data access
- Verify data deletion within 30 days of request

### Monitoring and Observability

**CloudWatch Metrics**:
- Incident processing rate (events/minute)
- Detection latency (milliseconds)
- SMS delivery success rate (percentage)
- Lambda error rate (percentage)
- Device online count (number)
- Cache size per device (number of incidents)

**CloudWatch Alarms**:
- Lambda error rate > 1%
- SMS delivery rate < 95%
- Device offline > 30 minutes
- DynamoDB throttling detected
- S3 storage > 80% capacity

**CloudWatch Dashboard**:
- Real-time incident map
- Active device count
- Incidents per hour (time series)
- Alert delivery rate (gauge)
- Lambda performance (P50, P99 latency)

**Edge Device Logging**:
- All errors and warnings to local log files
- Log rotation after 100MB
- Logs uploaded to CloudWatch on sync
- Diagnostic logs available via SSH

