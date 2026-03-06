# Implementation Plan: AgriShield AI System

## Overview

This implementation plan breaks down the AgriShield AI system into discrete coding tasks across three major components: Edge Device (Python), Cloud Infrastructure (AWS CDK + Python Lambda), and Frontend Dashboard (React/TypeScript). The system implements a distributed wildlife detection and deterrence platform with offline-first operation, cloud synchronization, and real-time alerting.

The implementation follows an incremental approach where each task builds on previous work, with checkpoints to validate functionality. Property-based tests are included as optional sub-tasks to verify correctness properties from the design document.

## Tasks

- [x] 1. Set up project structure and development environment
  - Create repository structure with separate directories for edge, cloud, and frontend
  - Set up Python virtual environments for edge and cloud components
  - Initialize Node.js project for frontend with Vite and TypeScript
  - Create .gitignore files for each component
  - Set up pre-commit hooks for linting and formatting
  - Create README files with setup instructions for each component
  - _Requirements: All (foundational)_

- [ ] 2. Implement Edge Device core detection engine
  - [ ] 2.1 Create Detection Engine class with TensorFlow Lite integration
    - Implement frame capture from camera at configurable frame rate
    - Implement frame preprocessing (resize to 224x224, normalize)
    - Load TensorFlow Lite model and run inference
    - Parse model output to extract species classification and confidence score
    - Implement evidence capture (still image and 5-second audio clip)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 2.2 Write property tests for Detection Engine
    - **Property 1: Detection Output Domain Validity** - Verify species is always one of valid values
    - **Property 2: Confidence Score Range** - Verify confidence is always in [0.0, 1.0]
    - **Property 3: Valid Detection Threshold** - Verify detections above 0.7 trigger evidence capture
    - **Validates: Requirements 1.2, 1.3, 1.6, 1.7, 1.8**

  - [x] 2.3 Create Audio Detection Engine class
    - Implement continuous audio capture at 16kHz sample rate
    - Implement 1-second audio window analysis
    - Load audio TensorFlow Lite model and run inference
    - Classify animal vocalizations with confidence scoring
    - Implement detection merging for visual + audio within 5 seconds
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.8_

  - [ ]* 2.4 Write property test for multi-modal detection fusion
    - **Property 24: Multi-Modal Detection Fusion** - Verify merged confidence is higher than individual detections
    - **Validates: Requirements 25.5**

- [ ] 3. Implement threat assessment and deterrence system
  - [x] 3.1 Create Threat Assessor module
    - Implement threat level assignment based on species and confidence
    - Apply threat level reduction for confidence between 0.5-0.7
    - Handle all species: Elephant, Leopard, Boar, Deer, Human, Unknown
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 3.2 Write property test for threat assessment
    - **Property 4: Threat Assessment Correctness** - Verify threat levels match species-confidence mapping
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

  - [ ] 3.3 Create Deterrence Controller class
    - Implement GPIO control for deterrent lights
    - Implement audio playback for species-specific deterrent sounds
    - Enforce 500ms activation latency for HIGH/MEDIUM threats
    - Implement 30-second deterrence duration
    - Implement 60-second cooldown period between activations
    - Add configuration flag to enable/disable deterrence
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 3.4 Write property test for deterrence cooldown
    - **Property 5: Deterrence Cooldown Enforcement** - Verify activations blocked within 60 seconds
    - **Validates: Requirements 3.8**

- [ ] 4. Implement local cache and offline operation
  - [ ] 4.1 Create Local Cache Manager with SQLite
    - Create SQLite database schema for incidents table with indexes
    - Implement encrypted database using SQLCipher
    - Implement store_incident() method with FIFO eviction at 1000 incidents
    - Implement get_unsent_batch() to retrieve up to 50 unsent incidents
    - Implement mark_synced() to update sync status
    - Implement eviction policy prioritizing LOW threat incidents
    - _Requirements: 4.2, 4.3, 4.4, 16.8_

  - [ ]* 4.2 Write property tests for cache management
    - **Property 6: Offline Detection Continuity** - Verify detection continues when offline
    - **Property 7: Cache Eviction Policy** - Verify LOW threats evicted first at capacity
    - **Property 8: Sync Acknowledgment State Update** - Verify incidents marked synced after acknowledgment
    - **Validates: Requirements 4.1, 4.2, 4.4, 5.6**

  - [ ] 4.3 Implement configuration persistence
    - Create Configuration Manager to load/save YAML configuration
    - Implement configuration validation against schema
    - Persist configuration to local storage on updates
    - Load configuration within 10 seconds on boot
    - _Requirements: 4.7, 4.8, 22.5, 22.6_

  - [ ]* 4.4 Write property test for configuration recovery
    - **Property 19: Configuration Recovery After Reboot** - Verify config loads and incidents sync after reboot
    - **Validates: Requirements 20.1, 20.2, 20.3**

- [ ] 5. Checkpoint - Verify edge device core functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement connectivity and MQTT communication
  - [ ] 6.1 Create Connectivity Manager for multi-network support
    - Implement WiFi connection with quality monitoring
    - Implement GSM connection with SIM7600 module
    - Implement LoRa connection with RAK2245 module
    - Implement connection priority: WiFi → GSM → LoRa
    - Implement automatic network switching on quality degradation
    - Monitor connection quality every 60 seconds
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 29.10_

  - [ ]* 6.2 Write property tests for network management
    - **Property 29: Network Connection Priority** - Verify connection attempts in correct order
    - **Property 30: Network Quality-Based Switching** - Verify switching when quality < 50%
    - **Validates: Requirements 29.2, 29.9**

  - [ ] 6.3 Create MQTT Client with TLS support
    - Implement MQTT connection to AWS IoT Core with mutual TLS
    - Load X.509 certificates and private key with secure permissions
    - Implement publish_incident() to agrishield/incidents/{device_id}
    - Implement publish_alert() to agrishield/alerts/{device_id}
    - Implement publish_telemetry() to agrishield/telemetry/{device_id}
    - Subscribe to agrishield/commands/{device_id}/* for configuration updates
    - Implement connection retry with exponential backoff
    - Compress images to JPEG quality 85 before publishing
    - _Requirements: 5.3, 5.4, 5.9, 5.10, 9.1, 9.2, 9.9_

  - [ ]* 6.4 Write property test for sync retry logic
    - **Property 9: Sync Retry with Exponential Backoff** - Verify 3 retries with increasing delays
    - **Validates: Requirements 5.7**

- [ ] 7. Implement battery management and power modes
  - [ ] 7.1 Create Battery Manager class
    - Monitor battery level every 60 seconds
    - Implement power mode state machine (NORMAL, SAVING, CRITICAL)
    - Apply power-saving adjustments: reduce frame rate to 5 fps in SAVING mode
    - Increase sync interval to 30 minutes in SAVING mode
    - Disable continuous monitoring in CRITICAL mode (motion detection only)
    - Disable deterrence lights in CRITICAL mode
    - Exit power-saving mode when battery > 40%
    - Send telemetry on mode changes
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9, 24.10_

  - [ ]* 7.2 Write property test for power mode transitions
    - **Property 23: Power Mode State Machine** - Verify correct transitions based on battery thresholds
    - **Validates: Requirements 24.2, 24.5, 24.8**

- [ ] 8. Implement model and firmware management
  - [ ] 8.1 Create Model Manager for remote updates
    - Subscribe to model update notifications on agrishield/commands/all/model-update
    - Download new model from S3 using presigned URL
    - Verify model checksum (SHA256) matches expected value
    - Replace current model with new version on successful verification
    - Restart Detection System within 30 seconds
    - Send confirmation with new model version
    - Maintain backup of previous model version
    - Implement automatic rollback after 3 consecutive inference failures
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 21.10_

  - [ ]* 8.2 Write property tests for model management
    - **Property 20: Model Checksum Verification** - Verify checksum validation before installation
    - **Property 21: Model Rollback on Failure** - Verify rollback after 3 failures
    - **Validates: Requirements 21.4, 21.10**

  - [ ] 8.3 Create Firmware Updater for OTA updates
    - Subscribe to firmware update notifications on agrishield/commands/all/firmware-update
    - Download firmware image from S3
    - Verify digital signature using public key
    - Create backup of current firmware
    - Install firmware update
    - Reboot within 60 seconds after installation
    - Verify successful boot within 120 seconds
    - Implement automatic rollback on boot failure
    - Send confirmation with new firmware version
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 27.10_

  - [ ]* 8.4 Write property tests for firmware management
    - **Property 26: Firmware Signature Verification** - Verify signature validation before installation
    - **Property 27: Firmware Rollback on Boot Failure** - Verify rollback within 120 seconds
    - **Validates: Requirements 27.4, 27.9**

- [ ] 9. Implement telemetry and diagnostics
  - [ ] 9.1 Create telemetry collection module
    - Collect CPU temperature, disk usage, battery level, uptime every 5 minutes
    - Publish telemetry to agrishield/telemetry/{device_id}
    - Include network type and connection quality in telemetry
    - Log connectivity warnings after 24 hours offline
    - _Requirements: 15.1, 15.2, 4.9_

  - [ ] 9.2 Create diagnostic system
    - Implement self-tests for camera, microphone, deterrence hardware, network, ML model
    - Run diagnostics on boot and after system errors
    - Provide diagnostic mode accessible via SSH
    - Report pass/fail status with detailed error messages
    - Log diagnostic results to local storage
    - Publish diagnostic results to agrishield/diagnostics/{device_id}
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.7, 30.10_

  - [ ]* 9.3 Write property test for diagnostic completeness
    - **Property 31: Diagnostic Test Completeness** - Verify all required tests execute and report status
    - **Validates: Requirements 30.2, 30.3**

- [ ] 10. Implement edge device main orchestration loop
  - [ ] 10.1 Create main application loop
    - Initialize all components (detection, deterrence, cache, connectivity, MQTT)
    - Start continuous detection thread
    - Start periodic sync thread (every 15 minutes)
    - Start periodic telemetry thread (every 5 minutes)
    - Handle graceful shutdown on SIGTERM/SIGINT
    - Implement error recovery and component restart logic
    - _Requirements: 1.9, 5.1, 15.1_

  - [ ] 10.2 Implement incident processing pipeline
    - Capture detection from Detection Engine
    - Assess threat level using Threat Assessor
    - Trigger deterrence for HIGH/MEDIUM threats
    - Store incident in Local Cache
    - Publish incident via MQTT if connected
    - Publish alert for HIGH threats
    - _Requirements: 1.1-1.10, 2.1-2.7, 3.1-3.10, 4.1-4.2, 5.3, 6.1-6.2_

  - [ ] 10.3 Implement remote configuration handler
    - Subscribe to configuration updates on agrishield/commands/{device_id}/config
    - Validate configuration schema on receipt
    - Apply valid configuration within 10 seconds
    - Persist configuration to local storage
    - Send confirmation with applied settings
    - Send error message for invalid configuration
    - Restart affected services if needed (within 30 seconds)
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 22.10_

  - [ ]* 10.4 Write property test for configuration validation
    - **Property 22: Configuration Schema Validation** - Verify invalid configs rejected with error
    - **Validates: Requirements 22.4, 22.8**

- [ ] 11. Checkpoint - Verify complete edge device implementation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Set up AWS cloud infrastructure with CDK
  - [x] 12.1 Create CDK project structure
    - Initialize AWS CDK project in TypeScript
    - Create separate stacks for IoT, Lambda, Storage, and Frontend
    - Configure stack dependencies and deployment order
    - Set up environment-specific configuration (dev, staging, prod)
    - _Requirements: All cloud requirements (foundational)_

  - [ ] 12.2 Create IoT Core infrastructure stack
    - Define IoT Thing Type for edge devices
    - Create IoT Policy with topic restrictions (publish to incidents/telemetry, subscribe to commands)
    - Set up certificate-based authentication
    - Create IoT Rules for routing messages to Lambda functions
    - Configure CloudWatch logging for IoT Core
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 17.9_

  - [ ]* 12.3 Write property test for IoT topic access control
    - **Property 13: IoT Topic Access Control** - Verify devices can only access their own topics
    - **Validates: Requirements 9.5, 9.6, 17.9**

  - [ ] 12.4 Create DynamoDB tables stack
    - Create Incidents table with device_id partition key and timestamp sort key
    - Create species-timestamp GSI for querying by species
    - Create Devices table with device_id partition key
    - Create Telemetry table with device_id partition key, timestamp sort key, and 90-day TTL
    - Create Movement Events table with species partition key and timestamp sort key
    - Enable point-in-time recovery on all tables
    - Enable encryption at rest with AWS-managed keys
    - Configure on-demand capacity mode for auto-scaling
    - _Requirements: 7.1, 7.2, 7.3, 7.8, 7.9, 15.4, 16.1, 19.1, 19.3, 19.4, 20.6, 26.9_

  - [ ] 12.5 Create S3 buckets stack
    - Create media bucket with versioning and SSE-S3 encryption
    - Create models bucket with versioning and SSE-S3 encryption
    - Create firmware bucket with versioning and SSE-S3 encryption
    - Configure lifecycle policies: transition to Glacier after 180 days, delete after 730 days
    - Set up CORS for frontend access
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.10, 16.2, 20.7, 21.1, 27.1_

  - [ ] 12.6 Create SNS topics stack
    - Create alerts SNS topic for SMS delivery
    - Create monitoring SNS topic for system warnings
    - Configure SMS delivery settings
    - Set up subscriptions for admin phone numbers
    - _Requirements: 6.4, 6.10, 15.5, 15.6, 15.7, 15.9_

  - [ ] 12.7 Create Cognito User Pool stack
    - Create User Pool with email/password authentication
    - Configure password policy (min 8 chars, uppercase, lowercase, number, special char)
    - Create user groups for "ranger" and "admin" roles
    - Configure JWT token expiration (1 hour)
    - Create User Pool Client for frontend
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.10_

- [ ] 13. Implement Lambda functions for event processing
  - [ ] 13.1 Create Incident Processor Lambda
    - Parse and validate incoming MQTT message JSON
    - Enrich incident with server-side timestamp and message_id
    - Store incident in DynamoDB Incidents table
    - Upload image to S3 with key pattern incidents/{device_id}/{timestamp}/image.jpg
    - Upload audio to S3 with key pattern incidents/{device_id}/{timestamp}/audio.wav
    - Generate presigned URLs for media with 1-hour expiration
    - Invoke Alert Router Lambda for HIGH threat incidents
    - Publish acknowledgment to agrishield/acks/{device_id}
    - Implement error handling with CloudWatch logging
    - Complete processing within 3 seconds (P99)
    - _Requirements: 7.1, 7.3, 7.5, 7.7, 7.9, 8.1, 8.2, 8.6, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10_

  - [ ]* 13.2 Write property tests for Incident Processor
    - **Property 11: Incident Storage Completeness** - Verify all required fields present in DynamoDB
    - **Property 12: Media Storage Key Convention** - Verify S3 keys follow correct pattern
    - **Property 17: Invalid JSON Error Handling** - Verify invalid JSON logged and rejected
    - **Property 18: Incident Enrichment** - Verify server timestamp and message_id added
    - **Validates: Requirements 7.3, 8.1, 8.2, 13.3, 13.4**

  - [ ] 13.3 Create Alert Router Lambda
    - Receive HIGH threat incidents from Incident Processor
    - Retrieve device location from Devices table
    - Query for phone numbers within 5km radius using geospatial calculation
    - Format SMS message with species, location name, and timestamp
    - Check deduplication: skip if alert sent for same device within 5 minutes
    - Publish SMS to alerts SNS topic
    - Log SMS delivery confirmation
    - Retry once after 30 seconds on delivery failure
    - Send notification to admin on retry failure
    - Complete processing within 2 seconds
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.9, 6.10, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10_

  - [ ]* 13.4 Write property test for alert deduplication
    - **Property 10: Alert Deduplication Window** - Verify alerts suppressed within 5-minute window
    - **Validates: Requirements 6.6, 14.9**

  - [ ] 13.5 Create Telemetry Processor Lambda
    - Parse telemetry message from MQTT
    - Store telemetry in DynamoDB Telemetry table
    - Check CPU temperature threshold (> 80°C) and publish warning
    - Check battery level threshold (< 20%) and publish warning
    - Check disk usage threshold (> 90%) and publish warning
    - Calculate device uptime percentage over last 24 hours
    - Check uptime threshold (< 95%) and publish warning
    - Update device last_seen timestamp in Devices table
    - _Requirements: 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10_

  - [ ] 13.6 Create Sync Handler Lambda
    - Receive batch of incidents from edge device
    - Process multiple incidents using DynamoDB BatchWriteItem
    - Upload all media files to S3
    - Return batch acknowledgment with list of successfully synced incident IDs
    - Handle partial failures gracefully
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ] 13.7 Create Configuration Manager Lambda
    - Receive configuration update request from API Gateway
    - Validate configuration schema
    - Store configuration in Devices table for audit trail
    - Publish configuration to agrishield/commands/{device_id}/config
    - Return success/failure response
    - _Requirements: 22.1, 22.2, 22.3, 22.6_

  - [ ] 13.8 Create Model Manager Lambda
    - Handle ML model upload to S3
    - Calculate and store model checksum (SHA256)
    - Publish model update notification to agrishield/commands/all/model-update
    - Track model versions in DynamoDB
    - Generate presigned URLs for model downloads
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.7_

  - [ ] 13.9 Create Movement Tracking Lambda
    - Subscribe to detection broadcast messages
    - Correlate detections of same species within 10 minutes and 1km
    - Calculate movement vector (direction and speed)
    - Classify movement type: migrating (> 5 km/h) or foraging (< 2 km/h)
    - Store movement event in Movement Events table
    - Link related incident IDs
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.9_

  - [ ]* 13.10 Write property test for movement correlation
    - **Property 25: Movement Event Correlation** - Verify detections linked within 10 min and 1km
    - **Validates: Requirements 26.3, 26.4**

- [ ] 14. Implement Lambda error handling and retry logic
  - [ ] 14.1 Add error handling to all Lambda functions
    - Implement try-catch blocks with CloudWatch logging
    - Configure automatic retry (up to 2 times) for Lambda invocations
    - Set up Dead Letter Queue (DLQ) for failed events
    - Implement exponential backoff for DynamoDB writes
    - Return failure acknowledgment to device on persistent errors
    - _Requirements: 13.9, 20.4, 20.5, 20.8, 20.9_

  - [ ] 14.2 Configure CloudWatch alarms
    - Create alarm for Lambda error rate > 1%
    - Create alarm for SMS delivery rate < 95%
    - Create alarm for device offline > 30 minutes
    - Create alarm for DynamoDB throttling
    - Create alarm for S3 storage > 80% capacity
    - Configure SNS notifications to admin for all alarms
    - _Requirements: 18.6, 18.7, 18.8, 8.7_

- [ ] 15. Checkpoint - Verify cloud infrastructure and Lambda functions
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Set up API Gateway for frontend communication
  - [ ] 16.1 Create REST API with Cognito authorizer
    - Define API Gateway REST API
    - Configure Cognito User Pool authorizer
    - Create resources and methods for incidents, devices, telemetry, configuration
    - Enable CORS for frontend domain
    - Configure request/response validation
    - _Requirements: 10.5, 10.6, 17.5, 17.6_

  - [ ] 16.2 Implement API endpoints
    - GET /incidents - Query incidents with filters (device_id, date range, species, threat_level)
    - GET /incidents/{id} - Get single incident with presigned media URLs
    - GET /devices - List all devices with status
    - GET /devices/{id} - Get device details and telemetry
    - PUT /devices/{id}/config - Update device configuration (admin only)
    - GET /telemetry/{device_id} - Get device telemetry history
    - POST /diagnostics/{device_id} - Trigger device diagnostics (admin only)
    - GET /movements - Query movement events
    - GET /export/incidents - Export incidents to CSV
    - _Requirements: 7.10, 11.1-11.10, 12.1-12.10, 23.1-23.10, 26.7, 26.8, 26.10, 30.5, 30.6_

  - [ ] 16.3 Implement role-based access control
    - Extract user role from JWT token claims
    - Enforce ranger role restrictions (read-only access)
    - Enforce admin role permissions (full access)
    - Return 403 Forbidden for unauthorized requests
    - _Requirements: 10.7, 10.8, 12.5, 17.7, 17.8_

  - [ ]* 16.4 Write property test for role-based access
    - **Property 14: Role-Based Access Control** - Verify rangers denied, admins allowed for config updates
    - **Validates: Requirements 10.7, 10.8**

- [ ] 17. Implement data privacy and compliance features
  - [ ] 17.1 Create audit logging system
    - Log all data access with user_id, timestamp, and resource
    - Log all data modifications with before/after values
    - Store audit logs in separate DynamoDB table with 7-year retention
    - _Requirements: 28.3, 28.4, 28.5_

  - [ ] 17.2 Implement data deletion API
    - Create endpoint for user data deletion requests
    - Delete all incidents and media for specified user/device
    - Complete deletion within 30 days
    - Log deletion in audit trail
    - _Requirements: 28.2_

  - [ ] 17.3 Implement location anonymization
    - Create function to round coordinates to 100m precision (3 decimal places)
    - Apply anonymization when sharing data with third parties
    - _Requirements: 28.1_

  - [ ]* 17.4 Write property test for location anonymization
    - **Property 28: Location Anonymization** - Verify coordinates rounded to 3 decimal places
    - **Validates: Requirements 28.1**

  - [ ] 17.5 Implement phone number encryption
    - Encrypt phone numbers using AWS KMS before storing
    - Decrypt phone numbers when sending SMS alerts
    - _Requirements: 28.9_

  - [ ] 17.6 Create data export API
    - Implement endpoint to export all user data in JSON format
    - Include incidents, device data, and telemetry
    - _Requirements: 28.10_

- [ ] 18. Implement monitoring and observability
  - [ ] 18.1 Create CloudWatch metrics
    - Incident processing rate (events/minute)
    - Detection latency (milliseconds)
    - SMS delivery success rate (percentage)
    - Lambda error rate (percentage)
    - Device online count (number)
    - Cache size per device (number of incidents)
    - _Requirements: 18.3, 18.4, 18.5_

  - [ ] 18.2 Create CloudWatch dashboard
    - Display real-time incident map
    - Display active device count
    - Display incidents per hour time series chart
    - Display alert delivery rate gauge
    - Display Lambda performance (P50, P99 latency)
    - _Requirements: 18.9_

  - [ ] 18.3 Configure edge device log upload
    - Upload local log files to CloudWatch Logs on sync
    - Implement log rotation after 100MB
    - _Requirements: 18.10_

- [ ] 19. Checkpoint - Verify cloud backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Initialize React frontend project
  - [x] 20.1 Set up React project with Vite and TypeScript
    - Initialize Vite project with React and TypeScript template
    - Install dependencies: React Query, Axios, Leaflet, Tailwind CSS
    - Configure Tailwind CSS
    - Set up ESLint and Prettier
    - Create folder structure: components, pages, hooks, services, types
    - _Requirements: All frontend requirements (foundational)_

  - [ ] 20.2 Create API client service
    - Implement Axios client with base URL configuration
    - Add request interceptor to include JWT token in Authorization header
    - Add response interceptor to handle 401 errors (redirect to login)
    - Implement retry logic with exponential backoff
    - Create typed API methods for all endpoints
    - _Requirements: 10.5, 10.6_

  - [ ] 20.3 Create TypeScript types
    - Define Incident, Device, Telemetry, MovementEvent interfaces
    - Define API request/response types
    - Define User and AuthContext types
    - _Requirements: All frontend requirements_

- [ ] 21. Implement authentication module
  - [x] 21.1 Create Cognito authentication service
    - Implement login function with Cognito User Pool
    - Implement logout function with token invalidation
    - Store JWT token in session storage
    - Implement token refresh before expiration
    - Extract user role from JWT claims
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6, 10.9_

  - [x] 21.2 Create authentication components
    - Create Login page with email/password form
    - Create ProtectedRoute component to guard authenticated routes
    - Create RoleGuard component to enforce role-based access
    - Display user info and logout button in header
    - _Requirements: 10.1, 10.7, 10.8, 10.9_

  - [ ] 21.3 Implement privacy notice
    - Display privacy notice modal on first login
    - Require user acknowledgment before proceeding
    - Store acknowledgment timestamp via API
    - _Requirements: 28.6, 28.7_

- [ ] 22. Implement map visualization module
  - [x] 22.1 Create incident map component
    - Initialize Leaflet map with default center location
    - Fetch incidents from API using React Query
    - Render markers at incident coordinates
    - Color-code markers by threat level (red=HIGH, orange=MEDIUM, yellow=LOW)
    - Implement marker clustering for dense areas
    - Display popup on marker click with species, timestamp, threat level, device_id
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 22.2 Write property test for marker color mapping
    - **Property 15: Threat Level Marker Color Mapping** - Verify correct colors for each threat level
    - **Validates: Requirements 11.5**

  - [ ] 22.3 Add heatmap layer
    - Implement heatmap overlay showing incident density
    - Toggle heatmap visibility
    - _Requirements: 11.7_

  - [ ] 22.4 Implement map filters
    - Add date range picker for time filtering
    - Add species dropdown filter
    - Add threat level filter
    - Update map markers when filters change
    - _Requirements: 11.8, 11.9_

  - [ ] 22.5 Create incident detail modal
    - Display full incident details on popup click
    - Show full-resolution image with presigned URL
    - Embed audio player for audio clip
    - _Requirements: 11.10_

  - [ ] 22.6 Add movement vectors to map
    - Fetch movement events from API
    - Render arrows showing movement direction and speed
    - Display linked incidents on vector click
    - _Requirements: 26.7, 26.8_

- [ ] 23. Implement device management module
  - [ ] 23.1 Create device list component
    - Fetch devices from API using React Query
    - Display table with device_id, location, status, last_seen, firmware version
    - Calculate and display device status (Online/Offline)
    - Implement search and sorting
    - _Requirements: 12.1, 12.2_

  - [ ]* 23.2 Write property test for device status calculation
    - **Property 16: Device Status Determination** - Verify Online if telemetry < 5 min, Offline if > 30 min
    - **Validates: Requirements 12.3, 12.4**

  - [ ] 23.3 Create device detail page
    - Display device information and current status
    - Show telemetry charts (CPU temp, battery, disk usage over time)
    - Display warning indicators for high CPU temp (> 80°C)
    - Show recent incidents for the device
    - _Requirements: 12.2, 12.9, 12.10_

  - [ ] 23.4 Create device configuration editor (admin only)
    - Display current configuration in editable form
    - Validate configuration values client-side
    - Send configuration update via API
    - Display confirmation message on success
    - Show error message on validation failure
    - Disable for ranger role users
    - _Requirements: 12.5, 12.6, 12.7, 12.8, 22.1, 22.2_

  - [ ] 23.5 Create device diagnostics page (admin only)
    - Display most recent diagnostic results
    - Show pass/fail status for each test
    - Display recommended troubleshooting steps for failures
    - Add "Run Diagnostics" button to trigger remote diagnostics
    - _Requirements: 30.5, 30.6, 30.9_

- [ ] 24. Implement incident reporting module
  - [ ] 24.1 Create reporting dashboard
    - Add date range selector
    - Add device, species, and threat level filters
    - Fetch filtered incidents from API
    - _Requirements: 23.1, 23.2, 23.10_

  - [ ] 24.2 Create summary statistics component
    - Calculate and display total incidents
    - Calculate incidents by species
    - Calculate incidents by threat level
    - Calculate incidents by device
    - _Requirements: 23.3_

  - [ ] 24.3 Create incident charts
    - Implement time-series chart showing incidents per day
    - Implement bar chart showing incidents by species
    - Implement pie chart showing distribution by threat level
    - Use Chart.js or Recharts library
    - _Requirements: 23.4, 23.5, 23.6_

  - [ ] 24.4 Implement CSV export
    - Create export function to convert incidents to CSV format
    - Include columns: timestamp, device_id, location, species, confidence, threat_level, image_url, audio_url
    - Trigger browser download on "Export Report" button click
    - _Requirements: 23.7, 23.8_

  - [ ] 24.5 Implement PDF export with map
    - Generate PDF with incident map screenshot
    - Include summary statistics in PDF
    - Use jsPDF or similar library
    - Trigger download on "Export Map" button click
    - _Requirements: 23.9_

  - [ ] 24.6 Create movement patterns view
    - Display common migration routes on map
    - Show movement statistics by species
    - Filter movements by date range
    - _Requirements: 26.10_

- [ ] 25. Implement frontend error handling and UX polish
  - [ ] 25.1 Add error boundaries
    - Create error boundary component to catch React errors
    - Display user-friendly error message
    - Log errors to console for debugging
    - _Requirements: General UX_

  - [ ] 25.2 Add loading states
    - Show loading spinners during API requests
    - Implement skeleton screens for data tables and maps
    - _Requirements: General UX_

  - [ ] 25.3 Add toast notifications
    - Implement toast notification system for success/error messages
    - Show notifications for configuration updates, exports, errors
    - _Requirements: General UX_

  - [ ] 25.4 Implement responsive design
    - Ensure all components work on mobile, tablet, and desktop
    - Test map interactions on touch devices
    - _Requirements: General UX_

- [ ] 26. Checkpoint - Verify complete frontend implementation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 27. Integration testing and end-to-end validation
  - [ ] 27.1 Set up integration test environment
    - Deploy test AWS infrastructure in separate account
    - Set up test Raspberry Pi with camera and microphone
    - Configure test Cognito users (ranger and admin)
    - _Requirements: All_

  - [ ] 27.2 Test detection to alert flow
    - Trigger wildlife detection on edge device
    - Verify incident stored in DynamoDB
    - Verify media uploaded to S3
    - Verify SMS alert sent for HIGH threat
    - Verify incident appears in dashboard
    - _Requirements: 1.1-1.10, 2.1-2.7, 3.1-3.10, 6.1-6.10, 7.1-7.10, 11.1-11.10, 13.1-13.10, 14.1-14.10_

  - [ ] 27.3 Test offline sync flow
    - Disconnect edge device from network
    - Generate multiple incidents
    - Verify incidents stored in local cache
    - Reconnect network
    - Verify incidents synced to cloud
    - Verify incidents marked as synced in cache
    - _Requirements: 4.1-4.9, 5.1-5.10_

  - [ ] 27.4 Test configuration update flow
    - Update device configuration in dashboard
    - Verify configuration published to MQTT
    - Verify edge device receives and applies configuration
    - Verify confirmation message received
    - Verify configuration persisted on device
    - _Requirements: 22.1-22.10_

  - [ ] 27.5 Test firmware update flow
    - Upload new firmware to S3
    - Publish firmware update notification
    - Verify edge device downloads firmware
    - Verify signature verification
    - Verify firmware installation and reboot
    - Verify confirmation with new version
    - _Requirements: 27.1-27.10_

  - [ ] 27.6 Test model update flow
    - Upload new ML model to S3
    - Publish model update notification
    - Verify edge device downloads model
    - Verify checksum verification
    - Verify model replacement and detection restart
    - Verify confirmation with new version
    - _Requirements: 21.1-21.10_

  - [ ] 27.7 Test multi-device coordination
    - Trigger detections on multiple devices within 10 minutes and 1km
    - Verify movement event created
    - Verify movement vector calculated
    - Verify movement displayed on dashboard
    - _Requirements: 26.1-26.10_

  - [ ] 27.8 Test battery management
    - Simulate battery level changes on edge device
    - Verify power mode transitions (NORMAL → SAVING → CRITICAL)
    - Verify frame rate and sync interval adjustments
    - Verify telemetry messages sent on mode changes
    - _Requirements: 24.1-24.10_

  - [ ] 27.9 Test role-based access control
    - Log in as ranger user
    - Verify read-only access to incidents and devices
    - Verify configuration editor disabled
    - Log in as admin user
    - Verify full access to all features
    - _Requirements: 10.7, 10.8, 12.5, 17.7, 17.8_

  - [ ] 27.10 Test data privacy features
    - Request data deletion via API
    - Verify incidents and media deleted
    - Verify audit log entry created
    - Test location anonymization for third-party sharing
    - Test data export API
    - _Requirements: 28.1-28.10_

- [ ] 28. Performance testing and optimization
  - [ ] 28.1 Test edge device performance
    - Measure detection latency (target: < 100ms P99)
    - Measure deterrence activation time (target: < 500ms)
    - Measure configuration load time (target: < 10s)
    - Measure sync throughput (target: 50 incidents per batch)
    - _Requirements: 1.1, 3.1, 4.8, 5.2_

  - [ ] 28.2 Test cloud performance
    - Measure Lambda processing latency (target: < 3s P99)
    - Measure DynamoDB write latency (target: < 1s)
    - Measure SMS delivery time (target: < 2s)
    - Measure API response time (target: < 500ms)
    - _Requirements: 7.1, 13.10, 6.3_

  - [ ] 28.3 Conduct load testing
    - Simulate 500 devices with 10 events/day each
    - Simulate 3x peak load (dawn/dusk activity)
    - Verify no throttling or errors under load
    - Verify auto-scaling works correctly
    - _Requirements: 19.7, 19.8, 19.9, 19.10_

  - [ ] 28.4 Optimize performance bottlenecks
    - Profile and optimize slow Lambda functions
    - Add DynamoDB indexes for common queries
    - Implement caching where appropriate
    - Optimize frontend bundle size
    - _Requirements: 19.1-19.10_

- [ ] 29. Security testing and hardening
  - [ ] 29.1 Conduct penetration testing
    - Attempt to publish to unauthorized MQTT topics
    - Attempt to access incidents without authentication
    - Attempt SQL injection in dashboard filters
    - Attempt to upload malicious firmware
    - Verify all attacks blocked
    - _Requirements: 9.5, 9.6, 10.1-10.10, 17.1-17.10_

  - [ ] 29.2 Scan for vulnerabilities
    - Scan edge device for open ports and unnecessary services
    - Scan Lambda dependencies for known CVEs
    - Scan frontend dependencies for vulnerabilities
    - Update dependencies to patch vulnerabilities
    - _Requirements: 16.1-16.10, 17.1-17.10_

  - [ ] 29.3 Verify encryption compliance
    - Verify DynamoDB encryption at rest enabled
    - Verify S3 encryption at rest enabled
    - Verify SQLite encryption with SQLCipher
    - Verify TLS 1.2+ for all network connections
    - Verify access logs capture all data access
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.8, 28.3_

- [ ] 30. Documentation and deployment preparation
  - [ ] 30.1 Write deployment documentation
    - Document AWS infrastructure deployment steps
    - Document edge device setup and provisioning
    - Document certificate generation and installation
    - Document environment configuration
    - _Requirements: All_

  - [ ] 30.2 Write operational runbooks
    - Create runbook for device provisioning
    - Create runbook for firmware updates
    - Create runbook for model updates
    - Create runbook for incident investigation
    - Create runbook for troubleshooting common issues
    - _Requirements: All_

  - [ ] 30.3 Create user documentation
    - Write user guide for ranger dashboard
    - Write admin guide for device management
    - Create video tutorials for common tasks
    - Document API endpoints for third-party integration
    - _Requirements: All_

  - [ ] 30.4 Set up CI/CD pipelines
    - Create GitHub Actions workflow for edge device code
    - Create GitHub Actions workflow for Lambda functions
    - Create GitHub Actions workflow for frontend
    - Implement automated testing in CI pipeline
    - Implement automated deployment to staging environment
    - _Requirements: All_

  - [ ] 30.5 Prepare production deployment
    - Create production AWS account and infrastructure
    - Generate production certificates for devices
    - Configure production Cognito User Pool
    - Set up production monitoring and alerting
    - Create production backup and disaster recovery plan
    - _Requirements: All_

- [ ] 31. Final checkpoint - System ready for deployment
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability back to the requirements document
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties from the design document
- Unit tests (not explicitly listed) should be written alongside implementation for specific examples and edge cases
- The implementation follows an incremental approach: Edge Device → Cloud Infrastructure → Frontend → Integration → Testing
- All code should include error handling, logging, and monitoring as specified in the design document
- Security best practices (encryption, authentication, authorization) must be implemented throughout
