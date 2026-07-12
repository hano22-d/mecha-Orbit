export class Explosion {
  constructor(canvas, x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;

    this.life = 0;
    this.maxLife = 500;

    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    if (this.type === "player") {
      this.width = isMobile ? 150 : 300;
      this.height = isMobile ? 150 : 300;
    } else if (this.type === "xilosVex") {
      this.width = isMobile ? 240 : 400;
      this.height = isMobile ? 300 : 500;
    } else {
      this.width = isMobile ? 140 : 350; 
      this.height = isMobile ? 140 : 350;
    }

    this.offsetX = this.width / 2;
    this.offsetY = this.height / 2;

    // فريمات انفجار اللاعب
    this.frameEXplayer = [
     "/assets/explotionFrame/enemyExFrame/Explosion_1.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_2.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_3.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_4.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_5.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_6.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_7.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_8.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_9.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_10.png",
    ].map((src) => {
      let img = new Image();
      img.src = src;
      return img;
    });

    // فريمات انفجار الاعداء
    this.frameEXenemy = [
      "/assets/explotionFrame/enemyExFrame/Explosion_1.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_2.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_3.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_4.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_5.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_6.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_7.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_8.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_9.png",
      "/assets/explotionFrame/enemyExFrame/Explosion_10.png",
    ].map((src) => {
      let img = new Image();
      img.src = src;
      return img;
    });

    this.xilosFrame = [
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0005.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0007.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0009.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0011.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0013.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0015.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0017.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0019.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0020.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0022.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0024.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0026.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0028.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0030.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0032.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0034.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0036.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0038.png",
      "/assets/explotionFrame/xilosexplotionFrame/explosion1_0040.png",
    ].map((src) => {
      let img = new Image();
      img.src = src;
      return img;
    });

    // ادوات التحكم بفريمات الانفجارات
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameInterval = 150;
    this.finished = false;
  }

  update(deltaTime) {
    this.life += deltaTime;
    this.frameTimer += deltaTime;

    if (this.frameTimer > this.frameInterval) {
      this.currentFrame++;
      this.frameTimer = 0;
    }
    
    const currentFrameArray = this.type === "player" ? this.frameEXplayer : (this.type === "xilosVex" ? this.xilosFrame : this.frameEXenemy);
    if (this.currentFrame >= currentFrameArray.length) {
      this.finished = true;
    }
  }
  
  isDone() {
    return this.life > this.maxLife;
  }
}