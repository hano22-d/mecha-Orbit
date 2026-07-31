import { assetsManager } from "../systems/AssetsManager";
import { settingsManager } from "../systems/settingsManager";

export class Explosion {
  static enemyFrames = [];
  static playerFrames = [];
  static xilosFrames = [];
  static assetsLoaded = false;

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

    Explosion._preloadAssets();

    this.currentFrame = 0;
    this.frameTimer = 0;
    
    // 👈 2. تعديل زمن وسلوك الفريمات بناءً على الجودة
    const quality = settingsManager.getGraphicsQuality();
    if (quality === "low") {
      this.frameInterval = 60; // تسريع زمن نهاية الانفجار لتوفير الفريمات
      this.frameStep = 2;      // قفز فريمين كل مرة (توفير 50% من عمليات الرسم)
    } else if (quality === "medium") {
      this.frameInterval = 50; 
      this.frameStep = 1;
    } else {
      this.frameInterval = 40; // الجودة العالية: سلاسة كاملة
      this.frameStep = 1;
    }

    this.finished = false;
  }

  static _preloadAssets() {
    if (!Explosion.assetsLoaded) {
      Explosion.enemyFrames = Array.from({ length: 10 }, (_, i) => {
        return assetsManager.getImage(`explosion${i + 1}`);
      });

      Explosion.playerFrames = Explosion.enemyFrames; 

      Explosion.xilosFrames = Array.from({ length: 17 }, (_, i) => {
        const key = `explosionC${i + 1}`;
        return assetsManager.getImage(key);
      });

      Explosion.assetsLoaded = true;
    }
  }

  _getFramesCount() {
    if (this.type === "player") return Explosion.playerFrames.length;
    if (this.type === "xilosVex") return Explosion.xilosFrames.length;
    return Explosion.enemyFrames.length;
  }

  update(deltaTime) {
    this.life += deltaTime;
    this.frameTimer += deltaTime;

    // 👈 3. استخدام frameStep المخصص للجودة
    if (this.frameTimer > this.frameInterval) {
      this.currentFrame += this.frameStep; // القفز بناءً على الجودة (1 أو 2)
      this.frameTimer = 0;
    }
    
    if (this.currentFrame >= this._getFramesCount()) {
      this.finished = true;
    }
  }

  isDone() {
    return this.finished || this.life > this.maxLife;
  }
}