/**
 * desktop.js — Mac desktop interaction
 *
 * Handles:
 * - Apple boot screen on page load
 * - Desktop icon double-click → open terminal window
 * - Dock icon click → open/restore window
 * - Window controls (close, minimize, maximize)
 * - Draggable window + window resize
 * - Genie effect (open / close / minimize)
 * - Live clock in menu bar
 * - Menubar app name change on window focus
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

    // CSS animation handles the bar fill — just set up dismiss timing

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
    var mobilePortfolio = document.querySelector(".mobile-portfolio");
    if (mobilePortfolio) mobilePortfolio.style.display = "block";
    window.Chat.init("chat-input-mobile", "chat-log-mobile");
    return;
  }

  // ── Desktop state ──
  var windowOpen = false;
  var windowMinimized = false;
  var windowMaximized = false;
  var activeAppName = "Finder";

  var menubarApp = document.querySelector(".menubar-app");
  var desktop = document.querySelector(".desktop");
  var dock = document.querySelector(".dock");
  var dockTerminal = document.querySelector(".dock-item[data-app='terminal']");
  var desktopTerminal = document.querySelector(".desktop-icon[data-app='terminal']");
  var dockSafari = document.querySelector(".dock-item[data-app='safari']");
  var dockSpotify = document.querySelector(".dock-item[data-app='spotify']");
  var dockLaunchpad = document.querySelector(".dock-item[data-app='launchpad']");
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

  // ── Menubar app name ──
  function setMenubarApp(name) {
    activeAppName = name;
    if (menubarApp) menubarApp.textContent = name;
  }

  // ── Get dock icon position for genie ──
  function getDockPosition(dockItem) {
    var item = dockItem || dockTerminal;
    var dockRect = item.getBoundingClientRect();
    return {
      x: dockRect.left + dockRect.width / 2,
      y: dockRect.bottom
    };
  }

  // ── Genie transform helpers ──
  function genieClosedState(targetWin, dockItem) {
    var dockPos = getDockPosition(dockItem);
    var winRect = targetWin.getBoundingClientRect();
    var winCenterX = winRect.left + winRect.width / 2;
    var dx = dockPos.x - winCenterX;
    return "translate(calc(-50% + " + dx + "px), 0) scaleX(0.12) scaleY(0.04) perspective(600px) rotateX(25deg)";
  }

  function genieOpenState() {
    return "translate(-50%, -50%) scale(1) perspective(600px) rotateX(0deg)";
  }

  function genieMinimizeState() {
    return "translate(-50%, 50vh) scaleX(0.08) scaleY(0.02) perspective(600px) rotateX(30deg)";
  }

  // ── Generic window open/close for Safari/Spotify ──
  function openGenericWindow(windowEl, dockItem, appName, onOpen) {
    if (windowEl.classList.contains("open")) {
      // Already open — just focus
      windowEl.style.zIndex = "101";
      setTimeout(function () { windowEl.style.zIndex = ""; }, 100);
      setMenubarApp(appName);
      return;
    }

    var dockPos = getDockPosition(dockItem);
    var winRect = windowEl.getBoundingClientRect();
    var winCenterX = winRect.left + winRect.width / 2;
    var dx = dockPos.x - winCenterX;

    dockItem.classList.add("bouncing");
    setTimeout(function () {
      dockItem.classList.remove("bouncing");

      windowEl.style.display = "flex";
      windowEl.style.top = "50%";
      windowEl.style.left = "50%";
      windowEl.style.transform = "translate(calc(-50% + " + dx + "px), 0) scaleX(0.12) scaleY(0.04) perspective(600px) rotateX(25deg)";
      windowEl.style.opacity = "0";
      windowEl.classList.add("open");
      void windowEl.offsetHeight;
      windowEl.classList.add("animating");
      windowEl.style.transform = genieOpenState();
      windowEl.style.opacity = "1";
      dockItem.classList.add("active");
      setMenubarApp(appName);

      setTimeout(function () { windowEl.classList.remove("animating"); }, 550);
      if (onOpen) setTimeout(onOpen, 300);
    }, 600);
  }

  function closeGenericWindow(windowEl, dockItem) {
    if (!windowEl.classList.contains("open")) return;

    var dockPos = getDockPosition(dockItem);
    var winRect = windowEl.getBoundingClientRect();
    var winCenterX = winRect.left + winRect.width / 2;
    var dx = dockPos.x - winCenterX;

    windowEl.classList.remove("animating");
    windowEl.classList.add("closing");
    windowEl.style.transform = "translate(calc(-50% + " + dx + "px), 0) scaleX(0.12) scaleY(0.04) perspective(600px) rotateX(25deg)";
    windowEl.style.opacity = "0";

    setTimeout(function () {
      windowEl.classList.remove("open", "closing");
      windowEl.style.display = "none";
      windowEl.style.transform = "";
      windowEl.style.opacity = "";
      dockItem.classList.remove("active");
      setMenubarApp("Finder");
    }, 450);
  }

  // ── Terminal window management ──
  function resetWindowStyles() {
    win.style.transform = "";
    win.style.opacity = "";
    win.style.top = "";
    win.style.left = "";
    win.style.width = "";
    win.style.height = "";
    win.classList.remove("animating", "closing", "minimizing", "maximized");
  }

  function openWindow() {
    if (windowOpen && !windowMinimized) {
      // Already open — just focus
      win.style.zIndex = "101";
      setTimeout(function () { win.style.zIndex = "100"; }, 100);
      setMenubarApp("Terminal");
      return;
    }

    if (windowMinimized) {
      resetWindowStyles();
      win.style.display = "flex";
      win.style.top = "50%";
      win.style.left = "50%";
      win.style.transform = genieClosedState(win, dockTerminal);
      win.style.opacity = "0";
      win.classList.add("open");
      void win.offsetHeight;
      win.classList.add("animating");
      win.style.transform = genieOpenState();
      win.style.opacity = "1";
      windowMinimized = false;
      windowOpen = true;
      dockTerminal.classList.add("active");
      setMenubarApp("Terminal");
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
      win.style.transform = genieClosedState(win, dockTerminal);
      win.style.opacity = "0";
      win.classList.add("open");
      void win.offsetHeight;
      win.classList.add("animating");
      win.style.transform = genieOpenState();
      win.style.opacity = "1";

      windowOpen = true;
      windowMinimized = false;
      dockTerminal.classList.add("active");
      if (desktopTerminal) desktopTerminal.classList.add("selected");
      setMenubarApp("Terminal");

      setTimeout(function () { win.classList.remove("animating"); }, 550);

      setTimeout(function () {
        if (window.Boot && window.Boot.start) window.Boot.start();
      }, 500);
    }, 600);
  }

  function closeWindow() {
    if (!windowOpen) return;
    win.classList.remove("animating");
    win.classList.add("closing");
    win.style.transform = genieClosedState(win, dockTerminal);
    win.style.opacity = "0";

    setTimeout(function () {
      win.classList.remove("open", "closing");
      win.style.display = "none";
      resetWindowStyles();
      windowOpen = false;
      windowMinimized = false;
      windowMaximized = false;
      dockTerminal.classList.remove("active");
      if (desktopTerminal) desktopTerminal.classList.remove("selected");
      var output = document.getElementById("terminal-output");
      if (output) { output.innerHTML = ""; output.dataset.ran = ""; }
      setMenubarApp("Finder");
    }, 450);
  }

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
      setMenubarApp("Finder");
    }, 500);
  }

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

  // ── Terminal event listeners ──
  if (desktopTerminal) {
    desktopTerminal.addEventListener("dblclick", function (e) {
      e.preventDefault();
      openWindow();
    });

    desktopTerminal.addEventListener("click", function (e) {
      e.stopPropagation();
      document.querySelectorAll(".desktop-icon").forEach(function (el) { el.classList.remove("selected"); });
      desktopTerminal.classList.add("selected");
    });
  }

  desktop.addEventListener("click", function () {
    document.querySelectorAll(".desktop-icon").forEach(function (el) { el.classList.remove("selected"); });
  });

  dockTerminal.addEventListener("click", function () {
    openWindow();
  });

  btnClose.addEventListener("click", closeWindow);
  btnMinimize.addEventListener("click", minimizeWindow);
  btnMaximize.addEventListener("click", toggleMaximize);
  titlebar.addEventListener("dblclick", toggleMaximize);

  // ── Safari dock click ──
  if (dockSafari) {
    dockSafari.addEventListener("click", function () {
      openGenericWindow(safariWin, dockSafari, "Safari", function() {
        if (window.SafariApp) window.SafariApp.init();
      });
    });
  }

  // ── Spotify dock click ──
  if (dockSpotify) {
    dockSpotify.addEventListener("click", function () {
      openGenericWindow(spotifyWin, dockSpotify, "Spotify", function() {
        if (window.SpotifyApp) window.SpotifyApp.init();
      });
    });
  }

  // ── Launchpad dock click ──
  if (dockLaunchpad) {
    dockLaunchpad.addEventListener("click", function () {
      if (window.Launchpad) window.Launchpad.toggle();
    });
  }

  // ── Safari/Spotify window close buttons ──
  var safariWin = document.getElementById("safari-window");
  var spotifyWin = document.getElementById("spotify-window");

  if (safariWin) {
    var safariClose = safariWin.querySelector(".window-btn.close");
    var safariMin = safariWin.querySelector(".window-btn.minimize");
    if (safariClose) safariClose.addEventListener("click", function () {
      closeGenericWindow(safariWin, dockSafari);
    });
    if (safariMin) safariMin.addEventListener("click", function () {
      closeGenericWindow(safariWin, dockSafari);
    });
    // Make Safari draggable
    makeDraggable(safariWin, dockSafari, "Safari");
    makeResizable(safariWin);
  }

  if (spotifyWin) {
    var spotifyClose = spotifyWin.querySelector(".window-btn.close");
    var spotifyMin = spotifyWin.querySelector(".window-btn.minimize");
    if (spotifyClose) spotifyClose.addEventListener("click", function () {
      closeGenericWindow(spotifyWin, dockSpotify);
    });
    if (spotifyMin) spotifyMin.addEventListener("click", function () {
      closeGenericWindow(spotifyWin, dockSpotify);
    });
    // Make Spotify draggable
    makeDraggable(spotifyWin, dockSpotify, "Spotify");
    makeResizable(spotifyWin);
  }

  // ── Generic drag handler for any window ──
  function makeDraggable(windowEl, dockItem, appName) {
    var isDragging = false;
    var dragOffsetX = 0;
    var dragOffsetY = 0;
    var titlebarEl = windowEl.querySelector(".window-titlebar");

    titlebarEl.addEventListener("mousedown", function (e) {
      if (e.target.closest(".window-controls")) return;
      if (windowEl.classList.contains("maximized")) return;

      isDragging = true;
      var rect = windowEl.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      windowEl.style.transition = "none";
      e.preventDefault();
    });

    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      var x = e.clientX - dragOffsetX;
      var y = e.clientY - dragOffsetY;
      var maxX = window.innerWidth - windowEl.offsetWidth;
      var maxY = window.innerHeight - windowEl.offsetHeight - 60;
      windowEl.style.left = Math.max(0, Math.min(x, maxX)) + "px";
      windowEl.style.top = Math.max(24, Math.min(y, maxY)) + "px";
      windowEl.style.transform = "none";
    });

    document.addEventListener("mouseup", function () {
      if (isDragging) {
        isDragging = false;
        windowEl.style.transition = "";
      }
    });

    // Focus on click
    windowEl.addEventListener("mousedown", function () {
      setMenubarApp(appName);
    });
  }

  // ── Generic resize handler for any window ──
  function makeResizable(windowEl) {
    var isResizing = false;
    var resizeDir = "";
    var resizeStartX = 0, resizeStartY = 0;
    var resizeStartW = 0, resizeStartH = 0;
    var resizeStartLeft = 0, resizeStartTop = 0;

    windowEl.querySelectorAll(".resize-handle").forEach(function (handle) {
      handle.addEventListener("mousedown", function (e) {
        if (windowEl.classList.contains("maximized")) return;
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        resizeDir = handle.className.replace("resize-handle resize-", "");
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartW = windowEl.offsetWidth;
        resizeStartH = windowEl.offsetHeight;
        var rect = windowEl.getBoundingClientRect();
        resizeStartLeft = rect.left;
        resizeStartTop = rect.top;
        windowEl.style.transition = "none";
        document.body.style.cursor = getComputedStyle(handle).cursor;
      });
    });

    document.addEventListener("mousemove", function (e) {
      if (!isResizing) return;
      var dx = e.clientX - resizeStartX;
      var dy = e.clientY - resizeStartY;
      var minW = parseInt(getComputedStyle(windowEl).minWidth) || 480;
      var minH = parseInt(getComputedStyle(windowEl).minHeight) || 300;
      var newW = resizeStartW, newH = resizeStartH;
      var newLeft = resizeStartLeft, newTop = resizeStartTop;

      if (resizeDir.includes("e")) newW = Math.max(minW, resizeStartW + dx);
      if (resizeDir.includes("w")) { newW = Math.max(minW, resizeStartW - dx); newLeft = resizeStartLeft + (resizeStartW - newW); }
      if (resizeDir.includes("s")) newH = Math.max(minH, resizeStartH + dy);
      if (resizeDir.includes("n")) { newH = Math.max(minH, resizeStartH - dy); newTop = Math.max(24, resizeStartTop + (resizeStartH - newH)); }

      windowEl.style.width = newW + "px";
      windowEl.style.height = newH + "px";
      windowEl.style.left = newLeft + "px";
      windowEl.style.top = newTop + "px";
      windowEl.style.transform = "none";
    });

    document.addEventListener("mouseup", function () {
      if (isResizing) {
        isResizing = false;
        windowEl.style.transition = "";
        document.body.style.cursor = "";
      }
    });
  }

  // ── Draggable terminal window ──
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

  // ── Click to focus terminal ──
  win.addEventListener("mousedown", function () {
    setMenubarApp("Terminal");
  });

  window.Desktop = {
    openWindow: openWindow,
    closeWindow: closeWindow,
    minimizeWindow: minimizeWindow,
    toggleMaximize: toggleMaximize,
    openGenericWindow: openGenericWindow,
    closeGenericWindow: closeGenericWindow,
    setMenubarApp: setMenubarApp
  };
})();