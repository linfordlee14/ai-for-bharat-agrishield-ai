# AgriShield AI - Quick Start Guide

Get the AgriShield AI system up and running in minutes.

---

## 🚀 Quick Demo (Mock Mode)

Run the frontend demo without AWS infrastructure:

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Verify mock mode is enabled
cat .env
# Should show: VITE_MOCK_API=true

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to: http://localhost:5173

# 6. Login with demo credentials
# Ranger: ranger@agrishield.ai / ranger123
# Admin: admin@agrishield.ai / admin123
```

**That's it!** You should see the dashboard with mock incidents on a map.

---

## 📋 Prerequisites

### For Demo Mode
- Node.js 18+ and npm
- Modern web browser

### For Production Deployment
- Everything above, plus:
- AWS account with admin access
- AWS CLI configured
- AWS CDK CLI: `npm install -g aws-cdk`
- Python 3.9+ (for edge device)

---

## 🎯 Common Tasks

### Run Frontend Demo
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
# Output in: frontend/dist/
```

### Check for Errors
```bash
cd frontend
npm run type-check
```

### Deploy Cloud Infrastructure
```bash
cd cloud
npm install
cdk bootstrap  # First time only
cdk deploy --all
```

### Provision Edge Device
```bash
cd cloud/scripts
./provision-device.sh device-001 "Field Station Alpha"
```

---

## 🔧 Configuration

### Switch to Production Mode

1. Edit `frontend/.env`:
```env
VITE_MOCK_API=false
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

2. Rebuild:
```bash
npm run build
```

### Switch Back to Demo Mode

1. Edit `frontend/.env`:
```env
VITE_MOCK_API=true
```

2. Restart dev server:
```bash
npm run dev
```

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
npm install
npm run dev
```

### "global is not defined" error
```bash
# Restart dev server
# Press Ctrl+C, then:
npm run dev
```

### Can't login
- Verify `VITE_MOCK_API=true` in `.env`
- Use demo credentials: `ranger@agrishield.ai` / `ranger123`
- Clear browser cache (Ctrl+Shift+R)

### Map not showing
- Check browser console for errors
- Verify internet connection (map tiles load from OpenStreetMap)
- Try refreshing the page

---

## 📚 Documentation

- **Full Setup**: See `SETUP.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: See `TROUBLESHOOTING.md`
- **Production Readiness**: See `PRODUCTION_READINESS.md`
- **Stability Report**: See `STABILITY_REPORT.md`

---

## 🎓 Demo Credentials

### Ranger Account (Read-Only)
- **Email**: ranger@agrishield.ai
- **Password**: ranger123
- **Permissions**: View incidents, view devices

### Admin Account (Full Access)
- **Email**: admin@agrishield.ai
- **Password**: admin123
- **Permissions**: All ranger permissions + device configuration

---

## 📊 What You'll See

### Dashboard Features
- **Map**: Interactive map with incident markers
- **Markers**: Color-coded by threat level
  - 🔴 Red = HIGH threat (Elephant, Leopard)
  - 🟠 Orange = MEDIUM threat (Boar, Human)
  - 🟡 Yellow = LOW threat (Deer, Unknown)
- **Popups**: Click markers to see incident details
- **Header**: Shows logged-in user and role

### Mock Data Includes
- 17 incidents around Nairobi, Kenya
- 5 devices with telemetry
- 2 movement events
- Various species: Elephants, Leopards, Boars, Deer, Humans

---

## 🚦 Status Indicators

### Application is Working When:
- ✅ Dev server starts without errors
- ✅ Browser console shows "🎭 Running in MOCK MODE"
- ✅ Login page displays with demo credentials
- ✅ Dashboard loads with map and markers
- ✅ Clicking markers shows incident details
- ✅ Header shows user name and role badge

### Something is Wrong If:
- ❌ Blank white screen
- ❌ "global is not defined" error
- ❌ "Cannot find module" errors
- ❌ Map area is blank
- ❌ Login redirects in a loop

**Solution**: See `TROUBLESHOOTING.md` for detailed fixes.

---

## 🔄 Development Workflow

### 1. Make Changes
Edit files in `frontend/src/`

### 2. Hot Reload
Changes appear automatically (Vite HMR)

### 3. Check for Errors
```bash
npm run type-check
```

### 4. Build for Production
```bash
npm run build
```

### 5. Test Production Build
```bash
npm run preview
```

---

## 📦 Project Structure

```
agrishield-ai/
├── frontend/          # React dashboard
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API & auth services
│   │   ├── mocks/       # Mock data
│   │   └── types/       # TypeScript types
│   └── .env           # Configuration
├── cloud/             # AWS CDK infrastructure
│   ├── lib/           # CDK stacks
│   └── lambda/        # Lambda functions
├── edge/              # Edge device code
│   ├── src/           # Python modules
│   └── tests/         # Unit tests
└── docs/              # Documentation
```

---

## 🎯 Next Steps

### For Demo/Development
1. ✅ Run frontend in mock mode
2. Explore the dashboard
3. Try both ranger and admin accounts
4. Review the code structure

### For Production Deployment
1. Review `PRODUCTION_READINESS.md`
2. Follow `DEPLOYMENT_GUIDE.md`
3. Deploy cloud infrastructure
4. Configure Cognito credentials
5. Test real authentication

---

## 💡 Tips

- **Mock Mode**: Perfect for frontend development without AWS costs
- **Hot Reload**: Changes appear instantly during development
- **TypeScript**: Catches errors before runtime
- **Console Logs**: Check browser console for helpful debug info
- **Demo Credentials**: Always visible on login page in mock mode

---

## 🆘 Need Help?

1. **Check Documentation**: See `TROUBLESHOOTING.md`
2. **Review Logs**: Check browser console (F12)
3. **Verify Configuration**: Check `.env` file
4. **Clean Install**: Delete `node_modules` and reinstall
5. **Check Status**: See `STABILITY_REPORT.md`

---

## ✅ Success Checklist

Before considering the demo successful:

- [ ] Frontend starts without errors
- [ ] Can login with demo credentials
- [ ] Dashboard displays with map
- [ ] Incident markers are visible
- [ ] Clicking markers shows popups
- [ ] Can logout successfully
- [ ] Can switch between ranger and admin accounts

---

**Ready to start?** Run `cd frontend && npm run dev` and open http://localhost:5173

**Questions?** Check the documentation files in the project root.

**Status**: ✅ Application is stable and ready to use!
