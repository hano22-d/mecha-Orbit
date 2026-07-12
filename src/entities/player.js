import { audioManager } from "../systems/SoundsSystem";
import { UpdateAnimationFrame } from "../utils/helpers";

// ==========================================
// 💎 الثوابت والاكواد السحرية المغتالة (Constants)
// ==========================================
const MAX_HEALTH = 100;
const PLANE_WIDTH = 160;
const PLANE_HEIGHT = 160;
const PLANE_WIDTH_MOBILE = 80;
const PLANE_HEIGHT_MOBILE = 80;

// إعدادات الحركة والفيزياء
const FRICTION_FACTOR = 0.97;
const ACCELERATION_RATE = 0.0025;
const TILT_SENSITIVITY = 0.2;
const MISSILE_TILT_SENSITIVITY = 0.05;

// توقيتات التأثيرات (بالمللي ثانية)
const HIT_FLASH_DURATION = 200;
const TRAIL_SPAWN_INTERVAL = 30;
const SHIELD_ANIMATION_INTERVAL = 50;
const FLAME_ANIMATION_INTERVAL = 40;

// أبعاد الشيلد وتأثير السلاح
const WEAPON_ARC_LINE_WIDTH = 6;

//كلاس اللاعب
export class Player {
  constructor(canvas) {
    // خواص الحالة الأساسية
    this.alive = true;
    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    this.width = isMobile ? PLANE_WIDTH_MOBILE : PLANE_WIDTH;
    this.height = isMobile ? PLANE_HEIGHT_MOBILE : PLANE_HEIGHT;
    this.x = canvas.logicalWidth / 2 - this.width / 2;
    this.y = canvas.logicalHeight * 0.85;
    this.health = MAX_HEALTH;

    // صناديق الاصطدام للاعب
    this.hitBox = [
      {
        x: 0,
        y: 0,
        width: this.width * 0.25, // بديل لـ 40 (40/160 = 0.25)
        height: this.height * 0.875, // بديل لـ 140 (140/160 = 0.875)
        offsetX: this.width * 0.375, // بديل لـ 60 (60/160 = 0.375)
        offsetY: this.height * 0.0625, // بديل لـ 10 (10/160 = 0.0625)
      }, // Body
      {
        x: 0,
        y: 0,
        width: this.width * 0.281,
        height: this.height * 0.25,
        offsetX: this.width * 0.093,
        offsetY: this.height * 0.562,
      }, // Left Wing
      {
        x: 0,
        y: 0,
        width: this.width * 0.281,
        height: this.height * 0.25,
        offsetX: this.width * 0.625,
        offsetY: this.height * 0.562,
      }, // Right Wing
    ];

    // خواص الضرر والوميض
    this.hit = false;
    this.hitTimer = 0;
    this.hitDuration = HIT_FLASH_DURATION;

    // الفيزياء والحركة
    this.velocityX = 0;
    this.velocityY = 0;
    this.acceleration = ACCELERATION_RATE;
    this.friction = FRICTION_FACTOR;
    this.currentAngle = 0;

    // مؤقتات نظام القتال
    this.lastShoot = 0;
    this.shootDelay = 300;
    this.lastShootMissile = 0;
    this.shootMissileDelay = 1000;

    // نظام الجزيئات الخلفية (Trail)
    this.trail = [];
    this.trailTimer = 0;

    // الحالات التأثيرية (Power-ups)
    this.healthEffect = false;
    this.shieldEffect = false;
    this.weaponEffect = false;
    this.weaponProgressEffect = 0;

    // تهيئة وتحميل الوسائط بأسماء واضحة
    this._initAssets();
  }

  // ========== دالة تحميل الصور ======== //
  _initAssets() {
    // صورة الصاروخ
    this.missileImage = new Image();
    this.missileImage.src =
      "/assets/weapon/5c9c6832-b15e-4cab-8c4c-ed2ad41ec331.png";
    this.missileCount = 0;

    // صورة الطائرة الأساسية
    this.planeImg = new Image();
    this.planeImg.src =
      "/assets/player.png";

    // فريمات الشيلد
    const shieldSources = [
      "/assets/powerUp/00.png",
      "/assets/powerUp/01.png",
      "/assets/powerUp/02.png",
      "/assets/powerUp/03.png",
      "/assets/powerUp/04.png",
      "/assets/powerUp/05.png",
      "/assets/powerUp/06.png",
      "/assets/powerUp/07.png",
      "/assets/powerUp/08.png",
      "/assets/powerUp/09.png",
    ];
    this.shieldFrame = shieldSources.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    this.shieldFrameSettings = {
      currentFrame: 0,
      frameInterval: SHIELD_ANIMATION_INTERVAL,
      frameTimer: 0,
    };

    // فريمات لهب المحرك
    this.fireFrames = ["fire01.png", "fire02.png", "fire03.png"].map((src) => {
      const image = new Image();
      image.src = `/assets/${src}`;
      return image;
    });

    this.fireframeSettings = {
      currentFrame: 0,
      frameInterval: FLAME_ANIMATION_INTERVAL,
      frameTimer: 0,
    };
  }

  update(keys, deltaTime, bossStart, camera, canvas) {
    if (!this.alive) return;

    // 1. حساب القوى والسرعة بناءً على المدخلات
    if (keys.right) this.velocityX += this.acceleration * deltaTime;
    if (keys.left) this.velocityX -= this.acceleration * deltaTime;
    if (keys.up) this.velocityY -= this.acceleration * deltaTime;
    if (keys.down) this.velocityY += this.acceleration * deltaTime;

    // تطبيق الاحتكاك الفيزيائي
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    // 2. تطبيق قيود الحصر الشاشاتي عند بدء الزعيم
    if (bossStart) {
      this._constrainMovement(camera, canvas);
    }

    // تحديث الموقع الفعلي
    this.x += this.velocityX;
    this.y += this.velocityY;

    // 3. تحديث صناديق التصادم (Hitboxes) بدقة متوافقة مع الإزاحة
    this._updateHitBoxes();

    // 4. تحديث الأنيميشن والتأثيرات البصرية
    UpdateAnimationFrame(this.fireframeSettings, this.fireFrames, deltaTime);
    UpdateAnimationFrame(this.shieldFrameSettings, this.shieldFrame, deltaTime);

    this._updateTrailEffect(deltaTime);
    this._updateHitFlash(deltaTime);

    // حساب زاوية الإمالة الحالية للطائرة
    this.currentAngle = this.velocityX * TILT_SENSITIVITY;
  }

  // ========== HitBox دالة تحديث =======//
  _updateHitBoxes() {
    for (let i = 0; i < this.hitBox.length; i++) {
      this.hitBox[i].x = this.x + this.hitBox[i].offsetX - this.width / 12;
      this.hitBox[i].y = this.y + this.hitBox[i].offsetY - this.height / 10;
    }
  }

  // ========= دالة حصر اللاعب ضمن الشاشة ======== //
  _constrainMovement(camera, canvas) {
    if (this.x < camera.x) this.x = camera.x;
    if (this.x > camera.x + canvas.width - this.width) {
      this.x = camera.x + canvas.width - this.width;
    }
    if (this.y < camera.y + canvas.height * 0.4) {
      this.y = camera.y + canvas.height * 0.4;
    }
    if (this.y > camera.y + canvas.height - this.height) {
      this.y = camera.y + canvas.height - this.height;
    }
  }

  // ========== دالة تحديث الترايل ========= //
  _updateTrailEffect(deltaTime) {
    this.trailTimer += deltaTime;

    const leftWingOffset = this.width * 0.0625; // ما يعادل 10 بكسل عندما يكون العرض 160
    const rightWingOffset = this.width * 0.855; // ما يعادل 140 بكسل عندما يكون العرض 160

    // شرط التوليد: سرعة عمودية كافية ومرور الوقت المحدد للنبضة
    if (
      Math.abs(this.velocityY) > 0.5 &&
      this.trailTimer > TRAIL_SPAWN_INTERVAL
    ) {
      this.trail.push({
        x: this.x - leftWingOffset,
        y: this.y + this.height / 2,
        alpha: 0.7,
      });

      this.trail.push({
        x: this.x + rightWingOffset,
        y: this.y + this.height / 2,
        alpha: 0.7,
      });
      this.trailTimer = 0;
    }

    // تدوير وتصفية الجزيئات المختفية
    this.trail.forEach((p) => (p.alpha -= 0.03));
    this.trail = this.trail.filter((p) => p.alpha > 0);
  }

  // ========== دالة تحديث الفلاش ========== //
  _updateHitFlash(deltaTime) {
    if (this.hit) {
      this.hitTimer += deltaTime;
      if (this.hitTimer > this.hitDuration) {
        this.hit = false;
      }
    }
  }
draw(ctx, camera) {
    if (!this.alive) return;

    // 1️⃣ رسم الترايل أولاً ليكون تحت الطائرة بصرياً خلف الكواليس
    this._drawTrail(ctx, camera);

    // 2️⃣ نظام الإمالة والـ Context المكبسول للطائرة ومحقاتها الحركية
    ctx.save();
    ctx.translate(this.x - camera.x, this.y - camera.y);
    ctx.rotate(this.currentAngle);

    // تطبيق وميض الضرر المتموج بالـ Sine Wave
    if (this.hit) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.05) * 0.5;
    }

  if (this.healthEffect) {
    ctx.save();
    
    let pulse = 1 + Math.sin(Date.now() * 0.01) * 0.15; 
    let glowRadius = this.width * 0.8 * pulse;

    let centerX = Math.round(-this.width / 12 + this.width / 2);
    let centerY = Math.round(-this.height / 10 + this.height / 2);

    // إنشاء التدرج الدائري في المركز الجديد تماماً
    let healthGlow = ctx.createRadialGradient(centerX, centerY, this.width * 0.1, centerX, centerY, glowRadius);
    healthGlow.addColorStop(0, "rgba(0, 255, 0, 0.6)");  
    healthGlow.addColorStop(0.5, "rgba(0, 255, 0, 0.2)");
    healthGlow.addColorStop(1, "rgba(0, 255, 0, 0)");    

    ctx.fillStyle = healthGlow;
    ctx.beginPath();
    // رسم الدائرة في الإحداثيات المركزية الصحيحة
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

    // رسم الصواريخ المحملة على الأجنحة برمجياً
    this._drawEquippedMissiles(ctx);

    // رسم السبرايت الأساسي للطائرة (الآن يرسم بحرية وبدون قيود الظلال الثقيلة!)
    ctx.drawImage(
      this.planeImg,
      Math.round(-this.width / 12),
      Math.round(-this.height / 10),
      Math.round(this.width),
      Math.round(this.height)
    );

    // إعادة ضبط الشفافية لحماية العناصر التالية
    ctx.globalAlpha = 1;

    // رسم لهب المحركات النفاثة المتفاعل مع السرعة الحالية
    this._drawThrusterFlames(ctx);

    ctx.restore(); // نهاية نظام الحصر والإمالة

    // 3️⃣ رسم التأثيرات الخارجية التي لا تميل مع دوران الطائرة (الشيلد والمؤقت الدائري)
    this._drawShield(ctx, camera);
    this._drawWeaponProgressBar(ctx, camera);
  }

  // ========= رسم الترايل ========= //
  _drawTrail(ctx, camera) {
    this.trail.forEach((p) => {
      ctx.beginPath();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = "cyan";
      // تقريب إحداثيات مركز كل نقطة ضوئية
      ctx.arc(Math.round(p.x - camera.x), Math.round(p.y - camera.y), 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  // ========= رسم الصواريخ ========== //
  _drawEquippedMissiles(ctx) {
    const missileW = Math.round(this.width * 0.3125);
    const missileH = Math.round(this.height * 0.625);
    const localY = Math.round(this.height * 0.3125);
  
    if (this.missileCount >= 1) {
      const leftLocalX = Math.round(this.width * -0.09375);
      ctx.drawImage(this.missileImage, leftLocalX, localY, missileW, missileH);
    }
    if (this.missileCount === 2) {
      const rightLocalX = Math.round(this.width * 0.625);
      ctx.drawImage(this.missileImage, rightLocalX, localY, missileW, missileH);
    }
  }

  // ========= رسم اللهب ========== //
  _drawThrusterFlames(ctx) {
    const frame = this.fireFrames[this.fireframeSettings.currentFrame];
    const speed = Math.hypot(this.velocityX, this.velocityY);
    const scale = Math.min(1.5, 1 + speed * 0.4);
  
    const flameWidth = Math.round(this.width * 0.1125);
    const flameHeight = Math.round(this.height * 0.25 * scale);
  
    const leftFlameX = Math.round(this.width * 0.28125);
    const rightFlameX = Math.round(this.width * 0.4375);
    const flameY = Math.round(this.height * 0.84375);
  
    ctx.drawImage(frame, leftFlameX, flameY, flameWidth, flameHeight);
    ctx.drawImage(frame, rightFlameX, flameY, flameWidth, flameHeight);
  }
  // ========== رسم الشيلد ========= //
  _drawShield(ctx, camera) {
    if (this.shieldEffect) {
      const frame = this.shieldFrame[this.shieldFrameSettings.currentFrame];
      const dynamicShieldSize = Math.round(this.width * 1.25);
      const dynamicShieldOffset = Math.round(this.width * 0.21875);
  
      // تقريب الحسابات النهائية بالكامل لثبات مطلق للهالة حول الطائرة
      const drawX = Math.round(this.x - camera.x - dynamicShieldOffset);
      const drawY = Math.round(this.y - camera.y - dynamicShieldOffset);
  
      ctx.drawImage(frame, drawX, drawY, dynamicShieldSize, dynamicShieldSize);
    }
  }

  // ========== رسم تاثير السلاح ========= //
  _drawWeaponProgressBar(ctx, camera) {
    if (!this.weaponEffect) return;
  
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = WEAPON_ARC_LINE_WIDTH;
  
    const spriteOffsetX = this.width / 12;
    const spriteOffsetY = this.height / 10;
  
    // تقريب إحداثيات مركز المؤشر الدائري
    const centerX = Math.round(this.x - camera.x + this.width / 2 - spriteOffsetX);
    const centerY = Math.round(this.y - camera.y + this.height / 2 - spriteOffsetY);
    const dynamicRadius = Math.round(this.width * 0.53125);
  
    ctx.arc(
      centerX,
      centerY,
      dynamicRadius,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * this.weaponProgressEffect
    );
  
    ctx.stroke();
    ctx.restore();
  }

  // ***** دالات أخرى ***** //

  // ============= دالة اطلاق الرصاص ========== //
  canShoot(keys, gameTimer) {
    if (keys.space && gameTimer - this.lastShoot > this.shootDelay) {
      this.lastShoot = gameTimer;
      return true;
    }
    return false;
  }

  // =========== دالة اطلاق الصواريخ ======= //
  canShootMissile(keys, deltaTime) {
    this.lastShootMissile += deltaTime;
    if (keys.missileKey && this.lastShootMissile > this.shootMissileDelay) {
      this.missileCount--;
      this.lastShootMissile = 0;
      return true;
    } else {
      return false;
    }
  }
  // =========== دالة زيادة صحة اللاعب ========== //
  heal(amount) {
    this.health += amount;
    if (this.health > MAX_HEALTH) {
      this.health = MAX_HEALTH;
    }
    this.healthEffect = true;
    setTimeout(() => (this.healthEffect = false), 2000);
  }

  // ======== دالة تضرر اللاعب ============= //
  takeDamage(enemy) {
    this.health -= enemy.damage;
    this.hit = true;
    this.hitTimer = 0;

    //دفع للاسفل عند الاصطدام
    this.velocityY += 1.5;
    this.velocityX += (Math.random() - 0.5) * 2;

    audioManager.play("damageSound");
  }

  // ========= دالة موت اللاعب ========== //
  delete() {
    this.alive = false;

    audioManager.loadSound(
      "expolsionPlayerSound",
      "/assets/audio/cannon_hit.ogg"
    );
    audioManager.play("expolsionPlayerSound");
  }
  // ============= دالة حساب موقع الصواريخ وارسالها لكلاس الصاروخ =========== //
  getMissileLaunchPositions() {
    const angle = -Math.PI / 2 + this.velocityX * MISSILE_TILT_SENSITIVITY;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // الإحداثيات المحلية النسبية للصاروخ على الطائرة
    const leftLocalX = this.width * -0.09375; // -15
    const leftLocalY = this.height * 0.3125; // 50
    const rightLocalX = this.width * 0.625; // 100
    const rightLocalY = this.height * 0.3125; // 50

    // الصاروخ الأيسر
    const leftX =
      this.x + this.width * -0.25 + (leftLocalX * cos - leftLocalY * sin); // -40 / 160 = -0.25
    const leftY =
      this.y + this.height * 0.25 + (leftLocalX * sin + leftLocalY * cos); //  40 / 160 = 0.25

    // الصاروخ الأيمن
    const rightX =
      this.x + this.width * 0.5 + (rightLocalX * cos - rightLocalY * sin); //  80 / 160 = 0.5
    const rightY =
      this.y + this.height * 0.9375 + (rightLocalX * sin + rightLocalY * cos); // 150 / 160 = 0.9375

    return {
      left: { x: leftX, y: leftY },
      right: { x: rightX, y: rightY },
      currentAngle: angle,
    };
  }
}
