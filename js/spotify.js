(function() {
  "use strict";

  var window_el = document.getElementById("spotify-window");
  var embed_container = document.getElementById("spotify-embed-container");
  var apiLoaded = false;
  var controller = null;
  var DEFAULT_URI = "spotify:playlist:2PWRebDBksNEfFGVdig2M5";

  function loadSpotifyApi() {
    if (apiLoaded) return;
    var script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);
    apiLoaded = true;
  }

  window.onSpotifyIframeApiReady = function(IFrameAPI) {
    if (embed_container) {
      IFrameAPI.createController(embed_container, { width: "100%", height: "100%", uri: DEFAULT_URI }, function(ctrl) {
        controller = ctrl;
      });
    }
  };

  window.SpotifyApp = {
    open: function() {
      // Called by launchpad — just show the window
      if (window_el) {
        window_el.style.display = "flex";
        window_el.classList.add("open");
      }
      if (!apiLoaded) {
        loadSpotifyApi();
      }
    },
    init: function() {
      // Called by desktop.js after genie animation — load API if needed
      if (!apiLoaded) {
        loadSpotifyApi();
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
