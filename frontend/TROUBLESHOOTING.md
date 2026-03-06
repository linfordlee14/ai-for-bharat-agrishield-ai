# Troubleshooting Guide

## Blank White Screen

If you see a blank white screen, follow these steps:

### 1. Check Browser Console

Open browser DevTools (F12) and check the Console tab for errors.

### 2. Verify TypeScript Compilation

```bash
cd frontend
npx tsc --noEmit
```

If there are errors, they need to be fixed before the app will run.

### 3. Clear Cache and Rebuild

```bash
# Stop the dev server (Ctrl+C)
rm -rf node_modules dist .vite
npm install
npm run dev
```

### 4. Check Environment Variables

Verify `frontend/.env` contains:
```
VITE_MOCK_API=true
```

### 5. Verify Dependencies

```bash
npm list react react-dom react-router-dom @tanstack/react-query leaflet react-leaflet
```

All should be installed without errors.

### 6. Check Port Availability

If port 5173 is in use:
```bash
npm run dev -- --port 3000
```

## Common Issues

### "Cannot find module" errors

**Solution:**
```bash
npm install
```

### Map not displaying

**Symptoms:** Login works but map area is blank

**Solutions:**
1. Check browser console for Leaflet errors
2. Verify Leaflet CSS is imported in `src/index.css`
3. Check network tab - mock API should return data

### Login redirects in a loop

**Symptoms:** Keeps redirecting between `/` and `/login`

**Solution:** This is normal if not logged in. Use demo credentials:
- `ranger@agrishield.ai` / `ranger123`
- `admin@agrishield.ai` / `admin123`

### TypeScript errors about missing properties

**Solution:** The mock data has been fixed. Pull latest changes or run:
```bash
git pull
npm install
```

### "Failed to fetch" errors

**Symptoms:** Errors in console about network requests

**Solution:** Verify `VITE_MOCK_API=true` in `.env`. If false, it will try to connect to real AWS backend.

## Development Server Issues

### Port already in use

```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Hot reload not working

```bash
# Restart dev server
# Press Ctrl+C then
npm run dev
```

## Build Issues

### Build fails with TypeScript errors

```bash
# Check for errors
npx tsc --noEmit

# Fix errors, then rebuild
npm run build
```

### Build succeeds but preview shows blank screen

```bash
npm run preview
```

Check browser console for errors. May need to adjust base path in `vite.config.ts`.

## Mock Data Issues

### No incidents showing on map

**Check:**
1. Browser console for errors
2. Network tab - should see mock API calls completing
3. React Query DevTools - should show cached data

**Solution:**
```typescript
// In browser console
sessionStorage.clear()
location.reload()
```

### Want to add more mock incidents?

Edit `frontend/src/mocks/mockData.ts` and add to `mockIncidents` array.

## Authentication Issues

### Can't login with demo credentials

**Check:**
1. `.env` has `VITE_MOCK_API=true`
2. Restart dev server after changing `.env`
3. Clear browser cache and session storage

**Solution:**
```javascript
// In browser console
sessionStorage.clear()
localStorage.clear()
location.reload()
```

### Stuck on loading spinner

**Symptoms:** Login page shows loading spinner forever

**Solution:**
1. Check browser console for errors
2. Verify mock auth is working:
```javascript
// In browser console
import { mockLogin } from './src/services/mockAuth'
mockLogin('ranger@agrishield.ai', 'ranger123')
```

## Still Having Issues?

### Get Detailed Logs

```bash
# Run with verbose logging
npm run dev -- --debug
```

### Check File Structure

Verify these files exist:
- `frontend/src/mocks/mockData.ts`
- `frontend/src/mocks/mockApi.ts`
- `frontend/src/services/mockAuth.ts`
- `frontend/.env` (with `VITE_MOCK_API=true`)

### Verify Mock Mode is Active

After starting dev server, check browser console. Should see:
```
🎭 Running in MOCK MODE - using local mock data
```

### Reset Everything

```bash
# Nuclear option - reset everything
cd frontend
rm -rf node_modules dist .vite package-lock.json
npm install
npm run dev
```

## Getting Help

If none of these solutions work:

1. **Check browser console** - Copy any error messages
2. **Check terminal output** - Copy any build errors
3. **Verify Node version** - Run `node --version` (should be 18+)
4. **Check file permissions** - Ensure you can read/write in frontend directory

## Success Indicators

When everything is working correctly, you should see:

✅ Dev server starts without errors  
✅ Browser console shows "🎭 Running in MOCK MODE"  
✅ Login page displays with demo credentials shown  
✅ After login, map loads with colored markers  
✅ Clicking markers shows incident popups  
✅ Header shows user name and role badge  

---

**Last Updated:** After fixing TypeScript errors in mock data


## Cognito "global is not defined" Error

### Symptoms
- Error: `Uncaught ReferenceError: global is not defined`
- Error occurs in `amazon-cognito-identity-js.js` or `buffer/index.js`
- Happens when loading the application

### Cause
The `amazon-cognito-identity-js` library expects Node.js globals (`global`, `process`) that aren't available in the browser environment.

### Solution

The Vite config has been updated to polyfill these globals. If you still see this error:

1. **Verify Vite config** - Check that `frontend/vite.config.ts` contains:
```typescript
export default defineConfig({
  // ...
  define: {
    'global': 'globalThis',
    'process.env': {},
  },
  // ...
})
```

2. **Restart the dev server:**
```bash
# Stop the server (Ctrl+C)
npm run dev
```

3. **Clear browser cache:**
- Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

4. **If still not working, try a full rebuild:**
```bash
rm -rf node_modules/.vite dist
npm run dev
```

### Why This Happens

Vite bundles code for the browser, but some npm packages (like Cognito) were originally written for Node.js. These packages reference Node.js-specific globals like `global` and `process.env`. The fix maps these to browser-compatible equivalents:
- `global` → `globalThis` (available in all modern browsers)
- `process.env` → `{}` (empty object, since we use `import.meta.env` in Vite)

