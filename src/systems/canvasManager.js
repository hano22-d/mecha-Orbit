// src/systems/CanvasManager.js

const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

function resizeCanvas() {

  // نكتفي بأبعاد الشاشة المنطقية الحالية لتطابق حسابات الـ translate والكاميرا لديك 100%
  const logicalWidth = window.innerWidth;
  const logicalHeight = window.innerHeight;

  // جعل أبعاد الكانفاس مطابقة تماماً لأبعاد الشاشة دون ضربها في dpr
  myCanvas.width = logicalWidth;
  myCanvas.height = logicalHeight;

  myCanvas.style.width = logicalWidth + "px";
  myCanvas.style.height = logicalHeight + "px";
}

// استدعاء الدالة عند تشغيل اللعبة لأول مرة
resizeCanvas();

// إعادة التشغيل تلقائياً إذا قام اللاعب بقلب الهاتف (Orientation Change) أو تغيير حجم الشاشة
window.addEventListener("resize", resizeCanvas);("resize", resizeCanvas);

export { myCanvas, ctx };