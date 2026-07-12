// كلاس شرارات الصاروخ المتجاوب
export class Particle {
  constructor(x, y, missileAngle, scale = 1) {
    this.x = x;
    this.y = y;

    this.size = (Math.random() * 4 + 2) * scale;

    this.spreadAngle = missileAngle + Math.PI + (Math.random() - 0.5) * 0.5;

    this.speed = (Math.random() * 3 + 1) * scale;

    this.velocityX = Math.cos(this.spreadAngle) * this.speed;
    this.velocityY = Math.sin(this.spreadAngle) * this.speed;

    this.alpha = 1;
    this.decay = Math.random() * 0.03 + 0.01;

    const colors = ["#ffffff", "#fffacd", "#ffeb3b", "#ffc107", "#ff9800"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.alpha -= this.decay;

    // تقليص الحجم تدريجياً بشكل متناسب
    if (this.size > 0.05) this.size -= 0.05;
  }
}
