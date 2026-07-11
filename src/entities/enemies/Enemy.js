const HEALTH_BAR_HEIGHT = 5;
const NORMAL_ENEMY_IMAGE = new Image();
NORMAL_ENEMY_IMAGE.src =
  "/assets/Default_Prompt_Flat_2D_topdown_perspective_game_asset_sprite_t_0_5ab76d0e-5f0d-455b-9aa6-9119708664e9_0.png";

export class Enemy {
  constructor({
    canvas,
    type,
    x,
    y,
    baseWidth,
    baseHeight,
    color,
    speed,
    health,
    maxHealth,
    imageElement,
    bulletDamage,
    hitBoxRatio = null,
  }) {
    this.alive = true;
    this.type = type;
    this.x = x;
    this.y = y;

    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;


    this.width = isMobile ? baseWidth * 0.52 : baseWidth;
    this.height = isMobile ? baseHeight * 0.52 : baseHeight;

    if (hitBoxRatio) {
      this.hitBox = hitBoxRatio.map((ratio) => ({
        x: 0,
        y: 0,
        width: this.width * ratio.wRatio,
        height: this.height * ratio.hRatio,
        offsetX: this.width * ratio.oxRatio,
        offsetY: this.height * ratio.oyRatio,
      }));
    } else {
      this.hitBox = [
        {
          width: this.width * 0.3,
          height: this.height * 0.45,
          offsetX: this.width * 0.47,
          offsetY: this.height * 0.4,
        },
      ];
    }

    this.color = color;
    this.speed = isMobile ? speed * 0.7 : speed;
    this.health = health;
    this.maxHealth = maxHealth;
    this.hit = false;
    this.image = imageElement || NORMAL_ENEMY_IMAGE;
    this.damage = 20;
    this.bulletDamage = bulletDamage;
  }

  update(time, deltaTime, game, camera) {
    this.y += this.speed * deltaTime;
    for (let box of this.hitBox) {
      box.x = this.x + box.offsetX;
      box.y = this.y + box.offsetY;
    }
  }
/*
  draw(ctx, camera) {
    if (!this.alive) return;
    this._drawHealthBar(ctx, camera);
    ctx.save();
    if (this.hit) {
      ctx.globalAlpha = 0.3 + Math.abs(Math.sin(Date.now() * 0.04)) * 0.5;
    }
    if (this.image) {
      ctx.drawImage(
        this.image,
        this.x - camera.x,
        this.y - camera.y,
        this.width,
        this.height
      );
    }
    ctx.restore();
  } */

  drawHealthBar(ctx, camera) {
    if (this.health >= this.maxHealth) return;
    const healthRate = Math.max(0, this.health / this.maxHealth);
    let barColor =
      healthRate > 0.5 ? "#00ff9d" : healthRate > 0.2 ? "#ffb700" : "#ff3b3b";
    const barWidth = this.width * 0.6;
    const barX = this.x + (this.width - barWidth) / 2 - camera.x;
    const barY = this.y - camera.y - 10;
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth * healthRate, HEALTH_BAR_HEIGHT);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(barX, barY, barWidth, HEALTH_BAR_HEIGHT);
  }

  isOffScreen(canvas, camera) {
    let padding = 100;
    return (
      this.x < camera.x - (this.width + padding) ||
      this.x > canvas.logicalWidth + camera.x + padding ||
      this.y < camera.y - (this.height + padding) ||
      this.y > camera.y + canvas.logicalHeight + padding
    );
  }
}
