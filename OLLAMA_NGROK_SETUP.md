# 🦙 Ollama + Ngrok Setup Guide for AI Role-Play

## Why Use Ollama Instead of OpenAI?

### Benefits
- ✅ **Zero API Costs** - No per-token charges
- ✅ **Data Privacy** - All data stays on your server
- ✅ **Full Control** - Choose and customize any model
- ✅ **Offline Capable** - Works without internet (local mode)
- ✅ **No Rate Limits** - Unlimited usage
- ✅ **Multiple Models** - Switch between Llama, Mistral, Gemma, etc.

### Use Cases
- Training environments with sensitive data
- High-volume usage (thousands of practice sessions)
- Organizations requiring data sovereignty
- Development and testing environments
- Cost-conscious implementations

---

## 🚀 Quick Start Guide

### Option 1: Local Setup (Single Machine)

**Step 1: Install Ollama**

**Linux/Mac:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai/download/windows

**Step 2: Pull a Model**
```bash
# Recommended: Llama 3.1 8B (4.7GB, fast & good quality)
ollama pull llama3.1:8b

# Alternative options:
ollama pull mistral:7b        # Mistral 7B (4.1GB, very fast)
ollama pull gemma2:9b         # Gemma 2 9B (5.4GB, good quality)
ollama pull phi3:medium       # Phi-3 Medium (7.9GB, Microsoft)
ollama pull llama3.1:70b      # Llama 3.1 70B (40GB, best quality, requires powerful GPU)
```

**Step 3: Start Ollama Service**
```bash
# Ollama typically starts automatically, but you can verify:
ollama serve
```

**Step 4: Test the Installation**
```bash
# Test with a simple prompt
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hello, who are you?",
  "stream": false
}'
```

**Step 5: Configure Application**
- Open your Scholarix CRM app
- Go to AI Practice → Setup
- Select "🦙 Ollama (Local)"
- Use URL: `http://localhost:11434`
- Select model: `llama3.1:8b`
- Click "Continue"

---

### Option 2: Cloud Setup with Ngrok (Remote Access)

This setup allows you to run Ollama on your server/computer and access it from anywhere via the cloud.

**Step 1: Install Ollama (Same as Option 1)**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.1:8b
```

**Step 2: Install Ngrok**

**Method A: Download Binary**
```bash
# Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

**Method B: Package Manager**
```bash
# Snap (Linux)
sudo snap install ngrok

# Homebrew (Mac)
brew install ngrok/ngrok/ngrok

# Chocolatey (Windows)
choco install ngrok
```

**Step 3: Get Ngrok Auth Token**
1. Sign up at https://dashboard.ngrok.com/signup
2. Copy your auth token from https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure ngrok:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**Step 4: Start Ngrok Tunnel**
```bash
# Basic tunnel (HTTP only, free tier)
ngrok http 11434

# With custom subdomain (requires paid plan)
ngrok http 11434 --subdomain=scholarix-ollama

# With authentication (recommended for security)
ngrok http 11434 --basic-auth="username:password"
```

**Step 5: Copy the Ngrok URL**
You'll see output like:
```
Forwarding    https://xxxx-xx-xxx-xxx-xxx.ngrok-free.app -> http://localhost:11434
```

Copy the `https://xxxx...ngrok-free.app` URL

**Step 6: Configure Application**
- Open Scholarix CRM from any device
- Go to AI Practice → Setup
- Select "🦙 Ollama (Local)"
- Use URL: `https://xxxx...ngrok-free.app`
- Select model: `llama3.1:8b`
- Click "Continue"

---

## 🔧 Advanced Configuration

### Running Ollama as a Service (Linux)

**Create systemd service file:**
```bash
sudo nano /etc/systemd/system/ollama.service
```

**Add content:**
```ini
[Unit]
Description=Ollama AI Service
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=0.0.0.0:11434"

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama
```

---

### Persistent Ngrok Tunnel (Always Online)

**Method 1: Ngrok Agent Configuration**

Create `~/.config/ngrok/ngrok.yml`:
```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  ollama:
    proto: http
    addr: 11434
    subdomain: scholarix-ollama  # Requires paid plan
    # Or use basic auth:
    # auth: "username:password"
```

Start tunnel:
```bash
ngrok start ollama
```

**Method 2: Systemd Service for Ngrok**

Create `/etc/systemd/system/ngrok.service`:
```ini
[Unit]
Description=Ngrok Tunnel for Ollama
After=network.target ollama.service
Requires=ollama.service

[Service]
Type=simple
User=YOUR_USERNAME
ExecStart=/usr/local/bin/ngrok http 11434 --log=stdout
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable ngrok
sudo systemctl start ngrok
```

**Method 3: Docker Compose (Recommended for Production)**

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
    environment:
      - OLLAMA_HOST=0.0.0.0:11434

  ngrok:
    image: ngrok/ngrok:latest
    container_name: ngrok
    command: http ollama:11434 --authtoken=${NGROK_AUTHTOKEN}
    ports:
      - "4040:4040"  # Ngrok web interface
    environment:
      - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
    depends_on:
      - ollama
    restart: unless-stopped

volumes:
  ollama_data:
```

Create `.env` file:
```
NGROK_AUTHTOKEN=your_ngrok_token_here
```

Run:
```bash
docker-compose up -d

# Pull model into Docker
docker exec -it ollama ollama pull llama3.1:8b

# Check ngrok URL
curl http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'
```

---

## 📊 Model Comparison & Recommendations

### Model Selection Guide

| Model | Size | RAM Needed | Speed | Quality | Use Case |
|-------|------|------------|-------|---------|----------|
| **llama3.1:8b** | 4.7GB | 8GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | **Recommended** - Best balance |
| mistral:7b | 4.1GB | 8GB | ⚡⚡⚡⚡ | ⭐⭐⭐ | Fastest, good for high volume |
| gemma2:9b | 5.4GB | 10GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Google's model, creative |
| phi3:medium | 7.9GB | 16GB | ⚡⚡ | ⭐⭐⭐⭐ | Microsoft, technical tasks |
| llama3.1:70b | 40GB | 64GB+ | ⚡ | ⭐⭐⭐⭐⭐ | Best quality, needs GPU |

### Performance Tips

**1. GPU Acceleration (Recommended)**
```bash
# Check if GPU is detected
ollama list

# Ollama automatically uses GPU if available (NVIDIA/AMD/Apple Silicon)
```

**2. Adjust Context Window**
```bash
# For longer conversations, increase context
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hello",
  "options": {
    "num_ctx": 4096
  }
}'
```

**3. Memory Management**
```bash
# Keep only needed models
ollama list
ollama rm MODEL_NAME

# Set memory limit
export OLLAMA_MAX_LOADED_MODELS=1
```

---

## 🔒 Security Best Practices

### 1. Ngrok Authentication
```bash
# Always use auth for production
ngrok http 11434 --basic-auth="admin:$(openssl rand -base64 20)"
```

### 2. Firewall Configuration
```bash
# Only allow local connections to Ollama
sudo ufw allow from 127.0.0.1 to any port 11434
sudo ufw deny 11434
```

### 3. Reverse Proxy (Nginx) - Alternative to Ngrok
```nginx
server {
    listen 443 ssl;
    server_name ollama.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:11434;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Add authentication
        auth_basic "Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Connection Refused" Error**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama
sudo systemctl restart ollama

# Check port
netstat -tlnp | grep 11434
```

**2. "Model Not Found" Error**
```bash
# List available models
ollama list

# Pull the model
ollama pull llama3.1:8b
```

**3. Slow Response Times**
```bash
# Check system resources
htop

# Use smaller model
ollama pull mistral:7b

# Enable GPU (if available)
nvidia-smi  # Check GPU
```

**4. Ngrok "Session Expired"**
```bash
# Free tier ngrok URLs expire after 8 hours
# Restart ngrok or upgrade to paid plan for persistent URLs

ngrok http 11434 --region=us
```

**5. CORS Errors**
```bash
# Add CORS headers to Ollama (if needed)
export OLLAMA_ORIGINS="*"
ollama serve
```

---

## 💰 Cost Comparison

### OpenAI vs Ollama

**OpenAI GPT-4:**
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Average role-play session: ~5K tokens
- Cost per session: **~$0.25**
- 1000 sessions/month: **$250/month**

**Ollama (Self-Hosted):**
- One-time setup cost: $0 (existing hardware) or ~$500-2000 (dedicated server)
- Monthly cost: $10-50 (electricity + internet)
- Cost per session: **$0**
- 1000 sessions/month: **~$30/month** (infrastructure)

**Break-even point: ~120-240 sessions** (1-2 months of regular use)

---

## 📈 Monitoring & Logs

### Check Ollama Logs
```bash
# Systemd service
sudo journalctl -u ollama -f

# Docker
docker logs -f ollama
```

### Monitor Ngrok Traffic
```bash
# Web interface
open http://localhost:4040

# API
curl http://localhost:4040/api/requests/http
```

### Performance Metrics
```bash
# Check model performance
curl http://localhost:11434/api/show -d '{
  "name": "llama3.1:8b"
}'
```

---

## 🚀 Production Deployment Checklist

- [ ] Ollama installed and running as service
- [ ] Model pulled and tested locally
- [ ] Ngrok configured with auth token
- [ ] Persistent ngrok tunnel configured
- [ ] Authentication enabled (basic auth or API key)
- [ ] SSL/TLS enabled (ngrok provides this)
- [ ] Monitoring set up (logs, metrics)
- [ ] Backup plan (multiple models, failover)
- [ ] Firewall rules configured
- [ ] Documentation shared with team
- [ ] Test from remote devices
- [ ] Load testing completed

---

## 📞 Support & Resources

### Official Documentation
- Ollama: https://ollama.ai/docs
- Ngrok: https://ngrok.com/docs
- Llama Models: https://llama.meta.com/

### Community
- Ollama Discord: https://discord.gg/ollama
- Ngrok Community: https://community.ngrok.com/

### Model Libraries
- Ollama Model Library: https://ollama.ai/library
- Hugging Face: https://huggingface.co/models

---

## 🎯 Quick Reference Commands

```bash
# Setup
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.1:8b
ngrok config add-authtoken YOUR_TOKEN
ngrok http 11434

# Management
ollama list                    # List models
ollama rm MODEL_NAME          # Remove model
ollama ps                     # Running models
systemctl status ollama       # Check service

# Testing
curl http://localhost:11434/api/tags  # List models
curl http://localhost:11434/api/generate -d '{"model":"llama3.1:8b","prompt":"Hi"}'

# Monitoring
journalctl -u ollama -f       # Ollama logs
curl http://localhost:4040/api/tunnels  # Ngrok status
```

---

**Last Updated:** November 3, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
