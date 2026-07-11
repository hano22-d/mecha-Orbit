// src/systems/CanvasManager.js

const myCanvas = document.getElementById("myCanvas"); // سنسميه لاحقاً gameCanvas ليكون أوضح
const ctx = myCanvas.getContext("2d");

const bgCanvas = document.getElementById("backgroundCanvas");
const bgCtx = bgCanvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const logicalWidth = window.innerWidth;
  const logicalHeight = window.innerHeight;

  // ضبط دقة العرض الفعلية (المضخمة بالـ DPR)
  myCanvas.width = logicalWidth * dpr;
  myCanvas.height = logicalHeight * dpr;
  bgCanvas.width = logicalWidth * dpr;
  bgCanvas.height = logicalHeight * dpr;

  // ضبط حجم الكانفاس بالـ CSS ليطابق حدود الشاشة المنطقية
  myCanvas.style.width = logicalWidth + "px";
  myCanvas.style.height = logicalHeight + "px";
  bgCanvas.style.width = logicalWidth + "px";
  bgCanvas.style.height = logicalHeight + "px";

  // تخزين الأبعاد المنطقية هنا ليستخدمها كل كود اللعبة بدلاً من width/height
  myCanvas.logicalWidth = logicalWidth;
  myCanvas.logicalHeight = logicalHeight;
  bgCanvas.logicalWidth = logicalWidth;
  bgCanvas.logicalHeight = logicalHeight;

  // إصلاح النقطة القاتلة: ضبط معامل التكبير لكلا الكانفاسين!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

export { myCanvas, bgCanvas, ctx, bgCtx };