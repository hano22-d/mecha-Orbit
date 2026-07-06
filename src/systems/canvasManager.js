// src/systems/CanvasManager.js

const myCanvas = document.getElementById("gameCanvas"); // استبدله بـ ID الكانفاس الخاص بك
const ctx = myCanvas.getContext("2d");

function resizeCanvas() {
  // 1. الحصول على نسبة بكسل الجهاز الحقيقية (مثلاً 2 أو 3 في الموبايل، و 1 في الشاشات القديمة)
  const dpr = window.devicePixelRatio || 1;

  // 2. تحديد الأبعاد المنطقية للشاشة (عرض وارتفاع المتصفح حالياً)
  const logicalWidth = window.innerWidth;
  const logicalHeight = window.innerHeight;

  // 3. تكبير الأبعاد الداخلية للكانفاس الحقيقية بضربها في الـ DPR
  myCanvas.width = logicalWidth * dpr;
  myCanvas.height = logicalHeight * dpr;

  // 4. إجبار الـ CSS على الحفاظ على الأبعاد المنطقية للشاشة بدون مطّ
  myCanvas.style.width = logicalWidth + "px";
  myCanvas.style.height = logicalHeight + "px";

  // 5. موازنة الرسم: نخبر الـ Canvas بأن يقوم بعمل Scale تلقائي لكل عمليات الرسم القادمة
  // هذا يضمن أن أكوادك الحالية (مثل الأبعاد والسرعات) لن تخرب وتعمل بنفس مقاساتها الطبيعية!
  ctx.scale(dpr, dpr);
}

// استدعاء الدالة عند تشغيل اللعبة لأول مرة
resizeCanvas();

// إعادة التشغيل تلقائياً إذا قام اللاعب بقلب الهاتف (Orientation Change) أو تغيير حجم الشاشة
window.addEventListener("resize", resizeCanvas);("resize", resizeCanvas);

export { myCanvas, ctx };