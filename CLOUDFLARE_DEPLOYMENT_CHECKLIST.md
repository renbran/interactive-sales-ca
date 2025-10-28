# 🚀 Cloudflare Deployment Checklist for Scholarix CRM

## Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Git repository ready
- [ ] GitHub account
- [ ] Cloudflare account (free tier is fine)

---

## 📋 STEP 1: Set Up Clerk Authentication

### 1.1 Create Clerk Account
1. Go to https://dashboard.clerk.com
2. Sign up or log in
3. Click **"Create Application"**
4. Application name: `Scholarix CRM`
5. Select authentication methods:
   - ✅ Email
   - ✅ Password
   - ✅ Google (optional)
   - ✅ Microsoft (optional)

### 1.2 Get API Keys
1. In Clerk Dashboard, go to **API Keys** section
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 1.3 Configure Allowed Origins
1. In Clerk Dashboard, go to **Settings** → **Domains**
2. Add your domains:
   - `http://localhost:5000` (for local dev)
   - `http://localhost:5173` (alternative local)
   - `https://your-app-name.pages.dev` (will get this in Step 3)

**📝 Save these keys - you'll need them shortly!**

```
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📋 STEP 2: Update Local Environment

### 2.1 Update .env File
The `.env` file has been created. Update it with your actual Clerk keys:

```bash
# Open the .env file and replace the placeholder values:
VITE_CLERK_PUBLISHABLE_KEY=pk_test_[YOUR_ACTUAL_KEY_HERE]

# Keep these as is for now:
VITE_API_BASE_URL=http://localhost:8787/api
VITE_ENVIRONMENT=development
VITE_APP_NAME=Scholarix CRM
VITE_APP_VERSION=1.0.0
```

### 2.2 Test Locally
```bash
npm run dev
# Visit http://localhost:5000
# Test authentication - sign up/sign in should work
```

---

## 📋 STEP 3: Create Cloudflare Account & Pages Project

### 3.1 Sign Up for Cloudflare
1. Go to https://dash.cloudflare.com/sign-up
2. Create free account
3. Verify your email

### 3.2 Create Pages Project
1. In Cloudflare Dashboard, click **Workers & Pages**
2. Click **Create application**
3. Select **Pages** tab
4. Click **Connect to Git**

### 3.3 Connect GitHub Repository
1. Click **GitHub** → Authorize Cloudflare
2. Select your GitHub account
3. Choose repository: `interactive-sales-ca`
4. Click **Begin setup**

### 3.4 Configure Build Settings
```
Project name: scholarix-crm
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: /

Environment variables (Add in next step)
```

**📝 Save your Cloudflare Pages URL:**
```
https://[your-project-name].pages.dev
```

---

## 📋 STEP 4: Set Environment Variables in Cloudflare Pages

### 4.1 Navigate to Environment Variables
1. In your Pages project, go to **Settings** → **Environment variables**
2. Click **Add variable** for **Production**

### 4.2 Add Required Variables

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_xxx...` | From Clerk Dashboard |
| `VITE_API_BASE_URL` | `https://your-app.pages.dev/api` | Your Pages URL + /api |
| `VITE_ENVIRONMENT` | `production` | Set to production |
| `VITE_APP_NAME` | `Scholarix CRM` | App name |
| `VITE_APP_VERSION` | `1.0.0` | Current version |

### 4.3 Optional AI Service Variables (if using)
| Variable Name | Value |
|--------------|-------|
| `VITE_OLLAMA_BASE_URL` | Your Ollama server URL |
| `VITE_OLLAMA_MODEL` | `llama3.1:8b` |
| `VITE_OPENAI_API_KEY` | Your OpenAI API key |
| `VITE_OPENAI_MODEL` | `gpt-4o-mini` |

**After adding all variables, click "Save"**

---

## 📋 STEP 5: Install Wrangler CLI

### 5.1 Install Wrangler Globally
```bash
npm install -g wrangler

# Or use it locally (already in package.json)
npx wrangler --version
```

### 5.2 Login to Cloudflare
```bash
npx wrangler login
# This will open a browser window to authenticate
```

---

## 📋 STEP 6: Create D1 Database

### 6.1 Create Production Database
```bash
# Create the database
npx wrangler d1 create scholarix-crm-db
```

**📝 Save the Database ID from the output:**
```
Created database scholarix-crm-db
Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 6.2 Update wrangler.toml
Open `wrangler.toml` and update the database_id on line 14:
```toml
[[d1_databases]]
binding = "DB"
database_name = "scholarix-crm-db"
database_id = "YOUR_ACTUAL_DATABASE_ID_HERE"  # ← Update this!
```

### 6.3 Run Migrations
```bash
# Apply the database schema
npx wrangler d1 execute scholarix-crm-db --file=./migrations/0001_initial_schema.sql --remote
```

### 6.4 Verify Database
```bash
# List tables to verify
npx wrangler d1 execute scholarix-crm-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

---

## 📋 STEP 7: Set Up Cloudflare Workers Secrets

### 7.1 Set Clerk Secret Key
```bash
npx wrangler secret put CLERK_SECRET_KEY
# When prompted, paste your Clerk Secret Key (sk_test_xxx or sk_live_xxx)
```

### 7.2 Set Encryption Key (Optional but Recommended)
```bash
# Generate a random encryption key
npx wrangler secret put ENCRYPTION_KEY
# Paste a random 32-character string
```

---

## 📋 STEP 8: Update CORS Configuration

### 8.1 Get Your Cloudflare Pages URL
Your Pages URL should be: `https://[project-name].pages.dev`

### 8.2 Update wrangler.toml
Open `wrangler.toml` and update line 30:
```toml
[vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://your-actual-pages-url.pages.dev"  # ← Update this!
```

### 8.3 Update Routes
On line 47-49, update the route pattern:
```toml
routes = [
  { pattern = "[your-project-name].pages.dev/api/*", zone_name = "pages.dev" }
]
```

---

## 📋 STEP 9: Deploy Cloudflare Worker (API Backend)

### 9.1 Deploy Worker
```bash
npx wrangler deploy
```

### 9.2 Verify Worker Deployment
The output will show:
```
Published scholarix-crm (X.XX sec)
  https://scholarix-crm.[your-subdomain].workers.dev
```

### 9.3 Bind Worker to Pages (Important!)
1. Go to Cloudflare Dashboard → **Workers & Pages**
2. Select your **Pages project** (scholarix-crm)
3. Go to **Settings** → **Functions**
4. Click **Add binding**
5. Variable name: `API`
6. Type: **Service**
7. Service: `scholarix-crm` (your worker)
8. Environment: `production`
9. Click **Save**

---

## 📋 STEP 10: Deploy Frontend to Pages

### 10.1 Trigger Deployment
Your Pages project should auto-deploy on git push. To manually trigger:

1. Go to Cloudflare Dashboard → Your Pages Project
2. Click **Deployments** tab
3. Click **Create deployment**
4. Select branch: `main`
5. Click **Deploy**

### 10.2 Build Process
Monitor the build logs. It should:
- ✅ Install dependencies
- ✅ Run `npm run build`
- ✅ Output to `dist/` directory
- ✅ Deploy to CDN

---

## 📋 STEP 11: Update Clerk Allowed Origins

### 11.1 Add Production URL to Clerk
1. Go back to Clerk Dashboard
2. Navigate to **Settings** → **Domains**
3. Add your production URL:
   - `https://[your-project-name].pages.dev`
4. Click **Save**

---

## 📋 STEP 12: Test Your Deployment

### 12.1 Visit Your Site
Go to: `https://[your-project-name].pages.dev`

### 12.2 Test Checklist
- [ ] Page loads without errors
- [ ] Sign up works
- [ ] Sign in works
- [ ] Can create leads
- [ ] Can make calls
- [ ] Can record call notes
- [ ] Dashboard shows data
- [ ] Mobile responsive

### 12.3 Check Browser Console
Open Developer Tools (F12) and check:
- [ ] No JavaScript errors
- [ ] API calls work (check Network tab)
- [ ] Authentication flows correctly

---

## 📋 STEP 13: Optional - Custom Domain

### 13.1 Add Custom Domain (if you have one)
1. In Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `scholarixglobal.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic, ~15 mins)

---

## 🎉 Deployment Complete!

Your Scholarix CRM is now live on Cloudflare!

**Your URLs:**
- 🌐 Frontend: `https://[your-project].pages.dev`
- ⚡ Worker API: `https://scholarix-crm.[your-subdomain].workers.dev`
- 🗄️ D1 Database: Connected via binding

---

## 🔧 Useful Commands Reference

```bash
# Local development
npm run dev                          # Start dev server
npm run build                        # Build for production
npm run preview                      # Preview production build

# Wrangler (Cloudflare CLI)
npx wrangler login                   # Login to Cloudflare
npx wrangler whoami                  # Check logged in user
npx wrangler deploy                  # Deploy worker
npx wrangler tail                    # View live logs
npx wrangler d1 list                 # List D1 databases

# Database commands
npx wrangler d1 execute [db-name] --file=[sql-file] --remote
npx wrangler d1 execute [db-name] --command="[SQL]" --remote

# Secrets management
npx wrangler secret put [SECRET_NAME]
npx wrangler secret list
npx wrangler secret delete [SECRET_NAME]
```

---

## 🆘 Troubleshooting

### Issue: Page shows blank/white screen
**Solution:** Check browser console for errors. Most likely missing environment variables.

### Issue: Authentication doesn't work
**Solution:** 
1. Verify Clerk publishable key is set correctly
2. Check Clerk Dashboard → Domains includes your Pages URL
3. Clear browser cache and cookies

### Issue: API calls fail (CORS errors)
**Solution:**
1. Check `CORS_ORIGIN` in `wrangler.toml` matches your Pages URL exactly
2. Redeploy worker with `npx wrangler deploy`

### Issue: Database errors
**Solution:**
1. Verify migrations ran: `npx wrangler d1 execute scholarix-crm-db --command="SELECT * FROM users LIMIT 1;" --remote`
2. Check database ID in `wrangler.toml` is correct

### Issue: Build fails on Cloudflare
**Solution:**
1. Check build logs in Cloudflare Dashboard
2. Verify all environment variables are set
3. Try building locally first: `npm run build`

---

## 📞 Need Help?

- Cloudflare Docs: https://developers.cloudflare.com/pages/
- Clerk Docs: https://clerk.com/docs
- D1 Database Docs: https://developers.cloudflare.com/d1/

---

**Last Updated:** October 28, 2025
**Version:** 1.0.0
