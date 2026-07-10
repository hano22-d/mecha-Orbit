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
  
      // 🎨 متغيرات الـ Juice
      this.opacity = 0.5;       
      this.fadeTimer = 0;       
      this.delayDuration = 1000; 
  
      // ⚡ عداد وقت خاص بنبض الطاقة النيوني
      this.pulseTimer = 0;
    }
  
    update(deltaTime) {
      // [كود الشفافية السابق كما هو بدون تغيير]
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
  
      // 🔥 الجديد: جعل عداد النبض يتصاعد مستمراً مع الوقت
      // نضرب بـ 0.005 للتحكم بسرعات النبض (كلما صغر الرقم أصبح النبض أهدأ وأنعم)
      this.pulseTimer += deltaTime * 0.005;
    }
  
    draw(ctx) {
      ctx.save(); 
  
      ctx.globalAlpha = this.opacity;
  
      // حساب الحجم الأساسي حسب نوع الشاشة
      let currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;
  
      if (this.isPressed) {
        // أ) إذا ضغط اللاعب: ينكمش الزر ميكانيكياً بنسبة 10% لتأكيد الضغط
        currentRadius = currentRadius * 0.9;
      } else {
        // ب) إذا كان في حالة انتظار: يبدأ سحر نبض الطاقة النيوني!
        // Math.sin تعطينا رقماً بين -1 و +1، نضربه في 0.04 (أي تلاعب بالحجم بنسبة 4% فقط)
        const pulseFactor = Math.sin(this.pulseTimer) * 0.04;
        
        // الحجم النهائي سيتأرجح بنعومة فائقة بين (الحجم * 0.96) و (الحجم * 1.04)
        currentRadius = currentRadius * (1 + pulseFactor);
      }
  
      ctx.drawImage(
        this.image,
        this.x - currentRadius,
        this.y - currentRadius,
        currentRadius * 2,
        currentRadius * 2
      );
  
      ctx.restore(); 
    }
  }