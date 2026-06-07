(function() {
  "use strict";

  var window_el = document.getElementById("spotify-window");
  var embed_container = document.getElementById("spotify-embed-container");
  var loading_el = document.getElementById("spotify-loading");
  var controller = null;
  var DEFAULT_URI = "spotify:playlist:2PWRebDBksNEfFGVdig2M5";

  window.onSpotifyIframeApiReady = function(IFrameAPI) {
    if (embed_container && loading_el) {
      loading_el.style.display = "none";
      IFrameAPI.createController(embed_container, { width: "100%", height: "100%", uri: DEFAULT_URI }, function(ctrl) {
        controller = ctrl;
      });
    }
  };

  window.SpotifyApp = {
    open: function() {
      if (window_el) {
        window_el.style.display = "flex";
        window_el.classList.add("open");
      }
    },
    init: function() {
      // API is preloaded in <head>, no manual loading needed
    },
    close: function() {
      if (window_el) {
        window_el.style.display = "none";
        window_el.classList.remove("open");
      }
    }
  };
})();
