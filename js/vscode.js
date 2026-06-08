(function() {
  "use strict";

  var editorContainer = document.getElementById("vscode-editor");
  var tabsContainer = document.getElementById("vscode-tabs");
  var fileTree = document.getElementById("vscode-file-tree");
  var langEl = document.getElementById("vscode-lang");
  var posEl = document.getElementById("vscode-pos");

  var editor = null;
  var openTabs = [];
  var activeTab = null;
  var monacoLoaded = false;

  var fileContents = {
    "index.html": { lang: "html", content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>raka — portfolio</title>\n</head>\n<body>\n  <!-- desktop environment -->\n</body>\n</html>' },
    "README.md": { lang: "markdown", content: "# Portfolio V2\n\nmacOS Sequoia-inspired desktop environment.\n\n## Features\n- Apple boot screen\n- Terminal with AI agent\n- Safari browser\n- Spotify player" },
    "config.js": { lang: "javascript", content: 'var CONFIG = {\n  apiEndpoint: "https://raka-agent-proxy.raka-portfolio.workers.dev",\n  model: "llama-3.3-70b-versatile",\n  maxTokens: 1024\n};' },
    "desktop.js": { lang: "javascript", content: '// desktop.js — Mac desktop interaction\n(function() {\n  "use strict";\n  var zCounter = 100;\n  function bringToFront(el) {\n    zCounter++;\n    el.style.zIndex = zCounter;\n  }\n})();' },
    "matrix.js": { lang: "javascript", content: '// matrix.js — ASCII rain engine\nvar canvas = document.getElementById("matrix-canvas");\nvar ctx = canvas.getContext("2d");\nvar columns = [];\n\nfunction draw() {\n  ctx.fillStyle = "rgba(0,0,0,0.05)";\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  columns.forEach(function(col, i) {\n    ctx.fillStyle = "#fff";\n    ctx.fillText(col.char, i * 14, col.y);\n    col.y += 14;\n    if (col.y > canvas.height) col.y = 0;\n  });\n  requestAnimationFrame(draw);\n}' },
    "base.css": { lang: "css", content: 'body {\n  margin: 0;\n  padding: 0;\n  font-family: -apple-system, BlinkMacSystemFont, system-ui;\n  background: #0d0d0d;\n  color: #e0e0e0;\n  overflow: hidden;\n}\n\n*, *::before, *::after {\n  box-sizing: border-box;\n}' },
    "desktop.css": { lang: "css", content: '/* desktop.css — macOS menu bar, dock */\n.mac-menubar {\n  position: fixed;\n  top: 0;\n  height: 24px;\n  background: rgba(20,20,20,0.75);\n  backdrop-filter: blur(20px);\n  z-index: 200;\n}\n\n.dock {\n  display: flex;\n  gap: 6px;\n  background: rgba(255,255,255,0.18);\n  border-radius: 14px;\n  padding: 6px 8px;\n}' },
    "window.css": { lang: "css", content: '/* window.css — window chrome */\n.window {\n  position: fixed;\n  width: 720px;\n  height: 460px;\n  background: #0d0d0d;\n  border-radius: 10px;\n  border: 1px solid rgba(255,255,255,0.12);\n  display: none;\n}\n\n.window.open { display: flex; }\n\n.window-titlebar {\n  height: 38px;\n  background: rgba(30,30,30,0.95);\n}' },
    "chat.css": { lang: "css", content: '/* chat.css — AI chat styles */\n.chat-msg-agent {\n  color: #ccc;\n  font-family: "IBM Plex Mono", monospace;\n  font-size: 13px;\n  line-height: 1.5;\n  padding: 4px 0;\n}\n\n.chat-label {\n  color: #4cd964;\n  font-weight: 600;\n}' },
  };

  // ── Monaco Editor loader ──
  function loadMonaco(callback) {
    if (monacoLoaded) { callback(); return; }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js";
    script.onload = function() {
      window.require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" }});
      window.require(["vs/editor/editor.main"], function() {
        monacoLoaded = true;
        callback();
      });
    };
    document.body.appendChild(script);
  }

  function createEditor() {
    if (editor) return;
    editor = window.monaco.editor.create(editorContainer, {
      value: "// Select a file to open",
      language: "plaintext",
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 13,
      fontFamily: "'IBM Plex Mono', monospace",
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      lineNumbers: "on",
      renderWhitespace: "selection",
      tabSize: 2,
    });

    editor.onDidChangeCursorPosition(function(e) {
      posEl.textContent = "Ln " + e.position.lineNumber + ", Col " + e.position.column;
    });
  }

  function openFile(name, lang) {
    // Check if already open
    var existing = openTabs.find(function(t) { return t.name === name; });
    if (existing) {
      switchTab(name);
      return;
    }

    var content = fileContents[name] ? fileContents[name].content : "// " + name + "\n// File content not available in demo";
    var language = lang || (fileContents[name] ? fileContents[name].lang : "plaintext");

    openTabs.push({ name: name, lang: language, content: content });
    activeTab = name;
    renderTabs();
    showContent(name, language);
  }

  function switchTab(name) {
    // Save current content
    if (activeTab && editor) {
      var current = openTabs.find(function(t) { return t.name === activeTab; });
      if (current) current.content = editor.getValue();
    }

    activeTab = name;
    var tab = openTabs.find(function(t) { return t.name === name; });
    if (tab && editor) {
      var langId = tab.lang;
      window.monaco.editor.setModelLanguage(editor.getModel(), langId);
      editor.setValue(tab.content);
      langEl.textContent = langId.charAt(0).toUpperCase() + langId.slice(1);
      editor.focus();
    }
    renderTabs();
  }

  function closeTab(name) {
    openTabs = openTabs.filter(function(t) { return t.name !== name; });
    if (activeTab === name) {
      activeTab = openTabs.length > 0 ? openTabs[openTabs.length - 1].name : null;
      if (activeTab) switchTab(activeTab);
      else if (editor) editor.setValue("// Select a file to open");
    }
    renderTabs();
  }

  function showContent(name, lang) {
    if (!editor) return;
    var tab = openTabs.find(function(t) { return t.name === name; });
    if (tab) {
      window.monaco.editor.setModelLanguage(editor.getModel(), lang);
      editor.setValue(tab.content);
      langEl.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
      editor.focus();
    }
  }

  function renderTabs() {
    var html = "";
    openTabs.forEach(function(tab) {
      var isActive = tab.name === activeTab ? " active" : "";
      html += '<div class="vscode-tab' + isActive + '" data-name="' + tab.name + '">' +
        '<span>' + tab.name + '</span>' +
        '<button class="vscode-tab-close" data-close="' + tab.name + '">&times;</button>' +
      '</div>';
    });
    tabsContainer.innerHTML = html;

    tabsContainer.querySelectorAll(".vscode-tab").forEach(function(el) {
      el.addEventListener("click", function(e) {
        if (e.target.classList.contains("vscode-tab-close")) return;
        switchTab(el.getAttribute("data-name"));
      });
    });

    tabsContainer.querySelectorAll(".vscode-tab-close").forEach(function(el) {
      el.addEventListener("click", function(e) {
        e.stopPropagation();
        closeTab(el.getAttribute("data-close"));
      });
    });
  }

  function getFileIcon(name) {
    var ext = name.split(".").pop();
    switch (ext) {
      case "css": return '<svg viewBox="0 0 16 16" width="12" height="12" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/><text x="8" y="11.5" text-anchor="middle" font-size="8" fill="#42a5f5" font-family="monospace" font-weight="bold">{}</text></svg>';
      case "js": return '<svg viewBox="0 0 16 16" width="12" height="12" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/><text x="8" y="11.5" text-anchor="middle" font-size="7" fill="#f5d442" font-family="monospace" font-weight="bold">JS</text></svg>';
      case "html": return '<svg viewBox="0 0 16 16" width="12" height="12" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/><text x="8" y="11.5" text-anchor="middle" font-size="7" fill="#e44d26" font-family="monospace" font-weight="bold">&lt;/&gt;</text></svg>';
      case "md": return '<svg viewBox="0 0 16 16" width="12" height="12" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/><text x="8" y="11" text-anchor="middle" font-size="6" fill="#888" font-family="sans-serif" font-weight="600">M&#8595;</text></svg>';
      default: return '<svg viewBox="0 0 16 16" width="12" height="12" style="display:block"><path d="M3 1.5h7l3.5 3.5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#555" stroke-width="1"/></svg>';
    }
  }

  function getFolderIcon() {
    return '<img src="assets/folder-icon.png" style="width:100%;height:100%;object-fit:contain;display:block;">';
  }

  function renderFileTree() {
    var tree = [
      { name: "css", type: "folder", children: ["base.css", "desktop.css", "window.css", "chat.css"] },
      { name: "js", type: "folder", children: ["config.js", "desktop.js", "matrix.js", "finder.js", "photos.js", "vscode.js"] },
      { name: "index.html", type: "file" },
      { name: "README.md", type: "file" },
    ];

    var html = "";
    tree.forEach(function(item) {
      if (item.type === "folder") {
        html += '<div class="vscode-tree-item folder" data-folder="' + item.name + '">' +
          '<span class="vscode-tree-icon">' + getFolderIcon() + '</span> ' + item.name + '</div>';
        html += '<div class="vscode-tree-children">';
        item.children.forEach(function(child) {
          html += '<div class="vscode-tree-item" data-file="' + child + '">' +
            '<span class="vscode-tree-icon">' + getFileIcon(child) + '</span> ' + child + '</div>';
        });
        html += '</div>';
      } else {
        html += '<div class="vscode-tree-item" data-file="' + item.name + '">' +
          '<span class="vscode-tree-icon">' + getFileIcon(item.name) + '</span> ' + item.name + '</div>';
      }
    });
    fileTree.innerHTML = html;

    fileTree.querySelectorAll(".vscode-tree-item[data-file]").forEach(function(el) {
      el.addEventListener("click", function() {
        fileTree.querySelectorAll(".vscode-tree-item").forEach(function(t) { t.classList.remove("active"); });
        el.classList.add("active");
        var name = el.getAttribute("data-file");
        openFile(name);
      });
    });
  }

  window.VSCodeApp = {
    init: function() {
      loadMonaco(function() {
        createEditor();
        renderFileTree();
        renderTabs();
      });
    },
    openFile: function(name, lang) {
      loadMonaco(function() {
        createEditor();
        openFile(name, lang);
        renderFileTree();
      });
    }
  };
})();
