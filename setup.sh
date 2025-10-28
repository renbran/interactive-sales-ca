#!/bin/bash

# Scholarix CRM Quick Setup Script
# This script helps set up the complete CRM system quickly

echo "🚀 Scholarix CRM Setup Script"
echo "================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "   npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI found"

# Login to Cloudflare
echo "🔐 Logging into Cloudflare..."
wrangler login

# Create D1 databases
echo "🗄️ Creating D1 databases..."
echo "Creating production database..."
wrangler d1 create scholarix-crm

echo "Creating staging database..."
wrangler d1 create scholarix-crm-staging

echo ""
echo "📝 IMPORTANT: Update wrangler.toml with your database IDs"
echo "   Look for the output above and replace the database_id values"
echo ""

# Set JWT secret
echo "🔑 Setting up JWT secret..."
echo "Please enter a secure JWT secret (32+ characters recommended):"
read -s jwt_secret
wrangler secret put JWT_SECRET --env production

# Optional: Set OpenAI API key
echo ""
echo "🤖 Do you want to set up OpenAI integration? (y/n)"
read setup_openai
if [ "$setup_openai" = "y" ]; then
    echo "Please enter your OpenAI API key:"
    read -s openai_key
    wrangler secret put OPENAI_API_KEY --env production
fi

echo ""
echo "🗄️ Applying database schema..."
echo "Make sure to update wrangler.toml with your database IDs first!"
echo "Press Enter when ready to continue..."
read

# Apply database schema
wrangler d1 execute scholarix-crm --file=database-schema.sql
wrangler d1 execute scholarix-crm-staging --file=database-schema.sql

echo ""
echo "🚀 Deploying Worker..."
wrangler deploy --env production

echo ""
echo "🌐 Building frontend..."
npm run build

echo ""
echo "📱 Deploying to Cloudflare Pages..."
wrangler pages publish dist --project-name scholarix-crm

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Create your admin user in the D1 database console"
echo "2. Update CORS origins in worker.ts with your domain"
echo "3. Test the login system"
echo "4. Create your team members"
echo ""
echo "🎯 Your Scholarix CRM is ready to transform your sales process!"