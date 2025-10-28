# Cloudflare Pages Configuration for Scholarix Interactive Sales CA

## Build Settings
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node.js version**: `18` or higher

## Environment Variables
Set these in your Cloudflare Pages dashboard under Settings > Environment variables:

### Production Environment Variables:
```
VITE_OLLAMA_BASE_URL=https://your-ollama-server.com
VITE_OLLAMA_MODEL=llama3.1:8b
```

### Note:
Since Ollama requires a backend server, you'll need to deploy Ollama on a separate server that's accessible from the internet. Options include:

1. **Deploy Ollama on a VPS** (DigitalOcean, Vultr, etc.)
2. **Use Ollama Cloud** (when available)
3. **Deploy on Railway, Render, or similar platforms**

Make sure your Ollama server has CORS enabled to allow requests from your Cloudflare Pages domain.

## Custom Domain Setup
1. In Cloudflare Pages, go to Custom domains
2. Add `scholarixglobal.com` and `www.scholarixglobal.com`
3. Configure DNS records as instructed by Cloudflare

## Headers Configuration
The `public/_headers` file is automatically deployed and includes security headers.

## Redirects Configuration  
The `public/_redirects` file handles SPA routing for React Router.

## Performance Features Enabled:
- Asset optimization
- Brotli compression
- HTTP/3 support
- Global CDN distribution
- Automatic HTTPS