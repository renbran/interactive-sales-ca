#!/bin/bash

# Environment Variables Setup Helper
# This script helps you set up environment variables step by step

echo "🔧 Environment Variables Setup Helper"
echo "======================================"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file exists"
else
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

echo ""
echo "📝 Please provide the following information:"
echo ""

# Get Clerk Publishable Key
read -p "Enter your Clerk Publishable Key (pk_test_... or pk_live_...): " clerk_key
if [ -n "$clerk_key" ]; then
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|VITE_CLERK_PUBLISHABLE_KEY=.*|VITE_CLERK_PUBLISHABLE_KEY=$clerk_key|" .env
    else
        # Linux/Windows Git Bash
        sed -i "s|VITE_CLERK_PUBLISHABLE_KEY=.*|VITE_CLERK_PUBLISHABLE_KEY=$clerk_key|" .env
    fi
    echo "✅ Updated VITE_CLERK_PUBLISHABLE_KEY"
fi

echo ""
read -p "Do you want to add OpenAI API key? (y/n): " add_openai
if [ "$add_openai" = "y" ]; then
    read -p "Enter your OpenAI API Key: " openai_key
    if [ -n "$openai_key" ]; then
        echo "" >> .env
        echo "# OpenAI Configuration (Optional)" >> .env
        echo "VITE_OPENAI_API_KEY=$openai_key" >> .env
        echo "VITE_OPENAI_MODEL=gpt-4o-mini" >> .env
        echo "✅ Added OpenAI configuration"
    fi
fi

echo ""
read -p "Do you want to add Ollama server URL? (y/n): " add_ollama
if [ "$add_ollama" = "y" ]; then
    read -p "Enter your Ollama server URL (e.g., http://localhost:11434): " ollama_url
    if [ -n "$ollama_url" ]; then
        echo "" >> .env
        echo "# Ollama Configuration (Optional)" >> .env
        echo "VITE_OLLAMA_BASE_URL=$ollama_url" >> .env
        echo "VITE_OLLAMA_MODEL=llama3.1:8b" >> .env
        echo "✅ Added Ollama configuration"
    fi
fi

echo ""
echo "======================================"
echo "✅ Environment setup complete!"
echo "======================================"
echo ""
echo "📋 Your .env file has been configured."
echo ""
echo "Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Visit http://localhost:5000"
echo "3. Try signing up/in to test Clerk authentication"
echo ""
echo "⚠️  Remember: These same environment variables need to be"
echo "   added to Cloudflare Pages dashboard for production!"
echo ""
