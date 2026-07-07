import { Enemy } from "./Enemy";

const SHOOTER_IMAGE = new Image();
SHOOTER_IMAGE.src =
  "/assets/Default_Prompt_Flat_2D_topdown_perspective_game_asset_sprite_t_0_ccce8f49-3b08-455f-8f89-cb68881b31db_0.png";

const SHOOTER_BULLET_IMAGE = new Image();
SHOOTER_BULLET_IMAGE.src = "/assets/weapon/02.png";

//shooter Enemy class
export class Shooter extends Enemy {
  constructor(config) {
    super({
      ...config,
      baseWidth: 175,
      baseHeight: 175,
      health: 50,
      maxHealth: 50,
      bulletDamage: 10,
      imageElement: SHOOTER_IMAGE,
      
      hitBoxRatio: [
        { wRatio: 0.2,   hRatio: 0.771, oxRatio: 0.4,   oyRatio: 0.114 }, // المربع الرأسي الرئيسي (35/175, 135/175, 70/175, 20/175)
        { wRatio: 0.314, hRatio: 0.171, oxRatio: 0.085, oyRatio: 0.428 }, // الجناح الأيسر العريض (55/175, 30/175, 15/175, 75/175)
        { wRatio: 0.314, hRatio: 0.171, oxRatio: 0.6,   oyRatio: 0.428 }, // الجناح الأيمن العريض (55/175, 30/175, 105/175, 75/175)
      ],
    });

    const isMobile = config.canvas.logicalHeight < 500 || config.canvas.logicalWidth < 768;

    this.attackRange = isMobile ? 200 : 300;
    this.lastShoot = 0;
    this.shootDelay = 2000;
    this.imgBullet = SHOOTER_BULLET_IMAGE;
  }

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
