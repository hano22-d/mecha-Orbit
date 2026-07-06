import { Particle } from "../entities/particle";

export class Missile {
  constructor(canvas, x, y, angle) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.angle = angle;
    const isMobile = canvas.height < 500 || canvas.width < 768;

    this.width = isMobile ? 25 : 50;
    this.height = isMobile ? 50 : 100;

    this.hitBox = [
      {
        x: 0,
        y: 0,
        width: this.width * 0.2, // 10/50 = 0.2
        height: this.height * 0.55, // 55/100 = 0.55
        offsetX: 0,
        offsetY: this.height * -0.25, // -25/100 = -0.25
      },
    ];
    this.damage = 50;

    this.image = new Image();
    this.image.src =
      "/assets/weapon/5c9c6832-b15e-4cab-8c4c-ed2ad41ec331.png";

    this.target = null;
    this.speed = 0;
    this.maxSpeed = 15;
    this.turnSpeed = 0.05;
    this.acceleration = 0.0025;

    this.particles = [];
  }
  update(deltaTime, enemy) {
    if (!this.alive) return;

    // 1️⃣ الرادار الذكي: البحث عن هدف في المجال الأمامي فقط
    if (this.target === null) {
      let minDistance = Infinity;

      for (let i = 0; i < enemy.length; i++) {
        if (!enemy[i] || enemy[i].alive === false) continue;

        let dx = enemy[i].x - this.x;
        let dy = enemy[i].y - this.y;

        let angleToEnemy = Math.atan2(dy, dx);
        let angleDiff = angleToEnemy - this.angle;

        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

        let distance = Math.hypot(dx, dy);
        if (distance < minDistance) {
          this.target = enemy[i];
          minDistance = distance;
        }
      }
    }

    // 2️⃣ تصفير الهدف إذا مات
    if (this.target && this.target.alive === false) {
      this.target = null;
    }

    // 3️⃣ نظام التوجيه الذكي
    if (this.target !== null) {
      let dxTarget = this.target.x - this.x;
      let dyTarget = this.target.y - this.y;

      let targetAngle = Math.atan2(dyTarget, dxTarget);
      let angleDiff = targetAngle - this.angle;

      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

      if (angleDiff > 0) {
        this.angle += this.turnSpeed;
      } else {
        this.angle -= this.turnSpeed;
      }
    }

    // حصر زاوية الصاروخ
    while (this.angle < -Math.PI) this.angle += Math.PI * 2;
    while (this.angle > Math.PI) this.angle -= Math.PI * 2;

    if (this.speed < this.maxSpeed) {
      this.speed += this.acceleration * deltaTime;
    }

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    for (let i = 0; i < this.hitBox.length; i++) {
      this.hitBox[i].x = this.x + this.hitBox[i].offsetX - this.width / 12;
      this.hitBox[i].y = this.y + this.hitBox[i].offsetY - this.height / 10;
    }

    const isMobile = this.width === 25;
    const particleScale = isMobile ? 0.5 : 1;

    // توليد شرارات الصاروخ
    if (this.alive) {
      let tailX = this.x - Math.cos(this.angle) * (this.height / 4);
      let tailY = this.y - Math.sin(this.angle) * (this.height / 4);

      this.particles.push(
        new Particle(tailX, tailY, this.angle, particleScale)
      );
      this.particles.push(
        new Particle(tailX, tailY, this.angle, particleScale)
      );
    }
    // تحديث شرارات الصاروخ
    this.particles.forEach((p) => p.update());
    this.particles = this.particles.filter((p) => p.alpha > 0);
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x - camera.x, this.y - camera.y);

    ctx.rotate(this.angle + Math.PI / 2);
    /* for (let i = 0; i < this.hitBox.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(0, 255, 0, 0.4)"; 
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    
    ctx.fillRect(
      this.hitBox[i].offsetX - this.width / 12,
      this.hitBox[i].offsetY - this.height / 10,
      this.hitBox[i].width,
      this.hitBox[i].height
    );
    ctx.strokeRect(
      this.hitBox[i].offsetX - this.width / 12,
      this.hitBox[i].offsetY - this.height / 10,
      this.hitBox[i].width,
      this.hitBox[i].height
    );
 }*/
    ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();

    this.particles.forEach((p) => p.draw(ctx, camera));
  }
}
