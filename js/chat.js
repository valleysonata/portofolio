/**
 * chat.js — chat orchestration
 *
 * Ties config, cursor, and messages together.
 * Handles the API call, input locking, and event listeners.
 *
 * Depends on: config.js, cursor.js, messages.js (loaded before this in index.html)
 */

(function () {
  "use strict";

  const { API_ENDPOINT, MODEL } = window.PORTFOLIO_CONFIG;
  const chatInput = document.getElementById("chat-input");

  // ── Send ─────────────────────────────────────────────────────────────────

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value    = "";
    chatInput.disabled = true;

    window.Messages.append("user", text);
    const contentEl = window.Messages.append("agent", "", true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: window.SYSTEM_PROMPT },
            { role: "user",   content: text },
          ],
          model:    MODEL,
          jsonMode: false,
        }),
      });

      // Clear waiting cursor before rendering reply
      document.querySelector(".typing-dot")?.remove();

      if (!response.ok) {
        contentEl.textContent = "error: communication channel closed. retry request.";
        finalizeInput();
        return;
      }

      const reply = (await response.text()).toLowerCase().trim();

      window.Messages.typeOut(contentEl, reply, () => {
        contentEl.parentElement.classList.add("done");
        finalizeInput();
      });

    } catch (err) {
      document.querySelector(".typing-dot")?.remove();
      contentEl.textContent = "error: system failure — connection offline.";
      console.error("[raka-agent]", err);
      finalizeInput();
    }
  }

  function finalizeInput() {
    chatInput.disabled = false;
    chatInput.focus();
    window.Cursor.update();
  }

  // ── Events & init ─────────────────────────────────────────────────────────

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  window.Cursor.update();
})();
