/**
 * desktop.js — Mac desktop interaction
 *
 * Handles:
 * - Desktop icon double-click → open terminal window
 * - Dock icon click → open/restore terminal window
 * - Window controls (close, minimize, maximize)
 * - Draggable window
 * - Window resize (drag edges/corners)
 * - Live clock in menu bar
 * - Mobile bypass (shows portfolio directly)
 *
 * Depends on: nothing
 */

(function () {
  "use strict";

  // ── State ──
  let windowOpen = false;
  let windowMinimized = false;
  let windowMaximized = false;

  // ── DOM refs ──
  const menubar = document.querySelector(".mac-menubar");
  const desktop = document.querySelector(".desktop");
  const dock = document.querySelector(".dock");
  const dockTerminal = document.querySelector(".dock-item[data-app='terminal']");
  const desktopTerminal = document.querySelector(".desktop-icon[data-app='terminal']");
  const win = document.getElementById("terminal-window");
  const titlebar = win.querySelector(".window-titlebar");
  const btnClose = win.querySelector(".window-btn.close");
  const btnMinimize = win.querySelector(".window-btn.minimize");
  const btnMaximize = win.querySelector(".window-btn.maximize");
  const clock = document.querySelector(".menubar-time");

  // ── Mobile bypass ──
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (isMobile) {
    const mobilePortfolio = document.querySelector(".mobile-portfolio");
    if (mobilePortfolio) mobilePortfolio.style.display = "block";
    return;
  }

  // ── Clock ──
  function updateClock() {
    const now = new Date();
    const opts = { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true };
    clock.textContent = now.toLocaleString("en-US", opts);
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ── Open window ──
  function openWindow() {
    if (windowOpen && !windowMinimized) return;

    if (windowMinimized) {
      win.style.display = "flex";
      win.classList.add("open", "animating");
      void win.offsetHeight;
      win.classList.remove("minimizing");
      windowMinimized = false;
      windowOpen = true;
      dockTerminal.classList.add("active");
      return;
    }

    dockTerminal.classList.add("bouncing");
    setTimeout(() => {
      dockTerminal.classList.remove("bouncing");

      win.style.display = "flex";
      win.style.left = "50%";
      win.style.top = "100%";
      win.style.transform = "translate(-50%, 0) scale(0.05) perspective(800px) rotateX(20deg)";
      win.style.opacity = "0";
      win.classList.add("open", "animating");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          win.style.transform = "translate(-50%, -50%) scale(1) perspective(800px) rotateX(0deg)";
          win.style.opacity = "1";
          win.style.top = "50%";
        });
      });

      windowOpen = true;
      windowMinimized = false;
      dockTerminal.classList.add("active");
      desktopTerminal.classList.add("selected");

      setTimeout(() => {
        if (window.Boot && window.Boot.start) {
          window.Boot.start();
        }
      }, 500);
    }, 600);
  }

  // ── Close window ──
  function closeWindow() {
    if (!windowOpen) return;
    win.classList.remove("animating");
    win.classList.add("closing");
    setTimeout(() => {
      win.classList.remove("open", "closing");
      win.style.display = "none";
      windowOpen = false;
      windowMinimized = false;
      windowMaximized = false;
      dockTerminal.classList.remove("active");
      desktopTerminal.classList.remove("selected");
      // Reset terminal for next open
      const output = document.getElementById("terminal-output");
      if (output) { output.innerHTML = ""; output.dataset.ran = ""; }
    }, 450);
  }

  // ── Minimize window ──
  function minimizeWindow() {
    if (!windowOpen || windowMinimized) return;
    win.classList.remove("animating");
    win.classList.add("minimizing");
    windowMinimized = true;
    setTimeout(() => {
      win.classList.remove("open", "minimizing");
      win.style.display = "none";
    }, 500);
  }

  // ── Maximize / restore window ──
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
      win.style.transform = "none";
      win.style.top = "24px";
      win.style.left = "0";
      win.style.width = "100vw";
      win.style.height = "calc(100vh - 24px)";
      windowMaximized = true;
    }
  }

  // ── Event listeners ──
  desktopTerminal.addEventListener("dblclick", (e) => {
    e.preventDefault();
    openWindow();
  });

  desktopTerminal.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".desktop-icon").forEach(el => el.classList.remove("selected"));
    desktopTerminal.classList.add("selected");
  });

  desktop.addEventListener("click", () => {
    document.querySelectorAll(".desktop-icon").forEach(el => el.classList.remove("selected"));
  });

  dockTerminal.addEventListener("click", () => {
    if (!windowOpen) {
      openWindow();
    } else if (windowMinimized) {
      openWindow();
    } else {
      win.style.zIndex = "101";
      setTimeout(() => { win.style.zIndex = "100"; }, 100);
    }
  });

  btnClose.addEventListener("click", closeWindow);
  btnMinimize.addEventListener("click", minimizeWindow);
  btnMaximize.addEventListener("click", toggleMaximize);
  titlebar.addEventListener("dblclick", toggleMaximize);

  // ── Draggable window ──
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  titlebar.addEventListener("mousedown", (e) => {
    if (e.target.closest(".window-controls")) return;
    if (windowMaximized) return;

    isDragging = true;
    const rect = win.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    win.style.transition = "none";
    titlebar.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const x = e.clientX - dragOffsetX;
    const y = e.clientY - dragOffsetY;

    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight - 60;
    const minY = 24;

    const clampedX = Math.max(0, Math.min(x, maxX));
    const clampedY = Math.max(minY, Math.min(y, maxY));

    win.style.left = clampedX + "px";
    win.style.top = clampedY + "px";
    win.style.transform = "none";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      titlebar.style.cursor = "grab";
      win.style.transition = "";
    }
  });

  // ── Window resize ──
  let isResizing = false;
  let resizeDir = "";
  let resizeStartX = 0;
  let resizeStartY = 0;
  let resizeStartW = 0;
  let resizeStartH = 0;
  let resizeStartLeft = 0;
  let resizeStartTop = 0;

  win.querySelectorAll(".resize-handle").forEach(handle => {
    handle.addEventListener("mousedown", (e) => {
      if (windowMaximized) return;
      e.preventDefault();
      e.stopPropagation();

      isResizing = true;
      resizeDir = handle.className.replace("resize-handle resize-", "");
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      resizeStartW = win.offsetWidth;
      resizeStartH = win.offsetHeight;

      const rect = win.getBoundingClientRect();
      resizeStartLeft = rect.left;
      resizeStartTop = rect.top;

      win.style.transition = "none";
      document.body.style.cursor = getComputedStyle(handle).cursor;
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;
    const minW = 480;
    const minH = 300;

    let newW = resizeStartW;
    let newH = resizeStartH;
    let newLeft = resizeStartLeft;
    let newTop = resizeStartTop;

    if (resizeDir.includes("e")) {
      newW = Math.max(minW, resizeStartW + dx);
    }
    if (resizeDir.includes("w")) {
      newW = Math.max(minW, resizeStartW - dx);
      newLeft = resizeStartLeft + (resizeStartW - newW);
    }
    if (resizeDir.includes("s")) {
      newH = Math.max(minH, resizeStartH + dy);
    }
    if (resizeDir.includes("n")) {
      newH = Math.max(minH, resizeStartH - dy);
      newTop = Math.max(24, resizeStartTop + (resizeStartH - newH));
    }

    win.style.width = newW + "px";
    win.style.height = newH + "px";
    win.style.left = newLeft + "px";
    win.style.top = newTop + "px";
    win.style.transform = "none";
  });

  document.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      win.style.transition = "";
      document.body.style.cursor = "";
    }
  });

  // ── Keyboard shortcuts ──
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "w" && windowOpen) {
      e.preventDefault();
      closeWindow();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "m" && windowOpen) {
      e.preventDefault();
      minimizeWindow();
    }
    const chatInput = document.getElementById("chat-input");
    if (e.key === "Escape" && windowOpen && chatInput && !chatInput.matches(":focus")) {
      closeWindow();
    }
  });

  window.Desktop = { openWindow, closeWindow, minimizeWindow, toggleMaximize };
})();
