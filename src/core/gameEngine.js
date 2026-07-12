// Game.js - الدفعة الأولى (المطهرة)
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemies/Enemy";
import { Chaser } from "../entities/enemies/Chaser";
import { Dodger } from "../entities/enemies/Dodger";
import { Shooter } from "../entities/enemies/Shooter";
import { Bullet } from "../entities/Bullet";
import { NormalWeapon } from "../weapons/NormalWeapon";
import { Explosion } from "../entities/Explosion";
import { Background } from "../entities/Background";
import { stateManager } from "./state";
import { Debris } from "../entities/Debris";
import { HealthPowerUp } from "../entities/powerUps/healthPowerUp";
import { ShieldPowerUp } from "../entities/powerUps/sheildPowerUp";
import { WeaponPowerUp } from "../entities/powerUps/weaponPowerUp";
import { collisionsSystem } from "../systems/CollisionSystem";
import { audioManager } from "../systems/SoundsSystem";
import { Boss } from "../entities/enemies/Boss";
import { hud } from "../ui/HUD";
import { MissilePowerUp } from "../entities/powerUps/missilePowerUp";
import { Missile } from "../weapons/Missile";
import { Rocks } from "../entities/rocks";
import { gameOverUi } from "../ui/gameOver";
import { TouchButton } from "../entities/ToucheButton";

export class Game {
  constructor(canvas, ctx, bgCanvas, bgCtx) {
    // أدوات الرسم
    this.myCanvas = canvas;
    this.ctx = ctx;
    this.bgCanvas = bgCanvas;
    this.bgCtx = bgCtx;

    window.gameInstance = this;
    this.gameTimer = 0;

    // 🛸 الكائنات النشطة (تحتوي على اللاعب والمصفوفات الحركية)
    this.player = new Player(this.myCanvas);

    // 🧠 تأجيل إنشاء الزعيم لتوظيف طاقة المعالج (نضعه null الآن)
    this.boss = null;

    this.enemies = [];
    this.bullets = [];
    this.enemiesBullets = [];
    this.powerUps = [];
    this.explosions = [];
    this.debris = [];
    this.missile = [];
    this.rocks = [];

    // مؤقتات ت spawning
    this.lastEnemy = 0;
    this.enemyDelay = 2000;

    this.lastPowerUp = 0;
    this.powerDelay = 10000;

    this.lastRock = 0;
    this.rockDelay = 7000;

    this.shieldActive = false;

    // نظام النقاط والعملات (Economy System)
    this.score = 0;
    this.credits = 0;

    // بيانات واجهة الفوز
    this.bulletsFired = 0;
    this.bulletsColision = 0;
    this.combo = 0;
    this.enemyType = {
      normal: 0,
      chaser: 0,
      dodger: 0,
      shooter: 0,
    };

    // متحكمات مرحلة مواجهة زعيم اللعبة (Boss Phase)
    this.remainingTimeBoss = 0;
    this.bossStart = false;
    this.bossMusicPlayed = false;

    this.bossArenaX = null;
    this.bossArenaY = null;

    // تأثيرات الكاميرا والاهتزاز
    this.camera = { x: 0, y: 0 };
    this.shake = { power: 0, duration: 0 };
    this.flash = { alpha: 0, color: "white" };

    // توليد الخلفية اعتماداً على كود الكانفاس المنطقي النظيف
    this.background = new Background(this.bgCanvas, this.camera);

    // مصفوفة تخزين الأزرار الافتراضية للموبايل
    this.touchButtons = [];
    this.initTouchControls();

    // 🛡️ معالجة الـ Resize بأمان حركي لمنع تسريب الذاكرة (Memory Leaks)
    this._resizeHandler = () => this.handleResize();
    window.addEventListener("resize", this._resizeHandler);
  }

  // دالة تدميرية اختيارية لاستدعائها عند إغلاق اللعبة لضمان تنظيف المتصفح بالكامل
  destroy() {
    window.removeEventListener("resize", this._resizeHandler);
  }

  update(input, time, deltaTime) {
    this.gameTimer += deltaTime;

    if (this.gameTimer > 240000 && !this.bossStart) {
      this.bossStart = true;
      this.boss = new Boss(this.myCanvas);
    }

    // تحديث الاهتزاز
    if (this.shake.duration > 0) {
      this.shake.duration -= deltaTime;
    } else {
      this.shake.power = 0;
    }

    // تحديث الفلاش
    if (this.flash.alpha > 0) {
      this.flash.alpha = Math.max(0, this.flash.alpha - 0.01 * deltaTime);
    }

    // حسابات مدة تأثير السلاح الحالي
    if (this.weaponEndTime) {
      const progress = (this.weaponEndTime - this.gameTimer) / 5000;
      this.player.weaponProgressEffect = Math.max(0, progress);
    } else {
      this.player.weaponProgressEffect = 0;
    }

    // == اعدادات تثبيت الكاميرا والموسيقى مع بداية البوس ==//
    this.handleCameraAndBossPhase();

    // تحديث الخلفية واللاعب بناءً على الأبعاد المنطقية
    this.background.update(this.camera);

    this.player.update(
      input.keys,
      deltaTime,
      this.bossStart,
      this.camera,
      this.myCanvas,
      this.gameTimer
    );

    // تحديثات حركة المقذوفات والأعداء
    this.spawnBulletPlayer(input, this.gameTimer);
    this.updateBullets(this.myCanvas, this.camera);
    this.updateEnemies(this.gameTimer, deltaTime, this.camera);

    if (this.bossStart && this.boss) {
      this.boss.update(time, deltaTime, this);
    }

    // تحديث بقية عناصر اللعبة
    this.updateEnemyBullets(this.myCanvas, this.camera);
    this.updatePowerUp(this.gameTimer);
    this.updateExplosion(deltaTime);
    this.updateDebris(deltaTime);
    this.updateMissile(input, time, deltaTime);
    this.updateRocks(this.gameTimer, deltaTime);

    // تحديث أزرار الموبايل إن وجدت
    if (this.touchButtons.length > 0) {
      const len = this.touchButtons.length;
      for (let i = 0; i < len; i++) {
        this.touchButtons[i].update(deltaTime);
      }
    }

    // معالجة التصادمات لواجهة اللعب
    this.handleCollisions(this.gameTimer);

    // تحديث الـ HUD بناءً على واجهة الأبعاد المنطقية المستقرة
    hud.update(this, this.myCanvas);
  }

  draw() {
    const isShaking = this.shake.power > 0;

    if (isShaking) {
      this.ctx.save(); // بداية الـ Shake
      const shakeX = (Math.random() - 0.5) * this.shake.power;
      const shakeY = (Math.random() - 0.5) * this.shake.power;
      this.ctx.translate(shakeX, shakeY);
    }

    this.background.draw(this.bgCtx, this.camera);

    //  رسم كتل الأعداء واللاعب
    this.renderEnemyBatch(this.enemies, this.ctx, this.camera);
    this.player.draw(this.ctx, this.camera);

    //  رسم الزعيم بأمان تام (فحص الـ null أولاً لمنع انهيار اللعبة)
    if (this.bossStart && this.boss && this.boss.alive) {
      this.boss.draw(this.ctx, this.camera);
    }

    // رسم المقذوفات والعناصر على دفعات (Batch Rendering الفخم)
    this.renderSpriteBatch(this.bullets, this.ctx, this.camera);
    this.renderSpriteBatch(this.enemiesBullets, this.ctx, this.camera);
    this.renderSpriteBatch(this.powerUps, this.ctx, this.camera);
    this.renderSpriteBatch(this.rocks, this.ctx, this.camera);

    // رسم الحطام والانفجارات
    this.renderExplosionAndDebrisBatch(this.ctx, this.camera);

    const missileLen = this.missile.length;
    if (missileLen > 0) {
      for (let i = 0; i < missileLen; i++) {
        this.missile[i].draw(this.ctx, this.camera, this);
      }
    }

    if (isShaking) {
      this.ctx.restore(); // نهاية الـ Shake
    }

    const btnLen = this.touchButtons.length;
    if (btnLen > 0) {
      for (let i = 0; i < btnLen; i++) {
        this.touchButtons[i].draw(this.ctx);
      }
    }

    this.drawFlash(this.ctx, this.myCanvas);
  }

  // دالة إطلاق الرصاص
  spawnBulletPlayer(input, gameTimer) {
    if (!this.player.weapon || typeof this.player.weapon.shoot !== "function") {
      this.player.weapon = new NormalWeapon(this.player);
    }

    if (this.player.canShoot(input.keys, gameTimer)) {
      this.player.weapon.shoot(this.bullets, this.myCanvas);
      this.bulletsFired++;
      audioManager.poolPlay("fire");
    }
  }

  // دالة تحديث الرصاص
  updateBullets(canvas, camera) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      if (bullet) {
        bullet.update();

        if (bullet.isOffScreen(canvas, camera)) {
          this.bullets.splice(i, 1);
        }
      } else {
        this.bullets.splice(i, 1);
      }
    }
  }
  //تابع توليد الاعداء
  spawnEnemy(gameTimer) {
    //زيادة نسب الاعداء المتطورين وسرعتهم حسب الزمن
    let normalWeight = 50;
    let chaserWeight = 25;
    let dodgerWeight = 15;
    let shooterWeight = 10;

    let speedUp = 0;

    // تعديل الأوزان صراحة حسب خط الزمن
    if (gameTimer > 240000) {
      normalWeight = 5;
      chaserWeight = 20;
      dodgerWeight = 20;
      shooterWeight = 55;
      speedUp = 0.03;
    } else if (gameTimer > 120000) {
      normalWeight = 15;
      chaserWeight = 25;
      dodgerWeight = 25;
      shooterWeight = 35;
      speedUp = 0.02;
    } else if (gameTimer > 60000) {
      normalWeight = 30;
      chaserWeight = 30;
      dodgerWeight = 20;
      shooterWeight = 20;
      speedUp = 0.01;
    }
    let totalWeight =
      normalWeight + chaserWeight + dodgerWeight + shooterWeight; // مجموع الأوزان الحالية
    let roll = Math.random() * totalWeight;
    let x = this.camera.x + Math.random() * this.myCanvas.logicalWidth;
    let y = this.camera.y - 50;

    //توليد الاعداء بنسب
    if (roll < normalWeight) {
      this.enemies.push(
        new Enemy({
          canvas: this.myCanvas,
          type: "normal",
          x: x,
          y: y,
          width: 125,
          height: 125,
          color: "red",
          speed: 0.1 + speedUp,
          health: 10,
          maxHealth: 10,
          bulletDamage: 10, //ضرر الرصاصة
        })
      );
    } else if (roll < normalWeight + chaserWeight) {
      this.enemies.push(
        new Chaser({
          canvas: this.myCanvas,
          type: "chaser",
          x: x,
          y: y,
          color: "yellow",
          speed: 0.05 + speedUp,
        })
      );
    } else if (roll < normalWeight + chaserWeight + dodgerWeight) {
      this.enemies.push(
        new Dodger({
          canvas: this.myCanvas,
          type: "dodger",
          x: x,
          y: y,
          color: "pink",
          speed: 0.06 + speedUp,
        })
      );
    } else {
      this.enemies.push(
        new Shooter({
          canvas: this.myCanvas,
          type: "shooter",
          x: x,
          y: y,
          color: "blue",
          speed: 0.05 + speedUp,
        })
      );
    }
  }
  //دالة تحديث الاعداء
  updateEnemies(gameTimer, deltaTime, camera) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy) {
        enemy.update(gameTimer, deltaTime, this, camera);

        if (enemy.isOffScreen(this.myCanvas, camera)) {
          this.enemies.splice(i, 1);
        }
      } else {
        this.enemies.splice(i, 1);
      }
    }

    // زيادة معدل التوليد حسب خط الزمن
    if (gameTimer > 45000) {
      this.enemyDelay = 1000; // تكثيف شديد قبل الزعيم
    } else if (gameTimer > 25000) {
      this.enemyDelay = 1500; // صعوبة متوسطة
    } else {
      this.enemyDelay = 2000; // البداية الهادئة
    }

    if (gameTimer - this.lastEnemy > this.enemyDelay && !this.bossStart) {
      this.spawnEnemy(gameTimer);
      this.lastEnemy = gameTimer;
    }
  }

  //دالة توليد رصاصات العدو
  spawnEnemyBullets(enemy, player) {
    if (!this.player.alive) return;

    const targetX = player.x + player.width / 2;
    const targetY = player.y + player.height / 2;

    const offsetX = enemy.width * 0.085;
    const offsetY = enemy.height * 0.2;

    const spawnX = enemy.x + enemy.width / 2 - offsetX;
    const spawnY = enemy.y + enemy.height - offsetY;

    const dx = targetX - spawnX;
    const dy = targetY - spawnY;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) return;

    const dirX = dx / distance;
    const dirY = dy / distance;

    const BULLET_SPEED = 3;
    const bulletSize = enemy.width * 0.142;

    this.enemiesBullets.push(
      new Bullet({
        x: spawnX,
        y: spawnY,
        velocityX: dirX * BULLET_SPEED,
        velocityY: dirY * BULLET_SPEED,
        width: bulletSize,
        height: bulletSize,
        image: enemy.imgBullet,
        damage: enemy.bulletDamage,
      })
    );

    audioManager.poolPlay("EnemyWeapon");
  }
  // دالة تحديث رصاصات العدو
  updateEnemyBullets(canvas, camera) {
    for (let i = this.enemiesBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemiesBullets[i];

      if (bullet) {
        bullet.update();

        if (bullet.isOffScreen(canvas, camera)) {
          this.enemiesBullets.splice(i, 1);
        }
      } else {
        this.enemiesBullets.splice(i, 1);
      }
    }
  }

  //دالة توليد المكافات
  spawnPoweUp() {
    const types = [MissilePowerUp, WeaponPowerUp, HealthPowerUp, ShieldPowerUp];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const isMobile =
      this.myCanvas.logicalHeight < 500 || this.myCanvas.logicalWidth < 768;

    // نحدد أقصى عرض متوقع للكبسولة لتأمين عملية التوليد (الصاروخ هو الأكبر: 70 للكمبيوتر و35 للموبايل)
    const maxPowerUpWidth =
      randomType === MissilePowerUp ? (isMobile ? 35 : 70) : isMobile ? 15 : 30;

    const padding = 20;

    const randomX =
      padding +
      Math.random() *
        (this.myCanvas.logicalWidth - padding * 2 - maxPowerUpWidth);

    this.powerUps.push(
      new randomType(this.myCanvas, this.camera.x + randomX, this.camera.y - 40) // توليدها مختفية قليلاً بالأعلى
    );
  }

  //تحديث المكافات
  updatePowerUp(gameTimer) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerup = this.powerUps[i];

      if (powerup) {
        powerup.update();

        if (powerup.isOffScreen(this.myCanvas, this.camera)) {
          this.powerUps.splice(i, 1);
        }
      } else {
        this.powerUps.splice(i, 1);
      }
    }

    if (gameTimer - this.lastPowerUp > this.powerDelay && !this.bossStart) {
      this.spawnPoweUp();
      this.lastPowerUp = gameTimer;
    }

    if (this.shieldActive && gameTimer > this.shieldEndTime) {
      this.shieldActive = false;
      this.player.shieldEffect = false;
    }

    if (this.player.weaponEffect && gameTimer > this.weaponEndTime) {
      this.player.weapon = new NormalWeapon(this.player);
      this.player.weaponEffect = false;
    }
  }

  // توليد الانفجارات
  spawnExplosion(target, typeName) {
    const targetCenterX = target.x + (target.width ? target.width / 2 : 0);
    const targetCenterY = target.y + (target.height ? target.height / 2 : 0);

    this.explosions.push(
      new Explosion(this.myCanvas, targetCenterX, targetCenterY, typeName)
    );
  }
  // دالة تحديث الانفجارات
  updateExplosion(deltaTime) {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];

      if (explosion) {
        explosion.update(deltaTime);

        if (explosion.isDone()) {
          this.explosions.splice(i, 1);
        }
      } else {
        this.explosions.splice(i, 1);
      }
    }
  }

  spawnMissile(input, time, deltaTime) {
    if (this.player.missileCount <= 0) return;

    if (this.player.canShootMissile(input.keys, deltaTime)) {
      const launchData = this.player.getMissileLaunchPositions();
      let spawnX, spawnY;

      if (this.player.missileCount === 2) {
        spawnX = launchData.right.x;
        spawnY = launchData.right.y;
      } else {
        spawnX = launchData.left.x;
        spawnY = launchData.left.y;
      }

      const newMissile = new Missile(
        this.myCanvas,
        spawnX,
        spawnY,
        launchData.currentAngle
      );
      this.missile.push(newMissile);

      audioManager.volume("missileSound", 0.5);
      audioManager.play("missileSound");
    }
  }

  updateMissile(input, time, deltaTime) {
    this.spawnMissile(input, time, deltaTime);

    for (let i = this.missile.length - 1; i >= 0; i--) {
      const m = this.missile[i];

      if (m) {
        const bossTarget =
          this.bossStart && this.boss && this.boss.alive ? this.boss : null;

        m.update(deltaTime, this.enemies, bossTarget);

        if (!m.alive) {
          this.missile.splice(i, 1);
        }
      } else {
        this.missile.splice(i, 1);
      }
    }

    if (this.missile.length === 0) {
      audioManager.pause("missileSound");
    }
  }

  handleCollisions(gameTimer) {
    // 🛸 [قسم الزعيم]: يتم فحصه فقط وحصرياً إذا كان الزعيم موجوداً وحياً في الذاكرة
    if (this.boss && this.boss.alive) {
      const bossHitBoxes = this.boss.hitBox || this.boss.htiBox;

      if (bossHitBoxes) {
        // 1️⃣ تصادم الزعيم مع رصاص اللاعب
        for (let i = this.bullets.length - 1; i >= 0; i--) {
          const bullet = this.bullets[i];
          if (!bullet) continue;

          let bulletCollided = false;
          for (let j = 0; j < bossHitBoxes.length; j++) {
            if (collisionsSystem(bossHitBoxes[j], bullet)) {
              bulletCollided = true;
              break;
            }
          }

          if (bulletCollided) {
            if (this.boss.health > 0) {
              this.boss.health -= bullet.damage;
              this.bulletsColision++;
              if (this.boss.health <= 0) this.triggerBossDefeat();
            }
            this.bullets.splice(i, 1);
          }
        }

        // 2️⃣ تصادم الزعيم مع صواريخ اللاعب
        for (let i = this.missile.length - 1; i >= 0; i--) {
          const missile = this.missile[i];
          if (!missile || !missile.alive) continue;

          let missileCollided = false;
          for (let m = 0; m < missile.hitBox.length; m++) {
            for (let b = 0; b < bossHitBoxes.length; b++) {
              if (collisionsSystem(bossHitBoxes[b], missile.hitBox[m])) {
                missileCollided = true;
                break;
              }
            }
            if (missileCollided) break;
          }

          if (missileCollided) {
            if (this.boss.health > 0) {
              this.boss.health -= missile.damage;
              this.bulletsColision++;
              missile.alive = false;
              audioManager.volume("explosionEnemy", 0.8);
              audioManager.play("explosionEnemy");
              if (this.boss.health <= 0) this.triggerBossDefeat();
            }
            this.missile.splice(i, 1);
          }
        }
      }
    } // 👈 نهاية كتل شرط الزعيم بأمان! المعالج سيكمل الآن للأسفل دائماً

    // ==========================================
    // 🎮 [قسم اللعب العام والأعداء والصخور العادية]
    // ==========================================

    // 1️⃣ تصادم الأعداء مع رصاص اللاعب
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (!bullet) continue;

      let bulletCollided = false;

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (!enemy || !enemy.alive) continue;

        let hasCollided = false;
        const enemyBoxes = enemy.hitBox;
        for (let k = 0; k < enemyBoxes.length; k++) {
          if (collisionsSystem(enemyBoxes[k], bullet)) {
            hasCollided = true;
            break;
          }
        }

        if (hasCollided) {
          bulletCollided = true;
          this.bulletsColision++;

          enemy.hit = true;
          enemy.lastHitTime = gameTimer;

          enemy.health -= bullet.damage;

          if (enemy.health <= 0) {
            enemy.alive = false;
            this.spawnExplosion(enemy, "enemy");
            this.spawnDebris(enemy);
            this.score++;
            this.combo++;

            if (typeof this.updateCredits === "function")
              this.updateCredits(enemy);

            if (this.enemyType && this.enemyType[enemy.type] !== undefined) {
              this.enemyType[enemy.type]++;
            }

            audioManager.volume("explosionEnemy", 0.7);
            audioManager.play("explosionEnemy");

            this.enemies.splice(j, 1);
          }
          break;
        }
      }

      if (bulletCollided) {
        this.bullets.splice(i, 1);
      }
    }

    // 2️⃣ تصادم اللاعب مع الأعداء
    if (this.player.alive) {
      const playerBoxes = this.player.hitBox;

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (!enemy || !enemy.alive) continue;

        let hasCollided = false;
        const enemyBoxes = enemy.hitBox;

        for (let e = 0; e < enemyBoxes.length; e++) {
          for (let p = 0; p < playerBoxes.length; p++) {
            if (collisionsSystem(enemyBoxes[e], playerBoxes[p])) {
              hasCollided = true;
              break;
            }
          }
          if (hasCollided) break;
        }

        if (hasCollided) {
          enemy.alive = false;

          if (!this.shieldActive) {
            if (typeof this.player.takeDamage === "function") {
              this.player.takeDamage(enemy);
            }
            if (typeof this.triggerShacke === "function") {
              this.triggerShacke(5 + (enemy.damage || 5) * 2, 200);
            }
          }

          this.spawnExplosion(enemy, "enemy");
          audioManager.volume("explosionEnemy", 0.6);
          audioManager.play("explosionEnemy");

          this.enemies.splice(j, 1);

          if (this.player.health <= 0) {
            this.player.alive = false;
            this.spawnExplosion(this.player, "player");
            if (typeof this.player.delete === "function") this.player.delete();

            const progressPercent = (this.gameTimer / 240000) * 100;
            this.remainingTimeBoss = Math.max(
              0,
              Math.min(progressPercent, 100)
            );

            setTimeout(() => {
              stateManager.setState("gameOver");
              if (gameOverUi && typeof gameOverUi.update === "function") {
                gameOverUi.update(this);
              }
            }, 1500);
          }
        }
      }
    }

    // 3️⃣ تصادم الـ powerUps مع اللاعب
    if (this.player.alive) {
      const playerBoxes = this.player.hitBox;

      for (let i = this.powerUps.length - 1; i >= 0; i--) {
        const powerUp = this.powerUps[i];
        if (!powerUp) continue;

        let powerUpCollided = false;
        const powerBoxes = powerUp.hitBox || [];

        for (let p = 0; p < playerBoxes.length; p++) {
          for (let pw = 0; pw < powerBoxes.length; pw++) {
            if (collisionsSystem(playerBoxes[p], powerBoxes[pw])) {
              powerUpCollided = true;
              break;
            }
          }
          if (powerUpCollided) break;
        }

        if (powerUpCollided) {
          if (typeof powerUp.apply === "function") {
            powerUp.apply(this.player, this.gameTimer, this);
          }
          audioManager.volume("powerUp", 0.7);
          audioManager.play("powerUp");
          this.powerUps.splice(i, 1);
        }
      }
    }

    // 4️⃣ تصادم اللاعب مع رصاصات العدو
    if (this.player.alive) {
      const playerBoxes = this.player.hitBox;

      for (let i = this.enemiesBullets.length - 1; i >= 0; i--) {
        const bullet = this.enemiesBullets[i];
        if (!bullet) continue;

        let bulletCollided = false;
        for (let p = 0; p < playerBoxes.length; p++) {
          if (collisionsSystem(bullet, playerBoxes[p])) {
            bulletCollided = true;
            break;
          }
        }

        if (bulletCollided) {
          if (!this.shieldActive) {
            if (typeof this.player.takeDamage === "function") {
              this.player.takeDamage(bullet);
            }
            if (typeof this.triggerShacke === "function") {
              this.triggerShacke(10, 200);
            }
            if (this.combo < 10) this.combo = 0;
          }

          this.enemiesBullets.splice(i, 1);

          if (this.player.health <= 0) {
            this.player.alive = false;
            this.spawnExplosion(this.player, "player");
            if (typeof this.player.delete === "function") this.player.delete();

            const progressPercent = (this.gameTimer / 240000) * 100;
            this.remainingTimeBoss = Math.max(
              0,
              Math.min(progressPercent, 100)
            );

            setTimeout(() => {
              stateManager.setState("gameOver");
              if (gameOverUi && typeof gameOverUi.update === "function") {
                gameOverUi.update(this);
              }
            }, 1500);
            break;
          }
        }
      }
    }

    // 5️⃣ تصادم الأعداء مع الصواريخ الموجّهة
    for (let i = this.missile.length - 1; i >= 0; i--) {
      const missile = this.missile[i];
      if (!missile || !missile.alive) continue;

      let missileCollided = false;

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (!enemy || !enemy.alive) continue;

        let hasCollided = false;
        const enemyBoxes = enemy.hitBox;
        const missileBoxes = missile.hitBox;

        for (let m = 0; m < missileBoxes.length; m++) {
          for (let e = 0; e < enemyBoxes.length; e++) {
            if (collisionsSystem(enemyBoxes[e], missileBoxes[m])) {
              hasCollided = true;
              break;
            }
          }
          if (hasCollided) break;
        }

        if (hasCollided) {
          missileCollided = true;
          missile.alive = false;
          enemy.health -= missile.damage || 50;

          if (enemy.health <= 0) {
            enemy.alive = false;
            this.spawnExplosion(enemy, "enemy");
            this.spawnDebris(enemy);
            this.score++;
            if (typeof this.updateCredits === "function")
              this.updateCredits(enemy);

            if (this.enemyType && this.enemyType[enemy.type] !== undefined) {
              this.enemyType[enemy.type]++;
            }

            audioManager.volume("explosionEnemy", 0.5);
            audioManager.play("explosionEnemy");
            this.enemies.splice(j, 1);
          }
          break;
        }
      }

      if (missileCollided) {
        this.missile.splice(i, 1);
      }
    }

    // 6️⃣ تصادم اللاعب مع الصخور
    if (this.player.alive) {
      const playerBoxes = this.player.hitBox;

      for (let i = this.rocks.length - 1; i >= 0; i--) {
        const rock = this.rocks[i];
        if (!rock) continue;

        let rockCollided = false;
        const rockBoxes = rock.hitBox || [];

        for (let p = 0; p < playerBoxes.length; p++) {
          for (let r = 0; r < rockBoxes.length; r++) {
            if (collisionsSystem(playerBoxes[p], rockBoxes[r])) {
              rockCollided = true;
              break;
            }
          }
          if (rockCollided) break;
        }

        if (rockCollided) {
          rock.alive = false;

          if (!this.shieldActive) {
            if (typeof this.player.takeDamage === "function") {
              this.player.takeDamage(rock);
            }
            if (typeof this.triggerShacke === "function") {
              this.triggerShacke(10, 200);
            }
          }

          audioManager.volume("explosionEnemy", 0.6);
          audioManager.play("explosionEnemy");
          this.rocks.splice(i, 1);

          if (this.player.health <= 0) {
            this.player.alive = false;
            this.spawnExplosion(this.player, "player");
            if (typeof this.player.delete === "function") this.player.delete();

            const progressPercent = (this.gameTimer / 240000) * 100;
            this.remainingTimeBoss = Math.max(
              0,
              Math.min(progressPercent, 100)
            );

            setTimeout(() => {
              stateManager.setState("gameOver");
              if (gameOverUi && typeof gameOverUi.update === "function") {
                gameOverUi.update(this);
              }
            }, 1500);
            break;
          }
        }
      }
    }

    // 7️⃣ تصادم رصاصات اللاعب مع الصخور
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (!bullet) continue;

      let bulletCollided = false;

      for (let j = this.rocks.length - 1; j >= 0; j--) {
        const rock = this.rocks[j];
        if (!rock || !rock.alive) continue;

        let hasCollided = false;
        const rockBoxes = rock.hitBox || [];

        for (let r = 0; r < rockBoxes.length; r++) {
          if (collisionsSystem(bullet, rockBoxes[r])) {
            hasCollided = true;
            break;
          }
        }

        if (hasCollided) {
          bulletCollided = true;
          rock.alive = false;
          this.spawnExplosion(rock, "rockExplosion");
          if (typeof this.spawnDebris === "function") this.spawnDebris(rock);

          this.bulletsColision++;
          audioManager.volume("explosionEnemy", 0.7);
          audioManager.play("explosionEnemy");
          this.rocks.splice(j, 1);
          break;
        }
      }

      if (bulletCollided) {
        this.bullets.splice(i, 1);
      }
    }
  }

  triggerBossDefeat() {
    this.boss.alive = false;

    if (typeof this.boss.delete === "function") this.boss.delete();

    // توليد انفجار مركزي سينمائي للزعيم
    this.spawnExplosion(this.boss, "xilosVex");

    // تشغيل أصوات الانفجار الملحمية
    audioManager.play("explotionXilos1");
    audioManager.play("explotionXilos2");

    // تأخير الانتقال لشاشة الفوز بأمان
    setTimeout(() => {
      // التأكد من أن اللاعب ما زال حياً ولم يمت مع الزعيم في نفس اللحظة
      if (!this.player.alive || this.player.health <= 0) return;

      stateManager.setState("win");
      audioManager.pause("bossSound");
      audioManager.play("winSound");

      if (typeof winUpdate === "function") winUpdate(this);
    }, 2000);
  }

  updateCredits(enemy) {
    if (enemy.color === "red") {
      this.credits++;
    } else if (enemy.color === "yellow") {
      this.credits += 2;
    } else if (enemy.color === "pink") {
      this.credits += 3;
    } else if (enemy.color === "blue") {
      this.credits += 4;
    }
  }
  // 🔄 دالة تفريغ الكائنات وإعادة التعيين الآمنة بنسبة 100%
  reset() {
    this.gameTimer = 0;
    this.score = 0;
    this.combo = 0;
    this.bulletsFired = 0;
    this.bulletsColision = 0;

    // تفريغ كامل للمصفوفات لضمان عدم تسريب كائنات من الجيم السابق
    this.bullets = [];
    this.enemies = [];
    this.enemiesBullets = [];
    this.explosions = [];
    this.powerUps = [];
    this.rocks = [];
    this.missile = [];
    this.debris = [];

    // إعادة خلق اللاعب من جديد بنقاط حياته الأصلية
    this.player = new Player(this.myCanvas);

    this.shieldActive = false;
    this.bossStart = false;
    this.bossMusicPlayed = false;

    // 🛡️ التطهير الجذري للزعيم: نعيده إلى null لتبدأ الدورة الزمنية للعبة بشكل نقي تماماً
    this.boss = null;

    this.bossArenaX = 0;
    this.bossArenaY = 0;

    this.lastEnemy = 0;
    this.lastPowerUp = 0;
    this.lastRock = 0;
    this.shieldEndTime = 0;
    this.weaponEndTime = 0;

    this.camera.x = 0;
    this.camera.y = 0;

    this.shake = {
      power: 0,
      duration: 0,
    };

    this.flash = {
      alpha: 0,
      color: "white",
    };

    this.enemyType = {
      normal: 0,
      chaser: 0,
      dodger: 0,
      shooter: 0,
    };

    if (audioManager) {
      audioManager.pause("bossSound");
      audioManager.pause("winSound");
      // يمكنك هنا إعادة تشغيل موسيقى الخلفية العادية للمرحلة إذا أردت
    }
  }

  // 🫨 اهتزاز الشاشة
  triggerShacke(power, duration) {
    this.shake.power = power;
    this.shake.duration = duration;
  }

  // 💥 توليد الحطام المتناثر عند تدمير الأعداء
  spawnDebris(enemy) {
    if (!enemy) return;
    const enemyCenterX = enemy.x + enemy.width / 2;
    const enemyCenterY = enemy.y + enemy.height / 2;

    this.debris.push(new Debris(this.myCanvas, enemyCenterX, enemyCenterY));
  }

  // 🪨 توليد الصخور العشوائية خارج حدود الكاميرا العلوية
  spawnRocks(gameTimer) {
    if (gameTimer - this.lastRock > this.rockDelay && !this.bossStart) {
      const isMobile =
        this.myCanvas.logicalHeight < 500 || this.myCanvas.logicalWidth < 768;

      const maxRockWidth = isMobile ? 55 : 110;
      const padding = 15;

      const x =
        this.camera.x +
        padding +
        Math.random() *
          (this.myCanvas.logicalWidth - padding * 2 - maxRockWidth);
      const y = this.camera.y - maxRockWidth;

      this.rocks.push(new Rocks(this.myCanvas, x, y));
      this.lastRock = gameTimer;
    }
  }

  // 🔄 تحديث الصخور بحلقات فور سريعة ومنخفضة التكلفة
  updateRocks(gameTimer, deltaTime) {
    this.spawnRocks(gameTimer);

    // تم استبدال forEach بحلقة for تقليدية فائقة السرعة
    for (let i = 0; i < this.rocks.length; i++) {
      if (this.rocks[i]) this.rocks[i].update(deltaTime);
    }
  }

  // 🔄 تحديث الحطام بحلقات فور سريعة
  updateDebris(deltaTime) {
    for (let i = 0; i < this.debris.length; i++) {
      if (this.debris[i]) this.debris[i].update(deltaTime);
    }
  }

  // 🎨 رسم تأثير الفلاش الأبيض (مثلاً عند تلقي ضرر قوي)
  drawFlash(ctx, canvas) {
    if (this.flash.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.flash.alpha;
    ctx.fillStyle = this.flash.color;
    ctx.fillRect(0, 0, canvas.logicalWidth, canvas.logicalHeight);
    ctx.restore();
  }

  handleCameraAndBossPhase() {
    if (this.bossStart) {
      // إذا بدأت مواجهة الزعيم ولم نثبت الحلبة بعد
      if (!this.bossArenaX) {
        this.bossArenaX = this.camera.x;
        this.bossArenaY = this.camera.y;

        // 🛡️ جدار حماية لمنع الانهيار: نتحقق من وجود الزعيم أولاً قبل حساب أبعاده وموقعه
        if (this.boss) {
          this.boss.x =
            this.bossArenaX +
            this.myCanvas.logicalWidth / 2 -
            (this.boss.width / 2 || 100);

          this.boss.y = this.bossArenaY - this.myCanvas.logicalHeight;
        }
      }

      // تثبيت الكاميرا في الحلبة لمنعها من تتبع اللاعب خارج المعركة
      this.camera.x = this.bossArenaX;
      this.camera.y = this.bossArenaY;

      // تشغيل الصوتيات لمرة واحدة عند دخول الزعيم
      if (!this.bossMusicPlayed) {
        if (audioManager) {
          audioManager.pause("bg");
          audioManager.play("bossSound");
          audioManager.play("bossSentance");
        }
        this.bossMusicPlayed = true;
      }
    } else {
      // حركة الكاميرا الطبيعية الملاحقة للاعب أثناء الطيران العادي
      if (this.player) {
        this.camera.x = this.player.x - this.myCanvas.logicalWidth * 0.45;
        this.camera.y = this.player.y - this.myCanvas.logicalHeight * 0.6;
      }
    }
  }

  // 📱 2️⃣ دالة الاستجابة عند تغير أبعاد الكانفاس (مثل قلب الهاتف أو تغيير حجم المتصفح)
  handleResize() {
    // إجبار اللاعب على إعادة فحص حدوده فوراً بناءً على الأبعاد الجديدة بشرط أن يكون حياً
    if (this.player && this.player.alive) {
      if (typeof this.player._constrainMovement === "function") {
        this.player._constrainMovement(this.camera, this.myCanvas);
      }
    }

    // إعادة حساب مواقع الأزرار اللمسية ديناميكياً لتتبع الزوايا الجديدة فوراً
    if (typeof this.initTouchControls === "function") {
      this.initTouchControls();
    }
  }

  //دالة توليد الازرار
  initTouchControls() {
    this.touchButtons.length = 0;

    const padding = 25;
    const joyRadius = 120;
    const btnRadius = 80;

    const canvasWidth = this.myCanvas.logicalWidth || this.myCanvas.width;
    const canvasHeight = this.myCanvas.logicalHeight || this.myCanvas.height;

    // إحداثيات عصا التحكم (أسفل اليسار)
    const joyX = padding + 80;
    const joyY = canvasHeight - 80;

    // إحداثيات زر الرصاص العادي (أسفل اليمين)
    const shootX = canvasWidth - 50 * 2.5;
    const shootY = canvasHeight - padding - 50 * 1.2;

    // إحداثيات زر الصاروخ التكتيكي
    const missileX = shootX + 60;
    const missileY = shootY - 50 * 0.6;

    this.touchButtons.push(
      new TouchButton({
        canvas: this.myCanvas,
        type: "JOY_BASE",
        imageSrc: "/assets/UI/ChatGPT Image 9 يوليو 2026، 09_52_23 م.png",
        relativeX: joyX,
        relativeY: joyY,
        radius: joyRadius,
      })
    );

    this.touchButtons.push(
      new TouchButton({
        canvas: this.myCanvas,
        type: "JOY_KNOB",
        imageSrc: "/assets/UI/ChatGPT Image 9 يوليو 2026، 09_50_08 م.png",
        relativeX: joyX,
        relativeY: joyY - 5,
        radius: joyRadius * 0.5, // المقبض نصف حجم القاعدة
      })
    );

    this.touchButtons.push(
      new TouchButton({
        canvas: this.myCanvas,
        type: "SHOOT",
        imageSrc: "/assets/UI/ChatGPT Image 9 يوليو 2026، 09_33_51 م.png",
        relativeX: shootX,
        relativeY: shootY,
        radius: btnRadius,
      })
    );

    this.touchButtons.push(
      new TouchButton({
        canvas: this.myCanvas,
        type: "MISSILE",
        imageSrc: "/assets/UI/ChatGPT Image 9 يوليو 2026، 09_39_11 م.png",
        relativeX: missileX,
        relativeY: missileY,
        radius: btnRadius * 0.8,
      })
    );
  }

  // ========================================================= //
  //===========  Batch Rendering دالات الرسم العامة ========== //
  // ========================================================== //

  // دالة عام لرسم الكائنات الحاشدة البسيطة
  renderSpriteBatch(entities, ctx, camera) {
    if (!entities || entities.length === 0) return;

    for (let i = 0; i < entities.length; i++) {
      const e = entities[i];

      const screenX = e.x - camera.x + e.width / 2;
      const screenY = e.y - camera.y + e.height / 2;

      ctx.save();
      ctx.translate(screenX, screenY);

      if (e.angle !== 0) {
        ctx.rotate(e.angle);
      }

      ctx.drawImage(e.image, -e.width / 2, -e.height / 2, e.width, e.height);

      ctx.restore();
    }
  }

  // (دالة عامة لرسم الكائنات المعقدة (الاعداء
  renderEnemyBatch(enemies, ctx, camera) {
    if (!enemies || enemies.length === 0) return;

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.alive) continue;

      ctx.save();

      if (e.hit) {
        ctx.globalAlpha = 0.3 + Math.abs(Math.sin(Date.now() * 0.04)) * 0.5;
      }

      ctx.drawImage(e.image, e.x - camera.x, e.y - camera.y, e.width, e.height);

      ctx.restore();
    }

    for (let i = 0; i < enemies.length; i++) {
      enemies[i].drawHealthBar(ctx, camera);
    }
  }

  // دالة عامة لرسم جميع شظايا لهب الصاروخ
  renderParticleBatch(particles, ctx, camera) {
    if (!particles || particles.length === 0) return;

    const sortedByColor = {};

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.alpha <= 0) continue;
      if (!sortedByColor[p.color]) sortedByColor[p.color] = [];
      sortedByColor[p.color].push(p);
    }

    for (const color in sortedByColor) {
      ctx.beginPath();
      ctx.fillStyle = color;

      const list = sortedByColor[color];
      for (let i = 0; i < list.length; i++) {
        const p = list[i];

        ctx.globalAlpha = p.alpha;

        const renderX = p.x - camera.x;
        const renderY = p.y - camera.y;

        ctx.moveTo(renderX + p.size, renderY);
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  // (دالة عامة  لرسم الكائنات متعددة الفريمات (الانفجارات والحطام
  renderExplosionAndDebrisBatch(ctx, camera) {
    // ممر رسم الانفجارات المجمع
    if (this.explosions.length > 0) {
      for (let i = 0; i < this.explosions.length; i++) {
        const exp = this.explosions[i];
        if (exp.finished) continue;

        ctx.save();
        let alpha = 1 - exp.life / exp.maxLife;
        ctx.globalAlpha = Math.max(0, alpha);

        const renderX = exp.x - camera.x - exp.offsetX;
        const renderY = exp.y - camera.y - exp.offsetY;

        let frame;
        if (exp.type === "player") frame = exp.frameEXplayer[exp.currentFrame];
        else if (exp.type === "xilosVex")
          frame = exp.xilosFrame[exp.currentFrame];
        else frame = exp.frameEXenemy[exp.currentFrame];

        if (frame)
          ctx.drawImage(frame, renderX, renderY, exp.width, exp.height);
        ctx.restore();
      }
    }

    // ممر رسم الحطام المجمع
    if (this.debris.length > 0) {
      for (let i = 0; i < this.debris.length; i++) {
        const deb = this.debris[i];
        if (deb.finished) continue;

        ctx.save();
        ctx.globalAlpha = deb.alpha;

        let frame = deb.debrisFrame[deb.currentDebris];
        const renderX = deb.x - camera.x - deb.offsetX;
        const renderY = deb.y - camera.y - deb.offsetY;

        if (frame)
          ctx.drawImage(frame, renderX, renderY, deb.width, deb.height);
        ctx.restore();
      }
    }
  }
}
