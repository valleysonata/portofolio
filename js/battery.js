(function() {
  "use strict";

  var indicator_el = document.getElementById("battery-indicator");
  var level_rect = document.getElementById("battery-level");

  function updateBattery(battery) {
    var pct = Math.round(battery.level * 100);

    if (level_rect) {
      var fillWidth = (pct / 100) * 13;
      level_rect.setAttribute("width", fillWidth);

      if (pct <= 20) {
        level_rect.setAttribute("fill", "#ff3b30");
      } else if (pct <= 50) {
        level_rect.setAttribute("fill", "#ffcc00");
      } else {
        level_rect.setAttribute("fill", "currentColor");
      }
    }
  }

  function showStatic() {
    if (level_rect) {
      level_rect.setAttribute("width", "9.75"); // 75% of 13
      level_rect.setAttribute("fill", "currentColor");
    }
  }

  function init() {
    if (!navigator.getBattery) {
      showStatic();
      return;
    }
    navigator.getBattery().then(function(battery) {
      updateBattery(battery);
      battery.addEventListener("levelchange", function() {
        updateBattery(battery);
      });
      battery.addEventListener("chargingchange", function() {
        updateBattery(battery);
      });
    }).catch(function() {
      showStatic();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();