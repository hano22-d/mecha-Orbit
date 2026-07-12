//Bullet Class

const SCREEN_OFFBOUNDS_PADDING = 50; // مسافة امان للتاكد من خروج الرصاصة بالكامل من الشاشة قبل حذفها

export class Bullet {
  constructor({
    x,
    y,
    velocityX,
    velocityY,
    width,
    height,
    image,
    damage,
    angle = 0,
  }) {
    this.x = x;
    this.y = y;

    this.velocityX = velocityX;
    this.velocityY = velocityY;

    this.width = width;
    this.height = height;
    this.image = image;

    this.damage = damage;
    this.angle = angle; // تخزين زاوية ميلان الرصاصة
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
  }
  
  isOffScreen(canvas, camera) {
    const isTooFarLeft = this.x < camera.x - SCREEN_OFFBOUNDS_PADDING;
    const isTooFarRight =
      this.x > canvas.logicalWidth + camera.x + SCREEN_OFFBOUNDS_PADDING;
    const isTooFarTop = this.y < camera.y - SCREEN_OFFBOUNDS_PADDING;
    const isTooFarBottom =
      this.y > canvas.logicalHeight + camera.y + SCREEN_OFFBOUNDS_PADDING;

    return isTooFarLeft || isTooFarRight || isTooFarTop || isTooFarBottom;
  }
}
