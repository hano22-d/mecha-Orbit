import { Particle } from "../entities/particle";
import { assetsManager } from "../systems/AssetsManager";

export class Missile {
  constructor(canvas, x, y, angle) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.angle = angle;
    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    this.width = isMobile ? 25 : 50;
    this.height = isMobile ? 50 : 100;

    this.hitBox = [
      {
        x: 0,
        y: 0,
        width: this.width * 0.2, 
        height: this.height * 0.55, 
        offsetX: 0,
        offsetY: this.height * -0.25, 
      },
    ];
    this.damage = 50;

    this.image = assetsManager.getImage("missile");

    this.target = null;
    this.speed = 0;
    this.maxSpeed = 15;
    this.turnSpeed = 0.05;
    this.acceleration = 0.0025;

    this.particles = [];
  }

  update(deltaTime, enemies, bossTarget) {
    if (!this.alive) return;

    if (this.target === null) {
      let minDistance = Infinity;

      // أ) فحص الأعداء العاديين في المصفوفة بالحلقة السريعة
      const len = enemies.length;
      for (let i = 0; i < len; i++) {
        if (!enemies[i] || enemies[i].alive === false) continue;

        const dx = enemies[i].x - this.x;
        const dy = enemies[i].y - this.y;

        const distance = Math.hypot(dx, dy);
        if (distance < minDistance) {
          this.target = enemies[i];
          minDistance = distance;
        }
      }

      if (bossTarget && bossTarget.alive !== false) {
        const dxBoss = bossTarget.x - this.x;
        const dyBoss = bossTarget.y - this.y;
        const distanceBoss = Math.hypot(dxBoss, dyBoss);

        // إذا كان الزعيم أقرب من أي عدو عادي، يتتبعه الصاروخ فوراً!
        if (distanceBoss < minDistance) {
          this.target = bossTarget;
          minDistance = distanceBoss;
        }
      }
    }

    // 2️⃣ تصفير الهدف إذا مات
    if (this.target && this.target.alive === false) {
      this.target = null;
    }

    // 3️⃣ نظام التوجيه الذكي وملاحقة الهدف الحالي
    if (this.target !== null) {
      const dxTarget = this.target.x - this.x;
      const dyTarget = this.target.y - this.y;

      const targetAngle = Math.atan2(dyTarget, dxTarget);
      let angleDiff = targetAngle - this.angle;

      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

      if (angleDiff > 0) {
        this.angle += this.turnSpeed;
      } else {
        this.angle -= this.turnSpeed;
      }
    }

    // حصر زاوية الصاروخ ضمن النطاق الرياضي المستقر
    while (this.angle < -Math.PI) this.angle += Math.PI * 2;
    while (this.angle > Math.PI) this.angle -= Math.PI * 2;

    if (this.speed < this.maxSpeed) {
      this.speed += this.acceleration * deltaTime;
    }

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // تحديث الهيت بوكس
    for (let i = 0; i < this.hitBox.length; i++) {
      this.hitBox[i].x = this.x + this.hitBox[i].offsetX - this.width / 12;
      this.hitBox[i].y = this.y + this.hitBox[i].offsetY - this.height / 10;
    }

    const isMobile = this.width === 25;
    const particleScale = isMobile ? 0.5 : 1;

    // توليد شرارات ذيل الصاروخ
    if (this.alive) {
      const tailX = this.x - Math.cos(this.angle) * (this.height / 4);
      const tailY = this.y - Math.sin(this.angle) * (this.height / 4);

      this.particles.push(new Particle(tailX, tailY, this.angle, particleScale));
      this.particles.push(new Particle(tailX, tailY, this.angle, particleScale));
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p) {
        p.update();
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      } else {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx, camera, game) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x - camera.x, this.y - camera.y);
    ctx.rotate(this.angle + Math.PI / 2);
    ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();

    game.renderParticleBatch(this.particles, ctx, camera);
  }
}