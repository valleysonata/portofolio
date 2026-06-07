/**
 * boot.js — unified terminal boot sequence
 *
 * Types out the entire terminal session into #terminal-output:
 *   1. Boot log
 *   2. whoami → output
 *   3. cat contact.txt → buttons
 *   4. ./raka-agent --interactive → chat UI
 *
 * Depends on: nothing
 * Writes to:  window.Boot
 */

(function () {
  "use strict";

  const BOOT_LINES = [
    { text: "raka-os v2.0.3 (build 2026-06-07)", cls: "dim" },
    { text: "boot device: /dev/portfolio  size: 13kb  free: 4gb", cls: "dim" },
    { text: "loading kernel modules", cls: "ok", ok: true },
    { text: "mounting /etc/raka.cfg", cls: "ok", ok: true },
    { text: "starting raka-agent in background", cls: "ok", ok: true },
    { text: "initializing chat subsystem", cls: "ok", ok: true },
  ];

  const TYPEWRITER_MS = 5;
  const LINE_PAUSE = 60;
  const BLOCK_PAUSE = 200;

  const PS1 = '<span class="ps1"><span class="u">raka</span>@portfolio:~$</span>';

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

  function appendHTML(host, html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    while (tmp.firstChild) host.appendChild(tmp.firstChild);
    return host.lastElementChild;
  }

  function scrollToBottom() {
    const body = document.querySelector(".window-body");
    if (body) body.scrollTop = body.scrollHeight;
  }

  function start() {
    const output = document.getElementById("terminal-output");
    if (!output) return;
    if (output.dataset.ran === "1") return;
    output.dataset.ran = "1";
    output.innerHTML = "";

    let cancelled = false;
    let done = false;

    // ── Boot log container ──
    const bootBlock = el("div", "terminal-block");
    const bootLines = el("div", "boot-lines");
    bootBlock.appendChild(bootLines);
    output.appendChild(bootBlock);

    // ── Welcome line ──
    const welcomeBlock = el("div", "terminal-block boot-welcome-block");
    welcomeBlock.style.opacity = "0";
    welcomeBlock.style.transition = "opacity 0.3s ease";
    welcomeBlock.textContent = "welcome to raka@portfolio";
    output.appendChild(welcomeBlock);

    // ── Skip hint ──
    const skipHint = el("div", "boot-skip");
    skipHint.textContent = "[ press any key to continue ]";
    skipHint.style.opacity = "0";
    skipHint.style.transition = "opacity 0.2s ease";
    output.appendChild(skipHint);

    // ── Whoami block (hidden initially) ──
    const whoamiBlock = el("div", "terminal-block");
    whoamiBlock.style.display = "none";
    whoamiBlock.innerHTML =
      '<div class="cmd-line">' + PS1 + '<span class="input">whoami</span></div>' +
      '<div class="cmd-result">' +
        '<div class="neofetch-info">' +
          '<div class="name">adyaraka banyu langit</div>' +
          '<div class="sub">incoming cs <span class="w">@nycu</span> · ai &amp; software</div>' +
        '</div>' +
      '</div>';
    output.appendChild(whoamiBlock);

    // ── Contact block (hidden initially) ──
    const contactBlock = el("div", "terminal-block");
    contactBlock.style.display = "none";
    contactBlock.innerHTML =
      '<div class="cmd-line">' + PS1 + '<span class="input">cat contact.txt</span></div>' +
      '<div class="cmd-result">' +
        '<div class="btns">' +
          '<a class="btn" href="mailto:banyulangitadyaraka@gmail.com">gmail</a>' +
          '<a class="btn" href="https://github.com/valleysonata" target="_blank">github</a>' +
          '<a class="btn" href="https://www.linkedin.com/in/adyaraka-banyu-langit-63456a317/" target="_blank">linkedin</a>' +
        '</div>' +
      '</div>';
    output.appendChild(contactBlock);

    // ── Chat block (hidden initially) ──
    const chatBlock = el("div", "terminal-block");
    chatBlock.style.display = "none";
    chatBlock.innerHTML =
      '<div class="cmd-line">' + PS1 + '<span class="input">./raka-agent --interactive</span></div>' +
      '<div class="cmd-result">' +
        '<div id="chat-log">' +
          '<div class="chat-msg-agent done">' +
            '<span class="chat-label">raka-agent &gt; </span>hey — i\'m an ai trained on raka\'s resume. ask me about his background, skills, or experience.' +
          '</div>' +
        '</div>' +
        '<div class="chat-input-row">' +
          '<span class="ps1" style="white-space:nowrap;"><span class="u">you</span>@ask:~$</span>' +
          '<div class="input-container">' +
            '<input id="chat-input" type="text" autocomplete="off" spellcheck="false" />' +
            '<div id="term-cursor" class="terminal-cursor blink-mode">▋</div>' +
          '</div>' +
        '</div>' +
        '<div class="chat-hint">press enter to send</div>' +
      '</div>';
    output.appendChild(chatBlock);

    scrollToBottom();

    // ── Skip logic ──
    function skip() {
      if (done || !output.dataset.ran) return;
      done = true;
      cancelled = true;

      // Show boot lines immediately
      bootLines.innerHTML = "";
      BOOT_LINES.forEach(function (line) {
        var lineEl = el("div", "boot-line " + (line.cls || ""));
        lineEl.textContent = line.text;
        if (line.ok) {
          var tag = el("span", "boot-ok-tag");
          tag.textContent = "  [ok]";
          lineEl.appendChild(tag);
        }
        bootLines.appendChild(lineEl);
      });

      welcomeBlock.style.opacity = "1";
      skipHint.style.opacity = "0";

      // Show all command blocks
      whoamiBlock.style.display = "";
      contactBlock.style.display = "";
      chatBlock.style.display = "";

      scrollToBottom();

      // Re-init chat after elements exist
      setTimeout(function () {
        if (window.Chat && window.Chat.init) window.Chat.init();
      }, 50);

      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    }

    function onKey() { skip(); }
    function onClick() { skip(); }

    setTimeout(function () {
      document.addEventListener("keydown", onKey);
      document.addEventListener("click", onClick);
    }, 500);

    // ── Sequential typing ──
    var bi = 0;

    function typeBootLine() {
      if (cancelled) return;
      if (bi >= BOOT_LINES.length) {
        // Boot done — show welcome, then start commands
        welcomeBlock.style.opacity = "1";
        skipHint.style.opacity = "1";
        scrollToBottom();

        setTimeout(function () {
          skipHint.style.opacity = "0";
          document.removeEventListener("keydown", onKey);
          document.removeEventListener("click", onClick);

          // Show command blocks with small delays
          whoamiBlock.style.display = "";
          scrollToBottom();

          setTimeout(function () {
            contactBlock.style.display = "";
            scrollToBottom();

            setTimeout(function () {
              chatBlock.style.display = "";
              scrollToBottom();

              // Init chat
              setTimeout(function () {
                if (window.Chat && window.Chat.init) window.Chat.init();
              }, 100);
            }, BLOCK_PAUSE);
          }, BLOCK_PAUSE);
        }, 1200);
        return;
      }

      var line = BOOT_LINES[bi++];
      var lineEl = el("div", "boot-line " + (line.cls || ""));
      bootLines.appendChild(lineEl);
      scrollToBottom();

      typeInto(lineEl, line.text, function () {
        if (line.ok) {
          var tag = el("span", "boot-ok-tag");
          tag.textContent = "  [ok]";
          lineEl.appendChild(tag);
        }
        scrollToBottom();
        setTimeout(typeBootLine, LINE_PAUSE);
      });
    }

    setTimeout(typeBootLine, 200);
  }

  window.Boot = { start: start };
})();
