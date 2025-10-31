# Production Testing Guide - Backend Auth Fix

## ✅ Deployment Status

**Latest Code Deployed:**
- **Commit:** be894d8 (Clerk JWT verification fix)
- **Deployed:** Just now (less than 1 minute ago)
- **Worker:** ✅ Live (Version 7eb3bbdd)
- **Frontend:** ✅ Live (Deployment 08b666bc)

**URLs:**
- **Production:** https://scholarix-crm.pages.dev
- **Latest Deployment:** https://08b666bc.scholarix-crm.pages.dev
- **Worker API:** https://scholarix-crm.renbranmadelo.workers.dev
- **Health Check:** https://scholarix-crm.renbranmadelo.workers.dev/api/health ✅ OK

---

## 🧪 Step-by-Step Testing Instructions

### IMPORTANT: Clear Your Browser Cache First!

**Before testing, do this:**
1. **Hard Refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Or Clear Cache:**
   - Open DevTools (F12)
   - Right-click on refresh button → "Empty Cache and Hard Reload"
3. **Or Use Incognito:** Open in private/incognito window

---

## Test 1: Verify You're on Latest Deployment

### Steps:
1. Open https://scholarix-crm.pages.dev
2. Open DevTools (F12) → Console tab
3. Type this command:
   ```javascript
   localStorage.getItem('app-version')
   ```
4. Or check the page source for latest code

### Expected:
- Page loads without errors
- Clerk sign-in button appears

---

## Test 2: Sign In and Check User Sync

### Steps:
1. **Sign OUT first** (if already signed in)
   - Click your profile → Sign Out
2. **Close all tabs**
3. **Open fresh tab:** https://scholarix-crm.pages.dev
4. **Sign In** with Clerk
5. **Watch Console** (F12 → Console)

### Expected Console Logs:
```
Syncing user to D1 database: { id: "user_xxx", email: "...", fullName: "...", role: "agent" }
✅ User synced to D1 database successfully
```

### ❌ If You See Error:
**Error:** "Failed to sync user: [message]"
**Solution:** Copy the EXACT error message and share it

---

## Test 3: Make a Call and Save

### Steps:
1. Click "Start New Call"
2. Fill in prospect info
3. Complete the call
4. Click "Save"
5. **Watch Console carefully**

### Expected Console Logs:

**Good Sign (Success):**
```
Saving call to backend: https://scholarix-crm.renbranmadelo.workers.dev/api/calls
Response status: 201
Call saved to backend successfully
✅ Call saved and synced to cloud!
```

**Bad Sign (Still Broken):**
```
Saving call to backend: https://scholarix-crm.renbranmadelo.workers.dev/api/calls
Failed to load calls: 401 {"error":"Unauthorized","message":"..."}
Failed to load calls from server. Using local data.
```

### ❌ If You See 401 Error:
**Check these in Console:**
1. What is the EXACT error message?
2. Does it say "No token provided" or "Invalid token" or something else?
3. Take a screenshot of the Console

---

## Test 4: Refresh and Verify Persistence

### Steps:
1. After saving a call (from Test 3)
2. **Refresh the page** (F5)
3. **Watch Console**

### Expected Console Logs:

**Success:**
```
Loading call history from: https://scholarix-crm.renbranmadelo.workers.dev/api/calls
Raw API response: {calls: [{...}]}
✅ Loaded 1 calls from backend
```

**Still Broken:**
```
Loading call history from: https://scholarix-crm.renbranmadelo.workers.dev/api/calls
Failed to load calls: 401 ...
Failed to load calls from server. Using local data.
```

---

## Test 5: Check Backend Directly (Advanced)

### Get Your Clerk Token:
1. Open Console (F12)
2. Type:
   ```javascript
   await window.Clerk.session.getToken()
   ```
3. Copy the token (starts with "eyJ...")

### Test API with Token:
Open a new terminal/command prompt:

**Windows (Command Prompt):**
```cmd
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" https://scholarix-crm.renbranmadelo.workers.dev/api/auth/me
```

**Expected Success Response:**
```json
{
  "data": {
    "id": 1,
    "clerk_id": "user_xxx",
    "email": "your@email.com",
    "full_name": "Your Name",
    "role": "agent"
  }
}
```

**If Still 401:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid token",
  "hint": "Try signing out and back in"
}
```

---

## 🔍 Common Issues and Solutions

### Issue 1: "User not found in database"

**Error:**
```
401: User not found. Please sync your account first.
```

**Solution:**
1. Sign out completely
2. Close all browser tabs
3. Open fresh tab
4. Sign in again
5. User sync should happen automatically

---

### Issue 2: "Token verification failed"

**Error:**
```
401: Token verification failed
```

**Possible Causes:**
1. Worker secret not updated correctly
2. Token expired
3. Clerk configuration mismatch

**Solution:**
1. Check worker secret is correct
2. Sign out and sign in (get fresh token)
3. Verify CLERK_SECRET_KEY in worker matches your Clerk dashboard

---

### Issue 3: CORS Error

**Error:**
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solution:**
This should be fixed, but if you see it:
1. Check you're accessing https://scholarix-crm.pages.dev (not localhost)
2. Hard refresh (Ctrl+Shift+R)
3. Try incognito window

---

### Issue 4: Old Code Cached

**Symptoms:**
- No console logs about user sync
- Still seeing old error messages
- No "✅ Token verified" logs

**Solution:**
1. Hard refresh: Ctrl+Shift+R
2. Clear all site data:
   - DevTools → Application → Clear storage → Clear site data
3. Use incognito window
4. Try different browser

---

## 📋 What to Share If Still Broken

If you're still seeing errors after all tests, please share:

### 1. Console Logs
Take screenshot of Console showing:
- Error messages (red text)
- Any warnings (yellow text)
- Last 20-30 lines

### 2. Network Tab
1. Open DevTools → Network tab
2. Filter: "calls"
3. Retry saving a call
4. Click on the failed request
5. Screenshot:
   - Request Headers (especially Authorization)
   - Response Headers
   - Response body

### 3. Exact Error Message
Copy and paste the EXACT error text from:
- Toast notifications
- Console errors
- Network response

### 4. Clerk Session Info
```javascript
// In Console, run:
window.Clerk.session

// Share (don't share the actual token):
- Session ID (if present)
- User ID (if present)
- Is token present? (yes/no)
```

---

## ✅ Success Indicators

You'll know it's working when you see ALL of these:

1. ✅ Console: "✅ User synced to D1 database successfully"
2. ✅ Console: "Call saved to backend successfully"
3. ✅ Toast: "✅ Call saved and synced to cloud!"
4. ✅ Console: "✅ Loaded X calls from backend" (after refresh)
5. ❌ NO "Failed to load calls from server" error
6. ❌ NO 401 Unauthorized errors

---

## 🚨 Emergency Rollback

If nothing works and you need the app working NOW:

The app WORKS perfectly with localStorage even if backend is broken. All your features work:
- ✅ Call recording
- ✅ Call history
- ✅ In-call notes
- ✅ Objection handler
- ✅ Script display

You just won't have:
- ❌ Cross-device sync
- ❌ Cloud backup
- ❌ Team sharing

To use localStorage mode:
- Just ignore the error messages
- Your calls save locally and work fine
- We fix backend in the background

---

## 🆘 Quick Debug Commands

**Check if user synced:**
```javascript
// In Console:
localStorage.getItem('scholarix-call-history')
// Should show your saved calls
```

**Force re-sync user:**
```javascript
// In Console:
// Sign out and back in will trigger auto-sync
```

**Check API is reachable:**
```javascript
// In Console:
fetch('https://scholarix-crm.renbranmadelo.workers.dev/api/health')
  .then(r => r.json())
  .then(console.log)
// Should show: {status: "ok", timestamp: "..."}
```

**Get your Clerk user ID:**
```javascript
// In Console:
window.Clerk.user?.id
// Should show: "user_xxx..."
```

---

## 📞 What Error Are You Seeing?

Please test and let me know:

1. **Which test failed?** (Test 1, 2, 3, 4, or 5)
2. **What error message?** (exact text)
3. **What did Console show?** (screenshot)
4. **Did you hard refresh?** (yes/no)
5. **Did you sign out/in fresh?** (yes/no)

With this info, I can pinpoint and fix the exact issue!

---

**Created:** January 2025
**Deployment:** be894d8 (Clerk fix)
**Status:** Testing in progress
