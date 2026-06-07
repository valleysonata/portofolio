/**
 * desktop.js — Mac desktop interaction
 *
 * Handles:
 * - Apple boot screen on page load
 * - Desktop icon double-click → open terminal window
 * - Dock icon click → open/restore terminal window
 * - Window controls (close, minimize, maximize)
 * - Draggable window + window resize
 * - Genie effect (open / close / minimize)
 * - Live clock in menu bar
 * - Mobile bypass (shows portfolio directly)
 *
 * Depends on: nothing
 */

(function () {
  "use strict";

  // ── Apple Boot Screen ──
  function dismissBootScreen(callback) {
    var bootEl = document.getElementById("apple-boot");
    if (!bootEl) { if (callback) callback(); return; }
    bootEl.style.transition = "opacity 0.6s ease";
    bootEl.style.opacity = "0";
    setTimeout(function () {
      bootEl.style.display = "none";
      if (callback) callback();
    }, 650);
  }

  function initBootScreen(callback) {
    var bootEl = document.getElementById("apple-boot");
    var fill = document.getElementById("boot-bar-fill");
    if (!bootEl || !fill) { if (callback) callback(); return; }

    fill.style.width = "0%";
    setTimeout(function () {
      fill.style.transition = "width 2.5s cubic-bezier(0.4, 0, 0.2, 1)";
      fill.style.width = "100%";
    }, 50);

    // Fade out after bar fills
    setTimeout(function () {
      dismissBootScreen(callback);
    }, 2800);

    // Safety: force dismiss after 4s no matter what
    setTimeout(function () {
      if (bootEl.style.display !== "none") {
        bootEl.style.transition = "none";
        bootEl.style.display = "none";
        if (callback) callback();
      }
    }, 4000);
  }

  // ── Mobile bypass ──
  var isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (isMobile) {
    initBootScreen(function () {
      var mobilePortfolio = document.querySelector(".mobile-portfolio");
      if (mobilePortfolio) mobilePortfolio.style.display = "block";
      // Init mobile chat
      window.Chat.init("chat-input-mobile", "chat-log-mobile");
    });
    return;
  }

  // ── Desktop state ──
  var windowOpen = false;
  var windowMinimized = false;
  var windowMaximized = false;

  var menubar = document.querySelector(".mac-menubar");
  var desktop = document.querySelector(".desktop");
  var dock = document.querySelector(".dock");
  var dockTerminal = document.querySelector(".dock-item[data-app='terminal']");
  var desktopTerminal = document.querySelector(".desktop-icon[data-app='terminal']");
  var win = document.getElementById("terminal-window");
  var titlebar = win.querySelector(".window-titlebar");
  var btnClose = win.querySelector(".window-btn.close");
  var btnMinimize = win.querySelector(".window-btn.minimize");
  var btnMaximize = win.querySelector(".window-btn.maximize");
  var clock = document.querySelector(".menubar-time");

  // ── Boot screen then show desktop ──
  initBootScreen(function () {
    // Desktop is now visible, everything is ready
  });

  // ── Clock ──
  function updateClock() {
    var now = new Date();
    var opts = { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true };
    clock.textContent = now.toLocaleString("en-US", opts);
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ── Get dock icon position for genie ──
  function getDockPosition() {
    var dockRect = dockTerminal.getBoundingClientRect();
    return {
      x: dockRect.left + dockRect.width / 2,
      y: dockRect.bottom
    };
  }

  // ── Genie transform helpers ──
  function genieClosedState() {
    var dock = getDockPosition();
    var winRect = win.getBoundingClientRect();
    var winCenterX = winRect.left + winRect.width / 2;
    var dx = dock.x - winCenterX;
    return "translate(calc(-50% + " + dx + "px), 0) scaleX(0.12) scaleY(0.04) perspective(600px) rotateX(25deg)";
  }

  function genieOpenState() {
    return "translate(-50%, -50%) scale(1) perspective(600px) rotateX(0deg)";
  }

  function genieMinimizeState() {
    return "translate(-50%, 50vh) scaleX(0.08) scaleY(0.02) perspective(600px) rotateX(30deg)";
  }

  // ── Reset window styles ──
  function resetWindowStyles() {
    win.style.transform = "";
    win.style.opacity = "";
    win.style.top = "";
    win.style.left = "";
    win.style.width = "";
    win.style.height = "";
    win.classList.remove("animating", "closing", "minimizing", "maximized");
  }

  // ── Open window ──
  function openWindow() {
    if (windowOpen && !windowMinimized) return;

    if (windowMinimized) {
      resetWindowStyles();
      win.style.display = "flex";
      win.style.top = "50%";
      win.style.left = "50%";
      win.style.transform = genieClosedState();
      win.style.opacity = "0";
      win.classList.add("open");
      void win.offsetHeight;
      win.classList.add("animating");
      win.style.transform = genieOpenState();
      win.style.opacity = "1";
      windowMinimized = false;
      windowOpen = true;
      dockTerminal.classList.add("active");
      setTimeout(function () { win.classList.remove("animating"); }, 550);
      return;
    }

    dockTerminal.classList.add("bouncing");
    setTimeout(function () {
      dockTerminal.classList.remove("bouncing");

      resetWindowStyles();
      win.style.display = "flex";
      win.style.top = "50%";
      win.style.left = "50%";
      win.style.transform = genieClosedState();
      win.style.opacity = "0";
      win.classList.add("open");
      void win.offsetHeight;
      win.classList.add("animating");
      win.style.transform = genieOpenState();
      win.style.opacity = "1";

      windowOpen = true;
      windowMinimized = false;
      dockTerminal.classList.add("active");
      desktopTerminal.classList.add("selected");

      setTimeout(function () { win.classList.remove("animating"); }, 550);

      setTimeout(function () {
        if (window.Boot && window.Boot.start) window.Boot.start();
      }, 500);
    }, 600);
  }

  // ── Close window ──
  function closeWindow() {
    if (!windowOpen) return;
    win.classList.remove("animating");
    win.classList.add("closing");
    win.style.transform = genieClosedState();
    win.style.opacity = "0";

    setTimeout(function () {
      win.classList.remove("open", "closing");
      win.style.display = "none";
      resetWindowStyles();
      windowOpen = false;
      windowMinimized = false;
      windowMaximized = false;
      dockTerminal.classList.remove("active");
      desktopTerminal.classList.remove("selected");
      var output = document.getElementById("terminal-output");
      if (output) { output.innerHTML = ""; output.dataset.ran = ""; }
    }, 450);
  }

  // ── Minimize window ──
  function minimizeWindow() {
    if (!windowOpen || windowMinimized) return;
    win.classList.remove("animating");
    win.classList.add("minimizing");
    win.style.transform = genieMinimizeState();
    win.style.opacity = "0";
    windowMinimized = true;
    setTimeout(function () {
      win.classList.remove("open", "minimizing");
      win.style.display = "none";
      resetWindowStyles();
    }, 500);
  }

  // ── Maximize / restore ──
  function toggleMaximize() {
    if (!windowOpen || windowMinimized) return;
    if (windowMaximized) {
      win.classList.remove("maximized");
      win.style.transform = "translate(-50%, -50%)";
      win.style.top = "50%";
      win.style.left = "50%";
      win.style.width = "720px";
      win.style.height = "460px";
      windowMaximized = false;
    } else {
      win.classList.add("maximized");
      windowMaximized = true;
    }
  }

  // ── Event listeners ──
  desktopTerminal.addEventListener("dblclick", function (e) {
    e.preventDefault();
    openWindow();
  });

  desktopTerminal.addEventListener("click", function (e) {
    e.stopPropagation();
    document.querySelectorAll(".desktop-icon").forEach(function (el) { el.classList.remove("selected"); });
    desktopTerminal.classList.add("selected");
  });

  desktop.addEventListener("click", function () {
    document.querySelectorAll(".desktop-icon").forEach(function (el) { el.classList.remove("selected"); });
  });

  dockTerminal.addEventListener("click", function () {
    if (!windowOpen) {
      openWindow();
    } else if (windowMinimized) {
      openWindow();
    } else {
      win.style.zIndex = "101";
      setTimeout(function () { win.style.zIndex = "100"; }, 100);
    }
  });

  btnClose.addEventListener("click", closeWindow);
  btnMinimize.addEventListener("click", minimizeWindow);
  btnMaximize.addEventListener("click", toggleMaximize);
  titlebar.addEventListener("dblclick", toggleMaximize);

  // ── Draggable window ──
  var isDragging = false;
  var dragOffsetX = 0;
  var dragOffsetY = 0;

  titlebar.addEventListener("mousedown", function (e) {
    if (e.target.closest(".window-controls")) return;
    if (windowMaximized) return;

    isDragging = true;
    var rect = win.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    win.style.transition = "none";
    titlebar.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      var x = e.clientX - dragOffsetX;
      var y = e.clientY - dragOffsetY;
      var maxX = window.innerWidth - win.offsetWidth;
      var maxY = window.innerHeight - win.offsetHeight - 60;
      var minY = 24;
      win.style.left = Math.max(0, Math.min(x, maxX)) + "px";
      win.style.top = Math.max(minY, Math.min(y, maxY)) + "px";
      win.style.transform = "none";
    }
    if (isResizing) {
      var dx = e.clientX - resizeStartX;
      var dy = e.clientY - resizeStartY;
      var minW = 480, minH = 300;
      var newW = resizeStartW, newH = resizeStartH;
      var newLeft = resizeStartLeft, newTop = resizeStartTop;

      if (resizeDir.includes("e")) newW = Math.max(minW, resizeStartW + dx);
      if (resizeDir.includes("w")) { newW = Math.max(minW, resizeStartW - dx); newLeft = resizeStartLeft + (resizeStartW - newW); }
      if (resizeDir.includes("s")) newH = Math.max(minH, resizeStartH + dy);
      if (resizeDir.includes("n")) { newH = Math.max(minH, resizeStartH - dy); newTop = Math.max(24, resizeStartTop + (resizeStartH - newH)); }

      win.style.width = newW + "px";
      win.style.height = newH + "px";
      win.style.left = newLeft + "px";
      win.style.top = newTop + "px";
      win.style.transform = "none";
    }
  });

  document.addEventListener("mouseup", function () {
    if (isDragging) {
      isDragging = false;
      titlebar.style.cursor = "grab";
      win.style.transition = "";
    }
    if (isResizing) {
      isResizing = false;
      win.style.transition = "";
      document.body.style.cursor = "";
    }
  });

  // ── Window resize ──
  var isResizing = false;
  var resizeDir = "";
  var resizeStartX = 0, resizeStartY = 0;
  var resizeStartW = 0, resizeStartH = 0;
  var resizeStartLeft = 0, resizeStartTop = 0;

  win.querySelectorAll(".resize-handle").forEach(function (handle) {
    handle.addEventListener("mousedown", function (e) {
      if (windowMaximized) return;
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      resizeDir = handle.className.replace("resize-handle resize-", "");
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      resizeStartW = win.offsetWidth;
      resizeStartH = win.offsetHeight;
      var rect = win.getBoundingClientRect();
      resizeStartLeft = rect.left;
      resizeStartTop = rect.top;
      win.style.transition = "none";
      document.body.style.cursor = getComputedStyle(handle).cursor;
    });
  });

  // ── Keyboard shortcuts ──
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "w" && windowOpen) { e.preventDefault(); closeWindow(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "m" && windowOpen) { e.preventDefault(); minimizeWindow(); }
    var chatInput = document.getElementById("chat-input");
    if (e.key === "Escape" && windowOpen && chatInput && !chatInput.matches(":focus")) { closeWindow(); }
  });

  window.Desktop = { openWindow: openWindow, closeWindow: closeWindow, minimizeWindow: minimizeWindow, toggleMaximize: toggleMaximize };
})();
