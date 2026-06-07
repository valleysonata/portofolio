/**
 * desktop.js — Mac desktop interaction
 *
 * Handles:
 * - Desktop icon double-click → open terminal window
 * - Dock icon click → open/restore terminal window
 * - Window controls (close, minimize, maximize)
 * - Draggable window
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
    // Show portfolio directly, skip desktop entirely
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
      // Restore from minimize
      win.classList.remove("minimizing");
      win.classList.add("open", "animating");
      windowMinimized = false;
      windowOpen = true;
      dockTerminal.classList.add("active");
      return;
    }

    // First open: bounce dock icon, then show window
    dockTerminal.classList.add("bouncing");
    setTimeout(() => {
      dockTerminal.classList.remove("bouncing");
      win.classList.add("open", "animating");
      win.style.transform = "translate(-50%, -50%) scale(0.7)";
      win.style.opacity = "0";
      win.style.display = "flex";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          win.style.transform = "translate(-50%, -50%) scale(1)";
          win.style.opacity = "1";
        });
      });

      windowOpen = true;
      windowMinimized = false;
      dockTerminal.classList.add("active");
      desktopTerminal.classList.add("selected");

      // Start boot after window opens
      setTimeout(() => {
        if (window.Boot && window.Boot.start) {
          window.Boot.start();
        }
      }, 350);
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
    }, 300);
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
    }, 400);
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
  // Desktop icon double-click
  desktopTerminal.addEventListener("dblclick", (e) => {
    e.preventDefault();
    openWindow();
  });

  // Desktop icon single click (just select)
  desktopTerminal.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".desktop-icon").forEach(el => el.classList.remove("selected"));
    desktopTerminal.classList.add("selected");
  });

  // Click desktop background to deselect
  desktop.addEventListener("click", () => {
    document.querySelectorAll(".desktop-icon").forEach(el => el.classList.remove("selected"));
  });

  // Dock icon click
  dockTerminal.addEventListener("click", () => {
    if (!windowOpen) {
      openWindow();
    } else if (windowMinimized) {
      openWindow(); // restore
    } else {
      // If already open, focus it (already visible)
      win.style.zIndex = "101";
      setTimeout(() => { win.style.zIndex = "100"; }, 100);
    }
  });

  // Window controls
  btnClose.addEventListener("click", closeWindow);
  btnMinimize.addEventListener("click", minimizeWindow);
  btnMaximize.addEventListener("click", toggleMaximize);

  // Double-click title bar to maximize
  titlebar.addEventListener("dblclick", toggleMaximize);

  // ── Draggable window ──
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  titlebar.addEventListener("mousedown", (e) => {
    // Don't drag on control buttons
    if (e.target.closest(".window-controls")) return;
    if (windowMaximized) return; // can't drag when maximized

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

    // Constrain to viewport (below menu bar, above dock)
    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight - 60;
    const minY = 24; // below menu bar

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

  // ── Keyboard shortcuts ──
  document.addEventListener("keydown", (e) => {
    // Cmd/Ctrl + W → close window
    if ((e.metaKey || e.ctrlKey) && e.key === "w" && windowOpen) {
      e.preventDefault();
      closeWindow();
    }
    // Cmd/Ctrl + M → minimize
    if ((e.metaKey || e.ctrlKey) && e.key === "m" && windowOpen) {
      e.preventDefault();
      minimizeWindow();
    }
    // Escape → close window
    if (e.key === "Escape" && windowOpen && !document.getElementById("chat-input").matches(":focus")) {
      closeWindow();
    }
  });

  // ── Expose for external use ──
  window.Desktop = { openWindow, closeWindow, minimizeWindow, toggleMaximize };
})();
