import { UpdateAnimationFrame } from "../../utils/helpers";

export class Boss {
  constructor(canvas) {
    this.alive = true;
    this.x = 0;
    this.y = 0;
    const isMobile = canvas.height < 500 || canvas.width < 768;
    this.width = isMobile ? 100 : 200;
    this.height = isMobile ? 132.5 : 250;
    this.direction = 1;
    this.attackRange = 600;
    this.lastShoot = 0;
    this.shootDelay = 2000;
// تصحيح المسمى إلى hitBox وضبط النسب المئوية
this.htiBox = [
  { 
    x: 0, y: 0, 
    width: this.width * 0.4,       // بديل لـ 80  (80/200 = 0.4)
    height: this.height * 0.92,    // بديل لـ 230 (230/250 = 0.92)
    offsetX: this.width * 0.375,   // بديل لـ 75  (75/200 = 0.375)
    offsetY: this.height * 0.12    // بديل لـ 30  (30/250 = 0.12)
  }, // المربع العمودي الرئيسي
  
  { 
    x: 0, y: 0, 
    width: this.width * 0.9,       // بديل لـ 180 (180/200 = 0.9)
    height: this.height * 0.32,    // بديل لـ 80  (80/250 = 0.32)
    offsetX: this.width * 0.125,   // بديل لـ 25  (25/200 = 0.125)
    offsetY: this.height * 0.2     // بديل لـ 50  (50/250 = 0.2)
  }, // المربع الأفقي العريض
  
  { 
    x: 0, y: 0, 
    width: this.width * 0.55,      // بديل لـ 110 (110/200 = 0.55)
    height: this.height * 0.32,    // بديل لـ 80  (80/250 = 0.32)
    offsetX: this.width * 0.31,    // بديل لـ 62  (62/200 = 0.31)
    offsetY: this.height * 0.56    // بديل لـ 140 (140/250 = 0.56)
  } // المربع الثالث الأفقي القصير
];

    this.imgBullet = new Image();
    this.imgBullet.src = "src/assets/weapon/laserRed08.png";
    this.color = "red";
    this.speed = 0.06;
    this.health = 300;
    this.hit = false;
    this.bulletDamage = 30;

    //صور فريمات اللهب
    this.bossFrame = [
      "src/assets/bossFrame1.png",
      "src/assets/bossFrame2.png",
    ].map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    //فريمات زايلوس بعد التضرر
    this.bossFrameDamage = [
      "src/assets/explotionFrame/xilosexplotionFrame/0009.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0010.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0011.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0012.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0013.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0014.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0015.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0017.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0019.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0021.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0023.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0025.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0026.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0028.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0030.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0032.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0033.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0035.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0037.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0039.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0041.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0043.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0045.png",
      "src/assets/explotionFrame/xilosexplotionFrame/0046.png",
    ].map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    //اعدادات الانيميشن زايلوس الاساسية
    this.bossFrameSettings = {
      currentFrame: 0,
      frameInterval: 1000,
      frameTimer: 0,
    };

    //اعدادات انيميشن اعمدة الدخان
    this.bossDamageFrameSettings = {
      currentFrame: 0,
      frameInterval: 70,
      frameTimer: 0,
    };
  }

  update(time, deltaTime, game) {
    if (!this.alive) return;

    //حركة العدو
    if (this.y > game.camera.y + 50) {
      this.y = game.camera.y + 50;

      if (this.x < game.camera.x) this.direction = 1;
      if (this.x > game.camera.x + game.myCanvas.width - this.width) {
        this.direction = -1;
      }
      this.x += this.speed * deltaTime * this.direction;
    } else {
      this.y += this.speed * deltaTime;
    }

    //حساب المسافة بين العدو واللاعب من اجل اطلاق النار
    let dx = game.player.x - this.x;
    let dy = game.player.y - this.y;
    let distance = Math.hypot(dx, dy);

    if (
      distance < this.attackRange &&
      time - this.lastShoot > this.shootDelay
    ) {
      game.spawnEnemyBullets(this, game.player);
      this.lastShoot = time;
    }

    for (let i = 0; i < this.htiBox.length; i++) {
      this.htiBox[i].x = this.x + this.htiBox[i].offsetX - this.width / 12;
      this.htiBox[i].y = this.y + this.htiBox[i].offsetY - this.height / 10;
    }

    UpdateAnimationFrame(this.bossFrameSettings, this.bossFrame, deltaTime); //تحديث زايلوس
    UpdateAnimationFrame(
      //تحديث اعمدة الدخان
      this.bossDamageFrameSettings,
      this.bossFrameDamage,
      deltaTime
    );
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    //رسم السحابة البرتقالية
    ctx.save();
    let centerX = this.x + this.width / 2 - camera.x;
    let centerY = this.y + this.height / 2 - camera.y;

    let gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      10,
      centerX,
      centerY,
      300
    );

    gradient.addColorStop(0, "rgba(255, 68, 0, 0.4)");
    gradient.addColorStop(0.5, "rgba(200, 0, 0, 0.2)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.beginPath();
    ctx.fillStyle = this.color;

    //رسم زايلوس
    const frame = this.bossFrame[this.bossFrameSettings.currentFrame];
    ctx.drawImage(
      frame,
      this.x - camera.x,
      this.y - camera.y,
      this.width,
      this.height
    );

    //رسم اعمدة الدخان
if (this.health < 150) {
  const frameDamage = this.bossFrameDamage[this.bossDamageFrameSettings.currentFrame];
  
  const screenX = this.x - camera.x;
  const screenY = this.y - camera.y;

  const smoke1X = screenX + (this.width * 0.3);
  const smoke1Y = screenY - (this.height * 0.64);
  ctx.drawImage(frameDamage, smoke1X, smoke1Y, this.width, this.height);


  const smoke2X = screenX - (this.width * 0.125);
  const smoke2Y = screenY - (this.height * 0.5);
  ctx.drawImage(frameDamage, smoke2X, smoke2Y, this.width, this.height);


  const smoke3X = screenX + (this.width * 0.2);
  const smoke3Y = screenY;
  const smoke3Width = this.width - (this.width * 0.375);
  const smoke3Height = this.height - (this.height * 0.3);
  ctx.drawImage(frameDamage, smoke3X, smoke3Y, smoke3Width, smoke3Height);
}
    /*
    for (let i = 0; i < this.htiBox.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)"; // جعلت اللون الشفاف أخف قليلاً لترى تفاصيل التصميم الفخم خلفه
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;

      // 🔥 السر هنا: نرسم بناءً على الـ x والـ y المحدثين في الـ update مع طرح الكاميرا
      const screenX = this.htiBox[i].x - camera.x;
      const screenY = this.htiBox[i].y - camera.y;

      ctx.fillRect(
        screenX,
        screenY,
        this.htiBox[i].width,
        this.htiBox[i].height
      );
      ctx.strokeRect(
        screenX,
        screenY,
        this.htiBox[i].width,
        this.htiBox[i].height
      );
    } */
  }
  delete() {
    this.alive = false;
  }
}
