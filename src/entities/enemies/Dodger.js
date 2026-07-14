import { assetsManager } from "../../systems/AssetsManager";
import { Enemy } from "./Enemy";



export class Dodger extends Enemy {
  constructor(config) {
    super({
      ...config,
      baseWidth: 170,
      baseHeight: 170,
      health: 20,
      maxHealth: 20,
      imageElement: assetsManager.getImage("enemyDodger"),
      bulletDamage: 10,
      
      hitBoxRatio: [
        { wRatio: 0.176, hRatio: 0.676, oxRatio: 0.411, oyRatio: 0.176 }, // المربع الرأسي الطويل (30/170, 115/170, 70/170, 30/170)
        { wRatio: 0.235, hRatio: 0.147, oxRatio: 0.176, oyRatio: 0.411 }, // الجناح الأيسر (40/170, 25/170, 30/170, 70/170)
        { wRatio: 0.235, hRatio: 0.147, oxRatio: 0.588, oyRatio: 0.411 }, // الجناح الأيمن (40/170, 25/170, 100/170, 70/170)
      ]
    });
    
    this.attackRange = 150;
    this.dodgeDirection = null;

    const isMobile = config.canvas.logicalHeight < 500 || config.canvas.logicalWidth < 768;
    this.powerDisplacement = isMobile ? 1.5 : 3
    
  }

  update(time, deltaTime, game, camera) {
    let closestBullet = null;
    let minDistance = Infinity;

    //حساب مركز العدو الحقيقي (نقطة المنتصف بين أطراف الـ hitBox)
    const enemyCenterX = this.x + this.width / 2;

    for (let i = 0; i < game.bullets.length; i++) {
      let dy = game.bullets[i].y - this.y;
      let dx = game.bullets[i].x - enemyCenterX;
      const distance = Math.hypot(dx, dy);

      if (distance < minDistance) {
        minDistance = distance;
        closestBullet = game.bullets[i];
      }
    }

    if (closestBullet && minDistance < this.attackRange) {
      if (closestBullet.x < enemyCenterX) {
        this.dodgeDirection = 1;
      } else {
        this.dodgeDirection = -1;
      }

      this.x += this.speed * this.powerDisplacement * this.dodgeDirection * deltaTime;
      this.y += this.speed * 1 * deltaTime;
    }
    super.update(time, deltaTime, game, camera);
  }
}
