// ==========================================================================
// 🕹️ Mecha-Orbit: Touch Controls Engine - TouchButton Class (OOP)
// ==========================================================================

export class TouchButton {
  constructor({ canvas, type, imageSrc, relativeX, relativeY, radius }) {
    this.canvas = canvas; 
    this.type = type;    

    this.x = relativeX; 
    this.y = relativeY;
    
    // 🔥 أضف هذين السطرين لحفظ المركز الأصلي (مهم جداً لإعادة المقبض للمنتصف عند رفع الإصبع)
    this.startX = relativeX;
    this.startY = relativeY;
    
    this.radius = radius; 
    
    this.isPressed = false;

    this.image = new Image();
    this.image.src = imageSrc;
    
    this.isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;
  }

  checkTouch(touchX, touchY) {
    // حساب الفارق بين مركز الزر ونقطة اللمس على المحورين X و Y
    const dx = touchX - this.x;
    const dy = touchY - this.y;
    
    // قانون المسافة بين نقطتين (فيثاغورس بدون جذر لسرعة الأداء العالية)
    const distanceSquared = dx * dx + dy * dy;
    
    // حساب مربع نصف القطر
    let currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;
    const radiusSquared = currentRadius * currentRadius;

    // إذا كانت المسافة المربعة أصغر من مربع نصف القطر، فالإصبع داخل الزر!
    if (distanceSquared <= radiusSquared) {
      this.isPressed = true;
      return true;
    }
    
    return false;
  }

  // 🎨 دالة الرسم: تقوم برسم صورة الزر في موقعه الحالي مع تطبيق الوهج النيوني الثابت.
  draw(ctx) {

    ctx.save(); // حفظ حالة الكانفاس الحالية (لكي لا يؤثر التوهج على باقي عناصر اللعبة)

    // 🖼️ رسم الصورة البصرية (الأزرار الاحترافية التي قمت بتوليدها)
    // رسم الصورة في المركز تماماً بناءً على إحداثيات (x, y) وطرح نصف القطر للحجم.
    
    // حساب الأبعاد الحقيقية بناءً على نوع الشاشة
    let currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;

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

    ctx.restore(); // استعادة حالة الكانفاس الأصلية
  }
  }