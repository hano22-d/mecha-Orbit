import { audioManager } from "../systems/SoundsSystem";
import { UpdateAnimationFrame } from "../utils/helpers";

// ==========================================
// 💎 الثوابت والاكواد السحرية المغتالة (Constants)
// ==========================================
const MAX_HEALTH = 300;
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
    const isMobile = canvas.height < 500 || canvas.width < 768;
    this.width = isMobile ? PLANE_WIDTH_MOBILE : PLANE_WIDTH;
    this.height = isMobile ? PLANE_HEIGHT_MOBILE : PLANE_HEIGHT;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height * 0.85;
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
      "/assets/Default_Prompt_Flat_2D_topdown_perspective_game_asset_sprite_h_0_f9c8efea-de69-412a-8cb1-d8a94ba66635_0.png";

    // فريمات الشيلد
    const shieldSources = [
      "00.png",
      "01.png",
      "02.png",
      "04.png",
      "05.png",
      "06.png",
      "07.png",
      "08.png",
      "09.png",
      "10.png",
    ];
    this.shieldFrame = shieldSources.map((src) => {
      const img = new Image();
      img.src = `/assets/powerUp/${src}`;
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

    // تطبيق توهج هالة الشفاء الخضراء
    if (this.healthEffect) {
      ctx.shadowColor = "lime";
      ctx.shadowBlur = 20;
    }

    // رسم الصواريخ المحملة على الأجنحة برمجياً
    this._drawEquippedMissiles(ctx);

    // رسم السبرايت الأساسي للطائرة
    ctx.drawImage(
      this.planeImg,
      -this.width / 12,
      -this.height / 10,
      this.width,
      this.height
    );

    // إعادة ضبط الشفافية والتوهج لحماية العناصر التالية
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

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
      ctx.arc(p.x - camera.x, p.y - camera.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ========= رسم الصواريخ ========== //
  _drawEquippedMissiles(ctx) {
    // حساب الأبعاد النسبية للصاروخ (الأصل: عرض 50 وطول 100 -> 50/160 = 0.3125 و 100/160 = 0.625)
    const missileW = this.width * 0.3125;
    const missileH = this.height * 0.625;

    // حساب الإزاحة العمودية المحلية (الأصل 50 بكسل -> 50/160 = 0.3125)
    const localY = this.height * 0.3125;

    if (this.missileCount >= 1) {
      // الجناح الأيسر أفقياً (الأصل -15 بكسل -> -15/160 = -0.09375)
      const leftLocalX = this.width * -0.09375;
      ctx.drawImage(this.missileImage, leftLocalX, localY, missileW, missileH);
    }
    if (this.missileCount === 2) {
      // الجناح الأيمن أفقياً (الأصل 100 بكسل -> 100/160 = 0.625)
      const rightLocalX = this.width * 0.625;
      ctx.drawImage(this.missileImage, rightLocalX, localY, missileW, missileH);
    }
  }

  // ========= رسم اللهب ========== //
  _drawThrusterFlames(ctx) {
    const frame = this.fireFrames[this.fireframeSettings.currentFrame];
    const speed = Math.hypot(this.velocityX, this.velocityY);
    const scale = Math.min(1.5, 1 + speed * 0.4);

    const flameWidth = this.width * 0.1125;
    const flameHeight = this.height * 0.25 * scale;

    const leftFlameX = this.width * 0.28125;
    const rightFlameX = this.width * 0.4375;
    const flameY = this.height * 0.84375;

    ctx.drawImage(frame, leftFlameX, flameY, flameWidth, flameHeight); // المحرك الأيسر
    ctx.drawImage(frame, rightFlameX, flameY, flameWidth, flameHeight); // المحرك الأيمن
  }
  // ========== رسم الشيلد ========= //
  _drawShield(ctx, camera) {
    if (this.shieldEffect) {
      const frame = this.shieldFrame[this.shieldFrameSettings.currentFrame];

      const dynamicShieldSize = this.width * 1.25;

      const dynamicShieldOffset = this.width * 0.21875;

      ctx.drawImage(
        frame,
        this.x - camera.x - dynamicShieldOffset,
        this.y - camera.y - dynamicShieldOffset,
        dynamicShieldSize,
        dynamicShieldSize
      );
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

    const centerX = this.x - camera.x + this.width / 2 - spriteOffsetX;
    const centerY = this.y - camera.y + this.height / 2 - spriteOffsetY;

    const dynamicRadius = this.width * 0.53125;

    ctx.arc(
      centerX,
      centerY,
      dynamicRadius,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * this.weaponProgressEffect // التناقص بناءً على الوقت المتبقي
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
