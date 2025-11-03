# 🚀 Quick Start: Get Ollama + Ngrok Online NOW

**Time to complete: ~10 minutes**

---

## ✅ You Already Have:
- ✅ Ollama v0.12.6 installed
- ✅ Models: gpt-oss:20b (13GB), llama3.2:3b (2GB)
- ✅ App deployed: https://scholarix-crm.pages.dev

---

## 📋 What You Need to Do:

### Option A: Quick Start (Use Existing Model)
**Skip download, start in 2 minutes!**

1. **Install Ngrok**
   ```bash
   # In PowerShell (as Administrator)
   choco install ngrok -y
   ```
   
   Or download: https://ngrok.com/download

2. **Get Ngrok Token** (Free, 1 minute)
   - Sign up: https://dashboard.ngrok.com/signup
   - Copy token: https://dashboard.ngrok.com/get-started/your-authtoken
   - Run: `ngrok config add-authtoken YOUR_TOKEN`

3. **Start Ngrok Tunnel**
   ```bash
   ngrok http 11434
   ```

4. **Copy the URL**
   Look for: `https://xxxx-xxxx-xxxx.ngrok-free.app`

5. **Configure App**
   - Open: https://scholarix-crm.pages.dev
   - Click "AI Practice"
   - Setup tab → Select "Ollama"
   - Paste ngrok URL
   - Select model: **llama3.2:3b** (you already have this!)
   - Click "Save & Start"

6. **Test!**
   - Choose a persona (e.g., "Budget-Conscious Student")
   - Start conversation
   - AI responds via your local Ollama!

---

### Option B: Recommended Setup (Better Quality)
**10 minutes total (includes 4.7GB download)**

1. **Pull Better Model** (one-time, ~5 min)
   ```bash
   ollama pull llama3.1:8b
   ```

2. **Install Ngrok** (same as Option A)
   ```bash
   choco install ngrok -y
   ```

3. **Configure Ngrok** (same as Option A)
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

4. **Start Tunnel**
   ```bash
   ngrok http 11434
   ```

5. **Configure App** (use **llama3.1:8b** instead)

---

## 🎯 Automated Setup (Easiest!)

Just run this batch file:

```bash
# In your project folder
./setup-ollama-ngrok.bat
```

It will:
- ✅ Check Ollama
- ✅ Pull llama3.1:8b (if needed)
- ✅ Verify installation
- ✅ Guide you through ngrok setup
- ✅ Start the tunnel
- ✅ Show you the URL to use

---

## 🔍 Troubleshooting

### Ngrok Not Found
```bash
# Install via Chocolatey
choco install ngrok -y

# Or download from
https://ngrok.com/download
```

### Ollama Not Responding
```bash
# Check if running
curl http://localhost:11434/api/tags

# Restart Ollama (Windows restarts it automatically)
# Or run: ollama serve
```

### Model Not Found
```bash
# List available models
ollama list

# Pull if needed
ollama pull llama3.1:8b
```

### Ngrok Auth Error
```bash
# Get your token from
https://dashboard.ngrok.com/get-started/your-authtoken

# Add it
ngrok config add-authtoken YOUR_TOKEN
```

---

## 📊 Model Comparison

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| **llama3.2:3b** | 2GB | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | Quick testing, fast responses |
| **llama3.1:8b** | 4.7GB | ⚡⚡ Fast | ⭐⭐⭐⭐ Better | Recommended for training |
| **gpt-oss:20b** | 13GB | ⚡ Slower | ⭐⭐⭐⭐⭐ Best | High-quality conversations |

**Your Current Models:**
- ✅ gpt-oss:20b (13GB) - Available now!
- ✅ llama3.2:3b (2GB) - Available now!

---

## 🎬 Step-by-Step Commands

```bash
# 1. Check what you have
ollama list

# 2. (Optional) Pull recommended model
ollama pull llama3.1:8b

# 3. Verify Ollama is running
curl http://localhost:11434/api/tags

# 4. Install ngrok (if not installed)
choco install ngrok -y

# 5. Add ngrok auth token
ngrok config add-authtoken YOUR_TOKEN_HERE

# 6. Start ngrok tunnel (keep this running!)
ngrok http 11434

# 7. Copy the HTTPS URL from ngrok output
# Example: https://abc123.ngrok-free.app

# 8. Open your app and paste the URL
# https://scholarix-crm.pages.dev
```

---

## ✅ Success Checklist

- [ ] Ngrok installed and authenticated
- [ ] Model available (llama3.2:3b or llama3.1:8b)
- [ ] Ngrok tunnel running (terminal open)
- [ ] HTTPS URL copied
- [ ] App configured with ngrok URL
- [ ] Test conversation successful
- [ ] Zero API costs confirmed! 🎉

---

## 🌐 What You'll Get

**Before (OpenAI):**
- Cost: $0.25 per training session
- Monthly: $250+ for 1,000 sessions
- Data sent to OpenAI servers

**After (Ollama + Ngrok):**
- Cost: $0 per session
- Monthly: $0 (unlimited!)
- All data stays on your machine
- Cloud access via ngrok tunnel

---

## 📞 Quick Help

**Current Status:**
- Ollama: ✅ Installed (v0.12.6)
- Models: ✅ 2 models ready
- Ngrok: ❌ Need to install
- App: ✅ Deployed and ready

**Next Step:** Install ngrok!

```bash
choco install ngrok -y
```

Then run:
```bash
ngrok config add-authtoken YOUR_TOKEN
ngrok http 11434
```

**That's it!** 🚀

---

## 🎯 Expected Output

When ngrok starts, you'll see:

```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:11434

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy this URL:** `https://abc123.ngrok-free.app`

Paste it in your app's Ollama setup screen!

---

**Ready? Let's go! 🚀**

Run: `./setup-ollama-ngrok.bat`
