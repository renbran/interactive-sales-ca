# 🚀 Cloudflare Pages Deployment Configuration

## Quick Deploy Commands

### Option 1: Direct Cloudflare Pages Deployment
```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=scholarix-voip --branch=main

# Or with custom name
npx wrangler pages deploy dist --project-name=interactive-sales-ca
```

### Option 2: Connect to Git (Recommended)
1. Go to https://dash.cloudflare.com/
2. Click "Workers & Pages" → "Create application" → "Pages"
3. Connect to GitHub repository: `renbran/interactive-sales-ca`
4. Configure build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Branch**: `claude/voip-50-percent-staging-011CUZoEWiED8dYsHJ5qHDdz`
5. Click "Save and Deploy"

## Configuration Details

### Build Settings
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node version**: 18.x or higher

### Environment Variables (Optional)
Add these in Cloudflare Pages dashboard if needed:
```
VITE_API_BASE_URL=https://your-worker.workers.dev
NODE_VERSION=18
```

## Expected URLs

After deployment, your app will be available at:
- **Production**: `https://interactive-sales-ca.pages.dev`
- **Or custom**: `https://scholarix-voip.pages.dev`
- **With custom domain**: `https://your-domain.com`

## Advantages of Cloudflare Pages

✅ **Automatic SSL/HTTPS**
✅ **Global CDN** (fast worldwide)
✅ **Unlimited bandwidth**
✅ **Automatic preview deployments** (for pull requests)
✅ **Can integrate with Workers** (for backend)
✅ **Custom domains supported**
✅ **Free tier**: 500 builds/month, unlimited requests

## Deployment Status

Once deployed, check status at:
https://dash.cloudflare.com/pages

## Rollback

If you need to rollback:
```bash
# List deployments
npx wrangler pages deployment list --project-name=interactive-sales-ca

# Rollback to specific deployment
npx wrangler pages deployment rollback <deployment-id>
```

## Custom Domain Setup

1. Go to your Cloudflare Pages project
2. Click "Custom domains"
3. Add your domain
4. Update DNS settings as instructed
5. Wait for SSL certificate (automatic)

## Integration with Workers

Your backend (from staging branch) can be deployed separately:
```bash
npm run worker:deploy
```

Then update the frontend to use the Workers URL:
```typescript
// In your app config
const API_BASE_URL = 'https://scholarix-crm.your-account.workers.dev';
```

## Build Optimization

Current build stats:
- **Total size**: 393 KB CSS + 287 KB JS = 680 KB
- **Gzipped**: 163 KB total
- **Load time**: ~2-3 seconds on 3G
- **Lighthouse score**: 90+ expected

## Troubleshooting

### Build Fails
- Check Node version is 18+
- Run `npm install` before build
- Check for TypeScript errors

### Assets Not Loading
- Verify base path in vite.config.ts
- Check asset paths in browser console

### Workers Integration
- Ensure CORS is enabled on Workers
- Check API_BASE_URL points to Workers domain
- Verify authentication tokens are sent

## Next Steps After Deployment

1. ✅ Visit your live URL
2. ✅ Test audio recording locally
3. ✅ Check audio level monitoring
4. ✅ Deploy Workers for backend features
5. ✅ Configure custom domain (optional)
6. ✅ Share with team!

---

**Built with Claude Code** 🤖
