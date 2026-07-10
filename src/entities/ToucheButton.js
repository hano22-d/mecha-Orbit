export class TouchButton {
  constructor({ canvas, type, imageSrc, relativeX, relativeY, radius }) {
    this.canvas = canvas;
    this.type = type;
    this.x = relativeX;
    this.y = relativeY;
    this.startX = relativeX;
    this.startY = relativeY - 5;
    this.radius = radius;
    this.isPressed = false;

    this.image = new Image();
    this.image.src = imageSrc;
    this.isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    // 🎨 متغيرات الشفافية
    this.opacity = 0.5;
    this.fadeTimer = 0;
    this.delayDuration = 1000;

    // ✨ زاوية دوران شريط اللمعان
    this.shineAngle = 0;

    // 🔵 تحديد لون اللمعان الليزري بناءً على نوع الزر
    if (this.type === "SHOOT") {
      this.glowColor = "rgba(0, 212, 255, 1)";
    } else if (this.type === "MISSILE") {
      this.glowColor = "#ffb359";
    } else {
      this.glowColor = "rgba(0, 255, 200, 0.8)";
    }
  }

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

    this.shineAngle += deltaTime * 0.001;
  }

  draw(ctx) {
    ctx.save();

    ctx.beginPath();

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

    if (this.type === "SHOOT" || this.type === "MISSILE") {
      const arcLength = Math.PI * 0.5;
      const startAngle = this.shineAngle;
      const endAngle = this.shineAngle + arcLength;

      // رسم القوس على الحافة الخارجية لزر الإطلاق
      ctx.arc(this.x, this.y - 4, currentRadius * 0.6, startAngle, endAngle);

      ctx.strokeStyle = this.glowColor;
      ctx.lineWidth = this.isMobile ? 2 : 3;
      ctx.lineCap = "round";

      ctx.stroke();
    }

    ctx.closePath();

    ctx.restore();
  }
}
