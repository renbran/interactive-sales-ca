# 🎯 YOUR ACTION ITEMS - Cloudflare Deployment

This document lists exactly what **YOU** need to do to deploy to Cloudflare.
Follow these steps in order.

---

## ✅ STEP 1: Get Clerk API Keys (Required - 5 minutes)

### What you need to do:
1. **Open your browser** and go to: **https://dashboard.clerk.com**
2. **Sign up** or **Sign in**
3. Click **"Create Application"** or select existing application
4. Give it a name: `Scholarix CRM`
5. Choose auth methods (Email + Password recommended)
6. Click **Create**

### Get your keys:
1. In Clerk Dashboard, go to **"API Keys"** (left sidebar)
2. **Copy** these two values:

   ```
   Publishable Key: pk_test_xxxxxxxxxxxxxxxxxxxxx
   Secret Key: sk_test_xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Save them somewhere safe** - you'll need them multiple times!

### ⚠️ IMPORTANT:
- Don't close this tab yet - we'll need it again in Step 8
- **Publishable Key** (pk_test_...) → Goes in .env and Cloudflare Pages
- **Secret Key** (sk_test_...) → Goes only in Wrangler secrets (never in .env!)

**✅ Once you have both keys copied, move to Step 2**

---

## ✅ STEP 2: Update Your Local .env File (Required - 2 minutes)

### What you need to do:
1. **Open** the `.env` file in your project root
2. **Find this line:**
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```
3. **Replace** `pk_test_your_actual_key_here` with your **actual Clerk Publishable Key**
4. **Save** the file

### Your .env should look like:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29tcGxldGVseV9zb21lX3JhbmRvbV9rZXk
VITE_API_BASE_URL=http://localhost:8787/api
VITE_ENVIRONMENT=development
VITE_APP_NAME=Scholarix CRM
VITE_APP_VERSION=1.0.0
```

**✅ After saving, move to Step 3**

---

## ✅ STEP 3: Test Locally (Required - 3 minutes)

### What you need to do:
1. **Open terminal** in your project folder
2. **Run these commands:**

   ```bash
   cd /d/salesApp/interactive-sales-ca
   npm run dev
   ```

3. **Open browser** and go to: **http://localhost:5000**
4. **Test the sign-up/sign-in** - it should work!
5. If it works, press **Ctrl+C** in terminal to stop the server

### ⚠️ Troubleshooting:
- If you see "Missing Clerk Publishable Key" → Check your .env file
- If port 5000 is busy → The app will use a different port (check terminal output)
- Clear browser cache if needed

**✅ Once the app loads and auth works, move to Step 4**

---

## ✅ STEP 4: Create Cloudflare Account (Required - 5 minutes)

### What you need to do:
1. **Open browser** and go to: **https://dash.cloudflare.com/sign-up**
2. **Sign up** with your email
3. **Verify** your email
4. **Log in** to Cloudflare Dashboard

**✅ Once logged in to Cloudflare, move to Step 5**

---

## ✅ STEP 5: Login to Cloudflare via Wrangler (Required - 2 minutes)

### What you need to do:
1. **Open terminal** in your project folder
2. **Run this command:**

   ```bash
   npx wrangler login
   ```

3. A **browser window will open**
4. Click **"Allow"** to authorize Wrangler
5. You should see: **"Successfully logged in"**

### Verify it worked:
```bash
npx wrangler whoami
```
You should see your Cloudflare account email.

**✅ Once logged in, move to Step 6**

---

## ✅ STEP 6: Create D1 Database (Required - 5 minutes)

### What you need to do:

#### 6.1 Create the database:
```bash
npx wrangler d1 create scholarix-crm-db
```

#### 6.2 Copy the Database ID:
You'll see output like this:
```
✅ Successfully created DB 'scholarix-crm-db'!

[[d1_databases]]
binding = "DB"
database_name = "scholarix-crm-db"
database_id = "12345678-abcd-1234-abcd-123456789abc"  ← COPY THIS!
```

**COPY** the `database_id` value!

#### 6.3 Update wrangler.toml:
1. **Open** `wrangler.toml` file
2. **Find line 14** (around there):
   ```toml
   database_id = "ffdec392-b118-45ac-9fbe-f1bb7737b7f6"
   ```
3. **Replace** it with your **actual database ID**
4. **Save** the file

#### 6.4 Run migrations:
```bash
npx wrangler d1 execute scholarix-crm-db --file=./migrations/0001_initial_schema.sql --remote
```

You should see: **"🌀 Executed X commands in Y.XXs"**

#### 6.5 Verify it worked:
```bash
npx wrangler d1 execute scholarix-crm-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

You should see a list of tables: users, leads, calls, etc.

**✅ Once you see the tables, move to Step 7**

---

## ✅ STEP 7: Set Up Worker Secrets (Required - 3 minutes)

### What you need to do:

#### 7.1 Set Clerk Secret Key:
```bash
npx wrangler secret put CLERK_SECRET_KEY
```

When prompted: **"Enter a secret value:"**
- **Paste** your **Clerk Secret Key** (sk_test_... from Step 1)
- Press **Enter**
- You should see: **"✨ Success! Uploaded secret CLERK_SECRET_KEY"**

#### 7.2 Set Clerk Publishable Key (for worker):
```bash
npx wrangler secret put CLERK_PUBLISHABLE_KEY
```

When prompted:
- **Paste** your **Clerk Publishable Key** (pk_test_... from Step 1)
- Press **Enter**

#### 7.3 Verify secrets:
```bash
npx wrangler secret list
```

You should see:
```
CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY
```

**✅ Once secrets are set, move to Step 8**

---

## ✅ STEP 8: Create Cloudflare Pages Project (Required - 10 minutes)

### What you need to do:

#### 8.1 Go to Pages:
1. **Go to** Cloudflare Dashboard: https://dash.cloudflare.com
2. Click **"Workers & Pages"** (left sidebar)
3. Click **"Create application"** button
4. Click **"Pages"** tab
5. Click **"Connect to Git"**

#### 8.2 Connect GitHub:
1. Click **"GitHub"**
2. Click **"Authorize Cloudflare"**
3. **Select** your GitHub account
4. **Choose** repository: `interactive-sales-ca`
5. Click **"Begin setup"**

#### 8.3 Configure build settings:
Fill in these values:

| Field | Value |
|-------|-------|
| **Project name** | `scholarix-crm` (or your preferred name) |
| **Production branch** | `main` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave as is) |

#### 8.4 Set environment variables:
**IMPORTANT:** Click **"Environment variables (advanced)"**

Add these variables for **Production**:

| Variable Name | Value |
|--------------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Your pk_test_... or pk_live_... key |
| `VITE_API_BASE_URL` | `https://scholarix-crm.[your-subdomain].workers.dev/api` |
| `VITE_ENVIRONMENT` | `production` |
| `VITE_APP_NAME` | `Scholarix CRM` |
| `VITE_APP_VERSION` | `1.0.0` |
| `NODE_VERSION` | `18` |

**Note:** For `VITE_API_BASE_URL`, use your worker URL (you'll get this in Step 9)
For now, you can use: `https://interactive-sales-ca.pages.dev/api`

#### 8.5 Deploy:
1. Click **"Save and Deploy"**
2. **Wait** for the build (2-5 minutes)
3. You'll see build logs

#### 8.6 Get your Pages URL:
After deployment, you'll see:
```
✅ Deployment successful!
Visit your site at: https://[random-id].scholarix-crm.pages.dev
```

**COPY THIS URL!** You'll need it multiple times.

**✅ Once deployed, move to Step 9**

---

## ✅ STEP 9: Update Clerk Allowed Domains (Required - 2 minutes)

### What you need to do:
1. **Go back** to Clerk Dashboard: https://dashboard.clerk.com
2. Go to **"Settings"** → **"Domains"** (or "Allowed Origins")
3. Click **"Add domain"** or **"Add origin"**
4. **Paste** your Cloudflare Pages URL:
   ```
   https://[your-project-id].pages.dev
   ```
5. Click **"Save"**

**✅ Once domain is added, move to Step 10**

---

## ✅ STEP 10: Update wrangler.toml with Production URL (Required - 2 minutes)

### What you need to do:

#### 10.1 Update CORS_ORIGIN:
1. **Open** `wrangler.toml`
2. **Find line 30** (around there):
   ```toml
   CORS_ORIGIN = "https://4b3242df.interactive-sales-ca.pages.dev"
   ```
3. **Replace** with your **actual Pages URL** from Step 8
4. **Save** the file

#### 10.2 Update routes (optional):
Find line 47-49:
```toml
routes = [
  { pattern = "interactive-sales-ca.pages.dev/api/*", zone_name = "pages.dev" }
]
```

Update with your actual project name if different.

**✅ Once updated, move to Step 11**

---

## ✅ STEP 11: Deploy Cloudflare Worker (Required - 2 minutes)

### What you need to do:
```bash
npx wrangler deploy
```

You should see:
```
✨ Built successfully!
🌎 Published scholarix-crm (X.XX sec)
   https://scholarix-crm.[your-subdomain].workers.dev
```

**COPY** the worker URL!

### Test the worker:
Open browser and visit:
```
https://scholarix-crm.[your-subdomain].workers.dev
```

You should see a response (might be an error page, that's OK - just means it's running).

**✅ Once deployed, move to Step 12**

---

## ✅ STEP 12: Update Pages Environment Variable (Required - 3 minutes)

### What you need to do:
1. **Go to** Cloudflare Dashboard
2. Go to **Workers & Pages** → Your Pages project
3. Go to **Settings** → **Environment variables**
4. **Find** `VITE_API_BASE_URL`
5. **Edit** it to your worker URL + `/api`:
   ```
   https://scholarix-crm.[your-subdomain].workers.dev/api
   ```
6. Click **"Save"**

### Redeploy Pages:
1. Go to **Deployments** tab
2. Click **"Retry deployment"** on the latest deployment
   OR
3. Just push a new commit to GitHub

**✅ Once redeployed, move to Step 13**

---

## ✅ STEP 13: Test Your Deployment! (Required - 5 minutes)

### What you need to do:

#### 13.1 Visit your site:
Open browser and go to:
```
https://[your-project-id].pages.dev
```

#### 13.2 Test these features:
- [ ] Page loads without errors
- [ ] Can see the sign-in button
- [ ] Can sign up with email
- [ ] Can sign in
- [ ] Can access dashboard
- [ ] Can create a lead
- [ ] Can start a call
- [ ] Can see analytics

#### 13.3 Check browser console:
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for errors (red text)

If you see errors:
- Note them down
- Check the **Network** tab for failed requests
- Verify all environment variables are set correctly

**✅ If everything works, CONGRATULATIONS! 🎉**

---

## 🎉 DEPLOYMENT COMPLETE!

### Your Production URLs:
```
Frontend: https://[your-project].pages.dev
Worker API: https://scholarix-crm.[your-subdomain].workers.dev
Database: D1 (scholarix-crm-db)
```

### Next Steps (Optional):
- [ ] Set up custom domain
- [ ] Enable R2 for call recordings
- [ ] Set up monitoring/alerts
- [ ] Configure backups

---

## 🆘 Troubleshooting

### Problem: White/blank page
**Solution:** 
- Check browser console (F12) for errors
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set in Pages
- Check Clerk domains include your Pages URL

### Problem: Authentication fails
**Solution:**
- Go to Clerk Dashboard → Domains
- Ensure your Pages URL is added
- Clear cookies and try again

### Problem: API calls fail (CORS errors)
**Solution:**
- Check `CORS_ORIGIN` in `wrangler.toml` matches your Pages URL
- Redeploy worker: `npx wrangler deploy`

### Problem: Database errors
**Solution:**
```bash
# Verify migrations ran
npx wrangler d1 execute scholarix-crm-db --command="SELECT * FROM users LIMIT 1;" --remote
```

### Problem: Build fails on Cloudflare
**Solution:**
- Check build logs in Cloudflare Dashboard
- Verify `NODE_VERSION=18` is set
- Try building locally: `npm run build`

---

## 📞 Need More Help?

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Clerk Docs:** https://clerk.com/docs
- **D1 Docs:** https://developers.cloudflare.com/d1/

**Check the detailed guides:**
- `CLOUDFLARE_DEPLOYMENT_CHECKLIST.md` - Complete step-by-step guide
- `DEPLOYMENT_COMMANDS.md` - Command reference
- `CLERK_SETUP_GUIDE.md` - Clerk-specific setup

---

**Created:** October 28, 2025
**Your deployment should be complete! 🚀**
