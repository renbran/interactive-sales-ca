#!/bin/bash

# Scholarix CRM - Cloudflare Deployment Setup Script
# This script helps automate the initial setup process

echo "🚀 Scholarix CRM - Cloudflare Deployment Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wrangler is installed
echo "📦 Checking dependencies..."
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm is available${NC}"

# Check if user is logged in to Cloudflare
echo ""
echo "🔐 Checking Cloudflare authentication..."
if ! npx wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare${NC}"
    echo "Please login to Cloudflare:"
    npx wrangler login
else
    echo -e "${GREEN}✅ Already logged in to Cloudflare${NC}"
    npx wrangler whoami
fi

echo ""
echo "=============================================="
echo "📋 Next Steps:"
echo "=============================================="
echo ""
echo "1️⃣  Set up Clerk Authentication:"
echo "   → Go to https://dashboard.clerk.com"
echo "   → Create a new application"
echo "   → Copy your publishable key and secret key"
echo ""
echo "2️⃣  Update your .env file:"
echo "   → Open .env file in the root directory"
echo "   → Add your VITE_CLERK_PUBLISHABLE_KEY"
echo ""
echo "3️⃣  Create D1 Database:"
echo "   → Run: npx wrangler d1 create scholarix-crm-db"
echo "   → Copy the database ID"
echo "   → Update wrangler.toml with the database ID"
echo ""
echo "4️⃣  Run database migrations:"
echo "   → Run: npx wrangler d1 execute scholarix-crm-db --file=./migrations/0001_initial_schema.sql --remote"
echo ""
echo "5️⃣  Set up secrets:"
echo "   → Run: npx wrangler secret put CLERK_SECRET_KEY"
echo "   → Paste your Clerk secret key when prompted"
echo ""
echo "6️⃣  Update wrangler.toml:"
echo "   → Update CORS_ORIGIN with your Cloudflare Pages URL"
echo "   → Update routes pattern"
echo ""
echo "7️⃣  Deploy Worker:"
echo "   → Run: npx wrangler deploy"
echo ""
echo "8️⃣  Create Cloudflare Pages project:"
echo "   → Go to Cloudflare Dashboard"
echo "   → Create Pages project from GitHub"
echo "   → Set environment variables"
echo ""
echo "9️⃣  Deploy and test!"
echo ""
echo "=============================================="
echo "📖 For detailed instructions, see:"
echo "   CLOUDFLARE_DEPLOYMENT_CHECKLIST.md"
echo "=============================================="
echo ""
