// src/systems/CanvasManager.js

const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const logicalWidth = window.innerWidth;
  const logicalHeight = window.innerHeight;

  // أبعاد الكانفاس الداخلية (عدد البكسلات الحقيقي) × dpr
  myCanvas.width = logicalWidth ;
  myCanvas.height = logicalHeight ;

  // الحجم الظاهر على الشاشة يبقى بالـ CSS pixels
  myCanvas.style.width = logicalWidth + "px";
  myCanvas.style.height = logicalHeight + "px";

}

// استدعاء الدالة عند تشغيل اللعبة لأول مرة
resizeCanvas();

// إعادة التشغيل تلقائياً إذا قام اللاعب بقلب الهاتف (Orientation Change) أو تغيير حجم الشاشة
window.addEventListener("resize", resizeCanvas);
"resize", resizeCanvas;

export { myCanvas, ctx };
