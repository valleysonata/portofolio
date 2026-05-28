# Serverless AI Terminal Portfolio & Canvas Rain Engine

Welcome to my interactive terminal portfolio. This website is built as a fully functional, responsive Unix-like command-line interface. It features a custom HTML5 Canvas graphic matrix-rain engine running seamlessly inside my ASCII logo and an integrated AI recruitment agent trained directly on my professional background.

---

##  Architecture: How It Works Without a Backend (And Why)

When building AI-powered web applications, developers typically use a traditional **Three-Tier Architecture**:
`Your Browser (Frontend) <---> Your Server (Backend) <---> AI Cloud Model (LLM)`

Instead, this project utilizes a **100% Serverless Frontend Architecture**. The browser communicates directly with the cloud:
`Your Browser (Frontend) <----------------------------------> AI Cloud Model (LLM)`

### How it works:
1. **Context Injected at Runtime:** My entire resume data and specialized behavioral instructions are saved directly inside the JavaScript file in the browser as static text strings.
2. **The Cloud Bridge Gateway:** When you type a question into the terminal input and press Enter, JavaScript uses a native browser feature called `fetch()` to send the request straight to `text.pollinations.ai`. This is an open edge routing gateway that connects public browser requests straight to heavy machine learning clusters in the cloud.
3. **Typing Simulation:** When the cloud AI finishes processing the response, it sends a text string back over the internet. My JavaScript intercepts this text and prints it character-by-character every 12 milliseconds while driving an artificial block cursor (`▋`) forward to perfectly mimic an old physical terminal screen.

### Why I chose a serverless architecture:
* **Zero Infrastructure Overhead:** Traditional backends require running a server 24/7 (using Node.js, Python Flask, etc.) which costs money, requires constant maintenance, and introduces security vulnerabilities. This site is entirely static, costing nothing to host.
* **Instantaneous Global Scaling:** Because the entire site consists of just a single frontend file, it is cached and served instantly across global networks (GitHub Pages CDN) directly to the user.
* **Low-Latency Performance:** Cutting out the middleman server reduces the physical distance your message has to travel over the internet, allowing the AI agent to begin processing requests much faster.

---

##  AI Agent Prompt Engineering & Guardrails

To ensure the embedded AI functions reliably as a professional portfolio representative, the system prompt strictly enforces the following design constraints:
* **Strict Context Locking:** The agent is explicitly forbidden from hallucinating or answering out-of-bounds questions (like generic chat or writing external code). It can only answer questions using the embedded resume text.
* **Jekyll-Proof Data Injection:** Originally, the resume data was injected into the JavaScript system prompt using a template literal tag (`${RESUME_CONTEXT}`). When pushed to GitHub Pages, the backend compiler (Jekyll) mistook this syntax for a server-side environment variable. It silently scrubbed the data, leaving the AI's system prompt blank and causing it to hallucinate. To prevent this, the data is isolated safely inside the standard HTML DOM structure where the compiler leaves it untouched, preserving full context tracking at runtime.
* **Visual Theme Alignment:** To match the vintage terminal theme, the system prompt forces the AI model to respond entirely in lowercase syntax, limit answers to 2–3 sentences max, and refrain from outputting raw markdown or bullet points which would break the layout metrics.

---

##  Tech Stack & Features

* **UI & Structure:** Monolithic semantic HTML5 and responsive retro CSS3 layout.
* **Graphics Engine:** Native JavaScript HTML5 Canvas 2D Context API calculating pixel-perfect monospaced character coordinates to render independent falling rain paths inside text characters.
* **AI Processing:** Serverless API integration with Pollinations AI routing infrastructure.
