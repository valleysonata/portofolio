# Cloudflare Worker Setup Instructions

## What This Does
This Worker acts as a proxy between your portfolio frontend and the Groq API. It keeps your API key secret by handling it on the backend.

## Setup Steps

### 1. Create Cloudflare Account (Free, 2 minutes)
- Go to https://dash.cloudflare.com/sign-up
- Sign up with email (no credit card needed)
- Verify your email

### 2. Install Wrangler (Cloudflare's CLI)
Open PowerShell and run:
```powershell
npm install -g wrangler
```

If you don't have npm, install Node.js first from https://nodejs.org

### 3. Login to Cloudflare
```powershell
wrangler login
```
This will open a browser window to authorize.

### 4. Set Your API Key as a Secret
```powershell
cd worker
wrangler secret put GROQ_API_KEY
```
When prompted, paste your Groq API key (get one at https://console.groq.com)

### 5. Deploy the Worker
```powershell
wrangler deploy
```

You'll get a URL like: `https://raka-agent-proxy.YOUR_SUBDOMAIN.workers.dev`

### 6. Update Your Portfolio Config
Open `js/config.js` in your portfolio and change:
```javascript
API_ENDPOINT: "https://raka-agent-proxy.YOUR_SUBDOMAIN.workers.dev",
GROQ_API_KEY: "",  // Remove the key
```

### 7. Push to GitHub
```powershell
cd ..
git add .
git commit -m "Add backend proxy"
git push origin main
```

## Free Tier Limits
- 100,000 requests/day
- More than enough for a portfolio

## Need Help?
If you get stuck, let me know what error you see and I'll help!
