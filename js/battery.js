(function() {
  "use strict";

  var indicator_el = document.getElementById("battery-indicator");
  var level_rect = document.getElementById("battery-level");

  function updateBattery(battery) {
    var pct = Math.round(battery.level * 100);
    var charging = battery.charging;

    if (level_rect) {
      // Scale the fill rect width (max width is 13 at 100%)
      var fillWidth = (pct / 100) * 13;
      level_rect.setAttribute("width", fillWidth);

      // Color based on level
      if (pct <= 20) {
        level_rect.setAttribute("fill", "#ff3b30");
      } else if (pct <= 50) {
        level_rect.setAttribute("fill", "#ffcc00");
      } else {
        level_rect.setAttribute("fill", "currentColor");
      }
    }

    // Add/remove charging bolt
    if (indicator_el) {
      var existingBolt = indicator_el.querySelector(".battery-bolt");
      if (charging && !existingBolt) {
        var bolt = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        bolt.setAttribute("class", "battery-bolt");
        bolt.setAttribute("width", "10");
        bolt.setAttribute("height", "12");
        bolt.setAttribute("viewBox", "0 0 10 12");
        bolt.style.cssText = "margin-left:2px;vertical-align:middle;";
        var boltPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        boltPath.setAttribute("d", "M6 0L0 7h4l-1 5 5-7H4l1-5z");
        boltPath.setAttribute("fill", "#4cd964");
        bolt.appendChild(boltPath);
        indicator_el.appendChild(bolt);
      } else if (!charging && existingBolt) {
        existingBolt.remove();
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