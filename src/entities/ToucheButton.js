// ==========================================================================
// 🕹️ Mecha-Orbit: Touch Controls Engine - TouchButton Class (OOP)
// ==========================================================================

export class TouchButton {
  constructor({ canvas, type, imageSrc, relativeX, relativeY, radius }) {
    this.canvas = canvas; 
    this.type = type;    

    this.x = relativeX; 
    this.y = relativeY;
    
    this.radius = radius; 
    
    this.isPressed = false;

    this.image = new Image();
    this.image.src = imageSrc;
    
    this.isMobile = canvas.height < 500 || canvas.width < 768;
  }

  // 🎨 دالة الرسم: تقوم برسم صورة الزر في موقعه الحالي مع تطبيق الوهج النيوني الثابت.
  draw(ctx) {

    ctx.save(); // حفظ حالة الكانفاس الحالية (لكي لا يؤثر التوهج على باقي عناصر اللعبة)

    // 🖼️ رسم الصورة البصرية (الأزرار الاحترافية التي قمت بتوليدها)
    // رسم الصورة في المركز تماماً بناءً على إحداثيات (x, y) وطرح نصف القطر للحجم.
    
    // حساب الأبعاد الحقيقية بناءً على نوع الشاشة
    const currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;

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