# 🚀 Quick Deployment Commands Reference

## Prerequisites Commands
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Install dependencies
npm install --legacy-peer-deps

# Test build locally
npm run build
```

---

## 🔐 Cloudflare Login
```bash
# Login to Cloudflare
npx wrangler login

# Check who you're logged in as
npx wrangler whoami

# Logout
npx wrangler logout
```

---

## 🗄️ Database Commands (D1)

### Create Database
```bash
# Create production database
npx wrangler d1 create scholarix-crm-db

# Create development database (optional)
npx wrangler d1 create scholarix-crm-db-dev
```

### Run Migrations
```bash
# Run migrations on production database
npx wrangler d1 execute scholarix-crm-db --file=./migrations/0001_initial_schema.sql --remote

# Run migrations on local database for testing
npx wrangler d1 execute scholarix-crm-db --file=./migrations/0001_initial_schema.sql --local
```

### Query Database
```bash
# List all tables
npx wrangler d1 execute scholarix-crm-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote

# Query users table
npx wrangler d1 execute scholarix-crm-db --command="SELECT * FROM users LIMIT 10;" --remote

# Query leads table
npx wrangler d1 execute scholarix-crm-db --command="SELECT * FROM leads LIMIT 10;" --remote

# Check database info
npx wrangler d1 info scholarix-crm-db

# List all databases
npx wrangler d1 list
```

---

## 🔒 Secrets Management

### Set Secrets
```bash
# Set Clerk secret key
npx wrangler secret put CLERK_SECRET_KEY
# When prompted, paste: sk_test_xxxxxxxxxxxxxxxxxxxxx

# Set encryption key (optional)
npx wrangler secret put ENCRYPTION_KEY
# Generate a random 32-character string

# Set Clerk publishable key (for worker)
npx wrangler secret put CLERK_PUBLISHABLE_KEY
```

### List and Delete Secrets
```bash
# List all secrets (values are hidden)
npx wrangler secret list

# Delete a secret
npx wrangler secret delete CLERK_SECRET_KEY
```

---

## ⚡ Worker Deployment

### Deploy Worker
```bash
# Deploy to production
npx wrangler deploy

# Deploy to development environment
npx wrangler deploy --env development

# Deploy with verbose output
npx wrangler deploy --verbose
```

### View Worker Logs
```bash
# Tail live logs
npx wrangler tail

# Tail logs with filters
npx wrangler tail --format pretty

# Stop tailing
# Press Ctrl+C
```

### Worker Info
```bash
# List all workers
npx wrangler deployments list

# Get worker status
npx wrangler deployments view
```

---

## 🌐 Local Development

### Start Dev Server
```bash
# Start Vite dev server (frontend)
npm run dev
# Access at: http://localhost:5000

# Start Wrangler dev server (worker)
npm run worker:dev
# Access at: http://localhost:8787
```

### Build and Preview
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run type-check
```

---

## 📦 R2 Storage (for call recordings - optional)

### Create R2 Bucket
```bash
# Create recordings bucket
npx wrangler r2 bucket create scholarix-recordings

# List buckets
npx wrangler r2 bucket list

# Delete bucket (be careful!)
npx wrangler r2 bucket delete scholarix-recordings
```

---

## 🔄 Update Deployment

### Update Frontend (Cloudflare Pages)
```bash
# Commit changes
git add .
git commit -m "Update frontend"
git push origin main

# Pages will automatically rebuild and deploy
```

### Update Backend (Worker)
```bash
# Make changes to functions/*.ts
# Then deploy
npx wrangler deploy
```

### Update Database Schema
```bash
# Create new migration file
# migrations/0002_add_new_table.sql

# Run migration
npx wrangler d1 execute scholarix-crm-db --file=./migrations/0002_add_new_table.sql --remote
```

---

## 🧪 Testing Commands

### Test Locally
```bash
# Start both frontend and worker
npm run dev          # Terminal 1
npm run worker:dev   # Terminal 2

# Test build
npm run build
npm run preview
```

### Test Database Connection
```bash
# Test query
npx wrangler d1 execute scholarix-crm-db --command="SELECT 1 as test;" --remote
```

### Test Worker Endpoint
```bash
# Using curl
curl https://scholarix-crm.[your-subdomain].workers.dev/api/health

# Using Wrangler
npx wrangler tail --format pretty
# Then make requests to your app
```

---

## 📊 Monitoring & Debugging

### View Analytics
```bash
# Worker analytics (in dashboard)
# Go to: Cloudflare Dashboard → Workers & Pages → Your Worker → Analytics

# Pages analytics
# Go to: Cloudflare Dashboard → Workers & Pages → Your Pages → Analytics
```

### Debug Logs
```bash
# Tail worker logs in real-time
npx wrangler tail

# Tail with pretty formatting
npx wrangler tail --format pretty

# Filter logs
npx wrangler tail --status error
npx wrangler tail --status ok
```

### Check Deployment Status
```bash
# List recent deployments
npx wrangler deployments list

# View specific deployment
npx wrangler deployments view [deployment-id]
```

---

## 🔧 Troubleshooting Commands

### Clear Cache and Rebuild
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

### Verify Configuration
```bash
# Check wrangler.toml is valid
npx wrangler deploy --dry-run

# Verify environment variables
cat .env

# Check Git status
git status
git log --oneline -5
```

### Reset Database (CAREFUL!)
```bash
# Delete database
npx wrangler d1 delete scholarix-crm-db

# Recreate database
npx wrangler d1 create scholarix-crm-db

# Run migrations again
npx wrangler d1 execute scholarix-crm-db --file=./migrations/0001_initial_schema.sql --remote
```

---

## 📱 Production URLs

After deployment, you'll have these URLs:

```bash
# Frontend (Cloudflare Pages)
https://[your-project-name].pages.dev

# Worker API
https://scholarix-crm.[your-subdomain].workers.dev

# Custom Domain (if configured)
https://scholarixglobal.com
```

---

## 🎯 One-Line Deployment

```bash
# Complete deployment sequence
npm run build && \
npx wrangler deploy && \
git add . && \
git commit -m "Deploy update" && \
git push origin main
```

---

## 📞 Get Help

```bash
# Wrangler help
npx wrangler --help
npx wrangler d1 --help
npx wrangler secret --help

# Check documentation
# https://developers.cloudflare.com/pages/
# https://developers.cloudflare.com/workers/
# https://developers.cloudflare.com/d1/
```

---

**Last Updated:** October 28, 2025
