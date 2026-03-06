# AgriShield AI - Ranger Dashboard

React web application for wildlife incident visualization and device management.

## Features

- **Authentication**: Secure login with Amazon Cognito (ranger and admin roles)
- **Interactive Map**: Leaflet-based map with incident markers, clustering, and heatmap
- **Device Management**: Monitor device status, telemetry, and configuration
- **Incident Reporting**: Generate reports with charts and export to CSV/PDF
- **Movement Tracking**: Visualize wildlife movement patterns across devices
- **Real-time Updates**: React Query for automatic data refresh

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Mapping**: Leaflet.js
- **Charts**: Chart.js / Recharts
- **Authentication**: Amazon Cognito

## Prerequisites

- Node.js 18.x or higher
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file with your configuration:

```bash
cp .env.example .env
nano .env
```

Required environment variables:

```env
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_MAP_DEFAULT_CENTER_LAT=-1.2921
VITE_MAP_DEFAULT_CENTER_LNG=36.8219
VITE_MAP_DEFAULT_ZOOM=12
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/
│   └── assets/             # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── auth/           # Authentication components
│   │   ├── map/            # Map visualization components
│   │   ├── devices/        # Device management components
│   │   ├── incidents/      # Incident components
│   │   ├── reports/        # Reporting components
│   │   ├── layout/         # Layout components
│   │   └── common/         # Shared components
│   ├── pages/              # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Devices.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useIncidents.ts
│   │   ├── useDevices.ts
│   │   └── useTelemetry.ts
│   ├── services/           # API services
│   │   ├── api.ts          # Axios client
│   │   ├── auth.ts         # Authentication service
│   │   ├── incidents.ts    # Incidents API
│   │   ├── devices.ts      # Devices API
│   │   └── telemetry.ts    # Telemetry API
│   ├── types/              # TypeScript types
│   │   ├── incident.ts
│   │   ├── device.ts
│   │   ├── telemetry.ts
│   │   ├── user.ts
│   │   └── api.ts
│   ├── utils/              # Utility functions
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── export.ts
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── .env.example            # Environment variables template
├── .eslintrc.cjs           # ESLint configuration
├── .prettierrc             # Prettier configuration
├── index.html              # HTML template
├── package.json            # Dependencies
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md
```

## User Roles

### Ranger (Read-Only)

- View incident map and details
- View device list and status
- View telemetry data
- Generate reports
- Export data to CSV/PDF

### Admin (Full Access)

All ranger permissions plus:
- Update device configuration
- Trigger device diagnostics
- Manage users
- Access audit logs

## Key Components

### Authentication

```typescript
// Login component
import { useAuth } from '@/hooks/useAuth';

function Login() {
  const { login, isLoading, error } = useAuth();
  
  const handleSubmit = async (email: string, password: string) => {
    await login(email, password);
  };
  
  return <LoginForm onSubmit={handleSubmit} />;
}
```

### Map Visualization

```typescript
// Incident map with markers
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useIncidents } from '@/hooks/useIncidents';

function IncidentMap() {
  const { data: incidents } = useIncidents();
  
  return (
    <MapContainer center={[lat, lng]} zoom={12}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {incidents?.map(incident => (
        <Marker 
          key={incident.id} 
          position={[incident.latitude, incident.longitude]}
          icon={getMarkerIcon(incident.threat_level)}
        >
          <Popup>
            <IncidentPopup incident={incident} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Device Management

```typescript
// Device list with status
import { useDevices } from '@/hooks/useDevices';

function DeviceList() {
  const { data: devices } = useDevices();
  
  return (
    <table>
      {devices?.map(device => (
        <tr key={device.device_id}>
          <td>{device.device_id}</td>
          <td>{device.location_name}</td>
          <td>
            <StatusBadge status={device.status} />
          </td>
          <td>{formatDate(device.last_seen)}</td>
        </tr>
      ))}
    </table>
  );
}
```

## API Integration

### Axios Client Configuration

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - add JWT token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### React Query Setup

```typescript
// src/hooks/useIncidents.ts
import { useQuery } from '@tanstack/react-query';
import { getIncidents } from '@/services/incidents';

export function useIncidents(filters?: IncidentFilters) {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => getIncidents(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
```

## Styling

### Tailwind CSS

The application uses Tailwind CSS for styling. Common utility classes:

```tsx
// Buttons
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Click me
</button>

// Cards
<div className="bg-white shadow-md rounded-lg p-6">
  Card content
</div>

// Status badges
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  Online
</span>
```

### Custom Theme

Customize colors in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        danger: '#dc2626',
        warning: '#f59e0b',
        success: '#10b981',
      },
    },
  },
};
```

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Type Checking

```bash
npm run type-check
```

## Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks:
- Runs ESLint on staged files
- Runs Prettier on staged files
- Runs type checking

## Deployment

### Deploy to AWS S3 + CloudFront

```bash
# Build production bundle
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API Gateway URL | `https://api.example.com` |
| `VITE_AWS_REGION` | AWS region | `us-east-1` |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID | `us-east-1_XXXXXXXXX` |
| `VITE_COGNITO_CLIENT_ID` | Cognito Client ID | `XXXXXXXXXXXXXXXXXX` |
| `VITE_MAP_DEFAULT_CENTER_LAT` | Default map latitude | `-1.2921` |
| `VITE_MAP_DEFAULT_CENTER_LNG` | Default map longitude | `36.8219` |
| `VITE_MAP_DEFAULT_ZOOM` | Default map zoom level | `12` |

## Troubleshooting

### Map not loading

Check that Leaflet CSS is imported in `main.tsx`:

```typescript
import 'leaflet/dist/leaflet.css';
```

### Authentication errors

Verify Cognito configuration in `.env` file and ensure the User Pool is properly configured.

### API request failures

Check browser console for CORS errors. Ensure API Gateway has CORS enabled for your frontend domain.

### Build errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Performance Optimization

- Code splitting with React.lazy()
- Image optimization with Vite
- React Query caching reduces API calls
- Marker clustering for large datasets
- Virtual scrolling for long lists

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright © 2024 AgriShield AI. All rights reserved.
