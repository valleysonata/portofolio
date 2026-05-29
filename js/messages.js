/**
 * messages.js — chat message rendering
 *
 * Handles appending message rows to the chat log and animating
 * agent replies with a typewriter effect.
 *
 * Depends on: window.PORTFOLIO_CONFIG (config.js)
 * Writes to:  window.Messages (consumed by chat.js)
 */

window.Messages = (function () {
  "use strict";

  const { TYPEWRITER_MS, TYPEWRITER_CHUNK } = window.PORTFOLIO_CONFIG;
  const chatLog = document.getElementById("chat-log");

  /**
   * Append a new message row to the chat log.
   *
   * @param {"user"|"agent"} role
   * @param {string}         text       - Displayed immediately (ignored when streaming=true)
   * @param {boolean}        streaming  - If true, shows a waiting blink cursor instead of text
   * @returns {HTMLElement}  The content <span> — caller can write into it later
   */
  function append(role, text, streaming = false) {
    const div     = document.createElement("div");
    div.className = role === "user" ? "chat-msg-user" : "chat-msg-agent";

    const label       = document.createElement("span");
    label.className   = "chat-label";
    label.textContent = role === "user" ? "you > " : "raka-agent > ";

    const content     = document.createElement("span");
    content.className = "chat-content";

    if (streaming) {
      const dot       = document.createElement("span");
      dot.className   = "typing-dot";
      dot.textContent = "▋";
      content.appendChild(dot);
    } else {
      content.textContent = text;
      if (role === "agent") div.classList.add("done");
    }

    div.appendChild(label);
    div.appendChild(content);
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;

    return content;
  }

  /**
   * Animate text into an element one chunk at a time (typewriter effect).
   * Appends a blinking cursor to the parent while typing; removes it on done.
   *
   * @param {HTMLElement} element     - Target element to write into
   * @param {string}      totalText   - Complete string to render
   * @param {Function}    [onComplete]- Called after the last character is rendered
   */
  function typeOut(element, totalText, onComplete) {
    let index = 0;
    element.textContent = "";

    const streamCursor       = document.createElement("span");
    streamCursor.className   = "typing-dot";
    streamCursor.textContent = "▋";
    element.parentElement.appendChild(streamCursor);

    function tick() {
      if (index < totalText.length) {
        element.textContent += totalText.slice(index, index + TYPEWRITER_CHUNK);
        index += TYPEWRITER_CHUNK;
        chatLog.scrollTop = chatLog.scrollHeight;
        setTimeout(tick, TYPEWRITER_MS);
      } else {
        streamCursor.remove();
        if (onComplete) onComplete();
      }
    }

    tick();
  }

  return { append, typeOut };
})();
