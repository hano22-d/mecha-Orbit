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
