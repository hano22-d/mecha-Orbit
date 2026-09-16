import { assetsManager } from "../../systems/AssetsManager";
import { Enemy } from "./Enemy";

export class Shooter extends Enemy {
  constructor(config) {
    super({
      ...config,
      baseWidth: 175,
      baseHeight: 175,
      health: 50,
      maxHealth: 50,
      bulletDamage: 10,
      imageElement: assetsManager.getImage("enemyShooter"),
      
      hitBoxRatio: [
        { wRatio: 0.2,   hRatio: 0.771, oxRatio: 0.4,   oyRatio: 0.114 }, // المربع الرأسي الرئيسي
        { wRatio: 0.314, hRatio: 0.171, oxRatio: 0.085, oyRatio: 0.428 }, // الجناح الأيسر العريض
        { wRatio: 0.314, hRatio: 0.171, oxRatio: 0.6,   oyRatio: 0.428 }, // الجناح الأيمن العريض
      ],
    });

    const isMobile = config.canvas.logicalHeight < 500 || config.canvas.logicalWidth < 768;

    this.attackRange = isMobile ? 200 : 300;
    this.lastShoot = 0;
    this.shootDelay = 2000;
    this.imgBullet = assetsManager.getImage("enemyW");
  }

  /* =================
       دالة التحديث
     ================= */
  update(time, deltaTime, game, camera) {
    let dx = game.player.x - this.x;
    let dy = game.player.y - this.y;
    let distance = Math.hypot(dx, dy); //دالة حديثة تقوم بعملية التربيع والجذر

    if (
      distance < this.attackRange &&
      time - this.lastShoot > this.shootDelay
    ) {
      game.spawnEnemyBullets(this, game.player);
      this.lastShoot = time;
    }
    super.update(time, deltaTime, game, camera);
  }
}
