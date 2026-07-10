// ==========================================================================
// 🕹️ Mecha-Orbit: Touch Controls Engine - TouchButton Class with Juice
// ==========================================================================

export class TouchButton {
  constructor({ canvas, type, imageSrc, relativeX, relativeY, radius }) {
    this.canvas = canvas; 
    this.type = type;     

    this.x = relativeX; 
    this.y = relativeY;
    this.startX = relativeX;
    this.startY = relativeY;
    
    this.radius = radius; 
    this.isPressed = false;

    this.image = new Image();
    this.image.src = imageSrc;
    
    this.isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    // 🎨 متغيرات الـ Juice الخاصة بالشفافية
    this.opacity = 0.5;       // الشفافية الابتدائية (نصف وضوح)
    this.fadeTimer = 0;       // عداد وقتي لحساب التأخير بعد رفع الإصبع
    this.delayDuration = 1000; // مدة التأخير بالملي ثانية (1 ثانية كاملة)
  }

  // 📐 دالة الفحص الرياضي للتصادم (كما هي بدون تغيير)
  checkTouch(touchX, touchY) {
    const dx = touchX - this.x;
    const dy = touchY - this.y;
    const distanceSquared = dx * dx + dy * dy;
    
    let currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;
    const radiusSquared = currentRadius * currentRadius;

    if (distanceSquared <= radiusSquared) {
      this.isPressed = true;
      return true;
    }
    return false;
  }

  // ⏳ دالة التحديث الديناميكي للتأثيرات البصرية (تُستدعى في كل إطار)
  update(deltaTime) {
    let targetOpacity = 0.5; // الهدف الافتراضي هو نصف شفافية

    if (this.isPressed) {
      // أ) إذا كان الزر مضغوطاً حالياً: الوضوح فوري 100% وإعادة تصفير العداد
      targetOpacity = 1.0;
      this.fadeTimer = 0; 
    } else {
      // ب) إذا رُفع الإصبع: نبدأ بحساب الوقت
      this.fadeTimer += deltaTime;

      if (this.fadeTimer < this.delayDuration) {
        // طالما لم تمر ثانية كاملة بعد الرفع، حافظ على الوضوح الكامل!
        targetOpacity = 1.0;
      } else {
        // بعد مرور ثانية، اسمح للهدف بالعودة إلى النصف
        targetOpacity = 0.5;
      }
    }

    // ✨ معادلة الـ Lerp السحرية للتنقل الناعم بين الشفافية الحالية والهدف
    // الرقم 0.008 يضمن تلاؤماً متناسباً مع الـ deltaTime لمنع القفزات الفجائية
    this.opacity += (targetOpacity - this.opacity) * (0.008 * deltaTime);
    
    // تأمين الحدود برمجياً بين 0.5 و 1.0
    if (this.opacity < 0.5) this.opacity = 0.5;
    if (this.opacity > 1.0) this.opacity = 1.0;
  }

  // 🎨 دالة الرسم: تطبق الـ globalAlpha بناءً على الحسابات الناعمة
  draw(ctx) {
    ctx.save(); 

    // 🔥 حقن الشفافية الحالية المحدثة في الكانفاس قبل رسم هذا الزر
    ctx.globalAlpha = this.opacity;

    let currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;

    // تأثير انكماش حجم الزر عند الضغط لإضافة استجابة ميكانيكية حركية للزر
    if (this.isPressed) {
      currentRadius = currentRadius * 0.9;
    }

    ctx.drawImage(
      this.image,
      this.x - currentRadius,
      this.y - currentRadius,
      currentRadius * 2,
      currentRadius * 2
    );

    ctx.restore(); // استعادة حالة الكانفاس (لكي لا تصبح باقي عناصر اللعبة شفافة بالخطأ!)
  }
}


/*
export class TouchButton {
  constructor({ canvas, type, imageSrc, relativeX, relativeY, radius }) {
    this.canvas = canvas;
    this.type = type;
    this.x = relativeX;
    this.y = relativeY;
    this.startX = relativeX;
    this.startY = relativeY;
    this.radius = radius;
    this.isPressed = false;

    this.image = new Image();
    this.image.src = imageSrc;
    this.isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    // 🎨 متغيرات الشفافية
    this.opacity = 0.5;
    this.fadeTimer = 0;
    this.delayDuration = 1000;

    this.shineAngle = 0;

    if (this.type === "SHOOT") {
      this.glowColor = "rgba(0, 212, 255, 1)"; // أزرق نيوني ساطع
    } else if (this.type === "MISSILE") {
      this.glowColor = "rgba(255, 0, 127, 1)"; // فوشيا تكتيكي
    } else {
      this.glowColor = "rgba(0, 255, 200, 0.8)"; // سيان للجويستيك
    }
  }

  update(deltaTime) {
    let targetOpacity = 0.5;
    if (this.isPressed) {
      targetOpacity = 1.0;
      this.fadeTimer = 0;
    } else {
      this.fadeTimer += deltaTime;
      targetOpacity = this.fadeTimer < this.delayDuration ? 1.0 : 0.5;
    }
    this.opacity += (targetOpacity - this.opacity) * (0.008 * deltaTime);
    if (this.opacity < 0.5) this.opacity = 0.5;
    if (this.opacity > 1.0) this.opacity = 1.0;

    this.shineAngle += deltaTime * 0.004;
  }

  draw(ctx) {
    ctx.save();

    ctx.globalAlpha = this.opacity;

    let currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;
    if (this.isPressed) currentRadius = currentRadius * 0.9;

    ctx.drawImage(
      this.image,
      this.x - currentRadius,
      this.y - currentRadius,
      currentRadius * 2,
      currentRadius * 2
    );

    const glowX = this.x + Math.cos(this.shineAngle) * currentRadius;
    const glowY = this.y + Math.sin(this.shineAngle) * currentRadius;

    ctx.beginPath();

    ctx.arc(glowX, glowY, this.isMobile ? 3 : 4, 0, Math.PI * 2);
    ctx.fillStyle = this.glowColor;

    ctx.fill();

    ctx.restore();
  }
}
 
*/