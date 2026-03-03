<p align="center">
  <img src="assets/diagrams/feature-icons-slide4.svg" alt="AgriShield AI" width="120" />
</p>

<h1 align="center">AgriShield AI 🌾🦏</h1>

<p align="center">
  <strong>An offline-first AI scarecrow protecting crops and wildlife</strong>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-documentation">Docs</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/platform-edge%20%7C%20cloud-lightgrey.svg" alt="Platform" />
</p>

---

## 🎯 The Problem

Rural farmers in India, Africa, and other regions lose **up to 70% of crops** to wildlife intrusion—elephants, boars, deer, and more. The consequences:

| Impact | Result |
|--------|--------|
| 💸 Financial loss | Families pushed into poverty |
| 🦏 Retaliatory killing | Endangered species at risk |
| ⚡ Dangerous fences | Harm to animals and humans |
| 👁️ Manual patrolling | Unsustainable and ineffective |

**AgriShield AI offers a humane, affordable, and scalable alternative.**

---

## 💡 The Solution

Solar-powered edge devices deployed at farm boundaries that:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   🎥 DETECT     │ ──▶ │   🔊 DETER      │ ──▶ │   📱 ALERT      │
│  Camera + Audio │     │  Light + Sound  │     │  SMS + LoRa     │
│  Edge ML Model  │     │  Non-lethal     │     │  Farmers/Rangers│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **Detect** – On-device ML identifies species and threat level in real-time
2. **Deter** – Automated light/sound patterns safely repel wildlife
3. **Alert** – Low-bandwidth SMS notifications to farmers and rangers
4. **Log** – Cloud sync for analytics, heatmaps, and long-term insights

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Multi-Modal Detection** | Camera + audio sensors identify animal species with high accuracy |
| ⚡ **Sub-Second Response** | Edge inference triggers deterrence in <1 second |
| 🔊 **Humane Deterrence** | Species-specific light and sound patterns—no harm to wildlife |
| 📊 **Ranger Dashboard** | Real-time heatmaps, incident logs, and device monitoring |
| 📴 **Offline-First** | Works without internet; syncs when connectivity is available |
| ☀️ **Solar Powered** | Sustainable operation in remote areas |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Camera     │  │  Microphone │  │  GSM/LoRa   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         ▼                ▼                ▼                      │
│  ┌─────────────────────────────────────────────────┐            │
│  │     Raspberry Pi / SBC + TensorFlow Lite        │            │
│  │     On-device inference + deterrence control    │            │
│  └─────────────────────────┬───────────────────────┘            │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                         CLOUD LAYER (AWS)                        │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  IoT Core   │  │   Lambda    │  │    SNS      │              │
│  │  Messaging  │  │  Processing │  │   Alerts    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         ▼                ▼                ▼                      │
│  ┌─────────────────────────────────────────────────┐            │
│  │     DynamoDB + S3 (Storage) │ Bedrock (Analytics)│           │
│  └─────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│  ┌─────────────────────────────────────────────────┐            │
│  │     React Dashboard – Heatmaps, Alerts, Devices │            │
│  └─────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for detailed diagrams and data flows.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+ (for dashboard)
- AWS CLI configured
- Raspberry Pi 4 (for edge deployment)

### Edge Device Setup

```bash
# Clone the repository
git clone https://github.com/your-org/agrishield-ai.git
cd agrishield-ai

# Install edge dependencies
cd edge-device
pip install -r requirements.txt

# Configure device
cp config.example.yaml config.yaml
# Edit config.yaml with your settings

# Run detection service
python main.py
```

### Dashboard Setup

```bash
# Install frontend dependencies
cd dashboard
npm install

# Start development server
npm run dev
```

### Cloud Infrastructure

```bash
# Deploy AWS resources
cd infrastructure
npm install
npx cdk deploy
```

See [`IMPLEMENTATION.md`](IMPLEMENTATION.md) for detailed setup instructions.

---

## 📂 Repository Structure

```
agrishield-ai/
├── edge-device/           # Edge device Python code
│   ├── models/            # TensorFlow Lite models
│   ├── detectors/         # Camera and audio detection
│   ├── deterrence/        # Light and sound control
│   └── comms/             # SMS/LoRa communication
├── dashboard/             # React ranger dashboard
│   ├── src/components/    # UI components
│   └── src/pages/         # Dashboard views
├── infrastructure/        # AWS CDK infrastructure
├── docs/                  # Documentation
│   ├── diagrams/          # Architecture diagrams
│   └── assets/            # Icons and images
├── .kiro/                 # Kiro IDE spec files
├── ARCHITECTURE.md        # System design details
├── IMPLEMENTATION.md      # Setup and configuration
└── README.md              # You are here
```

---

## 📊 Dashboard Preview

The Ranger Dashboard provides real-time visibility into:

- **Incident Heatmap** – Visualize animal activity zones across monitored areas
- **Recent Alerts** – Time, species, location, and threat level for each detection
- **Device Status** – Monitor online/offline status and battery levels

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Edge Hardware | Raspberry Pi 4, Camera Module, USB Microphone, GSM/LoRa HAT |
| Edge Software | Python, TensorFlow Lite, OpenCV |
| Cloud | AWS IoT Core, Lambda, DynamoDB, S3, SNS, Bedrock |
| Frontend | React, Leaflet.js, Tailwind CSS |
| Infrastructure | AWS CDK (TypeScript) |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | System design, data flows, and component details |
| [`IMPLEMENTATION.md`](IMPLEMENTATION.md) | Setup, configuration, and deployment guide |
| [`docs/diagrams/`](docs/diagrams/) | Visual architecture and flow diagrams |

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License—see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Wildlife conservation organizations for domain expertise
- Rural farming communities for feedback and testing
- AWS for cloud infrastructure support

---

<p align="center">
  <strong>Protecting crops. Preserving wildlife. Empowering farmers.</strong>
</p>


---

## 🖥️ Ranger Dashboard (Frontend) – Quick Start

This folder contains a demo‑ready React dashboard for rangers/admins to visualize wildlife incidents and device status.

### Demo Mode (no backend)

Prerequisites:
- Node.js 18+
- npm (or pnpm/yarn)

Steps:
1. Install deps:
   ```bash
   npm install
   ```
2. Ensure demo mode is enabled (default in `.env`):
   ```env
   VITE_DEMO_MODE=true
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the app at the URL shown (usually http://localhost:5173) and login with any credentials.

Demo behavior:
- Loads seeded JSON from `/public/demo-data/incidents.json` and `/public/demo-data/devices.json`
- Simulated latency: 200–500ms
- Mock auth: any email/password works
- "DEMO MODE" badge is shown in the header

### Production build
```bash
npm run build
npm run preview
```

### Real API integration (later)
The API facade lives in `src/services/api.ts` with three main functions:
- `fetchIncidents(params)`
- `fetchDevices()`
- `login(email, password)`

When `VITE_DEMO_MODE=false`, these functions call placeholder endpoints under `/api/v1/...` as defined in `FRONTEND_REQUIREMENTS.md`.

Options to wire a real backend quickly:
- Configure your reverse proxy (or Vite dev proxy) to forward `/api` to your backend base URL; or
- Update `src/services/api.ts` to use your base URL (e.g., via an env like `VITE_API_BASE_URL`).

Example Vite proxy (vite.config.ts):
```ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://api.agrishield.example.com',
    },
  },
});
```

Data contracts and endpoints follow `FRONTEND_REQUIREMENTS.md` Section 6–7.

### Project structure (frontend)
```
src/
  assets/
  components/
    AlertsPanel.tsx
    DeviceStatusPanel.tsx
    IncidentDetail.tsx
    FilterPanel.tsx
    MapPanel.tsx
  context/
    AuthContext.tsx
    DataContext.tsx
  layouts/
    DashboardLayout.tsx
    Header.tsx
    Sidebar.tsx
  models/
    types.ts
  pages/
    DashboardPage.tsx
    DevicesPage.tsx
    IncidentsPage.tsx
    LoginPage.tsx
    SettingsPage.tsx
  services/
    api.ts
  styles/
    index.css
```

### Notes
- Map uses Leaflet + a simple heatmap toggle (leaflet.heat)
- Alerts table supports pagination (20/page) and basic sorting
- Filters (species, time, threat) affect map and table
- Device panel shows online/offline/degraded status with last heartbeat
- Incident detail opens in a modal
- Responsive layout targets desktop and tablet
