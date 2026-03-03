# AgriShield AI – Frontend Design

## 1. Information Architecture

### Site Map

```
/
├── /login                    # Authentication page
├── /dashboard                # Main dashboard (default route)
│   ├── ?species=elephant     # Filtered view
│   ├── ?time=24h             # Time range filter
│   └── ?device=device-001    # Device filter
├── /incidents
│   ├── /                     # Incidents list view
│   └── /:id                  # Incident detail view
├── /devices
│   ├── /                     # Devices list view
│   └── /:id                  # Device detail view
└── /settings (admin only)    # Configuration panel
```

### Navigation Structure

**Primary Navigation** (Sidebar):
- Dashboard (home icon)
- Incidents (alert icon)
- Devices (hardware icon)
- Settings (gear icon, admin only)

**Secondary Navigation** (Header):
- User profile dropdown
- Notifications bell
- Demo mode indicator
- Logout button

---

## 2. Component Tree

### Application Structure

```
<App>
├── <AuthProvider>
│   ├── <Router>
│   │   ├── <PublicRoute path="/login">
│   │   │   └── <LoginPage>
│   │   └── <PrivateRoute path="/*">
│   │       └── <DashboardLayout>
│   │           ├── <Sidebar>
│   │           ├── <Header>
│   │           └── <Routes>
│   │               ├── <DashboardPage>
│   │               ├── <IncidentsPage>
│   │               ├── <DevicesPage>
│   │               └── <SettingsPage>
```

### Core Components Hierarchy

**DashboardPage**:
```
<DashboardPage>
├── <FilterPanel>
│   ├── <SpeciesFilter>
│   ├── <TimeRangeFilter>
│   ├── <ThreatLevelFilter>
│   └── <ActiveFiltersChips>
├── <MapPanel>
│   ├── <LeafletMap>
│   │   ├── <IncidentMarkers>
│   │   ├── <DeviceMarkers>
│   │   └── <HeatmapLayer>
│   └── <MapControls>
├── <AlertsPanel>
│   ├── <AlertsTable>
│   │   ├── <TableHeader>
│   │   ├── <TableBody>
│   │   │   └── <AlertRow> (repeated)
│   │   └── <TablePagination>
│   └── <EmptyState>
└── <DeviceStatusPanel>
    └── <DeviceCard> (repeated)
```

---


## 3. Layout Design

### Dashboard Layout (Desktop 1440px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (64px height)                                            │
│ [Logo] [Demo Badge]              [Notifications] [User] [Logout]│
├──────┬──────────────────────────────────────────────────────────┤
│      │ Filter Panel (280px width)                               │
│      │ ┌────────────────────────────┐                           │
│ Side │ │ Species Filter             │                           │
│ bar  │ │ ☐ Elephant  ☐ Boar        │                           │
│      │ │ ☐ Deer      ☐ Leopard     │                           │
│ (60) │ │                            │                           │
│      │ │ Time Range: [Last 24h ▼]  │                           │
│      │ │                            │                           │
│      │ │ Threat Level:              │                           │
│      │ │ ☐ HIGH  ☐ MEDIUM  ☐ LOW   │                           │
│      │ │                            │                           │
│      │ │ [Clear All] [Apply]        │                           │
│      │ └────────────────────────────┘                           │
│      │                                                           │
│      │ Map Panel (60% height)                                   │
│      │ ┌────────────────────────────────────────────────────┐  │
│      │ │                                                     │  │
│      │ │         [Interactive Leaflet Map]                  │  │
│      │ │         • Incident markers                         │  │
│      │ │         • Device markers                           │  │
│      │ │         • Heatmap overlay                          │  │
│      │ │                                                     │  │
│      │ │  [Zoom +/-] [Heatmap Toggle] [Fullscreen]         │  │
│      │ └────────────────────────────────────────────────────┘  │
│      │                                                           │
│      │ Alerts Panel (40% height)                                │
│      │ ┌────────────────────────────────────────────────────┐  │
│      │ │ Recent Incidents                    [Export CSV]   │  │
│      │ │ ┌──────┬─────────┬────────┬─────────┬──────────┐  │  │
│      │ │ │ Time │ Species │ Threat │ Location│ Conf.    │  │  │
│      │ │ ├──────┼─────────┼────────┼─────────┼──────────┤  │  │
│      │ │ │ 2m   │ 🐘 Ele  │ 🔴 HIGH│ Block A │ 92%      │  │  │
│      │ │ │ 15m  │ 🐗 Boar │ 🟡 MED │ Block B │ 85%      │  │  │
│      │ │ │ 1h   │ 🦌 Deer │ 🟢 LOW │ Block C │ 78%      │  │  │
│      │ │ └──────┴─────────┴────────┴─────────┴──────────┘  │  │
│      │ │                                                     │  │
│      │ │ [< Prev] Page 1 of 5 [Next >]                      │  │
│      │ └────────────────────────────────────────────────────┘  │
│      │                                                           │
│      │ Device Status Panel (Right sidebar, 280px)               │
│      │ ┌────────────────────────────┐                           │
│      │ │ Active Devices (3/5)       │                           │
│      │ │                            │                           │
│      │ │ ┌────────────────────────┐ │                           │
│      │ │ │ 🟢 Device-001          │ │                           │
│      │ │ │ Farm Block A           │ │                           │
│      │ │ │ Battery: 87%           │ │                           │
│      │ │ │ Last seen: 2m ago      │ │                           │
│      │ │ └────────────────────────┘ │                           │
│      │ │                            │                           │
│      │ │ ┌────────────────────────┐ │                           │
│      │ │ │ 🔴 Device-002          │ │                           │
│      │ │ │ Farm Block B           │ │                           │
│      │ │ │ Battery: 45%           │ │                           │
│      │ │ │ Last seen: 2h ago      │ │                           │
│      │ │ └────────────────────────┘ │                           │
│      │ └────────────────────────────┘                           │
└──────┴──────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1023px)

```
┌─────────────────────────────────────────┐
│ Header                                  │
│ [☰] [Logo]        [Notifications] [User]│
├─────────────────────────────────────────┤
│ Filter Panel (Collapsible)              │
│ [Species ▼] [Time ▼] [Threat ▼]        │
├─────────────────────────────────────────┤
│                                         │
│ Map Panel (Full width, 50vh)            │
│                                         │
├─────────────────────────────────────────┤
│ Alerts Table (Full width)               │
│ ┌─────┬─────────┬────────┬──────┐      │
│ │ Time│ Species │ Threat │ Loc  │      │
│ └─────┴─────────┴────────┴──────┘      │
├─────────────────────────────────────────┤
│ Device Status (Horizontal scroll)       │
│ [Device 1] [Device 2] [Device 3] →      │
└─────────────────────────────────────────┘
```

---


## 4. Design Tokens & Styling

### Color Palette

**Primary Colors**:
```css
--color-primary-50: #f0fdf4;
--color-primary-100: #dcfce7;
--color-primary-500: #22c55e;  /* Main brand green */
--color-primary-600: #16a34a;
--color-primary-700: #15803d;
```

**Semantic Colors**:
```css
/* Threat Levels */
--color-danger: #ef4444;      /* HIGH threat */
--color-warning: #f59e0b;     /* MEDIUM threat */
--color-success: #22c55e;     /* LOW threat */

/* Status Indicators */
--color-online: #22c55e;      /* Device online */
--color-offline: #ef4444;     /* Device offline */
--color-degraded: #f59e0b;    /* Device degraded */

/* Neutral Palette */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-500: #6b7280;
--color-gray-700: #374151;
--color-gray-900: #111827;
```

**Species Colors** (for map markers):
```css
--species-elephant: #8b5cf6;  /* Purple */
--species-boar: #f97316;      /* Orange */
--species-deer: #eab308;      /* Yellow */
--species-leopard: #ec4899;   /* Pink */
--species-human: #3b82f6;     /* Blue */
--species-unknown: #6b7280;   /* Gray */
```

### Typography

**Font Family**:
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

**Font Sizes**:
```css
--text-xs: 0.75rem;    /* 12px - Captions, labels */
--text-sm: 0.875rem;   /* 14px - Body small, table text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Card titles */
--text-2xl: 1.5rem;    /* 24px - Page headings */
--text-3xl: 1.875rem;  /* 30px - Hero text */
```

**Font Weights**:
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Badges, chips */
--radius-md: 0.5rem;    /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - Cards, panels */
--radius-xl: 1rem;      /* 16px - Modals */
--radius-full: 9999px;  /* Circular elements */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Z-Index Layers

```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

---


## 5. UI Patterns & Components

### Button Variants

**Primary Button**:
```jsx
<button className="btn-primary">
  Save Changes
</button>

/* Styles */
.btn-primary {
  background: var(--color-primary-600);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: background 150ms;
}
.btn-primary:hover {
  background: var(--color-primary-700);
}
```

**Secondary Button**:
```jsx
<button className="btn-secondary">
  Cancel
</button>

/* Styles */
.btn-secondary {
  background: white;
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
}
```

**Icon Button**:
```jsx
<button className="btn-icon">
  <FilterIcon />
</button>

/* Styles */
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Badge Component

```jsx
<Badge variant="danger">HIGH</Badge>
<Badge variant="warning">MEDIUM</Badge>
<Badge variant="success">LOW</Badge>

/* Styles */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
}
.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}
.badge-warning {
  background: #fef3c7;
  color: #92400e;
}
.badge-success {
  background: #d1fae5;
  color: #065f46;
}
```

### Card Component

```jsx
<Card>
  <CardHeader>
    <CardTitle>Device Status</CardTitle>
  </CardHeader>
  <CardBody>
    {/* Content */}
  </CardBody>
</Card>

/* Styles */
.card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
}
.card-body {
  padding: var(--space-6);
}
```

### Status Indicator

```jsx
<StatusIndicator status="online" />

/* Component */
const StatusIndicator = ({ status }) => (
  <span className={`status-dot status-${status}`} />
);

/* Styles */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: var(--space-2);
}
.status-online { background: var(--color-online); }
.status-offline { background: var(--color-offline); }
.status-degraded { background: var(--color-degraded); }
```

### Filter Chip

```jsx
<FilterChip onRemove={() => {}}>
  Species: Elephant
  <CloseIcon />
</FilterChip>

/* Styles */
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
}
```

### Modal Pattern

```jsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Incident Details</ModalTitle>
      <ModalClose />
    </ModalHeader>
    <ModalBody>
      {/* Content */}
    </ModalBody>
    <ModalFooter>
      <Button onClick={onClose}>Close</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

/* Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal-backdrop);
}
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 90%;
  z-index: var(--z-modal);
}
```

---


## 6. State Management Model

### Application State Structure

```typescript
interface AppState {
  auth: AuthState;
  incidents: IncidentsState;
  devices: DevicesState;
  filters: FiltersState;
  ui: UIState;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface IncidentsState {
  items: Incident[];
  selectedIncident: Incident | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface DevicesState {
  items: Device[];
  selectedDevice: Device | null;
  isLoading: boolean;
  error: string | null;
}

interface FiltersState {
  species: string[];
  timeRange: TimeRange;
  threatLevel: ThreatLevel[];
  deviceId: string | null;
}

interface UIState {
  sidebarOpen: boolean;
  mapView: 'markers' | 'heatmap' | 'both';
  theme: 'light' | 'dark';
  notifications: Notification[];
}
```

### State Management Strategy

**Recommended: Zustand**

```typescript
// stores/useIncidentsStore.ts
import create from 'zustand';

interface IncidentsStore {
  incidents: Incident[];
  isLoading: boolean;
  error: string | null;
  fetchIncidents: (filters: Filters) => Promise<void>;
  selectIncident: (id: string) => void;
  selectedIncident: Incident | null;
}

export const useIncidentsStore = create<IncidentsStore>((set, get) => ({
  incidents: [],
  isLoading: false,
  error: null,
  selectedIncident: null,
  
  fetchIncidents: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getIncidents(filters);
      set({ incidents: data.incidents, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  selectIncident: (id) => {
    const incident = get().incidents.find(i => i.incident_id === id);
    set({ selectedIncident: incident });
  },
}));
```

### Loading States

**Pattern**: Skeleton loaders for initial load, spinners for actions

```jsx
// Loading state for table
{isLoading ? (
  <TableSkeleton rows={10} />
) : (
  <AlertsTable data={incidents} />
)}

// Loading state for map
{isLoading ? (
  <div className="map-skeleton">
    <Spinner />
    <p>Loading incidents...</p>
  </div>
) : (
  <LeafletMap incidents={incidents} />
)}
```

### Empty States

```jsx
// No incidents found
<EmptyState
  icon={<SearchIcon />}
  title="No incidents found"
  description="Try adjusting your filters or time range"
  action={
    <Button onClick={clearFilters}>Clear Filters</Button>
  }
/>

// No devices registered
<EmptyState
  icon={<DeviceIcon />}
  title="No devices registered"
  description="Add your first edge device to start monitoring"
  action={
    <Button onClick={openAddDevice}>Add Device</Button>
  }
/>
```

### Error States

```jsx
// API error
<ErrorState
  title="Failed to load incidents"
  message={error.message}
  action={
    <Button onClick={retry}>Try Again</Button>
  }
/>

// Network error
<ErrorState
  icon={<WifiOffIcon />}
  title="Connection lost"
  message="Check your internet connection and try again"
  action={
    <Button onClick={retry}>Retry</Button>
  }
/>
```

---


## 7. Page Wireframes

### Login Page

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         ┌─────────────────────┐         │
│         │                     │         │
│         │   🛡️ AgriShield AI  │         │
│         │                     │         │
│         │   Ranger Dashboard  │         │
│         │                     │         │
│         │   ┌───────────────┐ │         │
│         │   │ Email         │ │         │
│         │   └───────────────┘ │         │
│         │                     │         │
│         │   ┌───────────────┐ │         │
│         │   │ Password      │ │         │
│         │   └───────────────┘ │         │
│         │                     │         │
│         │   ☐ Remember me     │         │
│         │                     │         │
│         │   [    Login    ]   │         │
│         │                     │         │
│         │   Forgot password?  │         │
│         │                     │         │
│         └─────────────────────┘         │
│                                         │
│         🎭 Demo Mode Available          │
│                                         │
└─────────────────────────────────────────┘
```

### Dashboard Page (Main View)

```
┌──────────────────────────────────────────────────────────────┐
│ Header: [Logo] AgriShield AI    [🔔 3] [👤 Ranger] [Logout] │
├──┬──────────────────────────────────────────────────────┬────┤
│  │ Filters                                              │Dev │
│S │ ┌──────────────────────────────────────────────┐    │ice │
│i │ │ Species: [Elephant] [Boar] [x]               │    │    │
│d │ │ Time: Last 24 hours                          │    │Sta │
│e │ │ Threat: [HIGH] [MEDIUM] [x]                  │    │tus │
│b │ └──────────────────────────────────────────────┘    │    │
│a │                                                      │Pan │
│r │ Map View                                             │el  │
│  │ ┌──────────────────────────────────────────────┐    │    │
│  │ │                                              │    │[🟢]│
│  │ │    🗺️  Interactive Map                      │    │Dev │
│  │ │                                              │    │001 │
│  │ │    • Incident markers                        │    │    │
│  │ │    • Device locations                        │    │[🔴]│
│  │ │    • Heatmap overlay                         │    │Dev │
│  │ │                                              │    │002 │
│  │ │    [+] [-] [🔥] [⛶]                         │    │    │
│  │ └──────────────────────────────────────────────┘    │[🟢]│
│  │                                                      │Dev │
│  │ Recent Incidents                    [Export CSV]    │003 │
│  │ ┌──────────────────────────────────────────────┐    │    │
│  │ │ Time  │ Species │ Threat │ Location │ Conf. │    │    │
│  │ ├───────┼─────────┼────────┼──────────┼───────┤    │    │
│  │ │ 2m    │ 🐘 Ele  │ 🔴 HIGH│ Block A  │ 92%   │    │    │
│  │ │ 15m   │ 🐗 Boar │ 🟡 MED │ Block B  │ 85%   │    │    │
│  │ │ 1h    │ 🦌 Deer │ 🟢 LOW │ Block C  │ 78%   │    │    │
│  │ │ 2h    │ 🐘 Ele  │ 🔴 HIGH│ Block A  │ 88%   │    │    │
│  │ └──────────────────────────────────────────────┘    │    │
│  │ [< Prev] Page 1 of 5 [Next >]                       │    │
└──┴──────────────────────────────────────────────────────┴────┘
```

### Incident Detail Modal

```
┌─────────────────────────────────────────────────────┐
│ Incident Details                              [X]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │         [Wildlife Detection Image]           │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Species: 🐘 Elephant                               │
│  Confidence: 92%                                    │
│  Threat Level: 🔴 HIGH                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📍 Location                                 │   │
│  │ Farm Block A - North Gate                   │   │
│  │ Lat: -1.2921, Lng: 36.8219                  │   │
│  │ [View on Map]                               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ⏰ Timestamp: March 2, 2026 14:32:15               │
│  📱 Device: agrishield-device-001                   │
│                                                     │
│  🔊 Deterrence Action:                              │
│  ✓ Sound played: elephant-deterrent.wav             │
│  ✓ Lights activated                                 │
│  [▶️ Play Sound]                                    │
│                                                     │
│  Status: [NEW ▼]                                    │
│  Notes: ┌─────────────────────────────────────┐    │
│         │ Add notes...                        │    │
│         └─────────────────────────────────────┘    │
│                                                     │
│  [Mark as Reviewed] [Close]                         │
└─────────────────────────────────────────────────────┘
```

### Devices Page

```
┌──────────────────────────────────────────────────────────────┐
│ Header: [Logo] AgriShield AI    [🔔 3] [👤 Ranger] [Logout] │
├──┬───────────────────────────────────────────────────────────┤
│  │ Devices                                    [+ Add Device] │
│S │                                                            │
│i │ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│d │ │ 🟢 Device-001  │ │ 🔴 Device-002  │ │ 🟢 Device-003  │ │
│e │ │                │ │                │ │                │ │
│b │ │ Farm Block A   │ │ Farm Block B   │ │ Farm Block C   │ │
│a │ │                │ │                │ │                │ │
│r │ │ Battery: 87%   │ │ Battery: 45%   │ │ Battery: 92%   │ │
│  │ │ Signal: ▂▃▅▇   │ │ Signal: ▂▃▅_   │ │ Signal: ▂▃▅▇   │ │
│  │ │                │ │                │ │                │ │
│  │ │ Last seen:     │ │ Last seen:     │ │ Last seen:     │ │
│  │ │ 2 minutes ago  │ │ 2 hours ago    │ │ 5 minutes ago  │ │
│  │ │                │ │                │ │                │ │
│  │ │ Incidents 24h: │ │ Incidents 24h: │ │ Incidents 24h: │ │
│  │ │ 12             │ │ 8              │ │ 15             │ │
│  │ │                │ │                │ │                │ │
│  │ │ [View Details] │ │ [View Details] │ │ [View Details] │ │
│  │ └────────────────┘ └────────────────┘ └────────────────┘ │
│  │                                                            │
│  │ ┌────────────────┐ ┌────────────────┐                    │
│  │ │ 🟡 Device-004  │ │ 🟢 Device-005  │                    │
│  │ │                │ │                │                    │
│  │ │ Farm Block D   │ │ Farm Block E   │                    │
│  │ │                │ │                │                    │
│  │ │ Battery: 62%   │ │ Battery: 78%   │                    │
│  │ │ Signal: ▂▃__   │ │ Signal: ▂▃▅▇   │                    │
│  │ │                │ │                │                    │
│  │ │ Last seen:     │ │ Last seen:     │                    │
│  │ │ 45 minutes ago │ │ 1 minute ago   │                    │
│  │ │                │ │                │                    │
│  │ │ Incidents 24h: │ │ Incidents 24h: │                    │
│  │ │ 5              │ │ 18             │                    │
│  │ │                │ │                │                    │
│  │ │ [View Details] │ │ [View Details] │                    │
│  │ └────────────────┘ └────────────────┘                    │
└──┴───────────────────────────────────────────────────────────┘
```

---


## 8. Interaction Patterns

### Filter Behavior

**User Flow**:
1. User opens filter panel (expanded by default on desktop)
2. User selects species checkboxes (e.g., Elephant, Boar)
3. Filters apply automatically with 300ms debounce
4. Active filters shown as chips above map/table
5. Click chip "X" to remove individual filter
6. "Clear All" button resets all filters

**State Updates**:
```typescript
// Filter change triggers:
1. Update URL query params (?species=elephant,boar)
2. Update filter state in store
3. Fetch filtered incidents from API
4. Update map markers and table rows
5. Show loading skeleton during fetch
```

### Pagination Behavior

**Pattern**: Server-side pagination with URL state

```typescript
// URL: /dashboard?page=2&limit=20
const [page, setPage] = useState(1);
const limit = 20;

const handlePageChange = (newPage: number) => {
  setPage(newPage);
  router.push(`/dashboard?page=${newPage}&limit=${limit}`);
  fetchIncidents({ offset: (newPage - 1) * limit, limit });
};
```

**UI Controls**:
- Previous/Next buttons (disabled at boundaries)
- Page number display: "Page 2 of 10"
- Optional: Jump to page input
- Optional: Items per page selector (20, 50, 100)

### Map Interactions

**Marker Click**:
```typescript
const handleMarkerClick = (incident: Incident) => {
  // 1. Center map on marker
  map.setView([incident.location.lat, incident.location.lng], 15);
  
  // 2. Open incident detail panel
  setSelectedIncident(incident);
  
  // 3. Highlight corresponding table row
  scrollToTableRow(incident.incident_id);
};
```

**Heatmap Toggle**:
```typescript
const [showHeatmap, setShowHeatmap] = useState(true);

// Toggle button in map controls
<button onClick={() => setShowHeatmap(!showHeatmap)}>
  {showHeatmap ? '🔥 Hide Heatmap' : '🔥 Show Heatmap'}
</button>

// Conditional layer rendering
{showHeatmap && (
  <HeatmapLayer
    points={incidents.map(i => [i.location.lat, i.location.lng])}
    intensity={0.5}
    radius={25}
  />
)}
```

### Real-Time Updates (Optional P1)

**Polling Strategy**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchIncidents(currentFilters);
  }, 30000); // Poll every 30 seconds
  
  return () => clearInterval(interval);
}, [currentFilters]);
```

**New Incident Notification**:
```typescript
// When new incidents detected
if (newIncidents.length > 0) {
  toast.info(`${newIncidents.length} new incidents detected`, {
    action: {
      label: 'View',
      onClick: () => scrollToTop()
    }
  });
}
```

### Responsive Sidebar

**Desktop** (>1024px): Always visible, 60px collapsed or 240px expanded

**Tablet** (768-1023px): Overlay sidebar, toggle with hamburger

**Mobile** (<768px): Bottom navigation bar

```typescript
const [sidebarOpen, setSidebarOpen] = useState(false);

// Hamburger button (tablet/mobile only)
<button onClick={() => setSidebarOpen(!sidebarOpen)}>
  <MenuIcon />
</button>

// Sidebar component
<Sidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  variant={isMobile ? 'overlay' : 'persistent'}
/>
```

---


## 9. Map Implementation Details

### Leaflet Configuration

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const MapView = ({ incidents, devices }) => {
  const center = [
    parseFloat(import.meta.env.VITE_MAP_CENTER_LAT),
    parseFloat(import.meta.env.VITE_MAP_CENTER_LNG)
  ];
  
  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Incident markers */}
      {incidents.map(incident => (
        <Marker
          key={incident.incident_id}
          position={[incident.location.lat, incident.location.lng]}
          icon={getSpeciesIcon(incident.species)}
          eventHandlers={{
            click: () => handleIncidentClick(incident)
          }}
        >
          <Popup>
            <IncidentPopup incident={incident} />
          </Popup>
        </Marker>
      ))}
      
      {/* Device markers */}
      {devices.map(device => (
        <Marker
          key={device.device_id}
          position={[device.location.lat, device.location.lng]}
          icon={getDeviceIcon(device.status)}
        >
          <Popup>
            <DevicePopup device={device} />
          </Popup>
        </Marker>
      ))}
      
      {/* Heatmap layer */}
      {showHeatmap && <HeatmapLayer incidents={incidents} />}
    </MapContainer>
  );
};
```

### Custom Marker Icons

```typescript
const getSpeciesIcon = (species: string) => {
  const iconMap = {
    elephant: '🐘',
    boar: '🐗',
    deer: '🦌',
    leopard: '🐆',
    human: '👤',
    unknown: '❓'
  };
  
  return L.divIcon({
    html: `
      <div class="custom-marker species-${species}">
        <span class="marker-icon">${iconMap[species]}</span>
      </div>
    `,
    className: 'custom-marker-wrapper',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

const getDeviceIcon = (status: string) => {
  const colorMap = {
    ONLINE: '#22c55e',
    OFFLINE: '#ef4444',
    DEGRADED: '#f59e0b'
  };
  
  return L.divIcon({
    html: `
      <div class="device-marker" style="background: ${colorMap[status]}">
        <span>📡</span>
      </div>
    `,
    className: 'device-marker-wrapper',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};
```

### Marker Clustering

```typescript
import MarkerClusterGroup from 'react-leaflet-cluster';

<MarkerClusterGroup
  chunkedLoading
  maxClusterRadius={50}
  spiderfyOnMaxZoom={true}
  showCoverageOnHover={false}
>
  {incidents.map(incident => (
    <Marker key={incident.incident_id} {...} />
  ))}
</MarkerClusterGroup>
```

### Heatmap Layer

```typescript
import { useMap } from 'react-leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ incidents }) => {
  const map = useMap();
  
  useEffect(() => {
    const points = incidents.map(i => [
      i.location.lat,
      i.location.lng,
      i.threat_level === 'HIGH' ? 1.0 : i.threat_level === 'MEDIUM' ? 0.6 : 0.3
    ]);
    
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.0: '#22c55e',
        0.5: '#f59e0b',
        1.0: '#ef4444'
      }
    }).addTo(map);
    
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [incidents, map]);
  
  return null;
};
```

---


## 10. Demo Mode Implementation

### Environment Configuration

```bash
# .env.development
VITE_DEMO_MODE=true
VITE_API_ENDPOINT=http://localhost:3000/api
VITE_AWS_REGION=us-east-1

# .env.production
VITE_DEMO_MODE=false
VITE_API_ENDPOINT=https://api.agrishield.example.com/v1
```

### Demo Data Service

```typescript
// services/demoDataService.ts
import incidentsData from '../demo-data/incidents.json';
import devicesData from '../demo-data/devices.json';

const DEMO_DELAY = 300; // Simulate network latency

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const demoDataService = {
  async getIncidents(filters?: Filters): Promise<IncidentsResponse> {
    await delay(DEMO_DELAY);
    
    let filtered = incidentsData;
    
    // Apply filters
    if (filters?.species?.length) {
      filtered = filtered.filter(i => filters.species.includes(i.species));
    }
    
    if (filters?.start_time) {
      filtered = filtered.filter(i => i.timestamp >= filters.start_time);
    }
    
    if (filters?.threat_level?.length) {
      filtered = filtered.filter(i => filters.threat_level.includes(i.threat_level));
    }
    
    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    const paginated = filtered.slice(offset, offset + limit);
    
    return {
      incidents: paginated,
      total: filtered.length,
      limit,
      offset
    };
  },
  
  async getIncidentById(id: string): Promise<Incident> {
    await delay(DEMO_DELAY);
    const incident = incidentsData.find(i => i.incident_id === id);
    if (!incident) throw new Error('Incident not found');
    return incident;
  },
  
  async getDevices(): Promise<DevicesResponse> {
    await delay(DEMO_DELAY);
    return { devices: devicesData };
  },
  
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(DEMO_DELAY);
    // Accept any credentials in demo mode
    return {
      access_token: 'demo_token_' + Date.now(),
      user: {
        id: 'demo_user',
        email,
        role: 'ranger'
      }
    };
  }
};
```

### API Service with Demo Mode Toggle

```typescript
// services/apiService.ts
import { demoDataService } from './demoDataService';
import axios from 'axios';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const apiService = {
  async getIncidents(filters?: Filters) {
    if (isDemoMode) {
      return demoDataService.getIncidents(filters);
    }
    
    const response = await axios.get('/incidents', { params: filters });
    return response.data;
  },
  
  async getIncidentById(id: string) {
    if (isDemoMode) {
      return demoDataService.getIncidentById(id);
    }
    
    const response = await axios.get(`/incidents/${id}`);
    return response.data;
  },
  
  async getDevices() {
    if (isDemoMode) {
      return demoDataService.getDevices();
    }
    
    const response = await axios.get('/devices');
    return response.data;
  },
  
  async login(email: string, password: string) {
    if (isDemoMode) {
      return demoDataService.login(email, password);
    }
    
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
  }
};
```

### Demo Mode Banner

```tsx
// components/DemoModeBanner.tsx
export const DemoModeBanner = () => {
  if (import.meta.env.VITE_DEMO_MODE !== 'true') return null;
  
  return (
    <div className="demo-banner">
      <span className="demo-icon">🎭</span>
      <span className="demo-text">DEMO MODE</span>
      <span className="demo-description">
        Using seeded data - no backend required
      </span>
    </div>
  );
};

// Styles
.demo-banner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%);
  border-bottom: 1px solid #f59e0b;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}
```

---


## 11. Acceptance Criteria Checklist

### Authentication (P0)

- [ ] Login page displays with email and password fields
- [ ] Valid credentials redirect to dashboard
- [ ] Invalid credentials show error message
- [ ] "Remember me" checkbox persists session for 7 days
- [ ] Logout button clears session and redirects to login
- [ ] Protected routes redirect to login when not authenticated
- [ ] JWT token stored securely (localStorage or httpOnly cookie)
- [ ] Token refresh handled automatically before expiry
- [ ] Demo mode bypasses authentication (any credentials work)

### Map Visualization (P0)

- [ ] Map loads with correct center coordinates from env config
- [ ] Incident markers display with species-specific icons
- [ ] Device markers display with status color coding
- [ ] Clicking incident marker opens detail panel
- [ ] Clicking device marker shows device info tooltip
- [ ] Map supports pan and zoom interactions
- [ ] Zoom controls (+/-) visible and functional
- [ ] Heatmap layer toggles on/off via control button
- [ ] Heatmap intensity reflects threat levels (red=HIGH, yellow=MEDIUM, green=LOW)
- [ ] Marker clustering works when zoomed out (>50 markers nearby)
- [ ] Map renders 100+ markers without lag (<500ms)
- [ ] Map viewport persists in session storage

### Incident Alerts Table (P0)

- [ ] Table displays all required columns (Time, Species, Threat, Location, Confidence)
- [ ] Timestamps show as relative time (e.g., "2m ago", "1h ago")
- [ ] Species column shows icon + name
- [ ] Threat level displays as colored badge (RED/YELLOW/GREEN)
- [ ] Confidence shows as percentage (0-100%)
- [ ] Clicking table row opens incident detail view
- [ ] Table sorts by column when header clicked
- [ ] Sort direction toggles (asc/desc) on repeated clicks
- [ ] Pagination controls display (Prev/Next, page number)
- [ ] Pagination shows "Page X of Y"
- [ ] Prev button disabled on first page
- [ ] Next button disabled on last page
- [ ] Empty state displays when no incidents found
- [ ] Loading skeleton shows during data fetch

### Filtering (P0)

- [ ] Species filter shows all species as checkboxes
- [ ] Multiple species can be selected simultaneously
- [ ] Time range dropdown includes all options (1h, 6h, 24h, 7d, Custom)
- [ ] Custom date picker allows start/end date selection
- [ ] Threat level filter allows multi-select (HIGH, MEDIUM, LOW)
- [ ] Device filter dropdown lists all registered devices
- [ ] Filters apply automatically with 300ms debounce
- [ ] Active filters display as removable chips
- [ ] Clicking chip "X" removes that filter
- [ ] "Clear All" button resets all filters to defaults
- [ ] Filter state persists in URL query params
- [ ] Map and table update together when filters change
- [ ] Filter changes trigger loading state

### Incident Detail View (P0)

- [ ] Modal/panel opens when incident selected
- [ ] Detection image displays (or placeholder if unavailable)
- [ ] Species name and icon shown
- [ ] Confidence score displays as percentage
- [ ] Threat level badge shown with correct color
- [ ] Location name and coordinates displayed
- [ ] Map thumbnail shows incident location
- [ ] Timestamp shows full date and time
- [ ] Device ID and name displayed
- [ ] Deterrence actions listed (sound, lights)
- [ ] Audio player available if audio clip exists
- [ ] Status dropdown allows changing incident status (admin only)
- [ ] Notes textarea allows adding comments (admin only)
- [ ] "Mark as Reviewed" button updates status
- [ ] Close button dismisses modal
- [ ] Clicking outside modal closes it
- [ ] ESC key closes modal

### Device Status Panel (P0)

- [ ] Panel displays all registered devices
- [ ] Each device shows online/offline/degraded status
- [ ] Status indicator uses correct color (green/red/yellow)
- [ ] Last heartbeat timestamp shown as relative time
- [ ] Battery level displays as percentage (if available)
- [ ] Signal strength indicator shown (if available)
- [ ] Total incidents in last 24h displayed per device
- [ ] Clicking device card opens device detail view
- [ ] "Locate on Map" button centers map on device
- [ ] Offline devices show alert badge if offline >30min
- [ ] Device list updates every 30 seconds (if real-time enabled)

### Responsive Layout (P0)

- [ ] Desktop layout (1024px+) shows sidebar + map + table side-by-side
- [ ] Tablet layout (768-1023px) stacks map and table vertically
- [ ] Tablet sidebar collapses to hamburger menu
- [ ] Mobile layout (320-767px) shows single-column layout
- [ ] Filter panel collapses to dropdown on tablet/mobile
- [ ] Device status panel scrolls horizontally on tablet
- [ ] Touch interactions work on mobile (tap markers, swipe map)
- [ ] Text remains readable at all breakpoints (min 14px)
- [ ] Buttons remain tappable on mobile (min 44x44px)

### Demo Mode (P0)

- [ ] Demo mode activates when VITE_DEMO_MODE=true
- [ ] Demo banner displays in header
- [ ] Login accepts any email/password combination
- [ ] Incidents load from demo-data/incidents.json
- [ ] Devices load from demo-data/devices.json
- [ ] API calls simulate 200-500ms latency
- [ ] Filters work with demo data
- [ ] Pagination works with demo data
- [ ] No actual API requests made in demo mode
- [ ] Console logs "Running in demo mode" on startup
- [ ] Demo data includes 50 incidents across 7 days
- [ ] Demo data includes 5 devices with varied status

### Performance (P0)

- [ ] Initial page load completes in <2 seconds (4G connection)
- [ ] Time to Interactive <3 seconds
- [ ] Map renders in <500ms with 100 markers
- [ ] Table pagination responds in <100ms
- [ ] Filter updates complete in <200ms
- [ ] Images lazy load below the fold
- [ ] Code splitting by route implemented
- [ ] Production build size <500KB (gzipped)
- [ ] Lighthouse Performance score >90

### Error Handling (P0)

- [ ] Network errors show toast notification
- [ ] API errors display user-friendly message
- [ ] Failed requests show "Retry" button
- [ ] Form validation errors display inline
- [ ] Session expiry redirects to login with message
- [ ] Empty states show helpful illustrations
- [ ] Error boundary catches critical failures
- [ ] Console errors logged for debugging
- [ ] No unhandled promise rejections

### Accessibility (Best Effort)

- [ ] All interactive elements keyboard accessible
- [ ] Tab order follows logical flow
- [ ] Focus indicators visible on all focusable elements
- [ ] ARIA labels on map markers and icons
- [ ] Color contrast ratio >4.5:1 for text
- [ ] Form inputs have associated labels
- [ ] Error messages announced to screen readers
- [ ] Skip to main content link available
- [ ] Alt text on all images

---


## 12. Project Structure

### Recommended Directory Layout (Vite + React)

```
agrishield-dashboard/
├── public/
│   ├── demo-data/
│   │   ├── incidents.json
│   │   ├── devices.json
│   │   └── images/
│   │       ├── elephant-001.jpg
│   │       ├── boar-001.jpg
│   │       └── ...
│   ├── sounds/
│   │   ├── elephant-deterrent.wav
│   │   └── boar-deterrent.wav
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorState.tsx
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── DemoModeBanner.tsx
│   │   ├── map/
│   │   │   ├── MapView.tsx
│   │   │   ├── IncidentMarker.tsx
│   │   │   ├── DeviceMarker.tsx
│   │   │   ├── HeatmapLayer.tsx
│   │   │   ├── MapControls.tsx
│   │   │   └── IncidentPopup.tsx
│   │   ├── incidents/
│   │   │   ├── AlertsTable.tsx
│   │   │   ├── AlertRow.tsx
│   │   │   ├── IncidentDetailModal.tsx
│   │   │   └── IncidentFilters.tsx
│   │   ├── devices/
│   │   │   ├── DeviceCard.tsx
│   │   │   ├── DeviceList.tsx
│   │   │   ├── DeviceDetailModal.tsx
│   │   │   └── DeviceStatusPanel.tsx
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       └── PrivateRoute.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── IncidentsPage.tsx
│   │   ├── DevicesPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   ├── apiService.ts
│   │   ├── demoDataService.ts
│   │   ├── authService.ts
│   │   └── mapService.ts
│   ├── stores/
│   │   ├── useAuthStore.ts
│   │   ├── useIncidentsStore.ts
│   │   ├── useDevicesStore.ts
│   │   ├── useFiltersStore.ts
│   │   └── useUIStore.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useIncidents.ts
│   │   ├── useDevices.ts
│   │   ├── useFilters.ts
│   │   └── useMediaQuery.ts
│   ├── types/
│   │   ├── incident.ts
│   │   ├── device.ts
│   │   ├── auth.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── tailwind.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.development
├── .env.production
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### Key Configuration Files

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'map-vendor': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});
```

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

**package.json** (key dependencies):
```json
{
  "name": "agrishield-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "leaflet.heat": "^0.2.0",
    "react-leaflet-cluster": "^2.1.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/leaflet": "^1.9.8",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1"
  }
}
```

---


## 13. Implementation Phases

### Phase 1: Foundation (Days 1-2)

**Goal**: Basic project setup and authentication

**Tasks**:
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Set up routing (React Router)
- [ ] Create basic layout components (Sidebar, Header)
- [ ] Implement login page UI
- [ ] Set up Zustand stores (auth, UI)
- [ ] Create demo data service
- [ ] Implement authentication flow (demo mode)
- [ ] Add protected route wrapper

**Deliverable**: Working login flow that redirects to empty dashboard

---

### Phase 2: Map & Data Display (Days 3-4)

**Goal**: Core visualization features

**Tasks**:
- [ ] Integrate Leaflet.js
- [ ] Create MapView component
- [ ] Implement incident markers with custom icons
- [ ] Add device markers with status colors
- [ ] Create incidents table component
- [ ] Implement pagination logic
- [ ] Add sorting functionality
- [ ] Create incident detail modal
- [ ] Load demo data (incidents.json, devices.json)
- [ ] Connect stores to components

**Deliverable**: Dashboard showing map with markers and sortable table

---

### Phase 3: Filtering & Interactions (Days 5-6)

**Goal**: User interactions and filtering

**Tasks**:
- [ ] Create filter panel component
- [ ] Implement species filter (checkboxes)
- [ ] Implement time range filter (dropdown + date picker)
- [ ] Implement threat level filter
- [ ] Add active filter chips
- [ ] Connect filters to data fetching
- [ ] Add URL query param persistence
- [ ] Implement marker click handlers
- [ ] Add heatmap layer toggle
- [ ] Create device status panel
- [ ] Add map controls (zoom, fullscreen)

**Deliverable**: Fully interactive dashboard with working filters

---

### Phase 4: Polish & Optimization (Days 7-8)

**Goal**: Production-ready quality

**Tasks**:
- [ ] Add loading skeletons
- [ ] Implement empty states
- [ ] Add error handling and retry logic
- [ ] Create toast notification system
- [ ] Optimize map performance (clustering)
- [ ] Add responsive breakpoints
- [ ] Implement demo mode banner
- [ ] Add keyboard navigation
- [ ] Optimize bundle size (code splitting)
- [ ] Add ARIA labels for accessibility
- [ ] Test on multiple browsers
- [ ] Fix any visual bugs

**Deliverable**: Polished, responsive, production-ready dashboard

---

### Phase 5: Deployment & Demo (Day 9)

**Goal**: Live deployment and demo preparation

**Tasks**:
- [ ] Build production bundle
- [ ] Deploy to Vercel/Netlify
- [ ] Configure environment variables
- [ ] Test live deployment
- [ ] Create demo script (3-5 minutes)
- [ ] Record demo video
- [ ] Prepare presentation slides
- [ ] Document any known limitations

**Deliverable**: Live demo link + video + documentation

---

## 14. Testing Strategy

### Manual Testing Checklist

**Authentication**:
- [ ] Login with valid credentials (demo mode)
- [ ] Login with invalid credentials (should fail gracefully)
- [ ] Logout and verify redirect
- [ ] Protected route access without auth
- [ ] Session persistence after refresh

**Map Functionality**:
- [ ] Map loads with correct center
- [ ] All incident markers visible
- [ ] Click marker opens detail panel
- [ ] Device markers show correct status colors
- [ ] Heatmap toggle works
- [ ] Zoom controls functional
- [ ] Pan and zoom interactions smooth

**Table Functionality**:
- [ ] Table displays all incidents
- [ ] Sorting by each column works
- [ ] Pagination controls functional
- [ ] Click row opens detail modal
- [ ] Empty state displays when no data

**Filtering**:
- [ ] Species filter updates results
- [ ] Time range filter works
- [ ] Threat level filter works
- [ ] Multiple filters combine correctly
- [ ] Clear all resets filters
- [ ] Filter chips removable
- [ ] URL params update with filters

**Responsive Design**:
- [ ] Desktop layout (1440px)
- [ ] Laptop layout (1024px)
- [ ] Tablet layout (768px)
- [ ] Mobile layout (375px)
- [ ] Touch interactions on mobile

**Performance**:
- [ ] Initial load <2 seconds
- [ ] Map renders 100 markers smoothly
- [ ] Filter updates <200ms
- [ ] No console errors
- [ ] Lighthouse score >90

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 15. Deployment Guide

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
VITE_DEMO_MODE=true
VITE_API_ENDPOINT=https://api.agrishield.example.com/v1
VITE_AWS_REGION=us-east-1
VITE_MAP_CENTER_LAT=-1.2921
VITE_MAP_CENTER_LNG=36.8219
```

### Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Or use netlify.toml
```

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### GitHub Pages Deployment

```bash
# Install gh-pages
npm i -D gh-pages

# Add to package.json scripts
"deploy": "vite build && gh-pages -d dist"

# Deploy
npm run deploy
```

---

*Document Version: 1.0*  
*Last Updated: March 2, 2026*  
*Ready for Implementation: Yes*
