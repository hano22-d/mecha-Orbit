// src/systems/CanvasManager.js

const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const logicalWidth = window.innerWidth;
  const logicalHeight = window.innerHeight;

  //ضبط دقة العرض
  myCanvas.width = logicalWidth * dpr;
  myCanvas.height = logicalHeight * dpr;

  //ضبط حجم الكانفاس ضمن حدود الشاشة
  myCanvas.style.width = logicalWidth + "px";
  myCanvas.style.height = logicalHeight + "px";

  // نخزن الأبعاد المنطقية هنا ليستخدمها كل كود اللعبة بدلاً من width/height
  myCanvas.logicalWidth = logicalWidth;
  myCanvas.logicalHeight = logicalHeight;

  //ضبط معامل التكبير في البارامتر الاول والرابع من اجل ان يتم الرسم بشكل صحيح
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
// استدعاء الدالة عند تشغيل اللعبة لأول مرة
resizeCanvas();

// إعادة التشغيل تلقائياً إذا قام اللاعب بقلب الهاتف (Orientation Change) أو تغيير حجم الشاشة
window.addEventListener("resize", resizeCanvas);
"resize", resizeCanvas;

export { myCanvas, ctx };
