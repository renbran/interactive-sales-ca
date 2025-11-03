# 🚀 Quick Start: Ollama + Ngrok for AI Role-Play

## ⚡ 5-Minute Setup

### Step 1: Install Ollama (2 minutes)

```bash
# Linux/Mac
curl -fsSL https://ollama.ai/install.sh | sh

# Windows: Download from https://ollama.ai/download
```

### Step 2: Pull Model (2 minutes)

```bash
# Recommended model (4.7GB)
ollama pull llama3.1:8b

# Wait for download to complete...
```

### Step 3: Test Local Setup (30 seconds)

```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags
```

**Configure App:**
1. Open https://scholarix-crm.pages.dev
2. Go to "AI Practice" tab
3. Click Setup
4. Select "🦙 Ollama (Local)"
5. Keep URL as: `http://localhost:11434`
6. Select model: `llama3.1:8b`
7. Click "Continue"
8. **Done!** Start practicing

---

## 🌐 For Cloud Access (Add 3 Minutes)

### Step 4: Install Ngrok

```bash
# Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Mac
brew install ngrok/ngrok/ngrok

# Windows
choco install ngrok
```

### Step 5: Get Auth Token

1. Sign up: https://dashboard.ngrok.com/signup
2. Copy token: https://dashboard.ngrok.com/get-started/your-authtoken
3. Run:
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### Step 6: Start Tunnel

```bash
ngrok http 11434
```

**You'll see:**
```
Forwarding    https://xxxx-xx-xxx.ngrok-free.app -> http://localhost:11434
```

### Step 7: Configure App with Ngrok URL

1. Open https://scholarix-crm.pages.dev from **any device**
2. Go to "AI Practice" → Setup
3. Select "🦙 Ollama (Local)"
4. Enter URL: `https://xxxx-xx-xxx.ngrok-free.app`
5. Select model: `llama3.1:8b`
6. Click "Continue"
7. **Done!** Now accessible from anywhere

---

## 💡 Common Commands

```bash
# List models
ollama list

# Test Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hello"
}'

# Start ngrok
ngrok http 11434

# Check ngrok status
curl http://localhost:4040/api/tunnels
```

---

## 🎯 Recommended Models

| Model | Command | Size | Speed | Quality |
|-------|---------|------|-------|---------|
| **Llama 3.1 8B** | `ollama pull llama3.1:8b` | 4.7GB | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| Mistral 7B | `ollama pull mistral:7b` | 4.1GB | ⚡⚡⚡⚡ | ⭐⭐⭐ |
| Gemma 2 9B | `ollama pull gemma2:9b` | 5.4GB | ⚡⚡⚡ | ⭐⭐⭐⭐ |

---

## 🐛 Troubleshooting

**Ollama not running?**
```bash
ollama serve
```

**Model not found?**
```bash
ollama pull llama3.1:8b
```

**Ngrok session expired?**
```bash
# Free tier expires after 8 hours, just restart:
ngrok http 11434
# Copy new URL to app
```

**Connection refused from app?**
- Check Ollama is running: `ps aux | grep ollama`
- Check ngrok is running: `curl http://localhost:4040/api/tunnels`
- Verify URL in app matches ngrok output

---

## 📊 Performance Tips

**Faster responses:**
```bash
# Use smaller model
ollama pull mistral:7b
```

**Better quality:**
```bash
# Use larger model (needs more RAM/GPU)
ollama pull llama3.1:70b
```

**Multiple models:**
```bash
# Pull multiple models and switch in app
ollama pull llama3.1:8b
ollama pull mistral:7b
ollama pull gemma2:9b
```

---

## 💰 Cost Savings

**Before (OpenAI):**
- $0.25 per practice session
- $250 per month (1000 sessions)

**After (Ollama):**
- $0 per practice session
- ~$30 per month (electricity + server)

**Savings: ~$220/month** 🎉

---

## 🔒 Security Note

**For Production:**
```bash
# Use authentication
ngrok http 11434 --basic-auth="admin:YOUR_SECURE_PASSWORD"
```

Update app URL to: `https://admin:PASSWORD@xxxx.ngrok-free.app`

---

## 📚 Full Documentation

See `OLLAMA_NGROK_SETUP.md` for:
- Systemd service setup
- Docker deployment
- Production best practices
- Advanced configuration
- Monitoring & logs

---

## ✅ Quick Checklist

- [ ] Ollama installed
- [ ] Model pulled (`llama3.1:8b`)
- [ ] Ollama running (`curl localhost:11434/api/tags`)
- [ ] App configured with correct URL
- [ ] Test conversation works
- [ ] (Optional) Ngrok installed for cloud access
- [ ] (Optional) Ngrok auth token configured
- [ ] (Optional) Ngrok tunnel running
- [ ] (Optional) App updated with ngrok URL

---

**Ready to Practice!** 🎓

Open https://scholarix-crm.pages.dev and start training your team with zero AI costs!
