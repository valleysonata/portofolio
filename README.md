# raka - portfolio V2

<div align="center">

[![Live Site](https://img.shields.io/badge/live%20site-valleysonata.github.io-brightgreen?style=for-the-badge&logo=github)](https://valleysonata.github.io/portofolio/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Terminal-themed personal portfolio with an AI chat agent.**  
Pure HTML, CSS, and vanilla JS.

[**View Live**](https://valleysonata.github.io/portofolio/)

</div>

---

## Features

- **ASCII matrix rain** - canvas animation over the name logo, each column drops at a randomised speed
- **raka-agent** - AI assistant trained on the resume, answers recruiter questions in real time
- **Typewriter renderer** - agent replies stream in character by character like a real terminal
- **Staggered entrance** - sections fade in sequentially on load
- **No framework, no bundler** - works offline, deploys instantly on GitHub Pages
- **Secure backend** - API key hidden behind Cloudflare Worker proxy

---

## The Journey: V1 to V2

This portfolio went through a complete rebuild. Here's what happened and what I learned.

### V1: The Original Build (Pollinations AI)

The first version of the portfolio used the [Pollinations AI API](https://pollinations.ai) - a free, no-auth-required service that seemed perfect for a simple project.

**Tech stack:**
- Frontend: HTML, CSS, vanilla JavaScript
- AI API: Pollinations (`https://text.pollinations.ai/`)
- Hosting: GitHub Pages
- Architecture: Direct API calls from frontend

**What worked:**
- Initial deployment was smooth
- Free with no API key required
- Simple architecture
- GitHub Pages deployment was instant

### What Went Wrong With V1

**Problem 1: Pollinations API Deprecated**
- The free tier started returning 429 "Too Many Requests" errors
- Anonymous users were rate-limited
- The API showed a deprecation notice
- Chat completely broke with "communication channel closed" error

**Problem 2: API Key Exposure**
- During development, I switched to Groq AI and accidentally committed the API key to a public GitHub repo
- GitHub's secret scanning detected it
- Groq sent a security alert
- The key was disabled
- I had to rotate to a new key

**Problem 3: Git Mess**
- Accidentally pushed to the wrong repository (a different project)
- Tried to fix it with `git pull --rebase` which caused conflicts
- Ended up deleting all git history with `rm -rf .git`
- Lost all 20+ original commits
- Had to rebuild from scratch

**Problem 4: File Structure Issues**
- Files got nested in `Downloads/portofolio-main (1)/portofolio-main/` paths
- Coffee shop project files accidentally got mixed in
- Repo structure was messy and unprofessional

**Problem 5: No Backend**
- API key was in frontend code (public)
- No way to hide credentials
- Security risk

### V2: The Rebuild

I rebuilt the entire portfolio with proper architecture and security.

**New tech stack:**
- Frontend: HTML, CSS, vanilla JavaScript (same as V1)
- AI API: Groq AI (llama-3.3-70b-versatile)
- Backend: Cloudflare Workers (free tier, 100k requests/day)
- Hosting: GitHub Pages
- Architecture: Frontend calls Cloudflare Worker, Worker calls Groq AI

**Key improvements:**

1. **Secure API key storage**
   - API key stored as Cloudflare Worker secret
   - Never exposed in frontend code
   - Safe even if repo is public

2. **Clean repo structure**
   - All files at root level (no nested folders)
   - No leftover files from other projects
   - Professional organization
   - Single clean commit

3. **Reliable AI service**
   - Groq AI is fast and reliable
   - No rate limiting issues
   - Better quality responses
   - Generous free tier

4. **Proper backend architecture**
   - Cloudflare Worker proxies API calls
   - Hides credentials
   - Handles CORS
   - Global edge network for speed

5. **Better documentation**
   - Clear setup instructions
   - Backend deployment guide
   - Architecture explanation

### What I Learned

1. **Always use environment variables or secrets for API keys** - Never commit them to public repos
2. **Don't delete git history casually** - It's hard to recover and you lose valuable context
3. **Verify the remote before pushing** - Accidentally pushing to wrong repos causes chaos
4. **Use a backend for API key security** - Frontend-only architecture is fine for no-key APIs, but you need a backend when keys are required
5. **Read error messages carefully** - "Communication channel closed" was clearly an API issue, not a code issue
6. **Test before declaring victory** - I should have tested the chat more thoroughly before saying it was fixed

### Migration from V1 to V2

If you have an existing V1 portfolio and want to upgrade:

1. Get a free Groq API key from https://console.groq.com
2. Install Wrangler: `npm install -g wrangler`
3. Login: `wrangler login`
4. Deploy the worker (see worker/SETUP.md)
5. Update `js/config.js` with your worker URL
6. Remove the API key from your code
7. Push to GitHub

The frontend code stayed mostly the same - just the API endpoint and key changed.

---

## File Structure

```
portfolio/
|-- css/
|   |-- reset.css         # Browser default reset
|   |-- base.css          # Body, typography, text selection
|   |-- layout.css        # Terminal prompt chrome, canvas wrapper, contact row
|   |-- animations.css    # @keyframes + staggered .l2 .l3 .l4 delays
|   |-- buttons.css       # .btn component
|   |-- chat.css          # Chat log, messages, input row, cursors
|-- js/
|   |-- config.js         # API settings, system prompt, resume context reader
|   |-- cursor.js         # Block cursor blink toggle
|   |-- messages.js       # appendMessage(), typeOut() typewriter renderer
|   |-- matrix.js         # Canvas ASCII rain engine
|   |-- chat.js           # Orchestration: fetch, input lock, event listeners
|-- worker/               # Cloudflare Worker backend (hides API key)
|   |-- index.js          # Worker script
|   |-- wrangler.toml     # Cloudflare config
|   |-- package.json      # Dependencies
|   |-- deploy.bat        # One-click deployment script
|   |-- SETUP.md          # Setup instructions
|-- LICENSE
|-- README.md
|-- index.html            # Markup + hidden resume context for the AI agent
```

---

## How it works

### ASCII rain (js/matrix.js)
Reads a hard-coded array of ASCII art lines and sweeps "drops" down each column using requestAnimationFrame. Characters are coloured white to grey to dark based on their distance from the active drop head. Each column has its own randomised fall speed so the rain feels organic.

### AI agent (js/chat.js + js/config.js)
On Enter, chat.js posts the user's message along with a system prompt to a Cloudflare Worker backend. The Worker proxies the request to Groq AI API, keeping the API key secure. The system prompt is assembled in config.js from constants plus the resume text read out of a hidden #raw-resume-context DOM node in index.html. The reply is piped through messages.js's typewriter renderer.

### Backend (worker/)
The worker/ directory contains a Cloudflare Worker that:
- Proxies requests to Groq AI API
- Hides the API key (stored as Cloudflare secret)
- Handles CORS headers
- Free tier: 100,000 requests/day

### Updating the resume
Edit the hidden `<div id="raw-resume-context">` block inside index.html. The agent reads it at page load, no other files need touching.

---

## Local development

No build tools needed. Clone and open index.html directly, or use a dev server:

```bash
# Clone
git clone https://github.com/valleysonata/portofolio.git
cd portofolio

# Option 1 - Node
npx serve .

# Option 2 - Python
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

---

## Deployment

Hosted on **GitHub Pages** from the `main` branch root.  
Any push to `main` auto-deploys to [valleysonata.github.io/portofolio](https://valleysonata.github.io/portofolio/)

No CI, no build step, no config needed beyond the Pages setting in the repository.

---

## Backend Deployment

The Cloudflare Worker is already deployed at:
`https://raka-agent-proxy.raka-portfolio.workers.dev`

To deploy your own version:
1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`
3. Set API key: `wrangler secret put GROQ_API_KEY`
4. Deploy: `wrangler deploy`

See worker/SETUP.md for detailed instructions.

---

## Tech stack

| Layer | Tech |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 - custom properties, keyframe animations |
| Logic | Vanilla JavaScript (ES2020), modular IIFE pattern |
| AI API | Groq AI (via Cloudflare Worker proxy) |
| Backend | Cloudflare Workers |
| Font | [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts |
| Hosting | GitHub Pages |

---

## License

MIT (c) 2025 Adyaraka Banyu Langit - see [LICENSE](LICENSE) for full text.
