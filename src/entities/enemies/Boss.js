import { UpdateAnimationFrame } from "../../utils/helpers";

export class Boss {
  static baseFrames = [];
  static damageFrames = [];
  static imagesPreloaded = false;

  constructor(canvas) {
    this.alive = true;
    this.x = 0;
    this.y = 0;
    
    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    this.width = isMobile ? 100 : 200;
    this.height = isMobile ? 132.5 : 250;
    this.direction = 1;
    this.attackRange = 600;
    this.lastShoot = 0;
    this.shootDelay = 2000;

    this.hitBox = [
      { 
        x: 0, y: 0, 
        width: this.width * 0.4,       
        height: this.height * 0.92,    
        offsetX: this.width * 0.375,   
        offsetY: this.height * 0.12    
      }, 
      { 
        x: 0, y: 0, 
        width: this.width * 0.9,       
        height: this.height * 0.32,    
        offsetX: this.width * 0.125,   
        offsetY: this.height * 0.2     
      }, 
      { 
        x: 0, y: 0, 
        width: this.width * 0.55,      
        height: this.height * 0.32,    
        offsetX: this.width * 0.31,    
        offsetY: this.height * 0.56    
      }  
    ];

    this.imgBullet = new Image();
    this.imgBullet.src = "/assets/weapon/laserRed08.png";
    this.color = "red";
    this.speed = 0.06;
    this.health = 300;
    this.hit = false;
    this.bulletDamage = 30;

    // 🔥 الخطوة 1: تهيئة التدرج الدائري (الهالة الضوئية) مرة واحدة فقط في الـ constructor لراحة الذاكرة
    this.bossGlowGradient = null;
    this._initGlowGradient(canvas);

    if (!Boss.imagesPreloaded) {
      Boss.baseFrames = ["/assets/bossFrame1.png", "/assets/bossFrame2.png"].map((src) => {
        const image = new Image();
        image.src = src;
        return image;
      });

      Boss.damageFrames = [
        "0009", "0010", "0011", "0012", "0013", "0014", "0015", "0017", 
        "0019", "0021", "0023", "0025", "0026", "0028", "0030", "0032", 
        "0033", "0035", "0037", "0039", "0041", "0043", "0045", "0046"
      ].map((num) => {
        const image = new Image();
        image.src = `/assets/explotionFrame/xilosexplotionFrame/${num}.png`;
        return image;
      });

      Boss.imagesPreloaded = true;
    }

    this.bossFrameSettings = {
      currentFrame: 0,
      frameInterval: 1000,
      frameTimer: 0,
    };

    this.bossDamageFrameSettings = {
      currentFrame: 0,
      frameInterval: 70,
      frameTimer: 0,
    };
  }

  // دالة مخصصة لبناء التدرج المحلي الثابت (مركزه 0,0) لمرة واحدة فقط
  _initGlowGradient(canvas) {
    // نستخدم السياق الافتراضي المؤقت لبناء التدرج
    const tempCtx = canvas.getContext("2d");
    this.bossGlowGradient = tempCtx.createRadialGradient(0, 0, 10, 0, 0, 300);
    this.bossGlowGradient.addColorStop(0, "rgba(255, 68, 0, 0.35)");
    this.bossGlowGradient.addColorStop(0.5, "rgba(200, 0, 0, 0.15)");
    this.bossGlowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  }

  update(time, deltaTime, game) {
    if (!this.alive) return;

    const targetY = game.camera.y + 50;
    if (this.y >= targetY) {
      this.y = targetY; 

      if (this.x < game.camera.x) {
        this.direction = 1;
      } else if (this.x > game.camera.x + game.myCanvas.logicalWidth - this.width) {
        this.direction = -1;
      }
      this.x += this.speed * deltaTime * this.direction;
    } else {
      this.y += this.speed * deltaTime;
    }

    if (game.player && game.player.alive) {
      const dx = game.player.x - this.x;
      const dy = game.player.y - this.y;
      const distance = Math.hypot(dx, dy);

      if (distance < this.attackRange && time - this.lastShoot > this.shootDelay) {
        if (typeof game.spawnEnemyBullets === "function") {
          game.spawnEnemyBullets(this, game.player);
        }
        this.lastShoot = time;
      }
    }

    for (let i = 0; i < this.hitBox.length; i++) {
      this.hitBox[i].x = this.x + this.hitBox[i].offsetX;
      this.hitBox[i].y = this.y + this.hitBox[i].offsetY;
    }

    UpdateAnimationFrame(this.bossFrameSettings, Boss.baseFrames, deltaTime);
    UpdateAnimationFrame(this.bossDamageFrameSettings, Boss.damageFrames, deltaTime);
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    const centerX = Math.round(this.x + this.width / 2 - camera.x);
    const centerY = Math.round(this.y + this.height / 2 - camera.y);

    // 🔥 الخطوة 2: رسم الهالة الضوئية باستخدام التدرج المخزن (Cache) وبأعلى كفاءة رسومية لكرت الشاشة
    ctx.save();
    ctx.translate(centerX, centerY); // الانتقال لمركز الزعيم
    ctx.fillStyle = this.bossGlowGradient; // استدعاء التدرج الجاهز فوراً
    ctx.beginPath();
    ctx.arc(0, 0, 300, 0, Math.PI * 2); // الرسم حول نقطة الصفر المحلية
    ctx.fill();
    ctx.restore();

    // 🎨 رسم فريم جسم الزعيم الحالي
    const frame = Boss.baseFrames[this.bossFrameSettings.currentFrame];
    const drawX = Math.round(this.x - camera.x);
    const drawY = Math.round(this.y - camera.y);

    if (frame) {
      ctx.drawImage(frame, drawX, drawY, this.width, this.height);
    }

    // 💨 رسم تأثيرات أعمدة الدخان والنيران عند هبوط نقاط الحياة عن 50%
    if (this.health < 150) {
      const frameDamage = Boss.damageFrames[this.bossDamageFrameSettings.currentFrame];
      
      if (frameDamage) {
        const smoke1X = Math.round(drawX + (this.width * 0.3));
        const smoke1Y = Math.round(drawY - (this.height * 0.64));
        ctx.drawImage(frameDamage, smoke1X, smoke1Y, this.width, this.height);

        const smoke2X = Math.round(drawX - (this.width * 0.125));
        const smoke2Y = Math.round(drawY - (this.height * 0.5));
        ctx.drawImage(frameDamage, smoke2X, smoke2Y, this.width, this.height);

        const smoke3X = Math.round(drawX + (this.width * 0.2));
        const smoke3Y = Math.round(drawY);
        const smoke3Width = this.width * 0.625;
        const smoke3Height = this.height * 0.7;
        ctx.drawImage(frameDamage, smoke3X, smoke3Y, smoke3Width, smoke3Height);
      }
    }
  }

  delete() {
    this.alive = false;
  }
}