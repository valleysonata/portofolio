/**
 * boot.js — boot sequence overlay
 *
 * Renders a fake BIOS-style boot log on first load, types it out line by
 * line, then fades out. Any keypress or click skips to the end. Called
 * automatically; exposes window.Boot for manual triggering.
 *
 * Depends on: nothing
 */

(function () {
  "use strict";

  const ASCII_LOGO = [
    "8 888888888o.  ",
    "8 8888    `88. ",
    "8 8888     `88 ",
    "8 8888     ,88 ",
    "8 8888.   ,88' ",
    "8 888888888P'  ",
    "8 8888`8b      ",
    "8 8888 `8b.    ",
    "8 8888   `8b.  ",
    "8 8888     `88.",
  ].join("\n");

  const BOOT_LINES = [
    { text: "raka-os v2.0.3 (build 2026-06-07)", cls: "dim", delay: 80 },
    { text: "boot device: /dev/portfolio  size: 13kb  free: 4gb", cls: "dim", delay: 40 },
    { text: "loading kernel modules", cls: "", delay: 60, ok: true },
    { text: "mounting /etc/raka.cfg", cls: "", delay: 50, ok: true },
    { text: "starting raka-agent in background", cls: "", delay: 60, ok: true },
    { text: "initializing chat subsystem", cls: "", delay: 50, ok: true },
    { text: "", cls: "dim", delay: 30 },
    { text: "welcome to raka@portfolio", cls: "welcome", delay: 80 },
    { text: "session opened. all systems nominal.", cls: "dim", delay: 40 },
  ];

  const TYPEWRITER_MS = 8;
  const POST_LINE_PAUSE = 120;

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function typeInto(target, text, cb) {
    if (!text) { cb(); return; }
    let i = 0;
    target.textContent = "";
    function tick() {
      if (i < text.length) {
        target.textContent += text[i++];
        setTimeout(tick, TYPEWRITER_MS);
      } else {
        cb();
      }
    }
    tick();
  }

  function start() {
    const screen = document.getElementById("boot-screen");
    if (!screen) return;

    const inner = screen.querySelector(".boot-inner");
    inner.innerHTML = "";

    const logo = el("div", "boot-ascii", ASCII_LOGO);
    inner.appendChild(logo);

    const linesHost = el("div", "boot-lines");
    inner.appendChild(linesHost);

    const prompt = el("div", "boot-prompt", "");
    prompt.innerHTML =
      '<span class="ps1"><span class="u">raka</span>@portfolio:~$</span>' +
      '<span class="boot-cursor"></span>';
    prompt.style.opacity = "0";
    prompt.style.transition = "opacity 0.2s ease";
    inner.appendChild(prompt);

    const skipHint = el("div", "boot-skip", "[ press any key to continue ]");
    inner.appendChild(skipHint);

    let cancelled = false;
    let done = false;

    function skip() {
      if (done) return;
      done = true;
      cancelled = true;
      screen.classList.add("is-done");
      setTimeout(() => { screen.style.display = "none"; }, 400);
      document.removeEventListener("keydown", onKey);
      screen.removeEventListener("click", onClick);
    }

    function onKey() { skip(); }
    function onClick() { skip(); }

    document.addEventListener("keydown", onKey);
    screen.addEventListener("click", onClick);

    let i = 0;
    function nextLine() {
      if (cancelled) return;
      if (i >= BOOT_LINES.length) {
        prompt.style.opacity = "1";
        return;
      }
      const line = BOOT_LINES[i++];
      const lineEl = el("div", "boot-line " + (line.cls || ""));
      linesHost.appendChild(lineEl);

      if (line.ok) {
        typeInto(lineEl, line.text, () => {
          const tag = el("span", "boot-ok-tag", "  [ok]");
          lineEl.appendChild(tag);
          setTimeout(nextLine, POST_LINE_PAUSE);
        });
      } else {
        typeInto(lineEl, line.text, () => {
          setTimeout(nextLine, POST_LINE_PAUSE);
        });
      }
    }

    setTimeout(nextLine, 350);
  }

  window.Boot = { start };
})();
