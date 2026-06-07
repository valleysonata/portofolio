/**
 * cursor.js — terminal block cursor behaviour
 *
 * Toggles the blinking block cursor element on/off based on whether
 * the chat input has content. When the user types, the native browser
 * caret takes over; the block cursor is only visible on an empty field.
 *
 * Depends on: nothing
 * Writes to:  window.Cursor (consumed by chat.js)
 */

window.Cursor = (function () {
  "use strict";

  let input, cursorEl;

  function init() {
    input = document.getElementById("chat-input");
    cursorEl = document.getElementById("term-cursor");
    if (input) input.addEventListener("input", update);
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
