
<img width="960" height="452" alt="sdads" src="https://github.com/user-attachments/assets/4f1ad39a-13f9-4aca-a64f-eee123fd8152" />


## Portfolio V2🍎

<div align="center">

[![Live Site](https://img.shields.io/badge/live%20site-valleysonata.github.io-brightgreen?style=for-the-badge&logo=github)](https://valleysonata.github.io/portofolio/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**macOS Sequoia-inspired desktop environment with an AI chat agent.**

[**View Live**](https://valleysonata.github.io/portofolio/)

</div>


---

A fully interactive macOS Sequoia-style desktop environment that runs entirely in the browser. Features a working terminal with an AI agent, a Safari-style browser, Spotify player, Launchpad app launcher, and native-feeling window management with genie-like animations. The AI agent runs through a Cloudflare Worker proxy to Groq, keeping the API key secure.

## Features

### Desktop Environment
- **Apple boot screen** — CSS keyframe loading bar, desktop only (hidden on mobile)
- **macOS Sequoia menu bar** — app name, Wi-Fi, battery with real-time level/charging indicator, live clock
- **Glassy dock** — bounce animations, active window dots, hover scale effects
- **Desktop icons** — double-click to open Terminal
- **Launchpad** — fullscreen overlay with search bar, 6-app grid, Esc/click-outside close

### Windows
- **Genie effect** — CSS 3D transform open/close/minimize animations targeting dock position
- **Draggable windows** — all windows are drag-to-move via titlebar
- **Resizable windows** — drag edge/corner handles to resize (min 480×300)
- **Traffic light buttons** — close (red), minimize (yellow), maximize (green) with hover symbols
- **Menubar updates** — app name changes to match focused window

### Terminal
- **ASCII matrix rain** — canvas animation over the R logo, randomized column speeds
- **raka-agent** — AI assistant trained on the resume, answers recruiter questions in real time
- **Typewriter renderer** — agent replies stream character by character
- **neofetch-style layout** — system info on the right, matrix canvas on the left

### Safari Browser
- **Address bar** — type URLs and press Enter to browse
- **Multi-proxy fallback** — tries multiple CORS proxies with timeout for reliability
- **Start page** — Favorites grid with GitHub, LinkedIn, Gmail icons
- **Navigation** — back/forward buttons with history stack
- **Loading bar** — animated progress indicator
- **Error page** — dark-themed failure page for blocked/inaccessible sites

### Spotify Player
- **iFrame embed** — real playable Spotify playlist via Spotify IFrame API
- **Rounded window** — macOS-style window frame with clipped embed content

### Mobile
- **Responsive fallback** — desktop UI hidden on screens < 768px
- **Mobile terminal** — simplified terminal with AI chat, matrix rain, contact buttons
- **No boot screen** — jumps straight to content on mobile

## Tech stack

| Layer | Tech |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 — custom properties, keyframe animations, glassmorphism, CSS 3D transforms |
| Logic | Vanilla JavaScript (ES2020), modular IIFE pattern |
| AI API | Groq AI (`llama-3.3-70b-versatile`) |
| Backend | Cloudflare Workers (free tier, 100k req/day) |
| Fonts | [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono), system `-apple-system` stack |
| Hosting | GitHub Pages |

## File structure

```
portfolio/
|-- index.html               # Markup + hidden resume context for the AI agent
|-- css/
|   |-- reset.css             # Browser default reset
|   |-- base.css              # Body background, vignette, text-shadow: none
|   |-- desktop.css           # Menu bar, dock, desktop icons, mobile media query
|   |-- window.css            # Window chrome, titlebar, traffic lights, resize handles,
|   |                         # genie animations, Safari/Spotify size overrides
|   |-- safari-window.css     # Safari toolbar, address bar, start page, error page
|   |-- spotify-window.css    # Spotify dark theme, embed container
|   |-- launchpad.css         # Fullscreen overlay, search bar, app grid, close hint
|   |-- apple-boot.css        # Apple boot screen + keyframe animation + mobile hide
|   |-- layout.css            # Neofetch two-column layout
|   |-- animations.css        # @keyframes + staggered delays
|   |-- chat.css              # Chat log, messages, input row, cursors
|   |-- boot.css              # Boot log line styles
|   |-- buttons.css           # Contact link buttons
|-- js/
|   |-- config.js             # API settings, system prompt, resume context reader
|   |-- cursor.js             # Block cursor blink toggle
|   |-- messages.js           # appendMessage(), typeOut() typewriter renderer
|   |-- matrix.js             # Canvas ASCII rain engine (desktop + mobile)
|   |-- boot.js               # Terminal boot sequence (whoami block)
|   |-- chat.js               # Orchestration: fetch, input lock, event listeners
|   |-- desktop.js            # Boot screen, genie effect, window drag/resize,
|   |                         # menubar updates, dock handlers, keyboard shortcuts
|   |-- safari.js             # Safari browser: CORS proxy, srcdoc rendering, history
|   |-- spotify.js            # Spotify iFrame API embed
|   |-- launchpad.js          # Launchpad toggle, app dispatch
|   |-- battery.js            # Battery API, SVG level updates, charging bolt
|-- assets/
|   |-- wallpaper.jpg         # Desktop background
|   |-- apple-logo.svg        # Apple logo for boot screen + menubar
|   |-- terminal-icon.svg     # Terminal dock/desktop icon
|   |-- safari-icon.png       # Safari dock/launchpad icon
|   |-- spotify-icon.png      # Spotify dock/launchpad icon
|   |-- github-icon.png       # GitHub launchpad icon
|   |-- gmail-icon.png        # Gmail launchpad icon
|   |-- launchpad-icon.svg    # Launchpad grid icon
|-- worker/                   # Cloudflare Worker backend (hides API key)
|   |-- index.js              # Worker script
|   |-- wrangler.toml         # Cloudflare config
|   |-- package.json          # Dependencies
|   |-- deploy.bat            # One-click deployment script
|   |-- SETUP.md              # Setup instructions
|-- LICENSE
|-- README.md
```

## How it works

### Desktop environment (`js/desktop.js`)
On load, the Apple boot screen plays a CSS-animated loading bar, then fades out to reveal the desktop. The boot sequence initializes the terminal's boot.js which types out system info. Windows open with a genie effect — a CSS 3D transform that compresses and skews the window toward the dock icon position. All windows support drag (via titlebar mousedown), resize (via edge/corner handles), and keyboard shortcuts (Ctrl/Cmd+W to close, Ctrl/Cmd+M to minimize).

### Safari browser (`js/safari.js`)
URLs are fetched through a cascade of CORS proxies with 6-second timeouts. If a proxy is down, it auto-falls back to the next one. The fetched HTML is rendered in a sandboxed `srcdoc` iframe. Sites that block external embedding show a dark error page. The start page displays favorites (GitHub, LinkedIn, Gmail) with PNG icons.

### Spotify player (`js/spotify.js`)
Uses the official Spotify IFrame API to embed a real playable playlist. The iframe is created dynamically and fills the window body. The window has rounded corners (border-radius: 10px) while the embed container clips with overflow: hidden for a clean look.

### AI agent (`js/chat.js` + `js/config.js`)
On Enter, `chat.js` posts the user's message along with a system prompt to a Cloudflare Worker. The Worker proxies the request to Groq AI, keeping the API key secure. The system prompt is assembled in `config.js` from constants plus the resume text read out of a hidden `#raw-resume-context` DOM node in `index.html`. The reply is piped through `messages.js`'s typewriter renderer.

### Battery indicator (`js/battery.js`)
Uses the Battery API (`navigator.getBattery()`) to read real charge level and charging state. The SVG fill width scales with percentage. A green lightning bolt appears when charging. Falls back to a static 75% fill on browsers that don't support the API (Safari/Firefox).

### Backend (`worker/`)
A Cloudflare Worker that proxies requests to Groq AI, hides the API key (stored as a Cloudflare secret), and handles CORS. Free tier covers 100,000 requests/day.

### Updating the resume
Edit the hidden `<div id="raw-resume-context">` block inside `index.html`. The agent reads it at page load — no other files need touching.

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

This portfolio went through a complete rebuild from a terminal-only chatbot to a full macOS desktop simulation.

### V1: terminal chatbot

The first version was a simple terminal-themed page with an AI chat agent powered by Pollinations AI, later switched to Groq AI after Pollinations deprecated their free tier.

### V2: macOS desktop environment

The rebuild transformed the single terminal into a fully interactive macOS Sequoia-inspired desktop with multiple apps, window management, and native-feeling animations — all in vanilla JS with no frameworks.

**What changed:**
- Apple boot screen with CSS keyframe loading bar
- macOS menu bar with live clock, battery indicator, and dynamic app names
- Glassy dock with bounce animations and active window dots
- Draggable + resizable windows with traffic light buttons
- Genie effect open/close/minimize animations
- Safari browser with CORS proxy fallback and start page
- Spotify player with real iFrame embed
- Launchpad fullscreen overlay with search
- Mobile-responsive fallback
- Battery API integration with charging state detection
