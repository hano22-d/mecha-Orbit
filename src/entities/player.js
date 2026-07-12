import { audioManager } from "../systems/SoundsSystem";
import { UpdateAnimationFrame } from "../utils/helpers";

const MAX_HEALTH = 100;
const PLANE_WIDTH = 160;
const PLANE_HEIGHT = 160;
const PLANE_WIDTH_MOBILE = 80;
const PLANE_HEIGHT_MOBILE = 80;

const FRICTION_FACTOR = 0.97;
const ACCELERATION_RATE = 0.0025;
const TILT_SENSITIVITY = 0.2;
const MISSILE_TILT_SENSITIVITY = 0.05;

const HIT_FLASH_DURATION = 200;
const TRAIL_SPAWN_INTERVAL = 30;
const SHIELD_ANIMATION_INTERVAL = 50;
const FLAME_ANIMATION_INTERVAL = 40;

const WEAPON_ARC_LINE_WIDTH = 6;

export class Player {
  // 💾 تخزين الصور بشكل ساكن (Static) لحماية الذاكرة وتسريع إعادة التشغيل
  static planeImg = null;
  static missileImage = null;
  static shieldFrames = [];
  static fireFrames = [];
  static assetsLoaded = false;

  constructor(canvas) {
    this.alive = true;
    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    this.width = isMobile ? PLANE_WIDTH_MOBILE : PLANE_WIDTH;
    this.height = isMobile ? PLANE_HEIGHT_MOBILE : PLANE_HEIGHT;
    this.x = canvas.logicalWidth / 2 - this.width / 2;
    this.y = canvas.logicalHeight * 0.85;
    this.health = MAX_HEALTH;

    this.hitBox = [
      { x: 0, y: 0, width: this.width * 0.25, height: this.height * 0.875, offsetX: this.width * 0.375, offsetY: this.height * 0.0625 },
      { x: 0, y: 0, width: this.width * 0.281, height: this.height * 0.25, offsetX: this.width * 0.093, offsetY: this.height * 0.562 },
      { x: 0, y: 0, width: this.width * 0.281, height: this.height * 0.25, offsetX: this.width * 0.625, offsetY: this.height * 0.562 }
    ];

    this.hit = false;
    this.hitTimer = 0;
    this.hitDuration = HIT_FLASH_DURATION;

    this.velocityX = 0;
    this.velocityY = 0;
    this.acceleration = ACCELERATION_RATE;
    this.friction = FRICTION_FACTOR;
    this.currentAngle = 0;

    this.lastShoot = 0;
    this.shootDelay = 300;
    this.lastShootMissile = 0;
    this.shootMissileDelay = 1000;

    this.trail = [];
    this.trailTimer = 0;

    this.healthEffect = false;
    this.shieldEffect = false;
    this.weaponEffect = false;
    this.weaponProgressEffect = 0;
    this.missileCount = 0;

    this._initAssets();

    this.shieldFrameSettings = { currentFrame: 0, frameInterval: SHIELD_ANIMATION_INTERVAL, frameTimer: 0 };
    this.fireframeSettings = { currentFrame: 0, frameInterval: FLAME_ANIMATION_INTERVAL, frameTimer: 0 };
  }

  _initAssets() {
    if (!Player.assetsLoaded) {
      Player.missileImage = new Image();
      Player.missileImage.src = "/assets/weapon/5c9c6832-b15e-4cab-8c4c-ed2ad41ec331.png";

      Player.planeImg = new Image();
      Player.planeImg.src = "/assets/player.png";

      Player.shieldFrames = Array.from({ length: 10 }, (_, i) => {
        const img = new Image();
        img.src = `/assets/powerUp/0${i}.png`;
        return img;
      });

      Player.fireFrames = ["fire01.png", "fire02.png", "fire03.png"].map((src) => {
        const img = new Image();
        img.src = `/assets/${src}`;
        return img;
      });

      Player.assetsLoaded = true;
    }
  }

  update(keys, deltaTime, bossStart, camera, canvas) {
    if (!this.alive) return;

    if (keys.right) this.velocityX += this.acceleration * deltaTime;
    if (keys.left) this.velocityX -= this.acceleration * deltaTime;
    if (keys.up) this.velocityY -= this.acceleration * deltaTime;
    if (keys.down) this.velocityY += this.acceleration * deltaTime;

    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    // تفعيل الحصر المنطقي النظيف فور بدء مواجهة الزعيم
    if (bossStart) {
      this._constrainMovement(camera, canvas);
    }

    this.x += this.velocityX;
    this.y += this.velocityY;

    this._updateHitBoxes();

    UpdateAnimationFrame(this.fireframeSettings, Player.fireFrames, deltaTime);
    UpdateAnimationFrame(this.shieldFrameSettings, Player.shieldFrames, deltaTime);

    this._updateTrailEffect(deltaTime);
    this._updateHitFlash(deltaTime);

    this.currentAngle = this.velocityX * TILT_SENSITIVITY;
  }

  _updateHitBoxes() {
    const len = this.hitBox.length;
    for (let i = 0; i < len; i++) {
      this.hitBox[i].x = this.x + this.hitBox[i].offsetX - this.width / 12;
      this.hitBox[i].y = this.y + this.hitBox[i].offsetY - this.height / 10;
    }
  }

  _constrainMovement(camera, canvas) {
    const viewWidth = canvas.logicalWidth;
    const viewHeight = canvas.logicalHeight;

    if (this.x < camera.x) this.x = camera.x;
    if (this.x > camera.x + viewWidth - this.width) {
      this.x = camera.x + viewWidth - this.width;
    }
    if (this.y < camera.y + viewHeight * 0.4) {
      this.y = camera.y + viewHeight * 0.4;
    }
    if (this.y > camera.y + viewHeight - this.height) {
      this.y = camera.y + viewHeight - this.height;
    }
  }

  _updateTrailEffect(deltaTime) {
    this.trailTimer += deltaTime;
    const leftWingOffset = this.width * 0.0625;
    const rightWingOffset = this.width * 0.855;

    if (Math.abs(this.velocityY) > 0.5 && this.trailTimer > TRAIL_SPAWN_INTERVAL) {
      this.trail.push({ x: this.x - leftWingOffset, y: this.y + this.height / 2, alpha: 0.7 });
      this.trail.push({ x: this.x + rightWingOffset, y: this.y + this.height / 2, alpha: 0.7 });
      this.trailTimer = 0;
    }

    const trailLen = this.trail.length;
    for (let i = 0; i < trailLen; i++) {
      this.trail[i].alpha -= 0.03;
    }
    this.trail = this.trail.filter((p) => p.alpha > 0);
  }

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

    this._drawTrail(ctx, camera);

    ctx.save();
    ctx.translate(this.x - camera.x, this.y - camera.y);
    ctx.rotate(this.currentAngle);

    if (this.hit) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.05) * 0.5;
    }

    if (this.healthEffect) {
      ctx.save();
      let pulse = 1 + Math.sin(Date.now() * 0.01) * 0.15; 
      let glowRadius = this.width * 0.8 * pulse;
      let centerX = Math.round(-this.width / 12 + this.width / 2);
      let centerY = Math.round(-this.height / 10 + this.height / 2);

      let healthGlow = ctx.createRadialGradient(centerX, centerY, this.width * 0.1, centerX, centerY, glowRadius);
      healthGlow.addColorStop(0, "rgba(0, 255, 0, 0.6)");  
      healthGlow.addColorStop(0.5, "rgba(0, 255, 0, 0.2)");
      healthGlow.addColorStop(1, "rgba(0, 0, 0, 0)");    

      ctx.fillStyle = healthGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    this._drawEquippedMissiles(ctx);

    if (Player.planeImg) {
      ctx.drawImage(
        Player.planeImg,
        Math.round(-this.width / 12),
        Math.round(-this.height / 10),
        Math.round(this.width),
        Math.round(this.height)
      );
    }

    ctx.globalAlpha = 1;
    this._drawThrusterFlames(ctx);
    ctx.restore();

    this._drawShield(ctx, camera);
    this._drawWeaponProgressBar(ctx, camera);
  }

  _drawTrail(ctx, camera) {
    const trailLen = this.trail.length;
    for (let i = 0; i < trailLen; i++) {
      const p = this.trail[i];
      ctx.beginPath();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = "cyan";
      ctx.arc(Math.round(p.x - camera.x), Math.round(p.y - camera.y), 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawEquippedMissiles(ctx) {
    if (!Player.missileImage) return;
    const missileW = Math.round(this.width * 0.3125);
    const missileH = Math.round(this.height * 0.625);
    const localY = Math.round(this.height * 0.3125);
  
    if (this.missileCount >= 1) {
      const leftLocalX = Math.round(this.width * -0.09375);
      ctx.drawImage(Player.missileImage, leftLocalX, localY, missileW, missileH);
    }
    if (this.missileCount === 2) {
      const rightLocalX = Math.round(this.width * 0.625);
      ctx.drawImage(Player.missileImage, rightLocalX, localY, missileW, missileH);
    }
  }

  _drawThrusterFlames(ctx) {
    const frame = Player.fireFrames[this.fireframeSettings.currentFrame];
    if (!frame) return;
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

  _drawShield(ctx, camera) {
    if (this.shieldEffect) {
      const frame = Player.shieldFrames[this.shieldFrameSettings.currentFrame];
      if (!frame) return;
      const dynamicShieldSize = Math.round(this.width * 1.25);
      const dynamicShieldOffset = Math.round(this.width * 0.21875);
  
      const drawX = Math.round(this.x - camera.x - dynamicShieldOffset);
      const drawY = Math.round(this.y - camera.y - dynamicShieldOffset);
  
      ctx.drawImage(frame, drawX, drawY, dynamicShieldSize, dynamicShieldSize);
    }
  }

  _drawWeaponProgressBar(ctx, camera) {
    if (!this.weaponEffect) return;
  
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = WEAPON_ARC_LINE_WIDTH;
  
    const spriteOffsetX = this.width / 12;
    const spriteOffsetY = this.height / 10;
  
    const centerX = Math.round(this.x - camera.x + this.width / 2 - spriteOffsetX);
    const centerY = Math.round(this.y - camera.y + this.height / 2 - spriteOffsetY);
    const dynamicRadius = Math.round(this.width * 0.53125);
  
    ctx.arc(centerX, centerY, dynamicRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.weaponProgressEffect);
    ctx.stroke();
    ctx.restore();
  }

  canShoot(keys, gameTimer) {
    if (keys.space && gameTimer - this.lastShoot > this.shootDelay) {
      this.lastShoot = gameTimer;
      return true;
    }
    return false;
  }

  canShootMissile(keys, deltaTime) {
    this.lastShootMissile += deltaTime;
    if (keys.missileKey && this.lastShootMissile > this.shootMissileDelay) {
      this.missileCount--;
      this.lastShootMissile = 0;
      return true;
    }
    return false;
  }

  heal(amount) {
    this.health = Math.min(MAX_HEALTH, this.health + amount);
    this.healthEffect = true;
    setTimeout(() => (this.healthEffect = false), 2000);
  }

  takeDamage(enemy) {
    this.health -= enemy.damage;
    this.hit = true;
    this.hitTimer = 0;
    this.velocityY += 1.5;
    this.velocityX += (Math.random() - 0.5) * 2;
    audioManager.play("damageSound");
  }

  delete() {
    this.alive = false;
    audioManager.loadSound("expolsionPlayerSound", "/assets/audio/cannon_hit.ogg");
    audioManager.play("expolsionPlayerSound");
  }

  getMissileLaunchPositions() {
    const angle = -Math.PI / 2 + this.velocityX * MISSILE_TILT_SENSITIVITY;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const leftLocalX = this.width * -0.09375; 
    const leftLocalY = this.height * 0.3125; 
    const rightLocalX = this.width * 0.625; 
    const rightLocalY = this.height * 0.3125; 

    const leftX = this.x + this.width * -0.25 + (leftLocalX * cos - leftLocalY * sin); 
    const leftY = this.y + this.height * 0.25 + (leftLocalX * sin + leftLocalY * cos); 

    const rightX = this.x + this.width * 0.5 + (rightLocalX * cos - rightLocalY * sin); 
    const rightY = this.y + this.height * 0.9375 + (rightLocalX * sin + rightLocalY * cos); 

    return {
      left: { x: leftX, y: leftY },
      right: { x: rightX, y: rightY },
      currentAngle: angle,
    };
  }
}