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
import { winUpdate } from "../ui/win";
import { gameOverUi } from "../ui/gameOver";
import { TouchButton } from "../entities/ToucheButton";

//game manager class//
export class Game {
  constructor(canvas, ctx) {
    //ادوات الرسم
    this.myCanvas = canvas;
    this.ctx = ctx;
    window.gameInstance = this;
    this.gameTimer = 0;

    //الكائنات
    this.player = new Player(this.myCanvas);
    this.boss = new Boss(this.myCanvas);
    this.enemies = [];
    this.bullets = [];
    this.enemiesBullets = [];
    this.powerUps = [];
    this.explosions = [];
    this.debris = [];
    this.missile = [];
    this.rocks = [];

    //مؤقتات
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

    //بيانات واجهة الفوز
    this.bulletsFired = 0;
    this.bulletsColision = 0;
    this.combo = 0; // عداد القتل المتتالي بدون تلقي ضرر (Combo 10)
    this.enemyType = {
      normal: 0,
      chaser: 0,
      dodger: 0,
      shooter: 0,
    };

    // متحكمات مرحلة مواجهة زعيم اللعبة (Boss / Xilos Phase)
    this.remainingTimeBoss = 0;
    this.bossStart = false;
    this.bossMusicPlayed = false;

    //( boos موضع بدء مجيء العدو) اخر موضع للكاميرا
    this.bossArenaX = null;
    this.bossArenaY = null;

    //effect
    this.camera = {
      x: 0,
      y: 0,
    };

    this.shake = {
      power: 0,
      duration: 0,
    };

    this.flash = {
      alpha: 0,
      color: "white",
    };

    this.background = new Background(this.myCanvas, this.camera);

    //مصفوفة تخزين الازرار
    this.touchButtons = [];
    //استدعاء دالة بناء الازرار لاول مرة
    this.initTouchControls();

    // ضبط عدم خروج اللاعب من الشاشة + تحديث مواقع الازرار عند تغير في حجم الشاشة
    window.addEventListener("resize", () => this.handleResize());
  }
  update(input, time, deltaTime) {
    this.gameTimer += deltaTime;

    //شرط الدخول لمرحلة زايلوس
    if (this.gameTimer > 240000) {
      this.bossStart = true;
    }

    if (this.shake.duration > 0) {
      //تحديث الاهتزاز
      this.shake.duration -= deltaTime;
    } else {
      this.shake.power = 0;
    }

    this.flash.alpha -= 0.01 * deltaTime; //تحديث الفلاش

    //تحديث مدة تاثير السلاح الحالي
    let remaining = this.weaponEndTime - this.gameTimer;
    let duration = 5000;
    let progress = remaining / duration;
    this.player.weaponProgressEffect = progress; //ارسال المدة المتبقية للاعب

    // == boos اعدادات تثبيت الكاميرا والموسيقى مع بداية ==//
    this.handleCameraAndBossPhase();

    this.background.update(this.camera); //تحديث الخلفية

    this.player.update(
      input.keys,
      deltaTime,
      this.bossStart,
      this.camera,
      this.myCanvas,
      this.gameTimer
    );

    this.spawnBulletPlayer(input, this.gameTimer);
    this.updateBullets(this.myCanvas, this.camera);

    this.updateEnemies(this.gameTimer, deltaTime, this.camera);

    if (this.bossStart) this.boss.update(time, deltaTime, this);

    this.updateEnemyBullets(this.myCanvas, this.camera);
    this.updatePowerUp(this.gameTimer);
    this.updateExplosion(deltaTime);
    this.updateDebris(deltaTime);
    this.updateMissile(input, time, deltaTime);
    this.updateRocks(this.gameTimer, deltaTime);

    if (this.touchButtons) {
      this.touchButtons.forEach((button) => button.update(deltaTime));
    }

    this.handleCollisions(time);

    hud.update(this, this.myCanvas); //تحديث واجهة اللعب
  }

  draw() {
    let shakeX = 0;
    let shakeY = 0;

    if (this.shake.power > 0) {
      shakeX = (Math.random() - 0.5) * this.shake.power;
      shakeY = (Math.random() - 0.5) * this.shake.power;
    }

    this.ctx.save(); //بداية shack
    this.ctx.translate(shakeX, shakeY);

    this.background.draw(this.ctx, this.camera);

    this.enemies.forEach((e) => e.draw(this.ctx, this.camera));

    this.player.draw(this.ctx, this.camera);

    if (this.bossStart && this.boss.alive) {
      this.boss.draw(this.ctx, this.camera);
    }
    this.bullets.forEach((b) => b.draw(this.ctx, this.camera));
    this.enemiesBullets.forEach((eb) => eb.draw(this.ctx, this.camera));
    this.powerUps.forEach((p) => p.draw(this.ctx, this.camera));
    this.explosions.forEach((ex) => ex.draw(this.ctx, this.camera));
    this.debris.forEach((d) => d.draw(this.ctx, this.camera));
    this.missile.forEach((m) => m.draw(this.ctx, this.camera, this.player));
    this.rocks.forEach((r) => r.draw(this.ctx, this.camera));

    this.ctx.restore(); //نهاية الshack

    this.touchButtons.forEach((button) => {
      button.draw(this.ctx);
    });

    this.drawFlash(this.ctx, this.myCanvas); //رسم الفلاش
  }
  //دالة اطلاق الرصاص
  spawnBulletPlayer(input, gameTimer) {
    //حماية استقرار السلاح
    if (!this.player.weapon || typeof this.player.weapon.shoot !== "function") {
      this.player.weapon = new NormalWeapon(this.player);
    }

    if (this.player.canShoot(input.keys, gameTimer)) {
      this.player.weapon.shoot(this.bullets, this.myCanvas);
      this.bulletsFired++;
      audioManager.poolPlay("fire");
    }
  }
  //دالة تحديث الرصاص
  updateBullets(canvas, camera) {
    this.bullets.forEach((bullet) => {
      if (bullet) bullet.update();
    });

    //فلترة المصفوفة بحذف الرصاصات الخارجة من الشاشة
    this.bullets = this.bullets.filter(
      (bullet) => bullet && !bullet.isOffScreen(canvas, camera)
    );
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
    this.enemies.forEach((enemy) => {
      if (enemy) enemy.update(gameTimer, deltaTime, this, camera);
    });

    this.enemies = this.enemies.filter(
      (enemy) => enemy && !enemy.isOffScreen(this.myCanvas, camera)
    );

    //زيادة معدل التوليد حسب الزمن
    if (gameTimer > 45000) {
      this.enemyDelay = 1000; // تكثيف شديد قبل الزعيم
    } else if (gameTimer > 25000) {
      this.enemyDelay = 1500; // صعوبة متوسطة
    } else {
      this.enemyDelay = 2000; // البداية الهادئة للعبة
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
    this.enemiesBullets.forEach((bullet) => {
      if (bullet) bullet.update();
    });

    this.enemiesBullets = this.enemiesBullets.filter(
      (bullet) => bullet && !bullet.isOffScreen(canvas, camera)
    );
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
    //تحديث
    this.powerUps.forEach((powerup) => {
      if (powerup) powerup.update();
    });

    // حذف المكافات الخارجة من الشاشة
    this.powerUps = this.powerUps.filter(
      (powerup) => powerup && !powerup.isOffScreen(this.myCanvas, this.camera)
    );

    if (gameTimer - this.lastPowerUp > this.powerDelay && !this.bossStart) {
      this.spawnPoweUp();
      this.lastPowerUp = gameTimer;
    }
    //زمن المكافات
    if (this.shieldActive && gameTimer > this.shieldEndTime) {
      this.shieldActive = false;
      this.player.shieldEffect = false;
    }
    if (this.player.weaponEffect && gameTimer > this.weaponEndTime) {
      this.player.weapon = new NormalWeapon(this.player);
      this.player.weaponEffect = false; // تصفير الحالة فوراً ليتوقف الشرط في الفريم القادم
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
    this.explosions.forEach((explosion) => {
      if (explosion) explosion.update(deltaTime);
    });

    this.explosions = this.explosions.filter(
      (explosion) => explosion && !explosion.isDone()
    );
  }
  spawnMissile(input, time, deltaTime) {
    if (this.player.missileCount <= 0) return;

    if (this.player.canShootMissile(input.keys, deltaTime)) {
      let launchData = this.player.getMissileLaunchPositions();
      let spawnX, spawnY;

      if (this.player.missileCount === 2) {
        spawnX = launchData.right.x;
        spawnY = launchData.right.y;
      } else {
        spawnX = launchData.left.x;
        spawnY = launchData.left.y;
      }

      let newMissile = new Missile(
        this.myCanvas,
        spawnX,
        spawnY,
        launchData.currentAngle
      );
      this.missile.push(newMissile);

      audioManager.volume("missileSound", 0.5);
      audioManager.play("missileSound");

      console.log("true");
    }
  }
  updateMissile(input, time, deltaTime) {
    this.spawnMissile(input, time, deltaTime);

    //المصفوفة الكلية للاعداء والتي تتضمن زايلوس
    let allEnemies = [...this.enemies];

    if (this.bossStart && this.boss && this.boss.alive) {
      allEnemies.push(this.boss);
    }

    this.missile.forEach((m) => {
      if (m) m.update(deltaTime, allEnemies);
    });

    this.missile = this.missile.filter((m) => m && m.alive);

    if (this.missile.length === 0) {
      audioManager.pause("missileSound");
    }
  }

  handleCollisions(gameTimer) {
    //تصادم ال boss مع الرصاص
    if (this.boss.alive) {
      this.bullets = this.bullets.filter((bullet) => {
        if (!bullet) return false;

        const hasCollided = this.boss.htiBox.some((bossBox) => {
          return collisionsSystem(bossBox, bullet);
        });

        if (hasCollided) {
          if (this.boss.health <= 0) return false;

          // تطبيق الضرر
          this.boss.health -= bullet.damage;
          this.bulletsColision++; // زيادة عداد تصادم الرصاص

          if (this.boss.health <= 0) {
            this.boss.alive = false;

            if (typeof this.boss.delete === "function") this.boss.delete();

            // توليد انفجار مركزي سينمائي للزعيم
            this.spawnExplosion(this.boss, "xilosVex");

            // تشغيل أصوات الانفجار الملحمية
            audioManager.play("explotionXilos1");
            audioManager.play("explotionXilos2");

            // تأخير الانتقال لشاشة الفوز لمنح الانفجار وقته البصري
            setTimeout(() => {
              // التأكد من أن اللاعب ما زال حياً ولم يمت مع الزعيم في نفس اللحظة
              if (!this.player.alive || this.player.health <= 0) return;

              stateManager.setState("win");
              audioManager.pause("bossSound");
              audioManager.play("winSound");

              if (typeof winUpdate === "function") winUpdate(this);
            }, 2000);
          }

          return false; // حذف الرصاصة من المصفوفة لأنها اصطدمت
        }

        return true; // إبقاء الرصاصة في الجو إذا لم تصطدم
      });
    }
    //تصادم الboss مع الصواريخ
    if (this.boss.alive) {
      this.missile = this.missile.filter((missile) => {
        if (!missile) return false;

        const hasCollided = missile.hitBox.some((missileBox) => {
          return this.boss.htiBox.some((bossBox) => {
            return collisionsSystem(bossBox, missileBox);
          });
        });

        if (hasCollided) {
          if (this.boss.health <= 0) return false;

          this.boss.health -= missile.damage;
          this.bulletsColision++;

          missile.alive = false;

          audioManager.volume("explosionEnemy", 0.8);
          audioManager.play("explosionEnemy");

          if (this.boss.health <= 0) {
            this.boss.alive = false;

            if (typeof this.boss.delete === "function") this.boss.delete();

            this.spawnExplosion(this.boss, "xilosVex");

            audioManager.play("explotionXilos1");
            audioManager.play("explotionXilos2");

            setTimeout(() => {
              if (!this.player.alive || this.player.health <= 0) return;

              stateManager.setState("win");
              audioManager.pause("bossSound");
              audioManager.play("winSound");

              if (typeof winUpdate === "function") winUpdate(this);
            }, 2000);
          }

          return false;
        }

        return true;
      });
    }

    //تصادم الاعداء مع الرصاص
    this.bullets = this.bullets.filter((bullet) => {
      if (!bullet) return false;
      let bulletSurvived = true;

      this.enemies.forEach((enemy) => {
        if (!enemy || !enemy.alive || !bulletSurvived) return;

        // فحص التصادم مع صناديق تصادم العدو
        const hasCollided = enemy.hitBox.some((enemyBox) => {
          return collisionsSystem(enemyBox, bullet);
        });

        if (hasCollided) {
          bulletSurvived = false;
          this.bulletsColision++;

          enemy.hit = true;
          setTimeout(() => {
            if (enemy) enemy.hit = false;
          }, 200);

          enemy.health -= bullet.damage;

          if (enemy.health <= 0) {
            enemy.alive = false;

            this.spawnExplosion(enemy, "enemy");
            this.spawnDebris(enemy);

            this.score++;
            this.combo++;
            if (typeof this.updateCredits === "function")
              this.updateCredits(enemy);

            //تحديث إحصائيات نوع العدو المقتول
            if (this.enemyType && this.enemyType[enemy.type] !== undefined) {
              this.enemyType[enemy.type]++;
            }

            audioManager.volume("explosionEnemy", 0.7);
            audioManager.play("explosionEnemy");
          }
        }
      });

      return bulletSurvived; // إبقاء الرصاصة إذا لم تصطدم بأي عدو
    });

    // التنظيف النهائي والموحد لمصفوفة الأعداء)
    this.enemies = this.enemies.filter((enemy) => enemy && enemy.alive);

    //تصادم اللاعب مع الاعداء
    if (this.player.alive) {
      this.enemies.forEach((enemy) => {
        if (!enemy || !enemy.alive || !this.player.alive) return;

        const hasCollided = enemy.hitBox.some((enemyBox) => {
          return this.player.hitBox.some((playerBox) => {
            return collisionsSystem(enemyBox, playerBox);
          });
        });

        if (hasCollided) {
          enemy.alive = false;

          if (!this.shieldActive) {
            if (typeof this.player.takeDamage === "function") {
              this.player.takeDamage(enemy);
            }

            if (typeof this.triggerShacke === "function") {
              this.triggerShacke(5 + (enemy.damage || 5) * 2, 200);
            }
          } else {
            // 💡 هنا يمكنك استدعاء صوت أو تأثير ارتداد الدرع لاحقاً
            // audioManager.play("shieldHit");
          }

          this.spawnExplosion(enemy, "enemy");
          audioManager.volume("explosionEnemy", 0.6);
          audioManager.play("explosionEnemy");

          if (this.player.health <= 0) {
            this.player.alive = false;

            this.spawnExplosion(this.player, "player");
            if (typeof this.player.delete === "function") this.player.delete();

            let progressPercent = (this.gameTimer / 240000) * 100;
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
      });

      this.enemies = this.enemies.filter((enemy) => enemy && enemy.alive);
    }

    //تصادم ال powerUps مع اللاعب
    this.powerUps = this.powerUps.filter((powerUp) => {
      if (!powerUp || !this.player.alive) return false;

      const hasCollided = this.player.hitBox.some((playerBox) => {
        return powerUp.hitBox.some((powerBox) => {
          return collisionsSystem(playerBox, powerBox);
        });
      });

      if (hasCollided) {
        if (typeof powerUp.apply === "function") {
          powerUp.apply(this.player, this.gameTimer, this);
        }

        audioManager.volume("powerUp", 0.7);
        audioManager.play("powerUp");

        return false;
      }

      return true;
    });

    //تصادم اللاعب مع رصاصات العدو
    if (this.player.alive) {
      this.enemiesBullets = this.enemiesBullets.filter((bullet) => {
        if (!bullet || !this.player.alive) return false;

        const hasCollided = this.player.hitBox.some((playerBox) => {
          return collisionsSystem(bullet, playerBox);
        });

        if (hasCollided) {
          if (!this.shieldActive) {
            if (typeof this.player.takeDamage === "function") {
              this.player.takeDamage(bullet);
            }

            if (typeof this.triggerShacke === "function") {
              this.triggerShacke(10, 200);
            }

            if (this.combo < 10) this.combo = 0;
          } else {
            // 💡 مساحة مخصصة لتأثيرات الدرع لاحقاً
          }

          if (this.player.health <= 0) {
            this.player.alive = false;

            this.spawnExplosion(this.player, "player");
            if (typeof this.player.delete === "function") this.player.delete();

            // حساب نسبة التقدم قبل ظهور الزعيم
            let progressPercent = (this.gameTimer / 240000) * 100;
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

          return false;
        }

        return true;
      });
    }

    // تصادم العدو مع الصواريخ
    this.missile = this.missile.filter((missile) => {
      if (!missile || !missile.alive) return false;
      let missileSurvived = true;

      this.enemies.forEach((enemy) => {
        if (!enemy || !enemy.alive || !missileSurvived) return;

        const hasCollided = enemy.hitBox.some((enemyBox) => {
          return missile.hitBox.some((missileBox) => {
            return collisionsSystem(enemyBox, missileBox);
          });
        });

        if (hasCollided) {
          missileSurvived = false;
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

            // تشغيل صوت التدمير
            audioManager.volume("explosionEnemy", 0.5);
            audioManager.play("explosionEnemy");
          }
        }
      });

      return missileSurvived;
    });

    this.enemies = this.enemies.filter((enemy) => enemy && enemy.alive);

    //تصادم اللاعب مع الصخور
    if (this.player.alive) {
      this.rocks = this.rocks.filter((rock) => {
        if (!rock || !this.player.alive) return false;

        const hasCollided = this.player.hitBox.some((playerBox) => {
          return rock.hitBox.some((rockBox) => {
            return collisionsSystem(playerBox, rockBox);
          });
        });

        if (hasCollided) {
          rock.alive = false;

          if (!this.shieldActive) {
            if (typeof this.player.takeDamage === "function") {
              this.player.takeDamage(rock);
            }

            if (typeof this.triggerShacke === "function") {
              this.triggerShacke(10, 200);
            }
            this.triggerShacke;
          } else {
            // 💡 مساحة مخصصة لتأثيرات الدرع ضد الصخور لاحقاً
          }

          audioManager.volume("explosionEnemy", 0.6);
          audioManager.play("explosionEnemy");

          if (this.player.health <= 0) {
            this.player.alive = false;

            this.spawnExplosion(this.player, "player");
            if (typeof this.player.delete === "function") this.player.delete();

            // حساب نسبة التقدم المستقرة قبل ظهور الزعيم
            let progressPercent = (this.gameTimer / 240000) * 100;
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

          return false;
        }

        return true;
      });
    }

    //تصادم رصاصات اللاعب مع الصخور
    this.bullets = this.bullets.filter((bullet) => {
      if (!bullet) return false;
      let bulletSurvived = true;

      this.rocks.forEach((rock) => {
        if (!rock || !rock.alive || !bulletSurvived) return;

        const hasCollided = rock.hitBox.some((rockBox) => {
          return collisionsSystem(bullet, rockBox);
        });

        if (hasCollided) {
          bulletSurvived = false;
          rock.alive = false;

          this.spawnExplosion(rock, "rockExplosion");
          if (typeof this.spawnDebris === "function") {
            this.spawnDebris(rock);
          }

          this.bulletsColision++;

          audioManager.volume("explosionEnemy", 0.7);
          audioManager.play("explosionEnemy");
        }
      });

      return bulletSurvived;
    });

    this.rocks = this.rocks.filter((rock) => rock && rock.alive);
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
  //دالة تفريغ الكائنات
  reset() {
    this.gameTimer = 0;
    this.score = 0;
    this.combo = 0;
    this.bulletsFired = 0;
    this.bulletsColision = 0;

    this.bullets = [];
    this.enemies = [];
    this.enemiesBullets = [];
    this.explosions = [];
    this.powerUps = [];
    this.rocks = [];
    this.missile = [];
    this.debris = [];

    this.player = new Player(this.myCanvas);

    this.shieldActive = false;

    this.bossArenaX = 0;
    this.bossArenaY = 0;

    if (this.boss) {
      this.bossStart = false;
      this.boss.alive = true;
      this.boss.health = 300;
      this.bossMusicPlayed = false;

      this.boss.x =
        this.bossArenaX +
        this.myCanvas.logicalWidth / 2 -
        (this.boss.width / 2 || 100);
      this.boss.y = this.bossArenaY - 700;
    }

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
    }
  }
  triggerShacke(power, duration) {
    this.shake.power = power;
    this.shake.duration = duration;
  }
  spawnDebris(enemy) {
    const enemyCenterX = enemy.x + enemy.width / 2;
    const enemyCenterY = enemy.y + enemy.height / 2;

    this.debris.push(new Debris(this.myCanvas, enemyCenterX, enemyCenterY));
  }
  spawnRocks(gameTimer) {
    if (gameTimer - this.lastRock > this.rockDelay && !this.bossStart) {
      const isMobile =
        this.myCanvas.logicalHeight < 500 || this.myCanvas.logicalWidth < 768;

      const maxRockWidth = isMobile ? 55 : 110;
      const padding = 15;

      let x =
        this.camera.x +
        padding +
        Math.random() *
          (this.myCanvas.logicalWidth - padding * 2 - maxRockWidth);
      let y = this.camera.y - maxRockWidth;

      this.rocks.push(new Rocks(this.myCanvas, x, y));
      this.lastRock = gameTimer;
    }
  }
  updateRocks(gameTimer, deltaTime) {
    this.spawnRocks(gameTimer);
    this.rocks.forEach((r) => r.update(deltaTime));
  }
  updateDebris(deltaTime) {
    this.debris.forEach((d) => d.update(deltaTime));
  }
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

        // الإحداثيات الأولية للزعيم
        this.boss.x =
          this.bossArenaX +
          this.myCanvas.logicalWidth / 2 -
          this.boss.width / 2;

        this.boss.y = this.bossArenaY - this.myCanvas.logicalHeight;
      }

      // تثبيت الكاميرا في الحلبة
      this.camera.x = this.bossArenaX;
      this.camera.y = this.bossArenaY;

      // تشغيل الصوتيات لمرة واحدة
      if (!this.bossMusicPlayed) {
        audioManager.pause("bg");
        audioManager.play("bossSound");
        audioManager.play("bossSentance");
        this.bossMusicPlayed = true;
      }
    } else {
      // حركة الكاميرا الطبيعية الملاحقة للاعب
      this.camera.x = this.player.x - this.myCanvas.logicalWidth * 0.45;
      this.camera.y = this.player.y - this.myCanvas.logicalHeight * 0.6;
    }
  }
  //دالة تجاوب ابعاد اللاعب والازرار اللمسية عند تغير ابعاد الكانفاس (مثل قلب الهاتف)
  handleResize() {
    // 1️⃣ إجبار اللاعب على إعادة فحص حدوده فوراً بناءً على الأبعاد الجديدة
    if (this.player) {
      this.player._constrainMovement(this.camera, this.myCanvas);
    }

    // 2️⃣ إعادة حساب مواقع الأزرار اللمسية ديناميكياً لتتبع الزوايا الجديدة فوراً
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
}
