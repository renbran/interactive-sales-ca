# Call Persistence Testing Guide

## Issue Reported
"Calls not saving - gone once refreshed"

## Fixes Applied

### 1. **Auto-Lead Creation** ✅
- Now automatically creates a lead from prospect info if none exists
- No longer requires pre-existing lead from Lead Management
- Lead is created with source: 'call-app' for tracking

### 2. **Worker Routes Updated** ✅
- Added route for `scholarix-crm.pages.dev/api/*`
- Worker now handles API calls from both domains

### 3. **Enhanced Error Logging** ✅
- Console shows API_BASE_URL being used
- Logs authentication status
- Shows full API error responses
- Tracks lead creation and call save steps

### 4. **Better User Feedback** ✅
- Success message: "Call saved and synced to cloud!"
- Error messages include specific reasons
- Warning if not logged in: "Sign in to sync across devices"

## Testing Instructions

### Step 1: Open Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Keep it open during testing

### Step 2: Clear Everything (Fresh Start)
```javascript
// Paste this in console to clear local data
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 3: Sign In
1. Go to https://scholarix-crm.pages.dev
2. Sign in with Clerk
3. Console should show: "No user logged in, using local storage only" → then loads after login

### Step 4: Start a Call (WITHOUT Creating Lead First)
1. Click **"New Call"** or **"Start Call"** button
2. Fill in prospect info:
   - Name: Test Prospect
   - Email: test@example.com
   - Phone: +1234567890
   - Company: Test Company
3. Start the call

### Step 5: Complete the Call
1. Navigate through the call script
2. Mark some qualification checkpoints
3. Click **"End Call"**
4. Add notes in the summary
5. Click **"Save"**

### Step 6: Check Console Logs

**Expected Logs:**
```
API_BASE_URL: /api
User authenticated: true
No lead ID found, creating lead from prospect info...
Lead created with ID: 123
Saving call with lead ID: 123
✅ Loaded 1 calls from backend
Call saved to backend successfully
```

**Success Toast:**
```
✅ "Call saved and synced to cloud!"
```

### Step 7: CRITICAL TEST - Refresh Browser
1. Press **F5** or click refresh
2. Wait for page to load
3. Navigate to Call History

**Expected Result:**
✅ Your call is still there!

**Console Should Show:**
```
Loading call history from: /api
✅ Loaded 1 calls from backend
```

### Step 8: Verify Data
Check that saved call includes:
- ✅ Prospect name
- ✅ Duration
- ✅ Notes
- ✅ Outcome
- ✅ Qualification score

## If It Still Doesn't Work

### Check 1: Are You Logged In?
```javascript
// Check in console:
console.log('Logged in:', !!window.Clerk?.user);
```

### Check 2: API Endpoint Accessible?
```javascript
// Test API connection:
fetch('/api/calls', {
  headers: {
    'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
  }
}).then(r => console.log('API Status:', r.status));
```

### Check 3: Look for Errors
In console, look for:
- ❌ Red error messages
- ❌ "Failed to save call to backend"
- ❌ "Failed to create lead"
- ❌ Network errors (ERR_CONNECTION_REFUSED, etc.)

### Check 4: Network Tab
1. Go to **Network** tab in DevTools
2. Filter by **XHR** or **Fetch**
3. Look for:
   - POST `/api/leads` - Should be 200 or 201
   - POST `/api/calls` - Should be 200 or 201
   - GET `/api/calls?limit=50` - Should be 200

## Common Issues & Solutions

### Issue: "Call saved locally but failed to sync"
**Cause:** API endpoint not reachable or authentication failed

**Solutions:**
1. Check if you're logged in
2. Refresh Clerk session: Sign out and back in
3. Check Network tab for 401/403 errors
4. Verify worker is deployed: https://scholarix-crm.renbranmadelo.workers.dev

### Issue: "Failed to create lead: 400"
**Cause:** Invalid data sent to API

**Solution:**
Check console for exact error message:
```javascript
// Look for line like:
"API Error Response: 400 {error message}"
```

### Issue: Calls load on refresh but old ones are missing
**Cause:** Calls were only saved to localStorage before the fix

**Solution:**
Old calls in localStorage won't be in database. Only new calls (after this fix) will persist.

### Issue: "CORS error"
**Cause:** Worker route not configured for domain

**Solution:**
Worker routes are now configured. If still happening:
1. Clear browser cache
2. Hard refresh (Ctrl+F5)
3. Check worker deployment succeeded

## Debug Commands

### Check Current State
```javascript
// Paste in console:
console.log('Environment:', {
  apiUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  user: !!window.Clerk?.user,
  userId: window.Clerk?.user?.id,
  localCalls: JSON.parse(localStorage.getItem('scholarix-call-history') || '[]').length
});
```

### Force Reload from Backend
```javascript
// Paste in console:
localStorage.removeItem('scholarix-call-history');
location.reload();
```

### Check Worker Health
```javascript
// Test worker directly:
fetch('https://scholarix-crm.renbranmadelo.workers.dev/api/calls')
  .then(r => console.log('Worker status:', r.status))
  .catch(e => console.error('Worker error:', e));
```

## Expected Timeline

- **Deployment:** ~5 minutes (automatic on git push)
- **Propagation:** ~2 minutes (Cloudflare Pages)
- **Testing:** ~5 minutes to verify

## Report Template

If still broken, provide:

```
Browser: Chrome 120 / Firefox 115 / Safari 17
OS: Windows 11 / Mac / iOS / Android
Logged In: Yes/No
User ID: (from console: window.Clerk?.user?.id)

Console Errors:
[Paste any red errors here]

Network Tab:
- POST /api/leads: [status code]
- POST /api/calls: [status code]
- GET /api/calls: [status code]

Steps Taken:
1. 
2. 
3. 

Expected: Calls persist after refresh
Actual: Calls disappear after refresh
```

---

**Status:** ✅ Fixed - Deployed October 28, 2025
**Test After:** 5 minutes from now
**Priority:** CRITICAL
