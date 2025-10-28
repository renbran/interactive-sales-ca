# 🎙️ Enable Recording Storage - Quick Setup

## Current Status
✅ Code is deployed and ready
⚠️ **R2 storage needs to be enabled in Cloudflare dashboard**

## What This Does
- **Recordings will persist after page refresh**
- **Recordings accessible from any device**
- **No more lost recordings!**

---

## 🚀 3-Step Setup (5 minutes)

### Step 1: Enable R2 Storage
1. Go to https://dash.cloudflare.com
2. Select your account: **Scholarix CRM**
3. Click **R2** in left sidebar
4. Click **Enable R2** button
5. ✅ Done! (R2 is FREE for first 10 GB)

### Step 2: Create Storage Bucket
Open terminal and run:
```bash
cd /d/salesApp/interactive-sales-ca
npx wrangler r2 bucket create scholarix-recordings
```

Expected output:
```
✅ Created bucket 'scholarix-recordings'
```

### Step 3: Deploy Worker
```bash
npx wrangler deploy
```

Expected output:
```
✅ Published scholarix-crm
   https://scholarix-crm.renbranmadelo.workers.dev
```

---

## ✅ That's It!

The frontend is already deployed. After these 3 steps:

1. **Make a call** with recording
2. **Save the call** with notes
3. **Refresh the page** 
4. **Check Call History** → Recording still there! 🎉

---

## 📊 What You Get

**Before (Current):**
- ❌ Recordings lost on page refresh
- ❌ Only available in current browser session
- ❌ Can't access from other devices

**After (With R2):**
- ✅ Recordings persist forever
- ✅ Access from any device
- ✅ Audio player with controls
- ✅ Download recordings
- ✅ Fast CDN delivery

---

## 🆓 R2 Free Tier

R2 is included in Cloudflare free plan:
- **10 GB storage FREE**
- **1 million uploads/month FREE**
- **10 million downloads/month FREE**

Typical recording size: **2-5 MB per call**
→ Can store **2,000+ recordings for FREE**

---

## 🧪 Test It

After setup:
1. Start a call (allow microphone)
2. Talk for 1-2 minutes
3. End call and save with notes
4. Look for: "Recording uploaded successfully" in console (F12)
5. **Refresh the page** (Ctrl+R)
6. Go to Call History
7. See recording with play button! 🎵

---

## ⚠️ Fallback Behavior

**If R2 is not enabled yet:**
- Recordings still work locally
- Saved to browser storage (temporary)
- Warning message: "Recording saved locally but not uploaded to cloud"
- **Lost on page refresh**

**Once R2 is enabled:**
- All new recordings upload automatically
- Survive page refresh
- Available across devices

---

## 🆘 Troubleshooting

**Error: "Please enable R2 through the Cloudflare Dashboard"**
→ Complete Step 1 above

**Bucket creation fails**
→ Make sure R2 is enabled first (Step 1)

**Recording shows "recording unavailable"**
→ Check microphone permissions in browser

**Recording not in history after refresh**
→ R2 not enabled yet, or upload failed
→ Check browser console (F12) for errors

---

## 📞 Ready to Test?

1. Enable R2: https://dash.cloudflare.com → R2 → Enable
2. Run: `npx wrangler r2 bucket create scholarix-recordings`
3. Run: `npx wrangler deploy`
4. Test a call!

**Note:** Frontend already deployed automatically via GitHub push.
Worker deployment needs manual `wrangler deploy` command.
