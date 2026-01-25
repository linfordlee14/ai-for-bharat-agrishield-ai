# AgriShield AI - Requirements Document

**Project Name:** AgriShield AI  
**Team Name:** CodeSavanna  
**Track:** AI for Rural Innovation & Sustainable Systems  
**Mission:** Solving human-wildlife conflict using offline Edge AI to protect farmers' crops while preserving endangered wildlife.

---

## 1. Problem Statement

Rural farmers in wildlife-adjacent regions face devastating crop losses from animals like elephants and wild boars. This leads to:
- **Financial ruin** for subsistence farmers who depend on their harvest
- **Retaliatory killing** of wildlife, including endangered species like rhinos and tigers
- **Escalating conflict** between conservation efforts and agricultural livelihoods

Current solutions like electric fences are:
- Prohibitively expensive for small-scale farmers
- Harmful or lethal to animals
- Difficult to maintain in remote areas without reliable power

AgriShield AI provides an affordable, humane, and offline-capable detection and deterrence system.

---

## 2. User Personas

### 2.1 Ravi - Smallholder Farmer
- **Age:** 45
- **Location:** Rural village bordering forest reserve
- **Tech Access:** Basic 2G feature phone, no smartphone
- **Needs:**
  - Simple SMS alerts when animals approach his fields
  - Solar-powered device (no grid electricity)
  - Affordable solution within his limited budget
  - Non-harmful deterrents that won't injure animals (avoiding legal issues)
- **Pain Points:**
  - Lost 40% of last year's crop to elephant raids
  - Cannot afford expensive fencing
  - Sleepless nights guarding fields manually

### 2.2 Sarah - Forest Ranger / Conservation Officer
- **Age:** 32
- **Location:** Regional wildlife management office
- **Tech Access:** Laptop, smartphone, office internet
- **Needs:**
  - Dashboard to monitor animal movement patterns
  - Historical data on incident hotspots
  - Heatmaps showing migration corridors
  - Reports for conservation planning
- **Pain Points:**
  - Reactive response to human-wildlife conflict
  - Lack of data on animal movement patterns
  - Difficulty coordinating with multiple farming communities

---

## 3. Functional Requirements

### 3.1 Detection System
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | System shall detect elephants via acoustic signatures (infrasound, trumpeting) | Must Have |
| FR-1.2 | System shall detect wild boars via visual recognition | Must Have |
| FR-1.3 | System shall detect rhinos via visual recognition (for tracking, not deterrence) | Must Have |
| FR-1.4 | Detection shall classify species with confidence score | Must Have |
| FR-1.5 | System shall support night-vision/IR camera input | Should Have |

### 3.2 Offline-First Operation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | All inference must run locally on edge device without internet | Must Have |
| FR-2.2 | Device shall queue events when offline and sync when connected | Must Have |
| FR-2.3 | Device shall operate for minimum 72 hours without connectivity | Should Have |

### 3.3 Alert System
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Alerts shall be delivered within 3 seconds of detection | Must Have |
| FR-3.2 | SMS alerts shall be sent via 2G network | Must Have |
| FR-3.3 | LoRaWAN alerts shall be supported for areas without cellular | Should Have |
| FR-3.4 | Alert message shall include: species, confidence, timestamp, device location | Must Have |

### 3.4 Deterrence System
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | System shall trigger strobe lights upon confirmed detection | Must Have |
| FR-4.2 | System shall emit species-specific deterrent sounds | Must Have |
| FR-4.3 | Deterrence methods shall be non-harmful to animals | Must Have |
| FR-4.4 | Deterrence intensity shall be configurable | Should Have |

### 3.5 Dashboard & Analytics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Web dashboard shall display real-time incident map | Must Have |
| FR-5.2 | Dashboard shall show historical heatmaps of animal activity | Must Have |
| FR-5.3 | Dashboard shall display device health status | Should Have |
| FR-5.4 | Dashboard shall generate exportable reports | Could Have |

---

## 4. Non-Functional Requirements

### 4.1 Performance
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1.1 | Detection accuracy | ≥ 95% |
| NFR-1.2 | False positive rate | ≤ 5% |
| NFR-1.3 | Alert latency (detection to notification) | < 3 seconds |
| NFR-1.4 | Inference time per frame | < 500ms |

### 4.2 Power & Environment
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-2.1 | Power source | Solar panel + battery |
| NFR-2.2 | Battery life (no sun) | ≥ 48 hours |
| NFR-2.3 | Operating temperature | -10°C to 50°C |
| NFR-2.4 | Weather resistance | IP65 rated enclosure |

### 4.3 Connectivity
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-3.1 | Minimum network | 2G GSM |
| NFR-3.2 | Alternative connectivity | LoRaWAN (optional) |
| NFR-3.3 | Cloud sync frequency | Every 15 minutes when online |

### 4.4 Scalability & Reliability
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-4.1 | System uptime | 99.5% |
| NFR-4.2 | Concurrent devices supported | 1,000+ |
| NFR-4.3 | Data retention | 2 years |

---

## 5. Tech Stack

### Edge Device
- **Hardware:** Raspberry Pi 4 / Raspberry Pi Zero 2 W
- **Camera:** Pi Camera Module with IR capability
- **Microphone:** USB microphone for acoustic detection
- **Language:** Python 3.9+
- **ML Framework:** TensorFlow Lite (optimized for edge)

### Cloud Infrastructure (AWS)
- **IoT Connectivity:** AWS IoT Core (MQTT)
- **Compute:** AWS Lambda (serverless processing)
- **Notifications:** AWS SNS (SMS delivery)
- **Database:** Amazon DynamoDB
- **Storage:** Amazon S3 (media/logs)

### Dashboard
- **Frontend:** React.js
- **Mapping:** Leaflet.js / Mapbox
- **Authentication:** AWS Cognito

### Communication
- **Primary:** 2G GSM (SMS via AWS SNS)
- **Secondary:** LoRaWAN gateway (optional)

---

## 6. Acceptance Criteria

### AC-1: Detection
- [ ] System correctly identifies elephants from audio with ≥95% accuracy
- [ ] System correctly identifies boars from video with ≥95% accuracy
- [ ] System runs inference entirely offline on Raspberry Pi

### AC-2: Alerts
- [ ] SMS alert received within 3 seconds of detection
- [ ] Alert contains species, confidence, timestamp, and location
- [ ] Alerts work on 2G network

### AC-3: Deterrence
- [ ] Lights and sounds activate upon confirmed detection
- [ ] No physical harm to animals from deterrence system

### AC-4: Dashboard
- [ ] Ranger can view real-time incident map
- [ ] Heatmap shows historical animal activity patterns
- [ ] Device status (battery, connectivity) visible

---

## 7. Out of Scope (v1.0)

- Drone-based monitoring
- Predictive analytics / ML-based migration forecasting
- Mobile app for farmers (SMS only for v1)
- Integration with government wildlife databases
