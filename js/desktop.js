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
  var zCounter = 100;

  function bringToFront(windowEl) {
    zCounter++;
    windowEl.style.zIndex = zCounter;
  }

  var menubarApp = document.querySelector(".menubar-app-text");
  var desktop = document.querySelector(".desktop");
  var dock = document.querySelector(".dock");
  var dockTerminal = document.querySelector(".dock-item[data-app='terminal']");
  var dockSafari = document.querySelector(".dock-item[data-app='safari']");
  var dockSpotify = document.querySelector(".dock-item[data-app='spotify']");
  var dockLaunchpad = document.querySelector(".dock-item[data-app='launchpad']");
  var dockFinder = document.querySelector(".dock-item[data-app='finder']");
  var dockPhotos = document.querySelector(".dock-item[data-app='photos']");
  var dockVscode = document.querySelector(".dock-item[data-app='vscode']");
  var dockTrash = document.querySelector(".dock-item[data-app='trash']");
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
      bringToFront(windowEl);
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
      bringToFront(win);
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

  // ── Desktop icons ──
  var desktopIcons = document.getElementById("desktop-icons");

  function getFileIcon(name) {
    var ext = name.split(".").pop();
    switch (ext) {
      case "html": return '<svg viewBox="0 0 16 16" width="14" height="14" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/><text x="8" y="11.5" text-anchor="middle" font-size="7" fill="#e44d26" font-family="monospace" font-weight="bold">&lt;/&gt;</text></svg>';
      case "css": return '<svg viewBox="0 0 16 16" width="14" height="14" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/><text x="8" y="11.5" text-anchor="middle" font-size="8" fill="#42a5f5" font-family="monospace" font-weight="bold">{}</text></svg>';
      case "js": return '<svg viewBox="0 0 16 16" width="14" height="14" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/><text x="8" y="11.5" text-anchor="middle" font-size="7" fill="#f5d442" font-family="monospace" font-weight="bold">JS</text></svg>';
      case "md": return '<svg viewBox="0 0 16 16" width="14" height="14" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/><text x="8" y="11" text-anchor="middle" font-size="6" fill="#888" font-family="sans-serif" font-weight="600">M&#8595;</text></svg>';
      case "txt": return '<svg viewBox="0 0 16 16" width="14" height="14" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/><text x="8" y="11" text-anchor="middle" font-size="6" fill="#aaa" font-family="sans-serif">A</text></svg>';
      default: return '<svg viewBox="0 0 16 16" width="14" height="14" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/></svg>';
    }
  }

  function renderDesktop() {
    if (!desktopIcons || !window.FinderFS) return;
    var desktopFolder = window.FinderFS.Desktop;
    if (!desktopFolder || !desktopFolder.children) return;

    var html = "";

    // Terminal always first
    html += '<div class="desktop-icon" data-app="terminal" title="Double-click to open">' +
      '<div class="desktop-icon-img"><img src="assets/terminal-icon.svg" alt="Terminal" width="52" height="52"></div>' +
      '<span class="desktop-icon-label">Terminal</span></div>';

    // Desktop folder items
    var items = desktopFolder.children;
    var names = Object.keys(items).sort(function(a, b) {
      var aF = items[a].type === "folder" ? 0 : 1;
      var bF = items[b].type === "folder" ? 0 : 1;
      return aF - bF || a.localeCompare(b);
    });

    names.forEach(function(name) {
      var item = items[name];
      var icon;
      if (item.type === "folder") {
        icon = '<img src="assets/folder-icon.png" alt="' + name + '" width="52" height="52" style="object-fit:contain;">';
      } else {
        icon = getFileIcon(name);
      }
      html += '<div class="desktop-icon" data-type="' + item.type + '" data-name="' + name + '" title="' + name + '">' +
        '<div class="desktop-icon-img">' + icon + '</div>' +
        '<span class="desktop-icon-label">' + name + '</span></div>';
    });

    desktopIcons.innerHTML = html;

    // Bind events
    desktopIcons.querySelectorAll(".desktop-icon").forEach(function(el) {
      el.addEventListener("click", function(e) {
        e.stopPropagation();
        document.querySelectorAll(".desktop-icon").forEach(function(d) { d.classList.remove("selected"); });
        el.classList.add("selected");
      });

      el.addEventListener("dblclick", function(e) {
        e.preventDefault();
        var appName = el.getAttribute("data-app");
        var type = el.getAttribute("data-type");
        var name = el.getAttribute("data-name");

        if (appName === "terminal") {
          openWindow();
        } else if (type === "folder") {
          openGenericWindow(finderWin, dockFinder, "Finder", function() {
            if (window.FinderApp) window.FinderApp.navigateTo("Desktop");
          });
        } else if (type === "file") {
          var ext = name.split(".").pop();
          if (["html", "css", "js", "md"].indexOf(ext) !== -1) {
            openGenericWindow(vscodeWin, dockVscode, "VS Code", function() {
              if (window.VSCodeApp) window.VSCodeApp.openFile(name, ext === "md" ? "markdown" : ext);
            });
          } else if (ext === "txt") {
            var file = items[name];
            if (file && file.content) {
              alert(name + "\n\n" + file.content);
            } else {
              alert(name + "\n\n(empty file)");
            }
          }
        }
      });
    });
  }

  // Initial render after Finder is ready
  setTimeout(renderDesktop, 100);

  // ── Spotlight Search ──
  var spotlightOverlay = document.getElementById("spotlight-overlay");
  var spotlightInput = document.getElementById("spotlight-input");
  var spotlightResults = document.getElementById("spotlight-results");
  var spotlightBtn = document.getElementById("menubar-spotlight");

  var spotlightApps = [
    { name: "Terminal", icon: "assets/terminal-icon.svg", action: function() { openWindow(); } },
    { name: "Finder", icon: "assets/Finder.png", action: function() { openGenericWindow(finderWin, dockFinder, "Finder", function() { if (window.FinderApp) window.FinderApp.init(); }); } },
    { name: "Safari", icon: "assets/safari-icon.png", action: function() { openGenericWindow(safariWin, dockSafari, "Safari", function() { if (window.SafariApp) window.SafariApp.init(); }); } },
    { name: "Photos", icon: "assets/apple-photos.svg", action: function() { openGenericWindow(photosWin, dockPhotos, "Photos", function() { if (window.PhotosApp) window.PhotosApp.init(); }); } },
    { name: "VS Code", icon: "assets/vscode-icon.png", action: function() { openGenericWindow(vscodeWin, dockVscode, "VS Code", function() { if (window.VSCodeApp) window.VSCodeApp.init(); }); } },
    { name: "Spotify", icon: "assets/spotify-icon.png", action: function() { openGenericWindow(spotifyWin, dockSpotify, "Spotify", function() { if (window.SpotifyApp) window.SpotifyApp.init(); }); } },
    { name: "Launchpad", icon: "assets/launchpad-icon.svg", action: function() { if (window.Launchpad) window.Launchpad.toggle(); } },
    { name: "GitHub", icon: "assets/github-icon.png", action: function() { window.open("https://github.com/valleysonata", "_blank"); } },
    { name: "LinkedIn", icon: "assets/gmail-icon.png", action: function() { window.open("https://www.linkedin.com/in/adyaraka-banyu-langit-63456a317/", "_blank"); } },
    { name: "Gmail", icon: "assets/gmail-icon.png", action: function() { window.location.href = "mailto:banyulangitadyaraka@gmail.com"; } },
  ];

  function openSpotlight() {
    if (!spotlightOverlay) return;
    spotlightOverlay.style.display = "flex";
    spotlightInput.value = "";
    spotlightResults.innerHTML = "";
    setTimeout(function() { spotlightInput.focus(); }, 50);
  }

  function closeSpotlight() {
    if (!spotlightOverlay) return;
    spotlightOverlay.style.display = "none";
    spotlightInput.value = "";
    spotlightResults.innerHTML = "";
  }

  function filterSpotlight(query) {
    if (!spotlightResults) return;
    if (!query.trim()) { spotlightResults.innerHTML = ""; return; }
    var q = query.toLowerCase();
    var matches = spotlightApps.filter(function(app) {
      return app.name.toLowerCase().indexOf(q) !== -1;
    });
    var html = "";
    matches.forEach(function(app) {
      html += '<div class="spotlight-result" data-index="' + spotlightApps.indexOf(app) + '">' +
        '<img src="' + app.icon + '" class="spotlight-result-icon" alt="' + app.name + '">' +
        '<span class="spotlight-result-name">' + app.name + '</span></div>';
    });
    if (matches.length === 0) {
      html = '<div class="spotlight-empty">No results</div>';
    }
    spotlightResults.innerHTML = html;

    spotlightResults.querySelectorAll(".spotlight-result").forEach(function(el) {
      el.addEventListener("click", function() {
        var idx = parseInt(el.getAttribute("data-index"));
        closeSpotlight();
        spotlightApps[idx].action();
      });
    });
  }

  if (spotlightBtn) {
    spotlightBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      if (ccPanel) ccPanel.style.display = "none";
      if (wifiPopup) wifiPopup.style.display = "none";
      openSpotlight();
    });
  }

  if (spotlightOverlay) {
    spotlightOverlay.addEventListener("click", function(e) {
      if (e.target === spotlightOverlay) closeSpotlight();
    });
  }

  if (spotlightInput) {
    spotlightInput.addEventListener("input", function() {
      filterSpotlight(spotlightInput.value);
    });
    spotlightInput.addEventListener("keydown", function(e) {
      if (e.key === "Escape") closeSpotlight();
      if (e.key === "Enter") {
        var first = spotlightResults.querySelector(".spotlight-result");
        if (first) first.click();
      }
    });
  }

  // ── Terminal event listeners ──
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

  // ── Finder dock click ──
  if (dockFinder) {
    dockFinder.addEventListener("click", function () {
      openGenericWindow(finderWin, dockFinder, "Finder", function() {
        if (window.FinderApp) window.FinderApp.init();
        renderDesktop();
      });
    });
  }

  // ── Photos dock click ──
  if (dockPhotos) {
    dockPhotos.addEventListener("click", function () {
      openGenericWindow(photosWin, dockPhotos, "Photos", function() {
        if (window.PhotosApp) window.PhotosApp.init();
      });
    });
  }

  // ── VS Code dock click ──
  if (dockVscode) {
    dockVscode.addEventListener("click", function () {
      openGenericWindow(vscodeWin, dockVscode, "VS Code", function() {
        if (window.VSCodeApp) window.VSCodeApp.init();
      });
    });
  }

  // ── Trash dock click ──
  if (dockTrash) {
    dockTrash.addEventListener("click", function () {
      openGenericWindow(finderWin, dockTrash, "Finder", function() {
        if (window.FinderApp) window.FinderApp.navigateTo("Trash");
      });
    });
  }

  // ── Safari/Spotify window close buttons ──
  var safariWin = document.getElementById("safari-window");
  var spotifyWin = document.getElementById("spotify-window");
  var finderWin = document.getElementById("finder-window");
  var photosWin = document.getElementById("photos-window");
  var vscodeWin = document.getElementById("vscode-window");

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
    makeDraggable(spotifyWin, dockSpotify, "Spotify");
    makeResizable(spotifyWin);
  }

  // ── Finder window setup ──
  if (finderWin) {
    var finderClose = finderWin.querySelector(".window-btn.close");
    var finderMin = finderWin.querySelector(".window-btn.minimize");
    if (finderClose) finderClose.addEventListener("click", function () {
      closeGenericWindow(finderWin, dockFinder);
    });
    if (finderMin) finderMin.addEventListener("click", function () {
      closeGenericWindow(finderWin, dockFinder);
    });
    makeDraggable(finderWin, dockFinder, "Finder");
    makeResizable(finderWin);
  }

  // ── Photos window setup ──
  if (photosWin) {
    var photosClose = photosWin.querySelector(".window-btn.close");
    var photosMin = photosWin.querySelector(".window-btn.minimize");
    if (photosClose) photosClose.addEventListener("click", function () {
      closeGenericWindow(photosWin, dockPhotos);
    });
    if (photosMin) photosMin.addEventListener("click", function () {
      closeGenericWindow(photosWin, dockPhotos);
    });
    makeDraggable(photosWin, dockPhotos, "Photos");
    makeResizable(photosWin);
  }

  // ── VS Code window setup ──
  if (vscodeWin) {
    var vscodeClose = vscodeWin.querySelector(".window-btn.close");
    var vscodeMin = vscodeWin.querySelector(".window-btn.minimize");
    if (vscodeClose) vscodeClose.addEventListener("click", function () {
      closeGenericWindow(vscodeWin, dockVscode);
    });
    if (vscodeMin) vscodeMin.addEventListener("click", function () {
      closeGenericWindow(vscodeWin, dockVscode);
    });
    makeDraggable(vscodeWin, dockVscode, "VS Code");
    makeResizable(vscodeWin);
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
      bringToFront(windowEl);
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
    if ((e.metaKey || e.ctrlKey) && e.key === " ") { e.preventDefault(); openSpotlight(); }
    var chatInput = document.getElementById("chat-input");
    if (e.key === "Escape") {
      if (spotlightOverlay && spotlightOverlay.style.display !== "none") { closeSpotlight(); return; }
      if (windowOpen && chatInput && !chatInput.matches(":focus")) { closeWindow(); }
    }
  });

  // ── Click to focus terminal ──
  win.addEventListener("mousedown", function () {
    bringToFront(win);
    setMenubarApp("Terminal");
  });

  // ── Show Desktop (minimize all) ──
  function showDesktop() {
    if (windowOpen && !windowMinimized) minimizeWindow();
    var safariWin = document.getElementById("safari-window");
    var spotifyWin = document.getElementById("spotify-window");
    if (safariWin && safariWin.classList.contains("open")) closeGenericWindow(safariWin, dockSafari);
    if (spotifyWin && spotifyWin.classList.contains("open")) closeGenericWindow(spotifyWin, dockSpotify);
  }

  // ── Bring All to Front ──
  function bringAllToFront() {
    document.querySelectorAll(".window.open").forEach(function (w) {
      bringToFront(w);
    });
  }

  // ── Menubar dropdown actions ──
  document.querySelectorAll(".menubar-dropdown-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var action = item.getAttribute("data-action");
      if (!action) return;

      switch (action) {
        case "new-terminal":
          openWindow();
          break;
        case "close":
          var activeWin = document.querySelector(".window.open");
          if (activeWin) {
            var id = activeWin.id;
            if (id === "terminal-window") closeWindow();
            else if (id === "safari-window") closeGenericWindow(safariWin, dockSafari);
            else if (id === "spotify-window") closeGenericWindow(spotifyWin, dockSpotify);
          }
          break;
        case "copy":
          var sel = window.getSelection();
          if (sel) navigator.clipboard.writeText(sel.toString()).catch(function() {});
          break;
        case "select-all":
          document.execCommand("selectAll");
          break;
        case "fullscreen":
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen();
          break;
        case "show-desktop":
          showDesktop();
          break;
        case "go-terminal":
          openWindow();
          break;
        case "go-safari":
          openGenericWindow(safariWin, dockSafari, "Safari", function() {
            if (window.SafariApp) window.SafariApp.init();
          });
          break;
        case "go-spotify":
          openGenericWindow(spotifyWin, dockSpotify, "Spotify", function() {
            if (window.SpotifyApp) window.SpotifyApp.init();
          });
          break;
        case "go-launchpad":
          if (window.Launchpad) window.Launchpad.toggle();
          break;
        case "minimize-all":
          showDesktop();
          break;
        case "bring-all":
          bringAllToFront();
          break;
        case "about-mac":
        case "about":
          alert("raka-os v2.0.3\nPortfolio Desktop Environment\n\nAdyaraka Banyu Langit\nIncoming CS @NYCU\n\nBuilt with HTML, CSS, vanilla JS\nNo frameworks. No bundlers. $0 cost.");
          break;
        case "lock-screen":
          showDesktop();
          document.getElementById("apple-boot").style.display = "flex";
          document.getElementById("apple-boot").style.opacity = "1";
          break;
        case "preferences":
          alert("Preferences coming soon.");
          break;
        case "shortcuts":
          alert("Keyboard Shortcuts:\n\nCtrl/⌘ + W — Close window\nCtrl/⌘ + M — Minimize window\nEsc — Close terminal / Launchpad");
          break;
      }
    });
  });

  // ── Control Center ──
  var ccPanel = document.getElementById("control-center");
  var ccBtn = document.getElementById("menubar-cc");
  var wifiPopup = document.getElementById("wifi-popup");
  var wifiBtn = document.getElementById("menubar-wifi");
  var wifiToggle = document.getElementById("wifi-toggle");
  var brightnessSlider = document.getElementById("brightness-slider");
  var brightnessPct = document.getElementById("brightness-pct");
  var volumeSlider = document.getElementById("volume-slider");
  var volumePct = document.getElementById("volume-pct");

  // WiFi state
  var wifiEnabled = localStorage.getItem("wifiEnabled") !== "false";
  if (wifiToggle) wifiToggle.checked = wifiEnabled;

  if (ccBtn && ccPanel) {
    ccBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      if (wifiPopup) wifiPopup.style.display = "none";
      ccPanel.style.display = ccPanel.style.display === "none" ? "block" : "none";
    });
  }

  if (wifiBtn && wifiPopup) {
    wifiBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      if (ccPanel) ccPanel.style.display = "none";
      wifiPopup.style.display = wifiPopup.style.display === "none" ? "block" : "none";
    });
  }

  if (wifiToggle) {
    wifiToggle.addEventListener("change", function() {
      wifiEnabled = wifiToggle.checked;
      localStorage.setItem("wifiEnabled", wifiEnabled.toString());
      var ccWifi = document.getElementById("cc-wifi");
      if (ccWifi) ccWifi.classList.toggle("active", wifiEnabled);
    });
  }

  // CC WiFi tile sync
  var ccWifi = document.getElementById("cc-wifi");
  if (ccWifi) {
    ccWifi.classList.toggle("active", wifiEnabled);
    ccWifi.addEventListener("click", function() {
      wifiEnabled = !wifiEnabled;
      localStorage.setItem("wifiEnabled", wifiEnabled.toString());
      ccWifi.classList.toggle("active", wifiEnabled);
      if (wifiToggle) wifiToggle.checked = wifiEnabled;
    });
  }

  // CC Bluetooth tile
  var ccBluetooth = document.getElementById("cc-bluetooth");
  if (ccBluetooth) {
    ccBluetooth.addEventListener("click", function() {
      ccBluetooth.classList.toggle("active");
    });
  }

  // CC Dark Mode tile
  var ccDarkmode = document.getElementById("cc-darkmode");
  if (ccDarkmode) {
    ccDarkmode.addEventListener("click", function() {
      ccDarkmode.classList.toggle("active");
    });
  }

  // CC Fullscreen tile
  var ccFullscreen = document.getElementById("cc-fullscreen");
  if (ccFullscreen) {
    ccFullscreen.addEventListener("click", function() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        ccFullscreen.classList.remove("active");
      } else {
        document.documentElement.requestFullscreen();
        ccFullscreen.classList.add("active");
      }
    });
  }

  // Brightness slider
  if (brightnessSlider && brightnessPct) {
    brightnessSlider.addEventListener("input", function() {
      brightnessPct.textContent = brightnessSlider.value + "%";
    });
  }

  // Volume slider
  if (volumeSlider && volumePct) {
    volumeSlider.addEventListener("input", function() {
      volumePct.textContent = volumeSlider.value + "%";
    });
  }

  // Close CC/WiFi on click outside
  document.addEventListener("click", function(e) {
    if (ccPanel && ccPanel.style.display !== "none" && !ccPanel.contains(e.target) && e.target !== ccBtn && !ccBtn.contains(e.target)) {
      ccPanel.style.display = "none";
    }
    if (wifiPopup && wifiPopup.style.display !== "none" && !wifiPopup.contains(e.target) && e.target !== wifiBtn && !wifiBtn.contains(e.target)) {
      wifiPopup.style.display = "none";
    }
  });

  // ── Battery percentage ──
  // Battery percentage text removed — only icon shown

  // ── Spotlight (handled above with overlay) ──

  // ── Brightness overlay ──
  var brightnessOverlay = document.getElementById("brightness-overlay");
  if (brightnessSlider && brightnessOverlay) {
    brightnessSlider.addEventListener("input", function() {
      var val = parseInt(brightnessSlider.value);
      brightnessOverlay.style.opacity = (100 - val) / 100;
    });
  }

  // ── Volume slider (cosmetic) ──
  // Just updates the display — no system audio control

  window.Desktop = {
    openWindow: openWindow,
    closeWindow: closeWindow,
    minimizeWindow: minimizeWindow,
    toggleMaximize: toggleMaximize,
    openGenericWindow: openGenericWindow,
    closeGenericWindow: closeGenericWindow,
    setMenubarApp: setMenubarApp,
    bringToFront: bringToFront
  };
})();