/**
 * cursor.js — terminal block cursor behaviour
 *
 * Toggles the blinking block cursor element on/off based on whether
 * the chat input has content.
 *
 * Depends on: nothing
 * Writes to:  window.Cursor (consumed by chat.js)
 */

window.Cursor = (function () {
  "use strict";

  let input, cursorEl;

  function init(inputId, cursorId) {
    input = document.getElementById(inputId || "chat-input");
    cursorEl = document.getElementById(cursorId || "term-cursor");
    if (input) {
      input.addEventListener("input", update);
    }
  }

  function update() {
    if (!input || !cursorEl) return;
    if (input.value.length > 0) {
      cursorEl.classList.remove("blink-mode");
    } else {
      cursorEl.classList.add("blink-mode");
    }
  }

  return { init, update };
})();
