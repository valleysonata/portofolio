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

## About

A retro terminal-styled personal portfolio for Adyaraka Banyu Langit. The page drops visitors straight into a fake `~/` shell: an ASCII name logo with falling rain, a `cat contact.txt` link row, and an interactive `raka-agent` chat at the bottom that answers questions about the owner's resume in real time.

Everything is static - no framework, no bundler - and the whole site is one HTML file plus a few CSS and JS modules. The AI agent runs through a small Cloudflare Worker that proxies requests to Groq, so the API key never ships in the frontend bundle.

## Features

- **ASCII matrix rain** - canvas animation over the name logo, each column drops at a randomised speed
- **raka-agent** - AI assistant trained on the resume, answers recruiter questions in real time
- **Typewriter renderer** - agent replies stream in character by character like a real terminal
- **Staggered entrance** - sections fade in sequentially on load
- **No framework, no bundler** - works offline, deploys instantly on GitHub Pages
- **Secure backend** - API key hidden behind a Cloudflare Worker proxy

## Tech stack

| Layer | Tech |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 - custom properties, keyframe animations |
| Logic | Vanilla JavaScript (ES2020), modular IIFE pattern |
| AI API | Groq AI (via Cloudflare Worker proxy) |
| Backend | Cloudflare Workers |
| Font | [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) |
| Hosting | GitHub Pages |

## File structure

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

## How it works

### ASCII rain (`js/matrix.js`)
Reads a hard-coded array of ASCII art lines and sweeps "drops" down each column using `requestAnimationFrame`. Characters are coloured white to grey to dark based on their distance from the active drop head. Each column has its own randomised fall speed so the rain feels organic.

### AI agent (`js/chat.js` + `js/config.js`)
On Enter, `chat.js` posts the user's message along with a system prompt to a Cloudflare Worker. The Worker proxies the request to Groq AI, keeping the API key secure. The system prompt is assembled in `config.js` from constants plus the resume text read out of a hidden `#raw-resume-context` DOM node in `index.html`. The reply is piped through `messages.js`'s typewriter renderer.

### Backend (`worker/`)
A small Cloudflare Worker that proxies requests to Groq AI, hides the API key (stored as a Cloudflare secret), and handles CORS. Free tier covers 100,000 requests/day.

### Updating the resume
Edit the hidden `<div id="raw-resume-context">` block inside `index.html`. The agent reads it at page load - no other files need touching.

## Local development

No build tools needed. Clone and open `index.html` directly, or use a dev server:

```bash
git clone https://github.com/valleysonata/portofolio.git
cd portofolio

# Node
npx serve .

# or Python
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Deployment

Hosted on **GitHub Pages** from the `main` branch root. Any push to `main` auto-deploys to [valleysonata.github.io/portofolio](https://valleysonata.github.io/portofolio/).

No CI, no build step, no config needed beyond the Pages setting in the repository.

## Backend deployment

The Cloudflare Worker is already deployed at:
`https://raka-agent-proxy.raka-portfolio.workers.dev`

To deploy your own version:
1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`
3. Set API key: `wrangler secret put GROQ_API_KEY`
4. Deploy: `wrangler deploy`

See `worker/SETUP.md` for detailed instructions.

## License

MIT (c) 2025 Adyaraka Banyu Langit - see [LICENSE](LICENSE) for full text.

---

## The journey: V1 to V2

This portfolio went through a complete rebuild. Here's what happened and what I learned.

### V1: the original build (Pollinations AI)

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

### What went wrong with V1

**1. Pollinations API deprecated**
The free tier started returning 429 "Too Many Requests" errors, anonymous users got rate-limited, and the API showed a deprecation notice. Chat completely broke with the "communication channel closed" error.

**2. API key exposure**
While switching to Groq AI, the API key was accidentally committed to a public GitHub repo. GitHub's secret scanning detected it, Groq sent a security alert, and the key was disabled - forcing a rotation.

**3. Git mess**
A push went to the wrong repository (a different project). Trying to fix it with `git pull --rebase` caused conflicts. The fix was `rm -rf .git`, which deleted all 20+ original commits. The project had to be rebuilt from scratch.

**4. File structure issues**
Files got nested in `Downloads/portofolio-main (1)/portofolio-main/` paths, and coffee shop project files accidentally got mixed in. The repo structure was messy and unprofessional.

**5. No backend**
The API key was sitting in the frontend code, public to anyone who opened DevTools. No way to hide credentials.

### V2: the rebuild

**New tech stack:**
- Frontend: HTML, CSS, vanilla JavaScript (same as V1)
- AI API: Groq AI (`llama-3.3-70b-versatile`)
- Backend: Cloudflare Workers (free tier, 100k requests/day)
- Hosting: GitHub Pages
- Architecture: Frontend calls Cloudflare Worker, Worker calls Groq AI

**Key improvements:**

1. **Secure API key storage** - key is a Cloudflare secret, never in frontend
2. **Clean repo structure** - flat root, no nested folders, no leftover files, single clean commit
3. **Reliable AI service** - Groq AI is fast, free, and not rate-limited
4. **Proper backend** - Worker proxies requests, handles CORS, hides credentials
5. **Better documentation** - clear setup, backend guide, architecture notes

### What I learned

1. **Always use environment variables or secrets for API keys.** Never commit them to public repos.
2. **Don't delete git history casually.** It's hard to recover and you lose valuable context.
3. **Verify the remote before pushing.** Accidentally pushing to the wrong repo causes chaos.
4. **Use a backend for API key security.** Frontend-only architecture is fine for no-key APIs, but you need a backend when keys are required.
5. **Read error messages carefully.** "Communication channel closed" was clearly an API issue, not a code issue.
6. **Test before declaring victory.** The chat should have been tested end-to-end (including the CORS preflight) before calling it done.
