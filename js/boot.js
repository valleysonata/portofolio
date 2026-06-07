/**
 * boot.js — unified terminal boot sequence
 *
 * Types out the entire terminal session into #terminal-output:
 *   1. Boot log (types out with typewriter)
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
  const BLOCK_PAUSE = 180;

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

  function scrollToBottom() {
    const body = document.querySelector(".window-body");
    if (body) body.scrollTop = body.scrollHeight;
  }

  function showBlock(block) {
    block.style.display = "";
    scrollToBottom();
  }

  function start() {
    const output = document.getElementById("terminal-output");
    if (!output) return;
    if (output.dataset.ran === "1") return;
    output.dataset.ran = "1";
    output.innerHTML = "";

    let cancelled = false;

    // ── Boot log container ──
    const bootBlock = el("div", "terminal-block");
    const bootLines = el("div", "boot-lines");
    bootBlock.appendChild(bootLines);
    output.appendChild(bootBlock);

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

    // ── Skip logic (press any key to skip typing) ──
    function skip() {
      if (cancelled) return;
      cancelled = true;

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

      showBlock(whoamiBlock);
      showBlock(contactBlock);
      showBlock(chatBlock);

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
        // Boot done — reveal command blocks
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("click", onClick);

        setTimeout(function () {
          showBlock(whoamiBlock);
          setTimeout(function () {
            showBlock(contactBlock);
            setTimeout(function () {
              showBlock(chatBlock);
              setTimeout(function () {
                if (window.Chat && window.Chat.init) window.Chat.init();
              }, 100);
            }, BLOCK_PAUSE);
          }, BLOCK_PAUSE);
        }, 600);
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
