# AgriShield AI - Demo Mode

This guide explains how to run the AgriShield AI frontend in demo mode with mock data (no AWS backend required).

## Quick Start

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Verify mock mode is enabled:**
   Check that `frontend/.env` contains:
   ```
   VITE_MOCK_API=true
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

5. **Login with demo credentials:**
   - **Ranger Account:**
     - Email: `ranger@agrishield.ai`
     - Password: `ranger123`
     - Access: Read-only (view incidents and devices)
   
   - **Admin Account:**
     - Email: `admin@agrishield.ai`
     - Password: `admin123`
     - Access: Full access (can modify device configurations)

## What You'll See

### Dashboard
- Interactive map centered on Nairobi, Kenya
- 17 mock wildlife incidents with color-coded markers:
  - 🔴 **Red** = HIGH threat (Elephants, Leopards)
  - 🟠 **Orange** = MEDIUM threat (Boars)
  - 🟡 **Yellow** = LOW threat (Deer, Humans, Unknown)
- Marker clustering for dense areas
- Click markers to see incident details

### Mock Data Includes:
- **5 Devices** across different farm sectors
  - 4 online, 1 offline
  - Various firmware and model versions
- **17 Incidents** spanning the last 7 days
  - Mix of species: Elephants, Leopards, Boars, Deer, Humans
  - Different threat levels and confidence scores
  - Realistic GPS coordinates around Nairobi
- **Telemetry Data** for all devices
  - CPU temperature, battery level, disk usage
  - 24 hours of data points (every 5 minutes)
- **2 Movement Events** showing animal migration patterns

## Features Available in Demo Mode

✅ **Authentication**
- Login/logout with mock users
- Role-based access control (ranger vs admin)
- Session management

✅ **Map Visualization**
- Interactive Leaflet map
- Color-coded incident markers
- Marker clustering
- Incident popups with details

✅ **Data Fetching**
- Simulated API delays (500-800ms)
- React Query integration
- Loading states and error handling

✅ **Filtering** (when implemented)
- Filter by device, species, threat level
- Date range filtering
- Real-time map updates

## Mock Data Location

All mock data is defined in:
- `frontend/src/mocks/mockData.ts` - Data definitions
- `frontend/src/mocks/mockApi.ts` - API simulation

You can modify these files to:
- Add more incidents
- Change device locations
- Adjust species distribution
- Test different scenarios

## Switching to Real AWS Backend

To connect to a real AWS backend:

1. **Update `.env`:**
   ```
   VITE_MOCK_API=false
   VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/api
   VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
   VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_AWS_REGION=us-east-1
   ```

2. **Restart the dev server:**
   ```bash
   npm run dev
   ```

The app will now connect to your AWS infrastructure instead of using mock data.

## Development Tips

### Adding New Mock Incidents

Edit `frontend/src/mocks/mockData.ts`:

```typescript
export const mockIncidents: Incident[] = [
  // ... existing incidents
  {
    id: 'incident-018',
    device_id: 'agrishield-device-001',
    timestamp: hoursAgo(1),
    species: 'Elephant',
    confidence: 0.94,
    threat_level: 'HIGH',
    latitude: -1.2900,
    longitude: 36.8250,
    image_url: 'https://example.com/incidents/018/image.jpg',
    audio_url: 'https://example.com/incidents/018/audio.wav',
  },
]
```

### Testing Different User Roles

The mock system supports two roles:

- **Ranger** (`ranger@agrishield.ai`):
  - Can view all incidents and devices
  - Cannot modify device configurations
  - Cannot trigger diagnostics

- **Admin** (`admin@agrishield.ai`):
  - Full access to all features
  - Can modify device configurations
  - Can trigger diagnostics

### Simulating Network Delays

Mock API calls include realistic delays:
- Login: 800ms
- Data fetching: 500-600ms
- Diagnostics: 2000ms

Adjust delays in `frontend/src/mocks/mockApi.ts`:

```typescript
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))
```

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Map not displaying
Check browser console for errors. Ensure Leaflet CSS is imported in `index.css`.

### Login not working
Verify `.env` has `VITE_MOCK_API=true` and restart the dev server.

### No incidents showing
Check browser console. Mock data should load automatically. Try refreshing the page.

## Next Steps

After exploring the demo:

1. **Deploy AWS Infrastructure** - Use the CDK stacks in `cloud/` directory
2. **Implement Remaining Features** - Device management, reporting, filters
3. **Connect Real Edge Devices** - Deploy detection engines to Raspberry Pi devices
4. **Configure Production** - Set up production Cognito, API Gateway, and domains

## Demo Credentials Summary

| Email | Password | Role | Access |
|-------|----------|------|--------|
| ranger@agrishield.ai | ranger123 | Ranger | Read-only |
| admin@agrishield.ai | admin123 | Admin | Full access |

Enjoy exploring AgriShield AI! 🦏🐘🌍
