/**
 * boot.js — boot sequence inside the terminal window
 *
 * Types out a fake boot log into .boot-section inside the window body.
 * Skippable on any keypress/click after a short delay.
 *
 * Depends on: nothing
 * Writes to:  window.Boot
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
    { text: "raka-os v2.0.3 (build 2026-06-07)", cls: "dim" },
    { text: "boot device: /dev/portfolio  size: 13kb  free: 4gb", cls: "dim" },
    { text: "loading kernel modules", cls: "ok", ok: true },
    { text: "mounting /etc/raka.cfg", cls: "ok", ok: true },
    { text: "starting raka-agent in background", cls: "ok", ok: true },
    { text: "initializing chat subsystem", cls: "ok", ok: true },
  ];

  const TYPEWRITER_MS = 6;
  const POST_LINE_PAUSE = 80;

  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
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
    const bootSection = document.getElementById("boot-section");
    if (!bootSection) return;
    // Don't restart if already run
    if (bootSection.dataset.ran === "1") return;
    bootSection.dataset.ran = "1";

    bootSection.innerHTML = "";

    const logo = el("div", "boot-ascii");
    logo.textContent = ASCII_LOGO;
    bootSection.appendChild(logo);

    const linesHost = el("div", "boot-lines");
    bootSection.appendChild(linesHost);

    const welcome = el("div", "boot-welcome");
    welcome.textContent = "welcome to raka@portfolio";
    welcome.style.opacity = "0";
    welcome.style.transition = "opacity 0.3s ease";
    bootSection.appendChild(welcome);

    const prompt = el("div", "boot-prompt");
    prompt.innerHTML =
      '<span class="ps1"><span class="u">raka</span>@portfolio:~$</span>' +
      '<span class="boot-cursor"></span>';
    prompt.style.opacity = "0";
    prompt.style.transition = "opacity 0.2s ease";
    bootSection.appendChild(prompt);

    const skipHint = el("div", "boot-skip", "[ press any key to continue ]");
    skipHint.style.opacity = "0";
    skipHint.style.transition = "opacity 0.2s ease";
    bootSection.appendChild(skipHint);

    let cancelled = false;
    let done = false;

    function skip() {
      if (done || !bootSection.dataset.ran) return;
      done = true;
      cancelled = true;
      // Show everything immediately
      linesHost.innerHTML = "";
      BOOT_LINES.forEach(line => {
        const lineEl = el("div", "boot-line " + (line.cls || ""));
        lineEl.textContent = line.text;
        if (line.ok) {
          const tag = el("span", "boot-ok-tag");
          tag.textContent = "  [ok]";
          lineEl.appendChild(tag);
        }
        linesHost.appendChild(lineEl);
      });
      welcome.style.opacity = "1";
      prompt.style.opacity = "1";
      skipHint.style.opacity = "0";

      // Fade out boot section after a moment, keep terminal visible
      setTimeout(() => {
        bootSection.style.transition = "opacity 0.4s ease";
        bootSection.style.opacity = "0.4";
      }, 800);

      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    }

    function onKey() { skip(); }
    function onClick() { skip(); }

    // Delay before accepting skip input
    setTimeout(() => {
      document.addEventListener("keydown", onKey);
      document.addEventListener("click", onClick);
    }, 500);

    let i = 0;
    function nextLine() {
      if (cancelled) return;
      if (i >= BOOT_LINES.length) {
        welcome.style.opacity = "1";
        prompt.style.opacity = "1";
        skipHint.style.opacity = "1";

        // After boot finishes, fade section down to make room for content
        setTimeout(() => {
          bootSection.style.transition = "opacity 0.5s ease";
          bootSection.style.opacity = "0.4";
          // Remove skip listener
          document.removeEventListener("keydown", onKey);
          document.removeEventListener("click", onClick);
        }, 1500);
        return;
      }
      const line = BOOT_LINES[i++];
      const lineEl = el("div", "boot-line " + (line.cls || ""));
      linesHost.appendChild(lineEl);

      typeInto(lineEl, line.text, () => {
        if (line.ok) {
          const tag = el("span", "boot-ok-tag");
          tag.textContent = "  [ok]";
          lineEl.appendChild(tag);
        }
        setTimeout(nextLine, POST_LINE_PAUSE);
      });
    }

    setTimeout(nextLine, 200);
  }

  window.Boot = { start };
})();
