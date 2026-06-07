(function() {
  "use strict";

  var window_el = document.getElementById("safari-window");
  var address_input = document.getElementById("safari-url");
  var loading_bar = document.getElementById("safari-loading-bar");
  var content_area = document.getElementById("safari-page-container");
  var back_btn = document.getElementById("safari-back");
  var forward_btn = document.getElementById("safari-forward");
  var refresh_btn = document.getElementById("safari-refresh");
  var history = [];
  var history_index = -1;

  function showLoading() {
    loading_bar.style.width = "0%";
    loading_bar.style.display = "block";
    loading_bar.style.transition = "width 0.3s ease";
    setTimeout(function() { loading_bar.style.width = "40%"; }, 50);
  }

  function hideLoading() {
    loading_bar.style.width = "100%";
    setTimeout(function() {
      loading_bar.style.display = "none";
      loading_bar.style.width = "0%";
    }, 300);
  }

  function showErrorPage(url, retryCallback) {
    content_area.innerHTML = "";
    var container = document.createElement("div");
    container.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#555;background:#fff;";

    var icon = document.createElement("div");
    icon.style.cssText = "font-size:48px;margin-bottom:16px;";
    icon.textContent = "!";
    var circle = document.createElement("div");
    circle.style.cssText = "width:80px;height:80px;border-radius:50%;border:3px solid #ccc;display:flex;align-items:center;justify-content:center;margin-bottom:24px;";
    circle.appendChild(icon);

    var title = document.createElement("div");
    title.style.cssText = "font-size:20px;font-weight:bold;margin-bottom:8px;color:#333;";
    title.textContent = "Page can\u2019t be reached";

    var subtitle = document.createElement("div");
    subtitle.style.cssText = "font-size:14px;color:#888;margin-bottom:24px;max-width:400px;text-align:center;word-break:break-all;";
    subtitle.textContent = url + " took too long to respond or is unreachable.";

    var retryBtn = document.createElement("button");
    retryBtn.textContent = "Try Again";
    retryBtn.style.cssText = "padding:10px 24px;background:#007AFF;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;";
    retryBtn.onmouseover = function() { retryBtn.style.background = "#005EC4"; };
    retryBtn.onmouseout = function() { retryBtn.style.background = "#007AFF"; };
    retryBtn.onclick = function() { retryCallback(); };

    container.appendChild(circle);
    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(retryBtn);
    content_area.appendChild(container);
  }

  function fetchAndRender(url) {
    if (!url) return;
    if (url.indexOf("http") !== 0) {
      url = "https://" + url;
    }
    address_input.value = url;
    history = history.slice(0, history_index + 1);
    history.push(url);
    history_index = history.length - 1;
    showLoading();
    var proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
    fetch(proxyUrl)
      .then(function(response) {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.text();
      })
      .then(function(html) {
        hideLoading();
        content_area.innerHTML = "";
        var iframe = document.createElement("iframe");
        iframe.style.cssText = "width:100%;height:100%;border:none;";
        iframe.sandbox = "allow-scripts allow-same-origin allow-forms allow-popups";
        iframe.srcdoc = html;
        content_area.appendChild(iframe);
      })
      .catch(function() {
        hideLoading();
        showErrorPage(url, function() { fetchAndRender(url); });
      });
  }

  if (address_input) {
    address_input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        fetchAndRender(address_input.value.trim());
      }
    });
  }

  if (back_btn) {
    back_btn.addEventListener("click", function() {
      if (history_index > 0) {
        history_index--;
        address_input.value = history[history_index];
        fetchAndRender(history[history_index]);
      }
    });
  }

  if (forward_btn) {
    forward_btn.addEventListener("click", function() {
      if (history_index < history.length - 1) {
        history_index++;
        address_input.value = history[history_index];
        fetchAndRender(history[history_index]);
      }
    });
  }

  if (refresh_btn) {
    refresh_btn.addEventListener("click", function() {
      if (history_index >= 0) {
        fetchAndRender(history[history_index]);
      }
    });
  }

  window.SafariApp = {
    open: function(url) {
      // Called by launchpad — just show the window
      if (window_el) {
        window_el.style.display = "flex";
      }
      if (address_input) {
        address_input.focus();
      }
      if (url) {
        fetchAndRender(url);
      }
    },
    init: function() {
      // Called by desktop.js after genie animation — focus address bar
      if (address_input) {
        address_input.focus();
      }
    },
    close: function() {
      if (window_el) {
        window_el.style.display = "none";
        window_el.classList.remove("open");
      }
    }
  };
})();
