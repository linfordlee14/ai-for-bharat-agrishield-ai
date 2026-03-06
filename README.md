# AgriShield AI - Wildlife Detection & Deterrence System

**AI-powered edge device system for protecting farms from wildlife intrusion using real-time detection, automated deterrence, and SMS alerts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![AWS CDK](https://img.shields.io/badge/AWS-CDK-orange.svg)](https://aws.amazon.com/cdk/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

AgriShield AI is a comprehensive wildlife detection and deterrence system designed to protect agricultural lands in India from wildlife intrusion. The system uses edge AI for real-time species detection, automated deterrence mechanisms, and cloud-based monitoring through a ranger dashboard.

### Key Components

1. **Edge Device** - Raspberry Pi-based detection system with camera, audio sensors, and deterrence hardware
2. **Cloud Backend** - AWS serverless infrastructure for data processing, storage, and alerts
3. **Frontend Dashboard** - React-based web application for rangers to monitor incidents and manage devices
4. **Documentation** - Comprehensive guides for setup, deployment, and usage

---

## 📁 Project Structure

```
agrishield-ai/
├── edge-device/          # Edge device Python code
│   ├── src/              # Detection engines (camera, audio)
│   ├── tests/            # Unit tests
│   ├── models/           # TensorFlow Lite models
│   ├── cache/            # Local incident cache
│   ├── certs/            # IoT certificates
│   ├── logs/             # Application logs
│   ├── sounds/           # Deterrence audio files
│   └── README.md         # Edge device documentation
│
├── frontend/             # React ranger dashboard
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Dashboard, Incidents, Devices, Settings
│   │   ├── services/     # API clients and authentication
│   │   ├── hooks/        # React hooks for data fetching
│   │   ├── utils/        # Utility functions
│   │   ├── mocks/        # Mock data for demo mode
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   └── README.md         # Frontend documentation
│
├── cloud/                # AWS CDK infrastructure
│   ├── lib/              # CDK stack definitions
│   │   ├── storage-stack.ts      # DynamoDB & S3
│   │   ├── lambda-stack.ts       # Lambda functions & API Gateway
│   │   ├── iot-stack.ts          # IoT Core configuration
│   │   └── frontend-stack.ts     # CloudFront & S3 hosting
│   ├── lambda/           # Lambda function code
│   │   ├── incident-processor/   # Process incoming incidents
│   │   ├── alert-router/         # Route SMS alerts
│   │   ├── telemetry-processor/  # Store device telemetry
│   │   ├── movement-tracker/     # Track animal movements
│   │   ├── sync-handler/         # Handle batch syncs
│   │   └── api/                  # Query endpoints
│   ├── scripts/          # Deployment and provisioning scripts
│   └── README.md         # Cloud infrastructure documentation
│
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md                   # System architecture
│   ├── IMPLEMENTATION.md                 # Implementation guide
│   ├── AWS_DEPLOYMENT_GUIDE_FOR_HOANG.md # AWS deployment steps
│   ├── DEMO_INSTRUCTIONS.md              # Demo guide
│   ├── QUICK_START.md                    # Quick start guide
│   ├── FEATURE_COMPLETION_REPORT.md      # Feature status
│   ├── diagrams/                         # Architecture diagrams
│   └── assets/                           # Images and icons
│
├── .kiro/                # Kiro IDE specification files
│   └── specs/            # Project specifications
│
├── .gitignore            # Git ignore rules
├── .env.example          # Environment variables template
└── README.md             # This file
```

---

## ✨ Features

### Edge Device
- ✅ Real-time wildlife detection using TensorFlow Lite
- ✅ Audio-based species classification
- ✅ Threat level assessment (HIGH, MEDIUM, LOW)
- ✅ Automated deterrence (lights, sounds)
- ✅ Offline-first architecture with local caching
- ✅ MQTT communication with AWS IoT Core
- ✅ Evidence capture (images + audio)

### Cloud Backend
- ✅ Serverless AWS infrastructure (Lambda, DynamoDB, S3)
- ✅ Real-time incident processing
- ✅ SMS alerts to nearby farmers (5km radius)
- ✅ Movement tracking across devices
- ✅ Device telemetry monitoring
- ✅ RESTful API with authentication
- ✅ Media storage with presigned URLs

### Frontend Dashboard
- ✅ Interactive map with incident markers (India location)
- ✅ Real-time incident monitoring
- ✅ Device status and configuration
- ✅ Incident filtering and export (CSV/JSON)
- ✅ User authentication (Cognito)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Demo mode with mock data

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **AWS CLI** v2 (for deployment)
- **AWS CDK** 2.x (for deployment)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/agrishield-ai.git
cd agrishield-ai
```

### 2. Run Frontend Demo (5 minutes)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and login with:
- **Email**: `ranger@agrishield.ai`
- **Password**: `ranger123`

### 3. Set Up Edge Device

```bash
cd edge-device
pip3 install -r requirements.txt
python3 src/detection_engine.py
```

See `edge-device/README.md` for detailed setup instructions.

### 4. Deploy to AWS

```bash
cd cloud
npm install
cdk bootstrap  # First time only
cdk deploy --all
```

See `docs/AWS_DEPLOYMENT_GUIDE_FOR_HOANG.md` for complete deployment instructions.

---

## 📚 Documentation

### Getting Started
- [Quick Start Guide](docs/QUICK_START.md) - Get up and running in 5 minutes
- [Demo Instructions](docs/DEMO_INSTRUCTIONS.md) - Run the demo locally
- [Setup Guide](docs/SETUP.md) - Detailed setup for all components

### Architecture & Design
- [System Architecture](docs/ARCHITECTURE.md) - High-level system design
- [Implementation Guide](docs/IMPLEMENTATION.md) - Technical implementation details
- [Frontend Design](docs/FRONTEND_DESIGN.md) - UI/UX specifications

### Deployment
- [AWS Deployment Guide](docs/AWS_DEPLOYMENT_GUIDE_FOR_HOANG.md) - Complete AWS deployment steps
- [Cloud Infrastructure](cloud/README.md) - CDK stack documentation
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - General deployment information

### Component Documentation
- [Edge Device](edge-device/README.md) - Edge device setup and configuration
- [Frontend](frontend/README.md) - Frontend development and build
- [Cloud Backend](cloud/README.md) - AWS infrastructure and Lambda functions

### Status & Reports
- [Feature Completion Report](docs/FEATURE_COMPLETION_REPORT.md) - Current feature status
- [Production Readiness](docs/PRODUCTION_READINESS.md) - Production checklist
- [Documentation Index](docs/DOCUMENTATION_INDEX.md) - Complete documentation index

---

## 🛠️ Technology Stack

### Edge Device
- **Python 3.9+** - Core application
- **TensorFlow Lite** - ML inference
- **OpenCV** - Image processing
- **PyAudio** - Audio capture
- **Paho MQTT** - IoT communication
- **Raspberry Pi 4** - Hardware platform

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Router** - Navigation
- **Leaflet** - Map visualization
- **Vite** - Build tool

### Cloud Backend
- **AWS CDK** - Infrastructure as Code
- **AWS Lambda** - Serverless compute
- **DynamoDB** - NoSQL database
- **S3** - Object storage
- **IoT Core** - Device communication
- **API Gateway** - REST API
- **Cognito** - Authentication
- **SNS** - SMS notifications
- **CloudFront** - CDN

---

## 🌍 Deployment Regions

The system is configured for deployment in India:
- **Map Center**: Karnataka region (20.5937°N, 78.9629°E)
- **Phone Numbers**: Indian format (+91)
- **Time Zone**: IST (UTC+5:30)
- **SMS Provider**: AWS SNS with India region

---

## 📊 System Status

| Component | Status | Notes |
|-----------|--------|-------|
| Edge Device | ✅ Complete | Detection engines fully implemented |
| Frontend | ✅ Complete | All pages functional, demo mode working |
| Cloud Infrastructure | ⚠️ Partial | CDK stacks defined, Lambda functions need implementation |
| Documentation | ✅ Complete | Comprehensive guides available |
| Testing | ✅ Complete | Unit tests for edge device |

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass before submitting PR

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Development Team** - Full-stack development
- **Hoang** - AWS deployment and DevOps
- **Project Lead** - Product management and coordination

---

## 📞 Support

For questions, issues, or support:
- **Documentation**: Check the `docs/` directory
- **Issues**: Open a GitHub issue
- **Email**: support@agrishield.ai

---

## 🎯 Roadmap

### Current Phase: Production Deployment
- [ ] Implement 12 Lambda functions
- [ ] Deploy to AWS production environment
- [ ] Connect real edge devices
- [ ] User acceptance testing

### Future Enhancements
- [ ] Mobile app for rangers
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with government wildlife databases
- [ ] Machine learning model improvements

---

## 🙏 Acknowledgments

- **AI for Bharat** - Project initiative
- **AWS** - Cloud infrastructure
- **TensorFlow** - ML framework
- **Open Source Community** - Various libraries and tools

---

**Built with ❤️ for protecting farms and wildlife in India**
