# AgriShield AI - Demo Quick Start 🚀

Get the AgriShield AI dashboard running in **under 2 minutes** with mock data!

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Demo

```bash
npm run dev
```

### 3. Open Your Browser

Navigate to: **http://localhost:5173**

### 4. Login

Use either demo account:

**Ranger (Read-Only):**
- Email: `ranger@agrishield.ai`
- Password: `ranger123`

**Admin (Full Access):**
- Email: `admin@agrishield.ai`
- Password: `admin123`

## What You'll See

🗺️ **Interactive Map** - Wildlife incidents across Kenya  
🔴 **Color-Coded Markers** - RED (high threat), ORANGE (medium), YELLOW (low)  
📊 **17 Mock Incidents** - Elephants, Leopards, Boars, Deer  
🖥️ **5 Mock Devices** - Edge devices with telemetry data  
👤 **Role-Based Access** - Different views for rangers vs admins  

## Demo Features

✅ Authentication with mock users  
✅ Interactive Leaflet map with clustering  
✅ Incident markers with detailed popups  
✅ Realistic data with simulated API delays  
✅ Role-based access control  

## Mock Data Details

- **Location**: Nairobi, Kenya region
- **Incidents**: Last 7 days of wildlife detections
- **Species**: Elephant, Leopard, Boar, Deer, Human, Unknown
- **Devices**: 5 edge devices (4 online, 1 offline)
- **Telemetry**: 24 hours of device metrics

## Customizing Mock Data

Edit `frontend/src/mocks/mockData.ts` to:
- Add more incidents
- Change locations
- Adjust species distribution
- Modify device configurations

## Switching to Real Backend

When ready to connect to AWS:

1. Deploy cloud infrastructure: `cd cloud && npm run deploy`
2. Update `frontend/.env`:
   ```
   VITE_MOCK_API=false
   VITE_API_BASE_URL=https://your-api-url.amazonaws.com/api
   VITE_COGNITO_USER_POOL_ID=your-pool-id
   VITE_COGNITO_CLIENT_ID=your-client-id
   ```
3. Restart: `npm run dev`

## Troubleshooting

**Map not showing?**
- Check browser console for errors
- Ensure port 5173 is not in use
- Try `npm install` again

**Login not working?**
- Verify `.env` has `VITE_MOCK_API=true`
- Restart the dev server
- Clear browser cache

**Need help?**
- See `frontend/DEMO_MODE.md` for detailed documentation
- Check `frontend/README.md` for development guide

---

**Ready to explore?** Login and start clicking on the map markers! 🎯
