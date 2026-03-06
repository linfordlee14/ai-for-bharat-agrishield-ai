# Requirements Document

## Introduction

AgriShield AI is a distributed wildlife detection and deterrence system designed to protect rural farmland from crop-raiding animals while preserving endangered species. The system addresses human-wildlife conflict in regions like India and Sub-Saharan Africa where farmers lose significant portions of their harvest to elephants, boars, deer, and other wildlife.

The system consists of three major components:
1. Edge devices (Raspberry Pi with camera, microphone, GSM/LoRa) deployed in farmland
2. AWS cloud infrastructure for event processing, storage, and alerting
3. Ranger dashboard (React web application) for incident visualization and device management

The system operates offline-first with local caching, uses low-cost hardware, supports low-bandwidth communication, implements non-lethal deterrence, and scales to hundreds of devices per region.

## Glossary

- **Edge_Device**: Raspberry Pi 4 with camera module, USB microphone, and GSM/LoRa HAT for communication
- **Detection_System**: TensorFlow Lite-based ML inference engine running on Edge_Device
- **Deterrence_System**: Hardware subsystem controlling lights and audio speakers for wildlife deterrence
- **Cloud_Platform**: AWS infrastructure including IoT Core, Lambda, DynamoDB, S3, and SNS
- **Ranger_Dashboard**: React web application for incident visualization and device management
- **Incident**: A wildlife detection event with species classification, timestamp, location, and media
- **Alert**: SMS notification sent to farmers and rangers when high-threat wildlife is detected
- **Local_Cache**: SQLite database on Edge_Device storing unsent incidents during connectivity loss
- **Sync_Process**: Periodic upload of cached incidents from Edge_Device to Cloud_Platform
- **Species_Classification**: ML model output identifying detected animal (Elephant, Boar, Deer, Leopard, Human, Unknown)
- **Threat_Level**: Classification of incident severity (HIGH, MEDIUM, LOW) based on species and confidence
- **Confidence_Score**: ML model probability output (0.0 to 1.0) indicating detection certainty
- **IoT_Core**: AWS managed MQTT broker for secure device-to-cloud messaging
- **Thing**: AWS IoT Core registered device with unique identifier and X.509 certificate
- **MQTT_Topic**: Pub/sub channel for device communication (incidents, telemetry, commands)
- **Farmer**: End user who owns/operates farmland protected by Edge_Device
- **Ranger**: Wildlife conservation officer who monitors incidents via Ranger_Dashboard
- **Admin**: System administrator with full access to Ranger_Dashboard and device management

## Requirements

### Requirement 1: Wildlife Detection

**User Story:** As a farmer, I want the system to automatically detect wildlife approaching my farmland, so that I can protect my crops from damage.

#### Acceptance Criteria

1. WHEN the Edge_Device captures a video frame, THE Detection_System SHALL process the frame within 100 milliseconds
2. WHEN the Detection_System processes a frame, THE Detection_System SHALL classify the species as one of: Elephant, Boar, Deer, Leopard, Human, or Unknown
3. WHEN the Detection_System classifies a species, THE Detection_System SHALL output a Confidence_Score between 0.0 and 1.0
4. THE Detection_System SHALL capture video frames at 15 frames per second with 640x480 resolution
5. THE Detection_System SHALL use a TensorFlow Lite model with input size 224x224x3 pixels
6. WHEN the Confidence_Score exceeds 0.7, THE Detection_System SHALL classify the detection as valid
7. WHEN a valid detection occurs, THE Edge_Device SHALL capture a still image at full camera resolution
8. WHEN a valid detection occurs, THE Edge_Device SHALL record a 5-second audio clip
9. THE Detection_System SHALL operate continuously during configured monitoring hours
10. WHEN the Detection_System encounters an inference error, THE Edge_Device SHALL log the error and continue monitoring

### Requirement 2: Threat Assessment

**User Story:** As a farmer, I want the system to assess the threat level of detected wildlife, so that I receive appropriate alerts for dangerous situations.

#### Acceptance Criteria

1. WHEN the Detection_System detects an Elephant with Confidence_Score above 0.7, THE Edge_Device SHALL assign Threat_Level HIGH
2. WHEN the Detection_System detects a Boar with Confidence_Score above 0.7, THE Edge_Device SHALL assign Threat_Level MEDIUM
3. WHEN the Detection_System detects a Deer with Confidence_Score above 0.7, THE Edge_Device SHALL assign Threat_Level LOW
4. WHEN the Detection_System detects a Leopard with Confidence_Score above 0.7, THE Edge_Device SHALL assign Threat_Level HIGH
5. WHEN the Detection_System detects a Human with Confidence_Score above 0.7, THE Edge_Device SHALL assign Threat_Level LOW
6. WHEN the Confidence_Score is between 0.5 and 0.7, THE Edge_Device SHALL reduce the Threat_Level by one level
7. WHEN the Threat_Level is determined, THE Edge_Device SHALL include it in the Incident record

### Requirement 3: Non-Lethal Deterrence

**User Story:** As a conservationist, I want the system to use non-lethal methods to deter wildlife, so that animals are protected while crops are safeguarded.

#### Acceptance Criteria

1. WHEN a valid detection occurs with Threat_Level HIGH or MEDIUM, THE Deterrence_System SHALL activate within 500 milliseconds
2. WHEN the Deterrence_System activates for an Elephant, THE Deterrence_System SHALL play the elephant-specific deterrent sound
3. WHEN the Deterrence_System activates for a Boar, THE Deterrence_System SHALL play the boar-specific deterrent sound
4. WHEN the Deterrence_System activates for an unknown species, THE Deterrence_System SHALL play the general alarm sound
5. WHEN the Deterrence_System plays a sound, THE Deterrence_System SHALL activate the deterrent lights simultaneously
6. THE Deterrence_System SHALL play deterrent sounds at a volume level between 90 and 110 decibels
7. WHEN the Deterrence_System activates, THE Deterrence_System SHALL continue deterrence for 30 seconds
8. WHEN the Deterrence_System completes a deterrence cycle, THE Edge_Device SHALL wait 60 seconds before allowing another activation
9. WHERE deterrence is disabled in configuration, THE Edge_Device SHALL skip deterrence activation
10. WHEN the Deterrence_System encounters a hardware error, THE Edge_Device SHALL log the error and continue detection

### Requirement 4: Offline-First Operation

**User Story:** As a farmer in a rural area with unreliable connectivity, I want the system to operate without internet connection, so that wildlife detection continues during network outages.

#### Acceptance Criteria

1. WHEN the Edge_Device loses network connectivity, THE Edge_Device SHALL continue wildlife detection without interruption
2. WHEN the Edge_Device loses network connectivity, THE Edge_Device SHALL store Incidents in the Local_Cache
3. THE Local_Cache SHALL store up to 1000 Incidents
4. WHEN the Local_Cache reaches 1000 Incidents, THE Edge_Device SHALL evict the oldest LOW Threat_Level Incidents first
5. WHEN network connectivity is restored, THE Edge_Device SHALL initiate the Sync_Process within 60 seconds
6. WHEN the Edge_Device operates offline, THE Deterrence_System SHALL continue to function normally
7. THE Edge_Device SHALL persist configuration settings locally to survive power cycles
8. WHEN the Edge_Device boots, THE Edge_Device SHALL load configuration from local storage within 10 seconds
9. WHEN the Edge_Device operates offline for more than 24 hours, THE Edge_Device SHALL log a connectivity warning

### Requirement 5: Cloud Synchronization

**User Story:** As a ranger, I want incident data synchronized to the cloud, so that I can monitor wildlife activity across multiple locations.

#### Acceptance Criteria

1. WHEN network connectivity is available, THE Edge_Device SHALL execute the Sync_Process every 15 minutes
2. WHEN the Sync_Process executes, THE Edge_Device SHALL retrieve up to 50 unsent Incidents from the Local_Cache
3. WHEN the Sync_Process retrieves Incidents, THE Edge_Device SHALL publish them to the MQTT_Topic "agrishield/incidents/{device_id}"
4. WHEN the Edge_Device publishes an Incident, THE Edge_Device SHALL include device_id, timestamp, species, Confidence_Score, Threat_Level, location, and media references
5. WHEN the Cloud_Platform receives an Incident, THE Cloud_Platform SHALL acknowledge receipt via MQTT
6. WHEN the Edge_Device receives acknowledgment, THE Edge_Device SHALL mark the Incident as synced in the Local_Cache
7. WHEN the Sync_Process fails to upload an Incident, THE Edge_Device SHALL retry up to 3 times with exponential backoff
8. WHEN all retry attempts fail, THE Edge_Device SHALL keep the Incident in the Local_Cache for the next Sync_Process
9. THE Edge_Device SHALL use TLS 1.2 or higher for all MQTT connections
10. WHEN the Edge_Device publishes media files, THE Edge_Device SHALL compress images to JPEG format with quality 85

### Requirement 6: Real-Time Alerting

**User Story:** As a farmer, I want to receive immediate SMS alerts when dangerous wildlife is detected, so that I can take protective action quickly.

#### Acceptance Criteria

1. WHEN an Incident with Threat_Level HIGH is created, THE Edge_Device SHALL attempt to send an Alert immediately
2. WHEN the Edge_Device has network connectivity, THE Edge_Device SHALL publish the Alert to MQTT_Topic "agrishield/alerts/{device_id}"
3. WHEN the Cloud_Platform receives an Alert, THE Cloud_Platform SHALL process it within 2 seconds
4. WHEN the Cloud_Platform processes an Alert, THE Cloud_Platform SHALL publish an SMS message to the configured SNS topic
5. THE Alert SMS SHALL include species name, location name, and timestamp in human-readable format
6. WHEN multiple Alerts occur within 5 minutes for the same device, THE Cloud_Platform SHALL send only one SMS
7. WHEN the Edge_Device lacks network connectivity, THE Edge_Device SHALL attempt to send the Alert via LoRa if configured
8. WHEN both GSM and LoRa fail, THE Edge_Device SHALL cache the Alert for the next Sync_Process
9. THE Cloud_Platform SHALL deliver SMS Alerts to all phone numbers within the configured alert radius
10. WHEN SMS delivery fails, THE Cloud_Platform SHALL log the failure and retry once after 30 seconds

### Requirement 7: Incident Storage

**User Story:** As a ranger, I want all wildlife incidents stored in a database, so that I can analyze patterns and trends over time.

#### Acceptance Criteria

1. WHEN the Cloud_Platform receives an Incident, THE Cloud_Platform SHALL store it in DynamoDB within 1 second
2. THE Cloud_Platform SHALL store Incidents in a table with partition key device_id and sort key timestamp
3. WHEN storing an Incident, THE Cloud_Platform SHALL include all fields: device_id, timestamp, species, Confidence_Score, Threat_Level, latitude, longitude, image_url, and audio_url
4. THE Cloud_Platform SHALL store Incident records for a minimum of 2 years
5. WHEN an Incident includes media files, THE Cloud_Platform SHALL upload them to S3 before storing the Incident record
6. THE Cloud_Platform SHALL generate presigned URLs for media files with 1-hour expiration
7. WHEN storing an Incident fails, THE Cloud_Platform SHALL log the error and return a failure acknowledgment to the Edge_Device
8. THE Cloud_Platform SHALL enable point-in-time recovery for the Incidents table
9. THE Cloud_Platform SHALL encrypt all Incident data at rest using AES-256
10. WHEN querying Incidents, THE Cloud_Platform SHALL support filtering by device_id, timestamp range, species, and Threat_Level

### Requirement 8: Media Storage

**User Story:** As a ranger, I want to view images and audio recordings of wildlife incidents, so that I can verify detections and assess situations accurately.

#### Acceptance Criteria

1. WHEN the Cloud_Platform receives an Incident with media, THE Cloud_Platform SHALL store images in S3 with key pattern "incidents/{device_id}/{timestamp}/image.jpg"
2. WHEN the Cloud_Platform receives an Incident with media, THE Cloud_Platform SHALL store audio in S3 with key pattern "incidents/{device_id}/{timestamp}/audio.wav"
3. THE Cloud_Platform SHALL enable versioning on the media S3 bucket
4. THE Cloud_Platform SHALL encrypt all media files at rest using SSE-S3
5. WHEN the Ranger_Dashboard requests media, THE Cloud_Platform SHALL generate a presigned URL valid for 1 hour
6. THE Cloud_Platform SHALL store media files for a minimum of 1 year
7. WHEN media storage exceeds 80% of allocated capacity, THE Cloud_Platform SHALL log a warning
8. THE Cloud_Platform SHALL compress images to reduce storage costs while maintaining visual quality
9. WHEN uploading media fails, THE Cloud_Platform SHALL retry up to 3 times before returning an error
10. THE Cloud_Platform SHALL support lifecycle policies to archive media older than 6 months to S3 Glacier

### Requirement 9: Device Authentication

**User Story:** As a system administrator, I want all edge devices to authenticate securely, so that only authorized devices can send data to the cloud.

#### Acceptance Criteria

1. THE Edge_Device SHALL authenticate to IoT_Core using X.509 certificates
2. WHEN the Edge_Device connects to IoT_Core, THE Edge_Device SHALL present a valid device certificate
3. WHEN IoT_Core receives a connection request, THE IoT_Core SHALL validate the certificate against the Root CA
4. WHEN certificate validation succeeds, THE IoT_Core SHALL apply the device-specific IoT Policy
5. THE IoT Policy SHALL restrict the Edge_Device to publish only to topics matching "agrishield/incidents/{device_id}" and "agrishield/telemetry/{device_id}"
6. THE IoT Policy SHALL restrict the Edge_Device to subscribe only to topics matching "agrishield/commands/{device_id}"
7. WHEN certificate validation fails, THE IoT_Core SHALL reject the connection and log the failure
8. THE Edge_Device SHALL store the private key with file permissions 600 (owner read/write only)
9. THE Edge_Device SHALL use mutual TLS for all MQTT connections
10. WHEN a device certificate expires within 30 days, THE Cloud_Platform SHALL send a renewal notification to Admin users

### Requirement 10: Dashboard Authentication

**User Story:** As a ranger, I want to log in securely to the dashboard, so that only authorized personnel can view incident data.

#### Acceptance Criteria

1. THE Ranger_Dashboard SHALL authenticate users via Amazon Cognito User Pool
2. WHEN a user submits login credentials, THE Ranger_Dashboard SHALL send them to Cognito for validation
3. WHEN Cognito validates credentials, THE Cognito SHALL return a JWT token with 1-hour expiration
4. WHEN the Ranger_Dashboard receives a JWT token, THE Ranger_Dashboard SHALL store it securely in browser session storage
5. WHEN the Ranger_Dashboard makes API requests, THE Ranger_Dashboard SHALL include the JWT token in the Authorization header
6. WHEN a JWT token expires, THE Ranger_Dashboard SHALL redirect the user to the login page
7. THE Ranger_Dashboard SHALL support two user roles: "ranger" with read-only access and "admin" with full access
8. WHEN a user with role "ranger" attempts to modify device settings, THE Ranger_Dashboard SHALL deny the request
9. WHEN a user logs out, THE Ranger_Dashboard SHALL clear all session data and invalidate the JWT token
10. THE Ranger_Dashboard SHALL enforce password requirements: minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character

### Requirement 11: Incident Visualization

**User Story:** As a ranger, I want to view wildlife incidents on a map, so that I can identify hotspots and patterns.

#### Acceptance Criteria

1. THE Ranger_Dashboard SHALL display Incidents on an interactive map using Leaflet.js
2. WHEN the Ranger_Dashboard loads, THE Ranger_Dashboard SHALL center the map on the configured default location
3. WHEN an Incident is displayed, THE Ranger_Dashboard SHALL render a marker at the Incident latitude and longitude
4. WHEN a user clicks an Incident marker, THE Ranger_Dashboard SHALL display a popup with species, timestamp, Threat_Level, and device_id
5. THE Ranger_Dashboard SHALL color-code markers by Threat_Level: red for HIGH, orange for MEDIUM, yellow for LOW
6. WHEN multiple Incidents occur at the same location, THE Ranger_Dashboard SHALL cluster markers and show the count
7. THE Ranger_Dashboard SHALL display a heatmap layer showing Incident density
8. WHEN a user selects a time range filter, THE Ranger_Dashboard SHALL update the map to show only Incidents within that range
9. WHEN a user selects a species filter, THE Ranger_Dashboard SHALL update the map to show only Incidents of that species
10. WHEN a user clicks on an Incident popup, THE Ranger_Dashboard SHALL display the associated image and audio in a modal

### Requirement 12: Device Management

**User Story:** As an admin, I want to view and manage all edge devices, so that I can monitor system health and configure devices remotely.

#### Acceptance Criteria

1. THE Ranger_Dashboard SHALL display a list of all registered Edge_Devices
2. WHEN the Ranger_Dashboard displays a device, THE Ranger_Dashboard SHALL show device_id, location name, status, last_seen timestamp, and firmware version
3. WHEN an Edge_Device has not sent telemetry for more than 30 minutes, THE Ranger_Dashboard SHALL mark the device status as "Offline"
4. WHEN an Edge_Device sends telemetry within the last 5 minutes, THE Ranger_Dashboard SHALL mark the device status as "Online"
5. WHERE the user has role "admin", THE Ranger_Dashboard SHALL allow editing device configuration
6. WHEN an admin updates device configuration, THE Ranger_Dashboard SHALL publish the new configuration to MQTT_Topic "agrishield/commands/{device_id}/config"
7. WHEN the Edge_Device receives a configuration update, THE Edge_Device SHALL apply the new settings within 10 seconds
8. WHEN the Edge_Device applies new configuration, THE Edge_Device SHALL send a confirmation message to the Cloud_Platform
9. THE Ranger_Dashboard SHALL display device telemetry including CPU temperature, disk usage, and battery level
10. WHEN device telemetry indicates CPU temperature above 80°C, THE Ranger_Dashboard SHALL display a warning indicator

### Requirement 13: Event Processing

**User Story:** As a system operator, I want the cloud platform to process incoming events reliably, so that no wildlife incidents are lost.

#### Acceptance Criteria

1. WHEN IoT_Core receives a message on topic "agrishield/incidents/*", THE IoT_Core SHALL invoke the Incident Processor Lambda function
2. WHEN the Incident Processor Lambda executes, THE Lambda SHALL parse the incoming message payload
3. WHEN the payload is invalid JSON, THE Lambda SHALL log the error and return a failure response
4. WHEN the payload is valid, THE Lambda SHALL enrich the Incident with server-side timestamp and message_id
5. WHEN the Lambda enriches an Incident, THE Lambda SHALL store it in DynamoDB
6. WHEN DynamoDB storage succeeds, THE Lambda SHALL upload media files to S3 if present
7. WHEN the Threat_Level is HIGH, THE Lambda SHALL invoke the Alert Router Lambda function
8. WHEN the Lambda completes processing, THE Lambda SHALL publish an acknowledgment to MQTT_Topic "agrishield/acks/{device_id}"
9. WHEN the Lambda encounters an error, THE Lambda SHALL log the error to CloudWatch and return a failure response
10. THE Lambda SHALL complete processing within 3 seconds for 99% of requests

### Requirement 14: Alert Routing

**User Story:** As a farmer, I want to receive alerts only for incidents near my farm, so that I am not overwhelmed with irrelevant notifications.

#### Acceptance Criteria

1. WHEN the Alert Router Lambda receives an Incident, THE Lambda SHALL retrieve the device location from DynamoDB
2. WHEN the Lambda retrieves device location, THE Lambda SHALL query for all registered phone numbers within 5 kilometers
3. WHEN the Lambda identifies recipient phone numbers, THE Lambda SHALL format an SMS message with species, location, and timestamp
4. WHEN the Lambda formats the SMS, THE Lambda SHALL publish it to the SNS topic
5. WHEN SNS receives the message, THE SNS SHALL deliver SMS to all recipient phone numbers
6. WHEN SMS delivery succeeds, THE SNS SHALL log the delivery confirmation
7. WHEN SMS delivery fails, THE SNS SHALL retry once after 30 seconds
8. WHEN the retry fails, THE SNS SHALL log the failure and send a notification to the Admin
9. THE Lambda SHALL deduplicate Alerts by checking if an Alert was sent for the same device within the last 5 minutes
10. WHEN a duplicate Alert is detected, THE Lambda SHALL skip SMS delivery and log the deduplication

### Requirement 15: Telemetry Collection

**User Story:** As a system operator, I want to collect device telemetry, so that I can monitor system health and predict maintenance needs.

#### Acceptance Criteria

1. THE Edge_Device SHALL publish telemetry to MQTT_Topic "agrishield/telemetry/{device_id}" every 5 minutes
2. WHEN the Edge_Device publishes telemetry, THE Edge_Device SHALL include device_id, timestamp, cpu_temperature, disk_usage_percent, battery_level_percent, and uptime_seconds
3. WHEN IoT_Core receives telemetry, THE IoT_Core SHALL invoke the Telemetry Processor Lambda function
4. WHEN the Telemetry Processor Lambda executes, THE Lambda SHALL store the telemetry in DynamoDB
5. WHEN cpu_temperature exceeds 80°C, THE Lambda SHALL publish a warning to the monitoring SNS topic
6. WHEN battery_level_percent falls below 20%, THE Lambda SHALL publish a warning to the monitoring SNS topic
7. WHEN disk_usage_percent exceeds 90%, THE Lambda SHALL publish a warning to the monitoring SNS topic
8. THE Lambda SHALL calculate device uptime percentage over the last 24 hours
9. WHEN device uptime falls below 95%, THE Lambda SHALL publish a warning to the monitoring SNS topic
10. THE Cloud_Platform SHALL retain telemetry data for 90 days

### Requirement 16: Data Encryption

**User Story:** As a privacy officer, I want all sensitive data encrypted, so that wildlife incident data and user information remain confidential.

#### Acceptance Criteria

1. THE Cloud_Platform SHALL encrypt all data at rest in DynamoDB using AWS-managed keys with AES-256
2. THE Cloud_Platform SHALL encrypt all media files in S3 using SSE-S3 with AES-256
3. THE Edge_Device SHALL encrypt all MQTT connections using TLS 1.2 or higher
4. THE Ranger_Dashboard SHALL encrypt all API requests using HTTPS with TLS 1.2 or higher
5. THE Cloud_Platform SHALL store API keys and secrets in AWS Secrets Manager
6. WHEN the Lambda functions retrieve secrets, THE Lambda SHALL use IAM role-based authentication
7. THE Edge_Device SHALL not store unencrypted credentials in configuration files
8. WHEN the Edge_Device stores sensitive data in Local_Cache, THE Edge_Device SHALL encrypt the SQLite database using SQLCipher
9. THE Cloud_Platform SHALL rotate encryption keys annually
10. WHEN encryption operations fail, THE system SHALL log the error and reject the operation

### Requirement 17: Access Control

**User Story:** As a security administrator, I want fine-grained access control, so that users and devices can only access authorized resources.

#### Acceptance Criteria

1. THE Cloud_Platform SHALL enforce IAM policies for all AWS resource access
2. THE Lambda execution role SHALL have read/write permissions only to the Incidents and Devices DynamoDB tables
3. THE Lambda execution role SHALL have PutObject permissions only to the media S3 bucket
4. THE Lambda execution role SHALL have Publish permissions only to the alerts SNS topic
5. THE Ranger_Dashboard API SHALL have read-only permissions to DynamoDB tables
6. THE Ranger_Dashboard SHALL generate presigned S3 URLs with GetObject permission and 1-hour expiration
7. WHERE the user has role "ranger", THE Ranger_Dashboard SHALL deny access to device configuration endpoints
8. WHERE the user has role "admin", THE Ranger_Dashboard SHALL allow access to all endpoints
9. THE IoT Policy SHALL restrict each Edge_Device to publish only to its own device-specific topics
10. WHEN an unauthorized access attempt occurs, THE Cloud_Platform SHALL log the attempt and deny the request

### Requirement 18: Monitoring and Observability

**User Story:** As a system operator, I want comprehensive monitoring and logging, so that I can troubleshoot issues and ensure system reliability.

#### Acceptance Criteria

1. THE Cloud_Platform SHALL send all Lambda logs to CloudWatch Logs
2. THE Cloud_Platform SHALL send all IoT Core connection logs to CloudWatch Logs
3. THE Cloud_Platform SHALL create CloudWatch metrics for Incident processing latency
4. THE Cloud_Platform SHALL create CloudWatch metrics for SMS delivery success rate
5. THE Cloud_Platform SHALL create CloudWatch metrics for Lambda error rate
6. WHEN Lambda error rate exceeds 1%, THE Cloud_Platform SHALL trigger a CloudWatch alarm
7. WHEN SMS delivery success rate falls below 95%, THE Cloud_Platform SHALL trigger a CloudWatch alarm
8. WHEN an Edge_Device is offline for more than 30 minutes, THE Cloud_Platform SHALL trigger a CloudWatch alarm
9. THE Cloud_Platform SHALL create a CloudWatch dashboard displaying key metrics: active devices, incidents per hour, alert delivery rate, and Lambda performance
10. THE Edge_Device SHALL log all errors and warnings to local log files with rotation after 100MB

### Requirement 19: Scalability

**User Story:** As a system architect, I want the system to scale automatically, so that it can support hundreds of devices without manual intervention.

#### Acceptance Criteria

1. THE Cloud_Platform SHALL use AWS Lambda with auto-scaling to handle variable event loads
2. THE Cloud_Platform SHALL configure Lambda with 1000 concurrent execution limit
3. THE Cloud_Platform SHALL use DynamoDB on-demand capacity mode for automatic scaling
4. WHEN request rate increases, THE DynamoDB SHALL scale read and write capacity automatically
5. THE Cloud_Platform SHALL use IoT_Core managed service which scales to millions of concurrent connections
6. THE Cloud_Platform SHALL use SNS managed service which handles burst SMS traffic automatically
7. WHEN the system processes 500 devices with 10 events per device per day, THE Cloud_Platform SHALL maintain processing latency below 3 seconds
8. WHEN peak event rate reaches 3x average (dawn/dusk activity), THE Cloud_Platform SHALL handle the load without throttling
9. THE Cloud_Platform SHALL support adding new Edge_Devices without infrastructure changes
10. WHEN the number of devices exceeds 1000, THE Cloud_Platform SHALL continue to operate without performance degradation

### Requirement 20: Reliability and Fault Tolerance

**User Story:** As a farmer, I want the system to operate reliably, so that I can trust it to protect my crops even during failures.

#### Acceptance Criteria

1. WHEN the Edge_Device loses power, THE Edge_Device SHALL resume operation automatically when power is restored
2. WHEN the Edge_Device resumes operation, THE Edge_Device SHALL load configuration from local storage within 10 seconds
3. WHEN the Edge_Device resumes operation, THE Edge_Device SHALL sync unsent Incidents from Local_Cache
4. WHEN a Lambda function fails, THE Cloud_Platform SHALL retry the invocation up to 2 times
5. WHEN all Lambda retries fail, THE Cloud_Platform SHALL send the event to a dead-letter queue for manual review
6. THE Cloud_Platform SHALL enable point-in-time recovery for all DynamoDB tables
7. THE Cloud_Platform SHALL enable versioning on all S3 buckets
8. WHEN DynamoDB write fails, THE Lambda SHALL log the error and return a failure acknowledgment
9. WHEN the Edge_Device receives a failure acknowledgment, THE Edge_Device SHALL keep the Incident in Local_Cache for retry
10. THE Cloud_Platform SHALL maintain 99.9% uptime for all critical services (IoT_Core, Lambda, DynamoDB)

### Requirement 21: Model Management

**User Story:** As a data scientist, I want to update ML models on edge devices remotely, so that I can improve detection accuracy without physical access.

#### Acceptance Criteria

1. THE Cloud_Platform SHALL store ML model files in S3 with versioning enabled
2. WHEN a new model version is uploaded, THE Cloud_Platform SHALL publish a model update notification to MQTT_Topic "agrishield/commands/all/model-update"
3. WHEN the Edge_Device receives a model update notification, THE Edge_Device SHALL download the new model from S3
4. WHEN the Edge_Device downloads a model, THE Edge_Device SHALL verify the file checksum matches the expected value
5. WHEN checksum verification succeeds, THE Edge_Device SHALL replace the current model with the new version
6. WHEN the Edge_Device replaces the model, THE Edge_Device SHALL restart the Detection_System within 30 seconds
7. WHEN the Detection_System restarts, THE Edge_Device SHALL send a confirmation message with the new model version
8. WHEN checksum verification fails, THE Edge_Device SHALL log the error and continue using the current model
9. THE Edge_Device SHALL maintain a backup of the previous model version
10. WHEN the new model causes errors, THE Edge_Device SHALL automatically rollback to the previous version after 3 consecutive failures

### Requirement 22: Configuration Management

**User Story:** As an admin, I want to configure edge devices remotely, so that I can adjust detection parameters without visiting each device.

#### Acceptance Criteria

1. THE Ranger_Dashboard SHALL provide a configuration editor for device settings
2. WHEN an admin updates device configuration, THE Ranger_Dashboard SHALL validate all configuration values
3. WHEN validation succeeds, THE Ranger_Dashboard SHALL publish the configuration to MQTT_Topic "agrishield/commands/{device_id}/config"
4. WHEN the Edge_Device receives a configuration update, THE Edge_Device SHALL validate the configuration schema
5. WHEN schema validation succeeds, THE Edge_Device SHALL apply the new configuration within 10 seconds
6. WHEN the Edge_Device applies configuration, THE Edge_Device SHALL persist it to local storage
7. WHEN the Edge_Device applies configuration, THE Edge_Device SHALL send a confirmation message with the applied settings
8. WHEN schema validation fails, THE Edge_Device SHALL reject the configuration and send an error message
9. THE Edge_Device SHALL support configuring: confidence_threshold, frame_rate, monitoring_hours, deterrence_enabled, and sync_interval
10. WHEN configuration changes require service restart, THE Edge_Device SHALL restart affected services within 30 seconds

### Requirement 23: Incident Reporting

**User Story:** As a ranger, I want to generate reports on wildlife incidents, so that I can analyze trends and plan conservation strategies.

#### Acceptance Criteria

1. THE Ranger_Dashboard SHALL provide a reporting interface with date range selection
2. WHEN a user selects a date range, THE Ranger_Dashboard SHALL query Incidents from DynamoDB
3. WHEN the query completes, THE Ranger_Dashboard SHALL display summary statistics: total incidents, incidents by species, incidents by Threat_Level, and incidents by device
4. THE Ranger_Dashboard SHALL display a time-series chart showing incidents per day
5. THE Ranger_Dashboard SHALL display a bar chart showing incidents by species
6. THE Ranger_Dashboard SHALL display a pie chart showing distribution by Threat_Level
7. WHEN a user clicks "Export Report", THE Ranger_Dashboard SHALL generate a CSV file with all Incident data
8. THE CSV export SHALL include columns: timestamp, device_id, location, species, Confidence_Score, Threat_Level, image_url, audio_url
9. WHEN a user clicks "Export Map", THE Ranger_Dashboard SHALL generate a PDF with the incident map and summary statistics
10. THE Ranger_Dashboard SHALL support filtering reports by device_id, species, and Threat_Level

### Requirement 24: Battery Management

**User Story:** As a farmer using solar-powered devices, I want the system to manage power efficiently, so that devices operate continuously even during cloudy periods.

#### Acceptance Criteria

1. THE Edge_Device SHALL monitor battery level every 60 seconds
2. WHEN battery level falls below 30%, THE Edge_Device SHALL enter power-saving mode
3. WHILE in power-saving mode, THE Edge_Device SHALL reduce frame rate to 5 frames per second
4. WHILE in power-saving mode, THE Edge_Device SHALL increase sync interval to 30 minutes
5. WHEN battery level falls below 15%, THE Edge_Device SHALL enter critical power mode
6. WHILE in critical power mode, THE Edge_Device SHALL disable continuous monitoring and activate only on motion detection
7. WHILE in critical power mode, THE Edge_Device SHALL disable deterrence lights
8. WHEN battery level rises above 40%, THE Edge_Device SHALL exit power-saving mode and resume normal operation
9. WHEN the Edge_Device enters power-saving mode, THE Edge_Device SHALL send a telemetry message indicating the mode change
10. THE Edge_Device SHALL log battery level changes to local storage for diagnostics

### Requirement 25: Audio-Based Detection

**User Story:** As a conservationist, I want the system to use audio cues for detection, so that wildlife can be identified even in low-light conditions or when obscured by vegetation.

#### Acceptance Criteria

1. THE Edge_Device SHALL capture audio continuously at 16kHz sample rate
2. WHEN the Edge_Device captures audio, THE Edge_Device SHALL analyze it in 1-second windows
3. WHEN audio analysis detects animal vocalizations, THE Edge_Device SHALL classify the species
4. WHEN audio classification confidence exceeds 0.6, THE Edge_Device SHALL create an audio-based detection event
5. WHEN both visual and audio detections occur within 5 seconds, THE Edge_Device SHALL merge them into a single Incident with higher confidence
6. THE Edge_Device SHALL use a separate TensorFlow Lite model for audio classification
7. WHEN audio-based detection occurs without visual confirmation, THE Edge_Device SHALL assign Threat_Level one level lower than visual detection
8. THE Edge_Device SHALL record 5 seconds of audio before and after each detection event
9. WHEN audio recording fails, THE Edge_Device SHALL log the error and continue with visual detection only
10. WHERE audio detection is disabled in configuration, THE Edge_Device SHALL skip audio processing

### Requirement 26: Multi-Device Coordination

**User Story:** As a ranger managing multiple devices, I want devices to coordinate detections, so that I can track wildlife movement across the protected area.

#### Acceptance Criteria

1. WHEN an Edge_Device detects wildlife, THE Edge_Device SHALL publish the detection to MQTT_Topic "agrishield/detections/broadcast"
2. WHEN another Edge_Device receives a broadcast detection, THE Edge_Device SHALL check if the species and timestamp match recent local detections
3. WHEN a matching detection is found within 10 minutes and 1 kilometer, THE Edge_Device SHALL link the Incidents as a movement event
4. WHEN the Cloud_Platform receives linked Incidents, THE Cloud_Platform SHALL calculate the movement vector (direction and speed)
5. WHEN movement speed exceeds 5 km/h, THE Cloud_Platform SHALL classify the movement as "migrating"
6. WHEN movement speed is below 2 km/h, THE Cloud_Platform SHALL classify the movement as "foraging"
7. THE Ranger_Dashboard SHALL display movement vectors as arrows on the map
8. WHEN a user clicks a movement vector, THE Ranger_Dashboard SHALL display all linked Incidents in chronological order
9. THE Cloud_Platform SHALL store movement events in a separate DynamoDB table with partition key species and sort key timestamp
10. THE Ranger_Dashboard SHALL provide a "Movement Patterns" view showing common migration routes

### Requirement 27: Firmware Updates

**User Story:** As a system administrator, I want to update edge device firmware remotely, so that I can deploy bug fixes and new features without physical access.

#### Acceptance Criteria

1. THE Cloud_Platform SHALL store firmware images in S3 with versioning enabled
2. WHEN a new firmware version is uploaded, THE Cloud_Platform SHALL publish a firmware update notification to MQTT_Topic "agrishield/commands/all/firmware-update"
3. WHEN the Edge_Device receives a firmware update notification, THE Edge_Device SHALL download the firmware image from S3
4. WHEN the Edge_Device downloads firmware, THE Edge_Device SHALL verify the digital signature using a public key
5. WHEN signature verification succeeds, THE Edge_Device SHALL install the firmware update
6. WHEN the Edge_Device installs firmware, THE Edge_Device SHALL create a backup of the current firmware
7. WHEN firmware installation completes, THE Edge_Device SHALL reboot within 60 seconds
8. WHEN the Edge_Device reboots, THE Edge_Device SHALL verify successful boot within 120 seconds
9. WHEN boot verification fails, THE Edge_Device SHALL automatically rollback to the previous firmware version
10. WHEN the Edge_Device completes firmware update, THE Edge_Device SHALL send a confirmation message with the new firmware version

### Requirement 28: Data Privacy and Compliance

**User Story:** As a privacy officer, I want the system to comply with data protection regulations, so that user privacy is protected and legal requirements are met.

#### Acceptance Criteria

1. THE Cloud_Platform SHALL anonymize location data to 100-meter precision before sharing with third parties
2. WHEN a user requests data deletion, THE Cloud_Platform SHALL delete all associated Incidents and media within 30 days
3. THE Cloud_Platform SHALL maintain an audit log of all data access and modifications
4. WHEN an admin accesses Incident data, THE Cloud_Platform SHALL log the admin user_id, timestamp, and accessed resource
5. THE Cloud_Platform SHALL retain audit logs for 7 years
6. THE Ranger_Dashboard SHALL display a privacy notice on first login requiring user acknowledgment
7. WHEN a user acknowledges the privacy notice, THE Cloud_Platform SHALL record the acknowledgment with timestamp
8. THE Cloud_Platform SHALL not store personally identifiable information in Incident records
9. WHEN phone numbers are stored for SMS alerts, THE Cloud_Platform SHALL encrypt them using AWS KMS
10. THE Cloud_Platform SHALL provide a data export API for users to retrieve all their associated data in JSON format

### Requirement 29: Network Connectivity Management

**User Story:** As a farmer in an area with multiple connectivity options, I want the system to automatically select the best available network, so that data transmission is reliable and cost-effective.

#### Acceptance Criteria

1. THE Edge_Device SHALL support multiple connectivity modes: WiFi, GSM, and LoRa
2. WHEN the Edge_Device boots, THE Edge_Device SHALL attempt to connect in order: WiFi, GSM, LoRa
3. WHEN WiFi connection succeeds, THE Edge_Device SHALL use WiFi for all data transmission
4. WHEN WiFi connection fails, THE Edge_Device SHALL attempt GSM connection within 30 seconds
5. WHEN GSM connection succeeds, THE Edge_Device SHALL use GSM for all data transmission
6. WHEN both WiFi and GSM fail, THE Edge_Device SHALL use LoRa for Alert transmission only
7. WHILE using LoRa, THE Edge_Device SHALL cache all other data for later sync
8. THE Edge_Device SHALL monitor connection quality every 60 seconds
9. WHEN connection quality degrades below 50%, THE Edge_Device SHALL attempt to switch to an alternative network
10. WHEN the Edge_Device switches networks, THE Edge_Device SHALL send a telemetry message indicating the network change

### Requirement 30: System Diagnostics

**User Story:** As a system operator, I want comprehensive diagnostic tools, so that I can troubleshoot issues quickly and minimize downtime.

#### Acceptance Criteria

1. THE Edge_Device SHALL provide a diagnostic mode accessible via local SSH connection
2. WHEN diagnostic mode is activated, THE Edge_Device SHALL run a series of self-tests: camera, microphone, deterrence hardware, network connectivity, and ML model
3. WHEN each self-test completes, THE Edge_Device SHALL report pass/fail status with detailed error messages
4. THE Edge_Device SHALL log all diagnostic results to local storage with timestamp
5. THE Ranger_Dashboard SHALL provide a "Device Diagnostics" page showing the most recent diagnostic results for each device
6. WHEN an admin clicks "Run Diagnostics", THE Ranger_Dashboard SHALL send a diagnostic command to the selected Edge_Device
7. WHEN the Edge_Device receives a diagnostic command, THE Edge_Device SHALL execute diagnostics and publish results to MQTT_Topic "agrishield/diagnostics/{device_id}"
8. THE Cloud_Platform SHALL store diagnostic results in DynamoDB for historical analysis
9. WHEN diagnostic tests fail, THE Ranger_Dashboard SHALL display recommended troubleshooting steps
10. THE Edge_Device SHALL automatically run diagnostics on boot and after any system error
