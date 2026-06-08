(function() {
  "use strict";

  var window_el = document.getElementById("safari-window");
  var address_input = document.getElementById("safari-url");
  var loading_bar = document.getElementById("safari-loading-bar");
  var content_area = document.getElementById("safari-page-container");
  var back_btn = document.getElementById("safari-back");
  var forward_btn = document.getElementById("safari-forward");
  var history = [];
  var history_index = -1;

  var PROXIES = [
    "https://api.allorigins.win/raw?url=",
    "https://api.cors.lol/?url=",
  ];

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
    container.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#999;background:#1e1e1e;padding:24px;";

    var circle = document.createElement("div");
    circle.style.cssText = "width:80px;height:80px;border-radius:50%;border:3px solid #444;display:flex;align-items:center;justify-content:center;margin-bottom:24px;";
    var icon = document.createElement("div");
    icon.style.cssText = "font-size:36px;color:#666;";
    icon.textContent = "!";
    circle.appendChild(icon);

    var title = document.createElement("div");
    title.style.cssText = "font-size:18px;font-weight:600;margin-bottom:8px;color:#ccc;";
    title.textContent = "Page can\u2019t be reached";

    var subtitle = document.createElement("div");
    subtitle.style.cssText = "font-size:13px;color:#777;margin-bottom:24px;max-width:400px;text-align:center;word-break:break-all;line-height:1.5;";
    subtitle.textContent = url + " is unavailable or blocks external access. This is a portfolio demo browser.";

    var retryBtn = document.createElement("button");
    retryBtn.textContent = "Try Again";
    retryBtn.style.cssText = "padding:8px 20px;background:#444;color:#ccc;border:1px solid #555;border-radius:6px;font-size:13px;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,sans-serif;transition:background 0.15s;";
    retryBtn.onmouseover = function() { retryBtn.style.background = "#555"; };
    retryBtn.onmouseout = function() { retryBtn.style.background = "#444"; };
    retryBtn.onclick = function() { retryCallback(); };

    container.appendChild(circle);
    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(retryBtn);
    content_area.appendChild(container);
  }

  function tryFetchWithProxy(url, proxyIndex, onSuccess, onAllFailed) {
    if (proxyIndex >= PROXIES.length) {
      onAllFailed();
      return;
    }
    var proxyUrl = PROXIES[proxyIndex] + encodeURIComponent(url);
    var controller = new AbortController();
    var timeout = setTimeout(function() { controller.abort(); }, 6000);

    fetch(proxyUrl, { signal: controller.signal })
      .then(function(response) {
        clearTimeout(timeout);
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function(html) {
        if (html && html.length > 100) {
          onSuccess(html);
        } else {
          throw new Error("Empty response");
        }
      })
      .catch(function() {
        clearTimeout(timeout);
        tryFetchWithProxy(url, proxyIndex + 1, onSuccess, onAllFailed);
      });
  }

  function renderInIframe(html) {
    content_area.innerHTML = "";
    var iframe = document.createElement("iframe");
    iframe.style.cssText = "width:100%;height:100%;border:none;background:#fff;";
    iframe.sandbox = "allow-scripts allow-same-origin allow-forms allow-popups";
    iframe.srcdoc = html;
    content_area.appendChild(iframe);
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

    tryFetchWithProxy(url, 0, function(html) {
      hideLoading();
      renderInIframe(html);
    }, function() {
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

  var refresh_btn = document.getElementById("safari-refresh");
  if (refresh_btn) {
    refresh_btn.addEventListener("click", function() {
      if (history_index >= 0 && history[history_index]) {
        fetchAndRender(history[history_index]);
      }
    });
  }

  var home_btn = document.getElementById("safari-home");
  if (home_btn) {
    home_btn.addEventListener("click", function() {
      content_area.innerHTML = '<div class="safari-start-page"><div class="safari-start-title">Favorites</div><div class="safari-start-grid"><a class="safari-favorite" href="https://github.com/valleysonata" target="_blank"><img class="safari-fav-icon" src="assets/github-icon.png" alt="GitHub" style="border-radius:10px;"><span>GitHub</span></a><a class="safari-favorite" href="https://www.linkedin.com/in/adyaraka-banyu-langit-63456a317/" target="_blank"><div class="safari-fav-icon" style="background:#0077B5;border-radius:10px;width:48px;height:48px;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:bold;">in</div><span>LinkedIn</span></a><a class="safari-favorite" href="mailto:banyulangitadyaraka@gmail.com"><img class="safari-fav-icon" src="assets/gmail-icon.png" alt="Gmail" style="border-radius:10px;"><span>Gmail</span></a></div></div>';
      address_input.value = "";
    });
  }

  var star_btn = document.getElementById("safari-star");
  if (star_btn) {
    star_btn.addEventListener("click", function() {
      alert("Bookmark added: " + (address_input.value || "Start Page"));
    });
  }

  window.SafariApp = {
    open: function(url) {
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
