export class Debris {
  constructor(canvas, x, y) {
    this.x = x;
    this.y = y;
    
    const isMobile = canvas.height < 500 || canvas.width < 768;
    this.width = isMobile ? 25 : 100;
    this.height = isMobile ? 25 : 100;

    this.offsetX = this.width / 2;
    this.offsetY = this.height / 2;

    this.alpha = 1;
    this.debrisFrame = [
      "src/assets/playerShip1_damage3.png",
      "src/assets/playerShip1_damage2.png",
      "src/assets/playerShip1_damage1.png",
    ].map((src) => {
      let img = new Image();
      img.src = src;
      return img;
    });

    this.currentDebris = 0;
    this.debrisTimer = 0;
    this.debrisInterval = 100;
    this.finished = false;
  }

  update(deltaTime) {
    this.debrisTimer += deltaTime;

    if (this.debrisTimer > this.debrisInterval) {
      this.currentDebris++;
      this.debrisTimer = 0;
    }
    if (this.currentDebris >= this.debrisFrame.length) {
      this.finished = true;
    }

    this.alpha = Math.max(0, this.alpha - 0.02);
  }

  draw(ctx, camera) {
    if (this.finished) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    let frame = this.debrisFrame[this.currentDebris];

    const renderX = this.x - camera.x - this.offsetX;
    const renderY = this.y - camera.y - this.offsetY;

    if (frame) {
      ctx.drawImage(frame, renderX, renderY, this.width, this.height);
    }
    
    ctx.restore();
  }
}