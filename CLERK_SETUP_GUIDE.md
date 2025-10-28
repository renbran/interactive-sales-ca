# 🔐 Clerk Authentication Setup Guide

## Step 1: Create/Access Clerk Account

### New to Clerk?
1. **Go to**: https://dashboard.clerk.com/
2. **Sign up** with your email
3. **Verify your email** 
4. **Create a new application**:
   - App Name: `Scholarix CRM`
   - Choose authentication methods (Email, Phone, Social)

### Already have Clerk?
1. **Login**: https://dashboard.clerk.com/
2. **Select your app** or create a new one

---

## Step 2: Get Your API Keys

1. In your Clerk dashboard, click **"API Keys"** in the sidebar
2. **Copy these two keys**:

### Publishable Key
- Starts with `pk_test_` (for development) or `pk_live_` (for production)
- Example: `pk_test_abcd1234efgh5678ijkl9012mnop3456qrst7890`

### Secret Key  
- Starts with `sk_test_` (for development) or `sk_live_` (for production)
- Example: `sk_test_wxyz9876vuts5432rqpo1098nmlk7654jihg3210`

---

## Step 3: Configure Allowed Origins

In your Clerk dashboard:

1. **Go to "Domains"** in the sidebar
2. **Add these origins**:
   ```
   https://378e70dc.interactive-sales-ca.pages.dev
   http://localhost:5173
   http://localhost:3000
   ```

---

## Step 4: Set Environment Variables

Once you have your keys, run these commands:

```bash
# Navigate to your project
cd /d/odoolocal/interactive-sales-ca

# Set your Clerk Secret Key (paste your actual key)
npx wrangler secret put CLERK_SECRET_KEY

# Set your Clerk Publishable Key (paste your actual key) 
npx wrangler secret put CLERK_PUBLISHABLE_KEY
```

---

## Step 5: Update Frontend Configuration

Add your **Publishable Key** to the frontend environment:

Create `.env.local` file:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
```

---

## Step 6: Deploy Updates

```bash
# Redeploy with new configuration
npx wrangler deploy

# Redeploy frontend
npm run build
npx wrangler pages deploy dist --project-name=interactive-sales-ca
```

---

## ✅ Ready to Set Up?

**Tell me when you have your Clerk keys ready, and I'll help you add them!**

### Quick Options:

1. **"I have my keys"** - I'll help you add them to Cloudflare
2. **"I need to create Clerk account"** - I'll walk you through it
3. **"Show me the Clerk dashboard"** - I'll open it for you

---

*Current Status: Scholarix CRM deployed but authentication not configured*