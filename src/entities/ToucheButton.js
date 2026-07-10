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
  
      // ✨ زاوية دوران نقطة اللمعان حول حافة الزر
      this.shineAngle = 0;
  
      // 🔵 تحديد لون اللمعان الليزري بناءً على نوع الزر (الهوية البصرية)
      // زر الرصاص أزرق نيوني، الصاروخ فوشيا/أحمر، والجويستيك سيان
      if (this.type === 'SHOOT') {
        this.glowColor = 'rgba(0, 212, 255, 1)'; // أزرق نيوني ساطع
      } else if (this.type === 'MISSILE') {
        this.glowColor = 'rgba(255, 0, 127, 1)'; // فوشيا تكتيكي
      } else {
        this.glowColor = 'rgba(0, 255, 200, 0.8)'; // سيان للجويستيك
      }
    }
  
    update(deltaTime) {
      // 1️⃣ تحديث الشفافية (كودنا المستقر الحركي)
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
  
      // 2️⃣ زيادة زاوية اللمعان باستمرار ليطوف حول الدائرة
      // نضرب بـ 0.004 للتحكم بسرطان الدوران (يمكنك زيادته لجعله أسرع وخاطفاً أكثر)
      this.shineAngle += deltaTime * 0.004;
    }
  
    draw(ctx) {
        ctx.save(); 
    
        // تطبيق الشفافية الحركية الموحدة
        ctx.globalAlpha = this.opacity;
    
        let currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;
        if (this.isPressed) currentRadius = currentRadius * 0.9;
    
        // 🖼️ 1. رسم صورة الزر الأصلية في المركز
        ctx.drawImage(
          this.image,
          this.x - currentRadius,
          this.y - currentRadius,
          currentRadius * 2,
          currentRadius * 2
        );
    
        // ✨ 2. رسم شريط اللمعان المداري المحيط (The Orbital Neon Arc)
        // نجعل طول الشريط يحتل جزءاً من الدائرة (مثلاً Math.PI * 0.5 يعطينا قوساً رائعاً بزاوية 90 درجة)
        const arcLength = Math.PI * 0.5; 
        const startAngle = this.shineAngle;
        const endAngle = this.shineAngle + arcLength;
    
        ctx.beginPath();
        // نرسم القوس مباشرة على الحافة الخارجية للزر (نزيد بكسل أو اثنين ليكون الوهج راكباً على الحافة تماماً)
        ctx.arc(this.x, this.y, currentRadius + 1, startAngle, endAngle);
        
        // ضبط مظهر الشريط الليزري
        ctx.strokeStyle = this.glowColor; // اللون النيوني الخاص بالزر القادم من الـ constructor
        ctx.lineWidth = this.isMobile ? 3 : 4;     // سماكة شريط اللمعان
        ctx.lineCap = "round";            // جعل أطراف الشريط دائرية وناعمة لتبدو انسيابية كالليزر
        
        ctx.stroke(); // صب الخط الليزري
    
        ctx.restore(); 
      }
  }