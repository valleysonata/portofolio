/**
 * matrix.js — ASCII matrix rain animation
 *
 * Renders a looping digital rain effect over the name logo using the
 * Canvas 2D API. Each column has an independent randomised drop speed.
 *
 * Depends on: nothing (reads #matrix-canvas from the DOM)
 */

(function () {
  "use strict";

  const ASCII_LINES = [
    "8 888888888o.  ",
    "8 8888    `88. ",
    "8 8888     `88 ",
    "8 8888     ,88 ",
    "8 8888.   ,88' ",
    "8 888888888P'  ",
    "8 8888`8b      ",
    "8 8888 `8b.    ",
    "8 8888   `8b.  ",
    "8 8888     `88.",
  ];

  const FONT      = "11px 'IBM Plex Mono', monospace";
  const FONT_SIZE = 11;

  function initCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.font = FONT;
    const letterWidth  = ctx.measureText("8").width;
    const lineHeight   = FONT_SIZE * 1.18;
    const columnsCount = ASCII_LINES[0].length;

    canvas.width  = letterWidth * columnsCount;
    canvas.height = lineHeight  * ASCII_LINES.length;

    const drops      = Array(columnsCount).fill(0);
    const rainSpeeds = drops.map(() => Math.random() * 0.35 + 0.15);

    function getCharColor(distance) {
      if (distance < 0 || distance >= 6)  return "#333333";
      if (Math.floor(distance) === 0)     return "#ffffff";
      if (distance < 3)                   return "#999999";
      return "#555555";
    }

    var frameCount = 0;
    function draw() {
      frameCount++;
      if (frameCount % 2 !== 0) { requestAnimationFrame(draw); return; }

      ctx.fillStyle    = "#0d0d0d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font         = FONT;
      ctx.textBaseline = "top";

      for (let row = 0; row < ASCII_LINES.length; row++) {
        for (let col = 0; col < ASCII_LINES[row].length; col++) {
          const char = ASCII_LINES[row][col];
          if (char === " ") continue;
          ctx.fillStyle = getCharColor(drops[col] - row);
          ctx.fillText(char, col * letterWidth, row * lineHeight);
        }
      }

      for (let i = 0; i < drops.length; i++) {
        drops[i] += rainSpeeds[i];
        if (drops[i] > ASCII_LINES.length + 6 && Math.random() > 0.96) {
          drops[i]      = -5;
          rainSpeeds[i] = Math.random() * 0.35 + 0.15;
        }
      }
    }

    requestAnimationFrame(draw);
  }

  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (isMobile) {
    initCanvas("matrix-canvas-mobile");
  } else {
    initCanvas("matrix-canvas");
  }
})();
