# 🤖 OpenAI Integration Setup Guide

## 📋 Required Variables

### **For Frontend (Cloudflare Pages Environment Variables):**

Go to: Cloudflare Dashboard → Your Pages Project → Settings → Environment variables → Production

Add these variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_OPENAI_API_KEY` | `sk-proj-xxxxxxxxxxxxx` | Your OpenAI API key |
| `VITE_OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |

**Alternative Models:**
- `gpt-4o-mini` - Fast and cost-effective (recommended)
- `gpt-4o` - Most capable model
- `gpt-4-turbo` - Previous generation flagship
- `gpt-3.5-turbo` - Fastest and cheapest

---

## 🔐 For Backend (Cloudflare Worker Secrets)

If your Worker needs direct access to OpenAI, set the secret:

```bash
# Set OpenAI API Key as Worker secret
npx wrangler secret put OPENAI_API_KEY
# When prompted, paste: sk-proj-xxxxxxxxxxxxx

# Optional: Set model preference
npx wrangler secret put OPENAI_MODEL
# When prompted, paste: gpt-4o-mini
```

---

## 🔑 How to Get Your OpenAI API Key

### Step 1: Go to OpenAI Platform
Visit: https://platform.openai.com/

### Step 2: Sign Up or Log In
- Create account or log in with existing account

### Step 3: Create API Key
1. Click on your profile (top right)
2. Select **"API keys"**
3. Click **"Create new secret key"**
4. Give it a name: `Scholarix CRM`
5. Click **"Create secret key"**
6. **COPY THE KEY IMMEDIATELY** (you won't see it again!)

Your key will look like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 4: Add Billing
⚠️ **Important:** You need to add a payment method to use the API
1. Go to **Settings** → **Billing**
2. Add a payment method
3. Set usage limits to control costs

---

## 💰 Cost Estimates

### GPT-4o-mini (Recommended for your use case):
- **Input:** $0.150 per 1M tokens (~750K words)
- **Output:** $0.600 per 1M tokens (~750K words)
- **Average cost per call summary:** $0.001 - $0.01 (very cheap!)

### GPT-4o:
- **Input:** $2.50 per 1M tokens
- **Output:** $10.00 per 1M tokens
- **Average cost per call summary:** $0.05 - $0.20

### Usage Limits (Recommended):
Set a monthly budget limit of $10-50 to start.

---

## 📝 Configuration in Your App

### Local Development:
Update `.env` file:
```bash
VITE_OPENAI_API_KEY=sk-proj-your-actual-key-here
VITE_OPENAI_MODEL=gpt-4o-mini
```

### Cloudflare Pages (Production):
1. Go to Pages dashboard
2. Settings → Environment variables → Production
3. Add:
   - `VITE_OPENAI_API_KEY` = `sk-proj-your-key`
   - `VITE_OPENAI_MODEL` = `gpt-4o-mini`
4. Click **"Save"**
5. **Redeploy** your site

### Cloudflare Worker (If needed):
```bash
echo "sk-proj-your-actual-key" | npx wrangler secret put OPENAI_API_KEY
echo "gpt-4o-mini" | npx wrangler secret put OPENAI_MODEL
```

---

## 🧪 Test the Integration

### After adding the keys:

1. **Redeploy** your Cloudflare Pages project
2. Visit your live site
3. Try using AI features (call summaries, objection handling, etc.)
4. Check browser console for any errors

### Test Commands:
```bash
# Test locally
npm run dev
# Visit http://localhost:5001 and test AI features

# Deploy to production
git add .
git commit -m "Add OpenAI integration"
git push origin main
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use environment variables (never hardcode keys)
- Set usage limits in OpenAI dashboard
- Use `gpt-4o-mini` to start (cheaper)
- Monitor usage in OpenAI dashboard
- Rotate keys periodically

### ❌ DON'T:
- Never commit API keys to Git
- Don't share keys publicly
- Don't use keys without rate limits
- Don't expose keys in frontend code (use backend proxy if possible)

---

## 🚨 If You See Errors

### Error: "Invalid API Key"
- Check key is correct in environment variables
- Ensure no extra spaces
- Verify key hasn't been revoked

### Error: "Insufficient Quota"
- Add billing information to OpenAI account
- Check usage limits
- Ensure payment method is valid

### Error: "Rate Limit Exceeded"
- You're making too many requests
- Wait a few minutes
- Consider upgrading your OpenAI plan

---

## 📊 Current Configuration Summary

**Frontend Variables (Cloudflare Pages):**
```
VITE_CLERK_PUBLISHABLE_KEY = pk_test_Y2hhcm1pbmctd2FsbGV5ZS0xMi5jbGVyay5hY2NvdW50cy5kZXYk
VITE_API_BASE_URL = https://scholarix-crm.renbranmadelo.workers.dev/api
VITE_ENVIRONMENT = production
VITE_APP_NAME = Scholarix CRM
VITE_APP_VERSION = 1.0.0
NODE_VERSION = 18
VITE_OPENAI_API_KEY = sk-proj-[YOUR-KEY-HERE] ← ADD THIS
VITE_OPENAI_MODEL = gpt-4o-mini ← ADD THIS
```

**Worker Secrets (Cloudflare Worker):**
```
CLERK_SECRET_KEY = ✅ Already set
CLERK_PUBLISHABLE_KEY = ✅ Already set
OPENAI_API_KEY = ⏳ Optional - add if worker needs it
OPENAI_MODEL = ⏳ Optional - add if worker needs it
```

---

## 🎯 Quick Setup Commands

```bash
# 1. Get your OpenAI API key from platform.openai.com

# 2. Update local .env (already done!)
# Edit .env file and replace:
# VITE_OPENAI_API_KEY=your_openai_api_key_here

# 3. Add to Cloudflare Pages
# Go to: dash.cloudflare.com → Pages → Settings → Environment variables
# Add VITE_OPENAI_API_KEY and VITE_OPENAI_MODEL

# 4. (Optional) Add to Worker if needed
npx wrangler secret put OPENAI_API_KEY
# Paste your key when prompted

# 5. Redeploy
git add .
git commit -m "Configure OpenAI integration"
git push origin main
```

---

## ✅ Checklist

- [ ] OpenAI account created
- [ ] API key generated
- [ ] Billing information added
- [ ] Usage limits set
- [ ] Local .env updated
- [ ] Cloudflare Pages variables added
- [ ] Worker secrets added (if needed)
- [ ] Tested locally
- [ ] Deployed to production
- [ ] Tested on live site

---

**Created:** October 28, 2025  
**Your OpenAI key starts with:** `sk-proj-...`  
**Remember:** Keep your API key secret and monitor usage!
