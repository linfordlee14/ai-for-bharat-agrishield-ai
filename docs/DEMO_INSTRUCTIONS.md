# AgriShield AI - Demo Instructions

## Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Running the Application

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies** (first time only)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to: `http://localhost:5173`
   - The application will open automatically

### Demo Credentials

The application is running in **DEMO MODE** with mock data.

**Ranger Account:**
- Email: `ranger@agrishield.ai`
- Password: `ranger123`

**Admin Account:**
- Email: `admin@agrishield.ai`
- Password: `admin123`

## Features to Demonstrate

### 1. Dashboard
- **Location**: India (Karnataka region) - map now shows correct location
- **Statistics**: View total incidents and breakdown by threat level
- **Interactive Map**: Click on incident markers to see details
- **Incident Details**: Full modal with species, confidence, threat level, location, and evidence links

### 2. Incidents Page
- **Complete History**: Table view of all incidents
- **Filtering**: 
  - By threat level (All, High, Medium, Low)
  - By species (dropdown with all detected species)
- **Export**: 
  - Export to CSV for Excel analysis
  - Export to JSON for data processing
- **Details**: Click "View Details" to see full incident information

### 3. Devices Page
- **Device Grid**: Cards showing all 5 devices
- **Status Filtering**: View All, Online, or Offline devices
- **Device Details**: Click any device card to see:
  - Complete configuration
  - Software versions
  - Location coordinates
  - Alert contacts
  - Monitoring schedule

### 4. Settings Page
- **Device Selection**: Choose a device from the sidebar
- **Configuration**:
  - Adjust confidence threshold (0.5 - 0.95)
  - Change frame rate (5-30 fps)
  - Enable/disable deterrence system
  - Set monitoring hours
  - Configure sync interval
- **System Info**: View demo mode status and version

## Demo Data

### Devices (5 total)
- **agrishield-device-001**: Farm Block A - North Sector (Online)
- **agrishield-device-002**: Farm Block B - East Sector (Online)
- **agrishield-device-003**: Farm Block C - South Sector (Online)
- **agrishield-device-004**: Farm Block D - West Sector (Offline)
- **agrishield-device-005**: Farm Block E - Central Sector (Online)

### Incidents (17 total)
- **5 HIGH threat**: Elephants and Leopards
- **6 MEDIUM threat**: Wild Boars
- **6 LOW threat**: Deer and Humans

### Species Detected
- Elephant
- Leopard
- Boar
- Deer
- Human
- Unknown

## Key Features Demonstrated

### ✅ Complete UI/UX
- Professional design with consistent styling
- Responsive layout (works on mobile, tablet, desktop)
- Smooth transitions and hover effects
- Intuitive navigation with active page highlighting

### ✅ Data Visualization
- Interactive map with marker clustering
- Statistics cards with real-time counts
- Color-coded threat levels (Red=High, Yellow=Medium, Blue=Low)
- Device status indicators (Green=Online, Red=Offline)

### ✅ Data Management
- Filter incidents by threat level and species
- Export data to CSV or JSON
- View detailed information in modals
- Configure device settings

### ✅ User Experience
- Demo mode indicator (yellow badge)
- Loading states for async operations
- Error handling with clear messages
- Logout functionality

## Navigation Flow

```
Login Page
    ↓
Dashboard (Map View)
    ↓
[Navigation Bar]
    ├── Dashboard → View map and statistics
    ├── Incidents → View table, filter, export
    ├── Devices → View status, configure
    └── Settings → Adjust device configuration
```

## Technical Details

### Frontend Stack
- React 18 with TypeScript
- React Router for navigation
- React Query for data management
- Tailwind CSS for styling
- Leaflet for map visualization

### Mock Data
- All data is generated locally
- No backend connection required
- Realistic timestamps and coordinates
- India location (Karnataka region)

### Configuration
- Demo mode: `VITE_MOCK_API=true` in `.env`
- Map center: India (20.5937°N, 78.9629°E)
- All settings in `frontend/.env`

## Troubleshooting

### Port Already in Use
If port 5173 is already in use:
```bash
npm run dev -- --port 3000
```

### Build Issues
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Map Not Loading
Check browser console for errors. Ensure internet connection for map tiles.

## Production Build

To create a production build:
```bash
npm run build
```

The build output will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Next Steps

### For AWS Deployment
1. Implement backend Lambda functions
2. Set up DynamoDB tables
3. Configure S3 for media storage
4. Set up Cognito for authentication
5. Deploy frontend to CloudFront
6. Update `.env` with production values
7. Set `VITE_MOCK_API=false`

### For Hoang
When ready to deploy to AWS:
1. Follow instructions in `DEPLOYMENT_GUIDE.md`
2. Use `cloud/scripts/deploy.sh` for automated deployment
3. Configure environment variables in AWS
4. Test with real devices

## Support

For issues or questions:
- Check `COMPLETION_SUMMARY.md` for feature details
- Review `TROUBLESHOOTING.md` for common issues
- Check browser console for error messages

---

**Note**: This is a fully functional demo application. All features work with mock data. Backend implementation is required for production use with real devices.
