# 🚀 Scholarix CRM - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Authentication Setup (Clerk)](#authentication-setup)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Cloudflare account (free tier works)
- ✅ Clerk account (free tier: 10K MAU)
- ✅ Git for version control

---

## Quick Start (15 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Install Wrangler CLI globally
npm install -g wrangler

# 3. Login to Cloudflare
wrangler login

# 4. Create D1 Database
wrangler d1 create scholarix-crm-db

# 5. Copy database ID and update wrangler.toml
# Replace YOUR_DATABASE_ID_HERE with the actual ID

# 6. Run migrations
npm run db:migrate

# 7. Create R2 bucket for recordings
npm run r2:create

# 8. Set up Clerk (see Authentication Setup section)

# 9. Set environment variables
cp .env.example .env
# Edit .env with your Clerk keys

# 10. Start development servers
npm run dev              # Frontend (port 5173)
npm run worker:dev       # API Worker (port 8787)
```

---

## Detailed Setup

### Step 1: Clone and Install

```bash
# Clone your repository (already done)
cd interactive-sales-ca

# Install all dependencies
npm install

# Verify installation
npm list @clerk/clerk-react hono wrangler
```

### Step 2: Cloudflare Setup

#### 2.1 Install and Configure Wrangler

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
# This opens a browser for authentication

# Verify login
wrangler whoami
```

#### 2.2 Create D1 Database

```bash
# Create production database
wrangler d1 create scholarix-crm-db

# Create development database
wrangler d1 create scholarix-crm-db-dev
```

**Output will show:**
```
✅ Successfully created DB 'scholarix-crm-db'
   Database ID: abc123-def456-ghi789
```

**Copy the Database ID** and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "scholarix-crm-db"
database_id = "abc123-def456-ghi789"  # Your actual ID here
```

#### 2.3 Run Database Migrations

```bash
# For production
npm run db:migrate

# For local development
npm run db:migrate:dev

# Verify migration
wrangler d1 execute scholarix-crm-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

You should see tables: users, leads, calls, conversations, etc.

#### 2.4 Create R2 Bucket (for call recordings)

```bash
# Create bucket
npm run r2:create

# Verify
wrangler r2 bucket list
```

---

## Environment Configuration

### Step 3: Create Environment Files

#### 3.1 Frontend Environment (.env)

Create `.env` in project root:

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxx

# API Configuration
VITE_API_BASE_URL=http://localhost:8787/api  # Dev
# VITE_API_BASE_URL=https://interactive-sales-ca.pages.dev/api  # Production

# Environment
VITE_ENVIRONMENT=development
```

#### 3.2 Wrangler Secrets (for Cloudflare Workers)

```bash
# Set Clerk secret key (required)
wrangler secret put CLERK_SECRET_KEY
# Paste your key when prompted: sk_test_xxxxx

# Set Clerk publishable key
wrangler secret put CLERK_PUBLISHABLE_KEY
# Paste your key when prompted: pk_test_xxxxx

# Optional: Set encryption key for sensitive data
wrangler secret put ENCRYPTION_KEY
# Generate a random string: openssl rand -base64 32
```

#### 3.3 Verify Secrets

```bash
wrangler secret list
```

---

## Authentication Setup (Clerk)

### Step 4: Configure Clerk

#### 4.1 Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up (free tier: 10,000 monthly active users)
3. Create a new application: "Scholarix CRM"
4. Choose authentication methods:
   - ✅ Email
   - ✅ Password
   - ✅ Google OAuth (optional)

#### 4.2 Get API Keys

From Clerk Dashboard:
1. Go to **API Keys**
2. Copy:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

#### 4.3 Configure User Metadata

Clerk Dashboard → **Users** → **Metadata**

Add custom field:
```json
{
  "role": "agent"  // or "admin"
}
```

#### 4.4 Set Up Webhooks (Optional - for auto user sync)

Clerk Dashboard → **Webhooks**
- Endpoint URL: `https://your-worker.workers.dev/api/auth/webhook`
- Subscribe to events: `user.created`, `user.updated`

#### 4.5 Update Clerk Settings

In Clerk Dashboard:
1. **Sessions** → Set session lifetime (default: 7 days)
2. **Paths** → Add redirect URLs:
   - Development: `http://localhost:5173`
   - Production: `https://interactive-sales-ca.pages.dev`

---

## Development

### Step 5: Start Development Servers

#### 5.1 Start Frontend (Vite)

```bash
npm run dev
```

Frontend runs on: **http://localhost:5173**

#### 5.2 Start API Worker (in another terminal)

```bash
npm run worker:dev
```

API runs on: **http://localhost:8787**

#### 5.3 Test the Setup

Open browser:
1. Go to `http://localhost:5173`
2. You should see the login page
3. Try signing up with your email

---

## Deployment

### Step 6: Deploy to Production

#### 6.1 Deploy Cloudflare Worker

```bash
# Deploy API
npm run worker:deploy

# Output shows: Published to https://scholarix-crm.your-subdomain.workers.dev
```

#### 6.2 Deploy Frontend (Cloudflare Pages)

##### Option A: Via GitHub (Recommended)

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Add CRM features"
   git push origin main
   ```

2. Cloudflare Dashboard → **Pages**
3. Click **Create a project**
4. Connect GitHub repository: `renbran/interactive-sales-ca`
5. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Environment variables:
   - Add `VITE_CLERK_PUBLISHABLE_KEY`
   - Add `VITE_API_BASE_URL` = `https://your-worker.workers.dev/api`
7. Click **Save and Deploy**

##### Option B: Via CLI

```bash
# Install Pages CLI
npm install -g @cloudflare/pages

# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=interactive-sales-ca
```

#### 6.3 Connect Worker to Pages

In `wrangler.toml`, routes are already configured:

```toml
routes = [
  { pattern = "interactive-sales-ca.pages.dev/api/*", zone_name = "pages.dev" }
]
```

This routes all `/api/*` requests to your Worker.

#### 6.4 Update Environment Variables

After deployment, update `.env`:

```env
VITE_API_BASE_URL=https://interactive-sales-ca.pages.dev/api
```

Rebuild and redeploy frontend.

---

## Testing

### Step 7: Verify Everything Works

#### 7.1 Test Authentication

1. Visit your production URL
2. Sign up with a new account
3. Check Clerk Dashboard → Users to verify

#### 7.2 Test Database

```bash
# Query users table
wrangler d1 execute scholarix-crm-db --command "SELECT * FROM users"

# Check tables
wrangler d1 execute scholarix-crm-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

#### 7.3 Test API Endpoints

```bash
# Health check
curl https://your-worker.workers.dev/api/health

# Get leads (requires auth)
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
     https://your-worker.workers.dev/api/leads
```

---

## Creating Your First Admin User

### Step 8: Set Up Admin Access

#### Method 1: Via Clerk Dashboard

1. Clerk Dashboard → **Users**
2. Find your user
3. Click **Edit**
4. Add metadata:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save

#### Method 2: Via Database

```bash
wrangler d1 execute scholarix-crm-db --command \
  "UPDATE users SET role='admin' WHERE email='your-email@example.com'"
```

#### Method 3: Via API (if you already have an admin)

Use the admin panel to promote users.

---

## Post-Deployment Checklist

- ✅ Frontend loads without errors
- ✅ Login/signup works
- ✅ Can create leads
- ✅ Can log calls
- ✅ Admin panel accessible (for admins)
- ✅ Database migrations applied
- ✅ R2 bucket created
- ✅ API endpoints respond correctly
- ✅ CORS configured properly
- ✅ Clerk webhooks working (if configured)

---

## Troubleshooting

### Common Issues

#### 1. "Unauthorized" Error

**Problem:** API returns 401 Unauthorized

**Solution:**
```bash
# Check if secrets are set
wrangler secret list

# Re-set Clerk secret if missing
wrangler secret put CLERK_SECRET_KEY
```

#### 2. Database Not Found

**Problem:** Worker can't connect to D1

**Solution:**
```bash
# Verify database ID in wrangler.toml
wrangler d1 list

# Run migrations again
npm run db:migrate
```

#### 3. CORS Error

**Problem:** Frontend can't connect to API

**Solution:**
Check `functions/index.ts` - CORS origin should include your frontend URL:
```typescript
origin: (origin) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://interactive-sales-ca.pages.dev',
  ];
  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
}
```

#### 4. Clerk Token Invalid

**Problem:** "Invalid token" error

**Solution:**
- Verify publishable key matches between Clerk and `.env`
- Check if token is being sent in Authorization header
- Test in Clerk Dashboard → **JWT Templates**

#### 5. Worker Deploy Fails

**Problem:** `wrangler deploy` errors

**Solution:**
```bash
# Clear cache
rm -rf node_modules .wrangler
npm install

# Verify wrangler.toml syntax
wrangler validate

# Check account permissions
wrangler whoami
```

---

## Maintenance

### Database Backups

```bash
# Backup database
wrangler d1 backup create scholarix-crm-db

# List backups
wrangler d1 backup list scholarix-crm-db

# Restore from backup
wrangler d1 backup restore scholarix-crm-db --backup-id=<backup-id>
```

### Monitor Performance

- Cloudflare Dashboard → **Workers & Pages**
- View analytics, logs, and errors
- Set up alerts for downtime

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update Wrangler
npm install -g wrangler@latest
```

---

## Next Steps

After successful deployment:

1. **Add Users**: Invite team members via Clerk
2. **Import Data**: Use CSV import feature (if implemented)
3. **Customize Scripts**: Add your call scripts
4. **Set Up Analytics**: Configure reporting dashboards
5. **Train Team**: Share user guides

---

## Support

- 📧 Email: support@scholarix.com
- 📖 Docs: [Link to documentation]
- 💬 Slack: [Your workspace]

---

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Hono Framework](https://hono.dev/)
- [React Query](https://tanstack.com/query/latest)

---

**Congratulations! Your Scholarix CRM is now live! 🎉**
