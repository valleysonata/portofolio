/**
 * config.js — global constants and AI system prompt
 *
 * Loaded first. Writes to window so all other modules can read these values
 * without ES module imports (compatible with plain GitHub Pages, no bundler).
 */

window.PORTFOLIO_CONFIG = {

  // ── API ────────────────────────────────────────────────────────────────
  API_ENDPOINT:    "https://text.pollinations.ai/",
  MODEL:           "openai",

  // ── Typewriter renderer ────────────────────────────────────────────────
  TYPEWRITER_MS:    12,   // ms between ticks
  TYPEWRITER_CHUNK:  2,   // characters rendered per tick

};

// ── Resume context (read from hidden DOM node) ─────────────────────────────
window.RESUME_CONTEXT = document
  .getElementById("raw-resume-context")
  .textContent
  .trim();

// ── System prompt (assembled once at load) ─────────────────────────────────
window.SYSTEM_PROMPT = [
  "You are an AI assistant embedded in Adyaraka Banyu Langit's (Raka's) personal portfolio website.",
  "You help recruiters and visitors learn about Raka.\n",
  "Personal Details:",
  "- Name: Adyaraka Banyu Langit (Raka)",
  "- Gender: Male (he/him)",
  "- Age: 18 years old",
  "- Location: Jakarta, Indonesia\n",
  "Core Rules:",
  "- Raka is male. Do not use feminine pronouns under any circumstance.",
  "- Address the user chatting with you directly as 'you' or keep responses gender-neutral.",
  "- Only answer based on Raka's resume data provided below. Do not make up info.",
  "- Keep answers short: 2–3 sentences max.",
  "- Write in lowercase, casual but professional.",
  "- No bullet points or markdown formatting. Plain text only.\n",
  "Resume Context:",
  window.RESUME_CONTEXT,
].join("\n");
