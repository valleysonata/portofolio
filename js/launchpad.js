(function() {
  "use strict";

  var overlay = document.getElementById("launchpad-overlay");
  var grid = overlay ? overlay.querySelector(".launchpad-grid") : null;

  function openApp(name) {
    switch (name) {
      case "Terminal":
        if (window.Desktop && window.Desktop.openWindow) {
          window.Desktop.openWindow("terminal");
        }
        break;
      case "Safari":
        if (window.SafariApp) {
          window.SafariApp.open();
        }
        break;
      case "Spotify":
        if (window.SpotifyApp) {
          window.SpotifyApp.open();
        }
        break;
      default:
        break;
    }
  }

  function openExternal(url) {
    window.open(url, "_blank");
  }

  function close() {
    if (overlay) {
      overlay.classList.remove("visible");
      setTimeout(function() {
        overlay.style.display = "none";
      }, 300);
    }
  }

  function toggle() {
    if (!overlay) return;
    if (overlay.classList.contains("visible")) {
      close();
    } else {
      overlay.style.display = "flex";
      void overlay.offsetHeight;
      overlay.classList.add("visible");
    }
  }

  if (grid) {
    grid.addEventListener("click", function(e) {
      var item = e.target.closest(".launchpad-item");
      if (!item) return;
      var action = item.getAttribute("data-action");
      if (!action) return;

      close();

      switch (action) {
        case "terminal":
          if (window.Desktop && window.Desktop.openWindow) window.Desktop.openWindow();
          break;
        case "safari":
          if (window.Desktop && window.Desktop.openGenericWindow && window.SafariApp) {
            var safariWin = document.getElementById("safari-window");
            var dockSafari = document.querySelector(".dock-item[data-app='safari']");
            window.Desktop.openGenericWindow(safariWin, dockSafari, "Safari", function() {
              window.SafariApp.init();
            });
          }
          break;
        case "spotify":
          if (window.Desktop && window.Desktop.openGenericWindow && window.SpotifyApp) {
            var spotifyWin = document.getElementById("spotify-window");
            var dockSpotify = document.querySelector(".dock-item[data-app='spotify']");
            window.Desktop.openGenericWindow(spotifyWin, dockSpotify, "Spotify", function() {
              window.SpotifyApp.init();
            });
          }
          break;
        case "finder":
          if (window.Desktop && window.Desktop.openGenericWindow && window.FinderApp) {
            var finderWin = document.getElementById("finder-window");
            var dockFinder = document.querySelector(".dock-item[data-app='finder']");
            window.Desktop.openGenericWindow(finderWin, dockFinder, "Finder", function() {
              window.FinderApp.init();
            });
          }
          break;
        case "photos":
          if (window.Desktop && window.Desktop.openGenericWindow && window.PhotosApp) {
            var photosWin = document.getElementById("photos-window");
            var dockPhotos = document.querySelector(".dock-item[data-app='photos']");
            window.Desktop.openGenericWindow(photosWin, dockPhotos, "Photos", function() {
              window.PhotosApp.init();
            });
          }
          break;
        case "vscode":
          if (window.Desktop && window.Desktop.openGenericWindow && window.VSCodeApp) {
            var vscodeWin = document.getElementById("vscode-window");
            var dockVscode = document.querySelector(".dock-item[data-app='vscode']");
            window.Desktop.openGenericWindow(vscodeWin, dockVscode, "VS Code", function() {
              window.VSCodeApp.init();
            });
          }
          break;
        case "github":
          window.open("https://github.com/valleysonata", "_blank");
          break;
        case "linkedin":
          window.open("https://www.linkedin.com/in/adyaraka-banyu-langit-63456a317/", "_blank");
          break;
        case "gmail":
          window.open("mailto:banyulangitadyaraka@gmail.com");
          break;
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) {
        close();
      }
    });
  }

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      close();
    }
  });

  window.Launchpad = {
    toggle: toggle
  };
})();
