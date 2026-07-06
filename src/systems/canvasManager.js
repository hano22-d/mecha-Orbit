// src/systems/CanvasManager.js

const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const logicalWidth = window.innerWidth;
  const logicalHeight = window.innerHeight;

  myCanvas.width = logicalWidth * dpr;
  myCanvas.height = logicalHeight * dpr;
  myCanvas.style.width = logicalWidth + "px";
  myCanvas.style.height = logicalHeight + "px";

  // 🟢 نخزن الأبعاد المنطقية هنا ليستخدمها كل كود اللعبة بدلاً من width/height
  myCanvas.logicalWidth = logicalWidth;
  myCanvas.logicalHeight = logicalHeight;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
// استدعاء الدالة عند تشغيل اللعبة لأول مرة
resizeCanvas();

// إعادة التشغيل تلقائياً إذا قام اللاعب بقلب الهاتف (Orientation Change) أو تغيير حجم الشاشة
window.addEventListener("resize", resizeCanvas);
"resize", resizeCanvas;

export { myCanvas, ctx };
