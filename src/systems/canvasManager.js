// src/systems/CanvasManager.js

const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

function resizeCanvas() {
  myCanvas.width = window.innerWidth;
  myCanvas.height = window.innerHeight;

  if(window.gameInstance && typeof window.gameInstance.handleResize === "function") {
    window.gameInstance.handleResize()
  }
}

// تشغيل الريسايز فوراً وعند تغيير الحجم
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

export { myCanvas, ctx };