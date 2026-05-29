# raka — portfolio

<div align="center">

[![Live Site](https://img.shields.io/badge/live%20site-valleysonata.github.io-brightgreen?style=for-the-badge&logo=github)](https://valleysonata.github.io/portofolio/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Terminal-themed personal portfolio with an AI chat agent.**  
Zero build steps. Zero dependencies. Pure HTML, CSS, and vanilla JS.

[**→ View Live**](https://valleysonata.github.io/portofolio/)

</div>

---

## Features

- **ASCII matrix rain** — canvas animation over the name logo, each column drops at a randomised speed
- **raka-agent** — AI assistant trained on the resume, answers recruiter questions in real time
- **Typewriter renderer** — agent replies stream in character by character like a real terminal
- **Staggered entrance** — sections fade in sequentially on load
- **No framework, no bundler** — works offline, deploys instantly on GitHub Pages

---

## File Structure

```
portfolio/
├── index.html            # Markup + hidden resume context for the AI agent
├── LICENSE               # MIT License
├── README.md             # You're reading it
├── css/
│   ├── reset.css         # Browser default reset
│   ├── base.css          # Body, typography, text selection
│   ├── layout.css        # Terminal prompt chrome, canvas wrapper, contact row
│   ├── animations.css    # @keyframes + staggered .l2 .l3 .l4 delays
│   ├── buttons.css       # .btn component
│   └── chat.css          # Chat log, messages, input row, cursors
└── js/
    ├── config.js         # API settings, system prompt, resume context reader
    ├── cursor.js         # Block cursor blink toggle
    ├── messages.js       # appendMessage(), typeOut() typewriter renderer
    ├── matrix.js         # Canvas ASCII rain engine
    └── chat.js           # Orchestration: fetch, input lock, event listeners
```

---

## How it works

### ASCII rain (`js/matrix.js`)
Reads a hard-coded array of ASCII art lines and sweeps "drops" down each column using `requestAnimationFrame`. Characters are coloured white → grey → dark based on their distance from the active drop head. Each column has its own randomised fall speed so the rain feels organic.

### AI agent (`js/chat.js` + `js/config.js`)
On Enter, `chat.js` posts the user's message along with a system prompt to the [Pollinations AI API](https://pollinations.ai) (no API key required). The system prompt is assembled in `config.js` from constants plus the resume text read out of a hidden `#raw-resume-context` DOM node in `index.html`. The reply is piped through `messages.js`'s typewriter renderer.

### Updating the resume
Edit the hidden `<div id="raw-resume-context">` block inside `index.html`. The agent reads it at page load, no other files need touching.

---

## Local development

No build tools needed. Clone and open `index.html` directly, or use a dev server:

```bash
# Clone
git clone https://github.com/valleysonata/portofolio.git
cd portofolio

# Option 1 — Node
npx serve .

# Option 2 — Python
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

---

## Deployment

Hosted on **GitHub Pages** from the `main` branch root.  
Any push to `main` auto-deploys to → [valleysonata.github.io/portofolio](https://valleysonata.github.io/portofolio/)

No CI, no build step, no config needed beyond the Pages setting in the repo.

---

## Tech stack

| Layer | Tech |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 — custom properties, keyframe animations |
| Logic | Vanilla JavaScript (ES2020), modular IIFE pattern |
| AI API | [Pollinations AI](https://pollinations.ai) — no key required |
| Font | [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts |
| Hosting | GitHub Pages |

---

## License

MIT © 2025 Adyaraka Banyu Langit — see [`LICENSE`](LICENSE) for full text.
