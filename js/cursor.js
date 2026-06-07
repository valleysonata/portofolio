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

  const input     = document.getElementById("chat-input");
  const cursorEl  = document.getElementById("term-cursor");

  /**
   * Show the blinking block when the field is empty;
   * hide it as soon as the user starts typing.
   */
  function update() {
    if (input.value.length > 0) {
      cursorEl.classList.remove("blink-mode");
    } else {
      cursorEl.classList.add("blink-mode");
    }
  }

  input.addEventListener("input", update);

  return { update };
})();
