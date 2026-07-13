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

    // تحديد الأبعاد منطقياً بناءً على نوع الانفجار ونوع الجهاز
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

    // نقطة الارتكاز المركزية (نصف العرض والارتفاع) ليتم الرسم في المنتصف تماماً
    this.offsetX = this.width / 2;
    this.offsetY = this.height / 2;

    // استدعاء دالة التحميل المسبق للأصول
    this._preloadAssets();

    // أدوات التحكم بالأنيميشن والفريمات
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameInterval = 40; // سرعة الانتقال بين الفريمات بالمللي ثانية
    this.finished = false;
  }

  // دالة داخلية مقفلة لتحميل الصور في الذاكرة الساكنة لمنع تسريب الذاكرة (Memory Leaks)
  _preloadAssets() {
    if (!Explosion.assetsLoaded) {
      const commonExplosionPaths = Array.from({ length: 10 }, (_, i) => 
        `/assets/explotionFrame/enemyExFrame/Explosion_${i + 1}.png`
      );

      Explosion.enemyFrames = commonExplosionPaths.map((src) => {
        const img = new Image();
        img.src = src;
        return img;
      });

      // توجيه مرجع اللاعب لنفس مصفوفة الأعداء لأن الصور متطابقة تماماً
      Explosion.playerFrames = Explosion.enemyFrames; 

      // 2. فريمات انفجار الزعيم الضخم XilosVex
      const xilosPaths = [
        "0005", "0007", "0009", "0013", "0017", "0019", "0022", "0026", "0028", "0032", "0036", "0040"
      ];

      Explosion.xilosFrames = xilosPaths.map((num) => {
        const img = new Image();
        img.src = `/assets/explotionFrame/xilosexplotionFrame/explosion1_${num}.png`;
        return img;
      });

      Explosion.assetsLoaded = true;
    }
  }

  // دالة جلب طول المصفوفة الحالية لمعرفة متى ينتهي الأنيميشن
  _getFramesCount() {
    if (this.type === "player") return Explosion.playerFrames.length;
    if (this.type === "xilosVex") return Explosion.xilosFrames.length;
    return Explosion.enemyFrames.length;
  }

  update(deltaTime) {
    this.life += deltaTime;
    this.frameTimer += deltaTime;

    // تحديث الفريم الحالي بناءً على الوقت المنقضي
    if (this.frameTimer > this.frameInterval) {
      this.currentFrame++;
      this.frameTimer = 0;
    }
    
    // التحقق من انتهاء جميع الفريمات لإيقاف الرسم وتدمير الكائن
    if (this.currentFrame >= this._getFramesCount()) {
      this.finished = true;
    }
  }

  isDone() {
    return this.finished || this.life > this.maxLife;
  }
}