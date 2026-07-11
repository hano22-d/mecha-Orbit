export class PowerUp {
  constructor(canvas, x, y, baseWidth = 30, baseHeight = 30, speed = 1) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.speed = speed;


    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    this.width = isMobile ? baseWidth * 0.5 : baseWidth;
    this.height = isMobile ? baseHeight * 0.5 : baseHeight;

    this.hitBox = [
      { x: 0, y: 0, width: this.width, height: this.height, offsetX: 0, offsetY: 0 }
    ];
  }

  update() {
    this.y += this.speed;

    for (let box of this.hitBox) {
      box.x = this.x + box.offsetX;
      box.y = this.y + box.offsetY;
    }
  }
/*
  draw(ctx, camera) {
    if (!this.alive) return;
    if (this.image) {
      ctx.drawImage(
        this.image,
        this.x - camera.x,
        this.y - camera.y,
        this.width,
        this.height
      );
    }
  } */

  isOffScreen(canvas, camera) {
    const padding = 50;
    return (
      this.x < camera.x - padding ||
      this.x > canvas.logicalWidth + camera.x + padding ||
      this.y < camera.y - padding ||
      this.y > camera.y + canvas.logicalHeight + padding
    );
  } 
}