# AgriShield AI – Frontend Requirements

## 1. Purpose & Context

The AgriShield AI Ranger Dashboard is a web-based monitoring and management interface designed for wildlife rangers and farm administrators to:

- **Monitor real-time wildlife detection incidents** across deployed edge devices
- **Visualize incident patterns** through interactive heatmaps and geographic overlays
- **Manage device fleet status** and health monitoring
- **Review historical data** for conservation insights and pattern analysis
- **Respond to alerts** with contextual information (species, location, threat level)

This is a **prototype/demo application** that must be:
- Easy to demonstrate in a 3-5 minute video presentation
- Deployable as a live web link for evaluators to test
- Functional with or without live backend (demo mode with seeded data)
- Visually polished and intuitive for non-technical users

**Target Evaluators**: Hackathon judges, conservation partners, potential investors

---

## 2. User Roles & Stories

### Primary Role: Ranger (Read-Only)

**User Story 1: Monitor Active Incidents**
> As a ranger, I want to see all recent wildlife detections on a map so I can understand current activity patterns in my patrol area.

**Acceptance Criteria**:
- Map displays all incidents from the last 24 hours by default
- Each incident shows species icon, timestamp, and threat level indicator
- Clicking an incident reveals detailed information panel
- Map auto-refreshes every 30 seconds when connected to backend

**User Story 2: Filter by Species & Time**
> As a ranger, I want to filter incidents by species type and time range so I can focus on specific threats (e.g., elephants in the last 6 hours).

**Acceptance Criteria**:
- Filter panel with species checkboxes (Elephant, Boar, Deer, Leopard, Human, Unknown)
- Time range selector (Last hour, 6 hours, 24 hours, 7 days, Custom)
- Filter updates map and alerts table in real-time
- Active filters displayed as removable chips

**User Story 3: View Device Status**
> As a ranger, I want to see which edge devices are online/offline so I can identify coverage gaps or technical issues.

**Acceptance Criteria**:
- Device list showing online/offline status with last heartbeat timestamp
- Visual indicators (green = online, red = offline, yellow = degraded)
- Device location markers on map with status color coding
- Alert badge when device offline > 30 minutes

### Secondary Role: Admin (Full Access)

**User Story 4: Manage Device Configuration**
> As an admin, I want to update device settings (location, alert thresholds) so I can optimize detection accuracy.

**Acceptance Criteria**:
- Device settings modal with editable fields
- Save/cancel actions with confirmation
- Changes reflected in device registry (DynamoDB)
- Success/error notifications

---

## 3. MVP Scope

### Must-Have Features (P0)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Interactive Map** | Leaflet.js map with incident markers and heatmap overlay | P0 |
| **Incident Alerts Table** | Sortable, paginated table of recent detections | P0 |
| **Species Filtering** | Filter incidents by animal type | P0 |
| **Time Range Selector** | Filter by time period (last hour, day, week) | P0 |
| **Device Status Panel** | List of devices with online/offline indicators | P0 |
| **Incident Detail View** | Modal/panel showing full incident data + image | P0 |
| **Authentication** | Login screen with Cognito integration | P0 |
| **Demo Mode** | Ability to run with seeded JSON data (no backend) | P0 |
| **Responsive Layout** | Mobile-friendly design (tablet minimum) | P0 |

### Nice-to-Have Features (P1)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Real-Time Updates** | WebSocket or polling for live incident feed | P1 |
| **Heatmap Intensity Toggle** | Adjust heatmap visualization density | P1 |
| **Export Data** | Download incidents as CSV/JSON | P1 |
| **Dark Mode** | Toggle between light/dark themes | P1 |
| **Audio Playback** | Play deterrence sound clips from incidents | P1 |
| **Notification Center** | In-app notification bell with unread count | P1 |
| **Device Health Metrics** | Battery level, signal strength, temperature | P1 |

### Out of Scope (Future)

- Mobile native app (iOS/Android)
- Multi-language support
- Advanced analytics (ML-powered predictions)
- Community/public dashboard
- SMS alert management from UI

---

## 4. Functional Requirements

### FR-1: Map Visualization

**Description**: Interactive map displaying incident locations and device positions.

**Requirements**:
- Use Leaflet.js with OpenStreetMap tiles
- Default center: Configurable via environment variable (Kenya coordinates)
- Zoom levels: 10-18 (farm-level detail)
- Incident markers: Custom icons per species (elephant, boar, deer, etc.)
- Marker clustering: Group nearby incidents when zoomed out
- Heatmap layer: Toggle-able overlay showing incident density
- Device markers: Distinct icons for edge devices with status color

**Interactions**:
- Click marker → Open incident detail panel
- Click device → Show device info tooltip
- Pan/zoom → Persist viewport in session storage

### FR-2: Incident Alerts Table

**Description**: Tabular view of recent incidents with sorting and pagination.

**Columns**:
| Column | Type | Sortable | Description |
|--------|------|----------|-------------|
| Timestamp | DateTime | Yes | ISO 8601 format, displayed as relative time |
| Species | String | Yes | Animal type with icon |
| Threat Level | Enum | Yes | HIGH/MEDIUM/LOW with color badge |
| Location | String | No | Device name or coordinates |
| Confidence | Number | Yes | ML model confidence (0-100%) |
| Status | Enum | No | NEW/REVIEWED/RESOLVED |

**Features**:
- Pagination: 20 items per page
- Sort: Click column header to toggle asc/desc
- Row click: Navigate to incident detail view
- Empty state: "No incidents found" with illustration

### FR-3: Filtering & Search

**Filter Options**:
- **Species**: Multi-select checkboxes (Elephant, Boar, Deer, Leopard, Human, Unknown)
- **Time Range**: Dropdown (Last hour, 6 hours, 24 hours, 7 days, Custom date picker)
- **Threat Level**: Multi-select (HIGH, MEDIUM, LOW)
- **Device**: Dropdown of device IDs
- **Status**: Multi-select (NEW, REVIEWED, RESOLVED)

**Behavior**:
- Filters applied via AND logic (all conditions must match)
- Active filters shown as removable chips above table
- Filter state persisted in URL query params
- "Clear All" button resets to defaults

### FR-4: Device Management

**Device List View**:
- Card or table layout showing all registered devices
- Each device displays:
  - Device ID
  - Location name
  - Status (Online/Offline/Degraded)
  - Last heartbeat timestamp
  - Battery level (if available)
  - Total incidents detected (last 24h)

**Device Detail View**:
- Full device metadata
- Incident history for this device
- Configuration settings (admin only)
- "Locate on Map" button

### FR-5: Incident Detail View

**Layout**: Modal or side panel

**Content**:
- Large image preview (if available)
- Species classification with confidence score
- Timestamp and location (map thumbnail)
- Threat level badge
- Device ID and name
- Deterrence action taken (sound played, lights activated)
- Audio clip player (if available)
- Admin actions: Mark as reviewed, add notes

### FR-6: Authentication & Authorization

**Login Flow**:
1. User lands on login page
2. Enter email + password (Cognito)
3. On success, redirect to dashboard
4. JWT token stored in localStorage
5. Token refresh handled automatically

**Role-Based Access**:
- **Ranger**: Read-only access to all views
- **Admin**: Full access including device configuration

**Session Management**:
- Auto-logout after 1 hour of inactivity
- "Remember me" checkbox for 7-day session
- Logout button in header

### FR-7: Demo Mode

**Purpose**: Allow dashboard to run without live backend for demos and testing.

**Implementation**:
- Environment variable: `VITE_DEMO_MODE=true`
- Load seeded JSON data from `/public/demo-data/`
- Simulate API responses with 200-500ms delay
- Mock authentication (any email/password works)
- Display "DEMO MODE" banner in header

**Demo Data Files**:
- `incidents.json`: 50 sample incidents across 7 days
- `devices.json`: 5 sample devices with varied status
- `images/`: Sample wildlife detection images

---

## 5. Non-Functional Requirements

### NFR-1: Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load Time | < 2 seconds | Lighthouse Performance score > 90 |
| Time to Interactive | < 3 seconds | First Contentful Paint < 1.5s |
| Map Render Time | < 500ms | 100 markers rendered |
| Table Pagination | < 100ms | Page change response time |
| API Response Handling | < 200ms | UI update after data fetch |

**Optimization Strategies**:
- Code splitting by route
- Lazy load map components
- Image optimization (WebP format, lazy loading)
- Debounce filter inputs (300ms)
- Virtual scrolling for large tables

### NFR-2: Responsiveness

**Breakpoints**:
- Mobile: 320px - 767px (basic support, not primary target)
- Tablet: 768px - 1023px (optimized)
- Desktop: 1024px+ (primary target)

**Layout Adaptations**:
- Tablet: Sidebar collapses to hamburger menu
- Tablet: Map and table stack vertically
- Mobile: Single-column layout, simplified filters

### NFR-3: Browser Compatibility

**Supported Browsers**:
- Chrome 100+ (primary)
- Firefox 100+
- Safari 15+
- Edge 100+

**Not Supported**:
- Internet Explorer
- Browsers without ES2020 support

### NFR-4: Accessibility

**WCAG 2.1 Level AA Targets** (best effort, not guaranteed):
- Keyboard navigation for all interactive elements
- ARIA labels for map markers and icons
- Color contrast ratio > 4.5:1 for text
- Focus indicators on all focusable elements
- Screen reader announcements for dynamic content updates

**Note**: Full WCAG compliance requires manual testing with assistive technologies.

### NFR-5: Error Handling

**Error States**:
- **Network Error**: "Unable to connect. Check your internet connection."
- **API Error**: "Failed to load data. Please try again."
- **Empty State**: "No incidents found. Try adjusting your filters."
- **Auth Error**: "Session expired. Please log in again."

**Error UI**:
- Toast notifications for transient errors
- Inline error messages for form validation
- Full-page error boundary for critical failures
- Retry button for failed requests

### NFR-6: Security

- All API requests use HTTPS
- JWT tokens stored in httpOnly cookies (if possible) or localStorage
- No sensitive data in URL params
- Input sanitization for user-generated content
- CSP headers configured
- No inline scripts

---

## 6. Data Contracts

### Incident Object

```json
{
  "incident_id": "inc_20260302_001",
  "device_id": "agrishield-device-001",
  "timestamp": 1709395200000,
  "species": "elephant",
  "confidence": 0.92,
  "threat_level": "HIGH",
  "location": {
    "lat": -1.2921,
    "lng": 36.8219,
    "name": "Farm Block A"
  },
  "image_url": "https://s3.amazonaws.com/agrishield-media/incidents/inc_20260302_001.jpg",
  "audio_url": "https://s3.amazonaws.com/agrishield-media/audio/inc_20260302_001.wav",
  "deterrence_action": {
    "sound_played": true,
    "lights_activated": true,
    "pattern": "elephant-deterrent"
  },
  "status": "NEW",
  "notes": ""
}
```

### Device Object

```json
{
  "device_id": "agrishield-device-001",
  "name": "Farm Block A - North Gate",
  "location": {
    "lat": -1.2921,
    "lng": 36.8219
  },
  "status": "ONLINE",
  "last_heartbeat": 1709395200000,
  "battery_level": 87,
  "signal_strength": -65,
  "firmware_version": "1.2.0",
  "total_incidents_24h": 12,
  "config": {
    "confidence_threshold": 0.7,
    "deterrence_enabled": true
  }
}
```

### Alert Object (for notifications)

```json
{
  "alert_id": "alert_20260302_001",
  "incident_id": "inc_20260302_001",
  "type": "WILDLIFE_DETECTED",
  "severity": "HIGH",
  "message": "Elephant detected at Farm Block A",
  "timestamp": 1709395200000,
  "read": false
}
```

---

## 7. API Endpoints

**Base URL**: `https://api.agrishield.example.com/v1` (or configured via env var)

### GET /incidents

**Description**: Fetch incidents with optional filters

**Query Parameters**:
- `species`: Comma-separated list (e.g., `elephant,boar`)
- `start_time`: Unix timestamp (milliseconds)
- `end_time`: Unix timestamp (milliseconds)
- `threat_level`: Comma-separated (e.g., `HIGH,MEDIUM`)
- `device_id`: Filter by device
- `limit`: Number of results (default: 100, max: 500)
- `offset`: Pagination offset

**Response**:
```json
{
  "incidents": [ /* array of Incident objects */ ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

### GET /incidents/:id

**Description**: Fetch single incident by ID

**Response**: Single Incident object

### GET /devices

**Description**: Fetch all registered devices

**Response**:
```json
{
  "devices": [ /* array of Device objects */ ]
}
```

### GET /devices/:id

**Description**: Fetch single device by ID

**Response**: Single Device object

### PATCH /devices/:id (Admin only)

**Description**: Update device configuration

**Request Body**:
```json
{
  "name": "Updated Name",
  "config": {
    "confidence_threshold": 0.8
  }
}
```

**Response**: Updated Device object

### GET /alerts

**Description**: Fetch unread alerts for current user

**Response**:
```json
{
  "alerts": [ /* array of Alert objects */ ],
  "unread_count": 5
}
```

### POST /auth/login

**Description**: Authenticate user (Cognito)

**Request Body**:
```json
{
  "email": "ranger@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": {
    "id": "user_001",
    "email": "ranger@example.com",
    "role": "ranger"
  }
}
```

---

## 8. Demo Mode Requirements

### Seeded Data Specifications

**Incidents** (`public/demo-data/incidents.json`):
- 50 incidents spanning 7 days
- Species distribution: 40% elephant, 25% boar, 20% deer, 10% leopard, 5% human
- Threat levels: 30% HIGH, 50% MEDIUM, 20% LOW
- Geographic spread: 5 device locations within 10km radius
- Timestamps: Realistic distribution (more at dawn/dusk)

**Devices** (`public/demo-data/devices.json`):
- 5 devices total
- Status: 3 online, 1 offline, 1 degraded
- Battery levels: 45-95%
- Last heartbeat: Varied (online = recent, offline = 2 hours ago)

**Images** (`public/demo-data/images/`):
- 10 sample wildlife detection images
- Randomly assigned to incidents
- Optimized for web (< 200KB each)

### Demo Mode Behavior

- Display "🎭 DEMO MODE" badge in header
- All API calls return mock data with 200-500ms simulated latency
- Authentication bypassed (any credentials work)
- No actual data persistence (changes reset on refresh)
- Console log: "Running in demo mode with seeded data"

---

## 9. Technology Stack Recommendation

### Option A: Vite + React (Recommended)

**Pros**:
- Fastest dev server and build times
- Simpler configuration
- Smaller bundle size
- Better for SPA with separate backend

**Stack**:
- **Build Tool**: Vite 5
- **Framework**: React 18
- **Routing**: React Router 6
- **State Management**: Zustand or React Context
- **Styling**: Tailwind CSS 3
- **Map**: Leaflet.js + React-Leaflet
- **HTTP Client**: Axios
- **Auth**: AWS Amplify (Cognito)
- **Charts**: Recharts (if needed)

### Option B: Next.js 14

**Pros**:
- Built-in API routes (useful for demo mode)
- Better SEO (not critical for this app)
- Server-side rendering (overkill for dashboard)

**Cons**:
- More complex setup
- Slower dev experience
- Unnecessary features for this use case

**Recommendation**: Use Vite + React for this prototype. Next.js adds complexity without clear benefits for a dashboard app.

---

## 10. Success Criteria

The frontend is considered "demo-ready" when:

- [ ] Dashboard loads in < 2 seconds on 4G connection
- [ ] All P0 features implemented and functional
- [ ] Demo mode works without backend (seeded data)
- [ ] Responsive layout works on tablet (768px+)
- [ ] No console errors in production build
- [ ] Authentication flow works with Cognito
- [ ] Map displays 100+ incidents without lag
- [ ] Filters update UI in < 200ms
- [ ] Error states handled gracefully
- [ ] Deployed to live URL (Vercel/Netlify)
- [ ] 3-minute demo video recorded successfully

---

*Document Version: 1.0*  
*Last Updated: March 2, 2026*  
*Target Completion: March 15, 2026*
