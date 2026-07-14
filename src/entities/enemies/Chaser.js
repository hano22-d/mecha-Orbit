import { assetsManager } from "../../systems/AssetsManager";
import { Enemy } from "./Enemy";


export class Chaser extends Enemy {
  constructor(config) {
    // config يحتوي بالفعل على الـ canvas والـ x والـ y الممررين من محرك اللعبة الرئيسي
    super({
      ...config,
      baseWidth: 125,
      baseHeight: 125,
      health: 30,
      maxHealth: 30,
      imageElement: assetsManager.getImage("enemyChaser"),
      bulletDamage: 10,
      
      hitBoxRatio: [
        { wRatio: 0.144, hRatio: 0.16, oxRatio: 0.44, oyRatio: 0.68 },  // رأس المثلث
        { wRatio: 0.48,  hRatio: 0.32, oxRatio: 0.28, oyRatio: 0.36 },  // منتصف الجسم
        { wRatio: 0.28,  hRatio: 0.20, oxRatio: 0.36, oyRatio: 0.16 }   // القاعدة والأجنحة
      ],
    });
  }

  update(time, deltaTime, game, camera) {
    let dx = game.player.x - this.x;
    let dy = game.player.y - this.y;
    let distance = Math.hypot(dx, dy);

    if (distance > 0) {
      this.x += (dx / distance) * this.speed * deltaTime;
      this.y += (dy / distance) * this.speed * deltaTime;
    }

    // استدعاء تحديث حركة الأب لتحديث نقاط الصناديق
    super.update(time, deltaTime, game, camera);
  }
}