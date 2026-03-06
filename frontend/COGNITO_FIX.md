# Cognito Global Error Fix

## Problem
When running the AgriShield frontend, you encountered this error:
```
Uncaught ReferenceError: global is not defined
at node_modules/buffer/index.js (amazon-cognito-identity-js.js)
```

## Root Cause
The `amazon-cognito-identity-js` library was written for Node.js and expects Node.js-specific globals:
- `global` - Node.js global object
- `process.env` - Node.js environment variables

These don't exist in browser environments, causing the error.

## Solution Applied

Updated `frontend/vite.config.ts` to add browser-compatible polyfills:

```typescript
export default defineConfig({
  // ...
  define: {
    'global': 'globalThis',      // Maps Node's 'global' to browser's 'globalThis'
    'process.env': {},            // Provides empty object for process.env
  },
  // ...
})
```

## How to Apply

1. **The fix is already in place** - `vite.config.ts` has been updated

2. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

3. **Clear browser cache:**
   - Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **If still seeing the error:**
   ```bash
   # Clear Vite cache and rebuild
   rm -rf node_modules/.vite dist
   npm run dev
   ```

## Verification

After restarting, the app should load without the `global is not defined` error. You should see:
- Login page loads correctly
- No errors in browser console (except React DevTools suggestion)
- Mock authentication works with demo credentials

## Why This Works

- **`globalThis`** is a standard JavaScript global object available in all modern browsers and Node.js
- **Empty `process.env`** prevents errors when Cognito checks for environment variables
- Vite's `define` option performs compile-time replacements, so `global` becomes `globalThis` in the bundled code

## Related Files

- `frontend/vite.config.ts` - Contains the fix
- `frontend/TROUBLESHOOTING.md` - Full troubleshooting guide with this and other solutions

## Alternative Approaches (Not Used)

We could have also:
1. Installed `vite-plugin-node-polyfills` - Adds more polyfills but increases bundle size
2. Used `buffer` polyfill package - Only needed if using Buffer directly
3. Switched to AWS Amplify - Different auth library, but heavier

The current solution is minimal and sufficient for Cognito to work.

---

**Status:** ✅ Fixed  
**Date:** Context transfer continuation  
**Impact:** Resolves app startup error, enables authentication to work
