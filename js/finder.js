(function() {
  "use strict";

  var content = document.getElementById("finder-content");
  var breadcrumb = document.getElementById("finder-breadcrumb");
  var statusbar = document.getElementById("finder-statusbar");
  var trashBadge = document.getElementById("trash-badge");

  var trashCount = 0;

  // ── Virtual file system ──
  var fs = {
    "portofolio": {
      type: "folder",
      children: {
        "css": {
          type: "folder",
          children: {
            "reset.css": { type: "file", ext: "css" },
            "base.css": { type: "file", ext: "css" },
            "desktop.css": { type: "file", ext: "css" },
            "window.css": { type: "file", ext: "css" },
            "chat.css": { type: "file", ext: "css" },
            "safari-window.css": { type: "file", ext: "css" },
            "spotify-window.css": { type: "file", ext: "css" },
            "finder-window.css": { type: "file", ext: "css" },
            "photos-window.css": { type: "file", ext: "css" },
            "vscode-window.css": { type: "file", ext: "css" },
          }
        },
        "js": {
          type: "folder",
          children: {
            "config.js": { type: "file", ext: "js" },
            "cursor.js": { type: "file", ext: "js" },
            "messages.js": { type: "file", ext: "js" },
            "matrix.js": { type: "file", ext: "js" },
            "boot.js": { type: "file", ext: "js" },
            "chat.js": { type: "file", ext: "js" },
            "desktop.js": { type: "file", ext: "js" },
            "safari.js": { type: "file", ext: "js" },
            "spotify.js": { type: "file", ext: "js" },
            "launchpad.js": { type: "file", ext: "js" },
            "battery.js": { type: "file", ext: "js" },
            "finder.js": { type: "file", ext: "js" },
            "photos.js": { type: "file", ext: "js" },
            "vscode.js": { type: "file", ext: "js" },
          }
        },
        "assets": {
          type: "folder",
          children: {
            "wallpaper.jpg": { type: "file", ext: "img" },
            "apple-logo.svg": { type: "file", ext: "img" },
            "terminal-icon.svg": { type: "file", ext: "img" },
            "safari-icon.png": { type: "file", ext: "img" },
            "spotify-icon.png": { type: "file", ext: "img" },
          }
        },
        "index.html": { type: "file", ext: "html" },
        "README.md": { type: "file", ext: "md" },
      }
    },
    "Desktop": { type: "folder", children: {} },
    "Documents": { type: "folder", children: {} },
    "Downloads": { type: "folder", children: {} },
    "Trash": { type: "folder", children: {} }
  };

  var currentPath = ["portofolio"];
  var history = [];
  var historyIndex = -1;
  var selectedFile = null;

  function getCurrentFolder() {
    var folder = fs;
    for (var i = 0; i < currentPath.length; i++) {
      if (folder[currentPath[i]]) {
        folder = folder[currentPath[i]].children || folder[currentPath[i]];
      }
    }
    return folder;
  }

  function getIcon(name, item) {
    if (item.type === "folder") return "&#128193;";
    switch (item.ext) {
      case "html": return "&#128196;";
      case "css": return "&#127912;";
      case "js": return "&#9889;";
      case "img": return "&#127748;";
      case "md": return "&#128221;";
      default: return "&#128196;";
    }
  }

  function getLanguage(name) {
    var ext = name.split(".").pop();
    switch (ext) {
      case "html": return "html";
      case "css": return "css";
      case "js": return "javascript";
      case "md": return "markdown";
      default: return "plaintext";
    }
  }

  function render() {
    var folder = getCurrentFolder();
    var names = Object.keys(folder).sort(function(a, b) {
      var aIsFolder = folder[a].type === "folder";
      var bIsFolder = folder[b].type === "folder";
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      return a.localeCompare(b);
    });

    // Sort: folders first, then files
    names.sort(function(a, b) {
      var aF = folder[a].type === "folder" ? 0 : 1;
      var bF = folder[b].type === "folder" ? 0 : 1;
      return aF - bF || a.localeCompare(b);
    });

    var html = '<div class="finder-grid">';
    names.forEach(function(name) {
      var item = folder[name];
      var icon = getIcon(name, item);
      html += '<div class="finder-file" draggable="true" data-name="' + name + '" data-type="' + item.type + '">' +
        '<div class="finder-file-icon">' + icon + '</div>' +
        '<div class="finder-file-name">' + name + '</div>' +
      '</div>';
    });
    html += '</div>';
    content.innerHTML = html;

    statusbar.textContent = names.length + " item" + (names.length !== 1 ? "s" : "");
    breadcrumb.textContent = currentPath[currentPath.length - 1] || "portofolio";

    // Update sidebar active
    document.querySelectorAll(".finder-sidebar-item").forEach(function(el) {
      el.classList.remove("active");
      if (el.getAttribute("data-path") === currentPath[0]) el.classList.add("active");
    });

    bindFileEvents();
  }

  function bindFileEvents() {
    content.querySelectorAll(".finder-file").forEach(function(el) {
      el.addEventListener("click", function(e) {
        e.stopPropagation();
        content.querySelectorAll(".finder-file").forEach(function(f) { f.classList.remove("selected"); });
        el.classList.add("selected");
        selectedFile = el.getAttribute("data-name");
      });

      el.addEventListener("dblclick", function() {
        var name = el.getAttribute("data-name");
        var type = el.getAttribute("data-type");
        if (type === "folder") {
          navigateInto(name);
        } else {
          // Open in VS Code
          var ext = name.split(".").pop();
          if (["html", "css", "js", "md"].indexOf(ext) !== -1) {
            if (window.VSCodeApp && window.VSCodeApp.openFile) {
              window.VSCodeApp.openFile(name, getLanguage(name));
            }
          }
        }
      });

      el.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, el);
      });

      // Drag to trash
      el.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("text/plain", el.getAttribute("data-name"));
        e.dataTransfer.effectAllowed = "move";
      });

      el.addEventListener("dragover", function(e) {
        e.preventDefault();
        if (el.getAttribute("data-type") === "folder") {
          el.classList.add("drag-over");
        }
      });

      el.addEventListener("dragleave", function() {
        el.classList.remove("drag-over");
      });

      el.addEventListener("drop", function(e) {
        e.preventDefault();
        el.classList.remove("drag-over");
        var dragName = e.dataTransfer.getData("text/plain");
        var targetName = el.getAttribute("data-name");
        var targetFolder = getCurrentFolder();
        if (targetFolder[targetName] && targetFolder[targetName].type === "folder" && dragName !== targetName) {
          targetFolder[targetName].children[dragName] = targetFolder[dragName];
          delete targetFolder[dragName];
          render();
        }
      });
    });
  }

  function navigateInto(name) {
    var folder = getCurrentFolder();
    if (folder[name] && folder[name].type === "folder") {
      currentPath.push(name);
      history = history.slice(0, historyIndex + 1);
      history.push(currentPath.slice());
      historyIndex = history.length - 1;
      render();
    }
  }

  function navigateBack() {
    if (currentPath.length > 1) {
      currentPath.pop();
      history = history.slice(0, historyIndex + 1);
      history.push(currentPath.slice());
      historyIndex = history.length - 1;
      render();
    }
  }

  function navigateForward() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      currentPath = history[historyIndex].slice();
      render();
    }
  }

  function moveToTrash(name) {
    var folder = getCurrentFolder();
    if (folder[name]) {
      fs.Trash.children[name] = folder[name];
      delete folder[name];
      trashCount++;
      updateTrashBadge();
      render();
    }
  }

  function updateTrashBadge() {
    if (trashBadge) {
      if (trashCount > 0) {
        trashBadge.style.display = "flex";
        trashBadge.textContent = trashCount;
      } else {
        trashBadge.style.display = "none";
      }
    }
  }

  function showContextMenu(x, y, fileEl) {
    removeContextMenu();
    var name = fileEl.getAttribute("data-name");
    var type = fileEl.getAttribute("data-type");

    var menu = document.createElement("div");
    menu.className = "finder-context-menu";
    menu.style.left = x + "px";
    menu.style.top = y + "px";

    var items = [];
    if (type === "folder") {
      items.push({ label: "Open", action: function() { navigateInto(name); }});
    } else {
      var ext = name.split(".").pop();
      if (["html", "css", "js", "md"].indexOf(ext) !== -1) {
        items.push({ label: "Open in VS Code", action: function() {
          if (window.VSCodeApp && window.VSCodeApp.openFile) window.VSCodeApp.openFile(name, getLanguage(name));
        }});
      }
    }
    items.push({ label: "Rename", action: function() { startRename(fileEl, name); }});
    items.push({ divider: true });
    items.push({ label: "Move to Trash", action: function() { moveToTrash(name); }});

    items.forEach(function(item) {
      if (item.divider) {
        var div = document.createElement("div");
        div.className = "finder-context-divider";
        menu.appendChild(div);
      } else {
        var el = document.createElement("div");
        el.className = "finder-context-item";
        el.textContent = item.label;
        el.addEventListener("click", function() {
          removeContextMenu();
          item.action();
        });
        menu.appendChild(el);
      }
    });

    document.body.appendChild(menu);
    document.addEventListener("click", removeContextMenu, { once: true });
  }

  function removeContextMenu() {
    document.querySelectorAll(".finder-context-menu").forEach(function(m) { m.remove(); });
  }

  function startRename(fileEl, oldName) {
    var nameEl = fileEl.querySelector(".finder-file-name");
    var input = document.createElement("input");
    input.className = "finder-file-name-input";
    input.value = oldName;
    nameEl.replaceWith(input);
    input.focus();
    input.select();

    function finish() {
      var newName = input.value.trim();
      if (newName && newName !== oldName) {
        var folder = getCurrentFolder();
        folder[newName] = folder[oldName];
        delete folder[oldName];
      }
      render();
    }

    input.addEventListener("blur", finish);
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") finish();
      if (e.key === "Escape") render();
    });
  }

  function createNewFile() {
    var folder = getCurrentFolder();
    var name = "untitled";
    var i = 1;
    while (folder[name]) { name = "untitled " + i++; }
    folder[name] = { type: "file", ext: "txt" };
    render();
    // Auto-rename
    var lastFile = content.querySelector('.finder-file[data-name="' + name + '"]');
    if (lastFile) startRename(lastFile, name);
  }

  function createNewFolder() {
    var folder = getCurrentFolder();
    var name = "untitled folder";
    var i = 1;
    while (folder[name]) { name = "untitled folder " + i++; }
    folder[name] = { type: "folder", children: {} };
    render();
    var lastFile = content.querySelector('.finder-file[data-name="' + name + '"]');
    if (lastFile) startRename(lastFile, name);
  }

  // ── Event bindings ──
  var backBtn = document.getElementById("finder-back");
  var forwardBtn = document.getElementById("finder-forward");
  var newFileBtn = document.getElementById("finder-new-file");
  var newFolderBtn = document.getElementById("finder-new-folder");

  if (backBtn) backBtn.addEventListener("click", navigateBack);
  if (forwardBtn) forwardBtn.addEventListener("click", navigateForward);
  if (newFileBtn) newFileBtn.addEventListener("click", createNewFile);
  if (newFolderBtn) newFolderBtn.addEventListener("click", createNewFolder);

  document.querySelectorAll(".finder-sidebar-item").forEach(function(el) {
    el.addEventListener("click", function() {
      var path = el.getAttribute("data-path");
      currentPath = [path];
      history = [[path]];
      historyIndex = 0;
      render();
    });
  });

  content.addEventListener("click", function() {
    content.querySelectorAll(".finder-file").forEach(function(f) { f.classList.remove("selected"); });
    selectedFile = null;
  });

  window.FinderApp = {
    init: function() { render(); },
    navigateTo: function(path) {
      currentPath = [path];
      history = [[path]];
      historyIndex = 0;
      render();
    },
    getTrashCount: function() { return trashCount; },
    emptyTrash: function() {
      fs.Trash.children = {};
      trashCount = 0;
      updateTrashBadge();
      if (currentPath[0] === "Trash") render();
    }
  };
})();
