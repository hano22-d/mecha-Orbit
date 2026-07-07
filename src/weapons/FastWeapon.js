import { Weapon } from "./Weapon";
import { Bullet } from "../entities/Bullet";

export class FastWeapon extends Weapon {
  constructor(...arg) {
    super(...arg);
    this.image = new Image();
    this.image.src = "/assets/weapon/laserGreen13.png";
  }

  shoot(bullets, canvas) {
    // زاوية ميلان اللاعب
    let angle = this.owner.currentAngle || 0;
    const fireAngle = angle * 2.5;

    // زاوية الرصاصة الديناميكية
    const bulletSpeed = 12;
    const velocityX = bulletSpeed * Math.sin(fireAngle);
    const velocityY = -bulletSpeed * Math.cos(fireAngle);

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const centerX = this.owner.x;
    const centerY = this.owner.y;

    const localX = this.owner.width / 2 - this.owner.width / 12;
    const localY = -(this.owner.height / 10);

    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    const bulletW = isMobile ? 2.5 : 5;
    const bulletH = isMobile ? 7.5 : 15;

    const bulletCenterOffset = bulletW / 2;

    const spawnX = centerX + (localX * cos - localY * sin) - bulletCenterOffset;
    const spawnY = centerY + (localX * sin + localY * cos);

    bullets.push(
      new Bullet({
        x: spawnX,
        y: spawnY,
        velocityX: velocityX,
        velocityY: velocityY,
        width: bulletW,
        height: bulletH,
        image: this.image,
        damage: 5,
        angle: fireAngle,
      })
    );
  }
}