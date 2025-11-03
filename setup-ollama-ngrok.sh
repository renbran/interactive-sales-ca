#!/bin/bash
# Ollama + Ngrok Setup Script for Windows

echo "🚀 Setting up Ollama + Ngrok for Scholarix AI Role-Play"
echo "=========================================================="
echo ""

# Step 1: Check Ollama
echo "✅ Step 1: Checking Ollama..."
if command -v ollama &> /dev/null; then
    echo "   Ollama version: $(ollama --version)"
else
    echo "   ❌ Ollama not found!"
    echo "   📥 Please download from: https://ollama.ai/download/windows"
    exit 1
fi

# Step 2: Check/Pull recommended model
echo ""
echo "📦 Step 2: Checking for llama3.1:8b model..."
if ollama list | grep -q "llama3.1:8b"; then
    echo "   ✅ Model already installed"
else
    echo "   📥 Pulling llama3.1:8b (4.7GB, this may take a few minutes)..."
    ollama pull llama3.1:8b
fi

# Step 3: Test Ollama
echo ""
echo "🧪 Step 3: Testing Ollama API..."
curl -s http://localhost:11434/api/tags > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Ollama is running on http://localhost:11434"
else
    echo "   ⚠️  Starting Ollama service..."
    # Ollama usually auto-starts on Windows
    sleep 2
fi

# Step 4: Ngrok setup
echo ""
echo "🌐 Step 4: Setting up Ngrok..."
if command -v ngrok &> /dev/null; then
    echo "   ✅ Ngrok is installed"
else
    echo "   ℹ️  Ngrok not found. Installing via Chocolatey..."
    echo ""
    echo "   Please run in PowerShell (as Administrator):"
    echo "   choco install ngrok -y"
    echo ""
    echo "   Or download manually from: https://ngrok.com/download"
    echo ""
    read -p "Press Enter after installing ngrok..."
fi

# Step 5: Ngrok auth
echo ""
echo "🔑 Step 5: Ngrok Authentication"
echo "   1. Sign up (free): https://dashboard.ngrok.com/signup"
echo "   2. Get your auth token: https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
read -p "Enter your ngrok auth token (or press Enter to skip): " NGROK_TOKEN

if [ ! -z "$NGROK_TOKEN" ]; then
    ngrok config add-authtoken $NGROK_TOKEN
    echo "   ✅ Ngrok authenticated"
fi

# Step 6: Start ngrok tunnel
echo ""
echo "🚀 Step 6: Starting ngrok tunnel..."
echo "   This will expose Ollama to the cloud!"
echo ""
echo "   Starting ngrok http 11434..."
echo ""
echo "=========================================================="
echo "🎉 SETUP COMPLETE!"
echo "=========================================================="
echo ""
echo "Next steps:"
echo "1. Keep this terminal open"
echo "2. Ngrok will show you a public URL (https://xxxx.ngrok-free.app)"
echo "3. Copy that URL"
echo "4. Open https://scholarix-crm.pages.dev"
echo "5. Go to AI Practice → Setup"
echo "6. Select 'Ollama (Local)'"
echo "7. Paste your ngrok URL"
echo "8. Select model: llama3.1:8b"
echo "9. Start practicing!"
echo ""
echo "Starting ngrok now..."
echo ""

ngrok http 11434
