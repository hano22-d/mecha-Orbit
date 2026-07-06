const ROCK_IMAGE = new Image();
ROCK_IMAGE.src = "/assets/rock2.png"; // تحميل الصورة مرة واحدة في الذاكرة العالمية

export class Rocks {
  constructor(canvas, x, y) {
    this.alive = true;
    this.x = x;
    this.y = y;

    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    const baseRandomWidth = Math.random() * 80 + 30;
    this.width = isMobile ? baseRandomWidth * 0.5 : baseRandomWidth;
    this.height = this.width;

    this.image = ROCK_IMAGE;
    
    const baseSpeed = 0.05;
    this.speed = isMobile ? baseSpeed * 0.75 : baseSpeed;
    
    this.damage = 10;
    this.angle = 0;

    this.rotationSpeed =
      (Math.random() * 0.001 + 0.001) * (Math.random() > 0.5 ? 1 : -1);

    const hitBoxWidth = this.width * 0.75;
    const hitBoxHeight = this.height * 0.75;

    const offsetX = (this.width - hitBoxWidth) / 2;
    const offsetY = (this.height - hitBoxHeight) / 2;

    this.hitBox = [
      {
        x: 0,
        y: 0,
        width: hitBoxWidth,
        height: hitBoxHeight,
        offsetX: offsetX,
        offsetY: offsetY,
      },
    ];
  }

  update(deltaTime) {
    this.y += this.speed * deltaTime;
    this.angle += this.rotationSpeed * deltaTime;

    for (let box of this.hitBox) {
      box.x = this.x + box.offsetX;
      box.y = this.y + box.offsetY;
    }
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    ctx.save();

    ctx.translate(
      this.x - camera.x + this.width / 2,
      this.y - camera.y + this.height / 2
    );
    ctx.rotate(this.angle);

    ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );

    ctx.restore();
  }
}