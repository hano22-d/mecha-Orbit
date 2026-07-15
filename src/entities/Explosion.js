import { assetsManager } from "../systems/AssetsManager";

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

    // استدعاء دالة جلب الأصول المسرعة من الذاكرة
    Explosion._preloadAssets();

    // أدوات التحكم بالأنيميشن والفريمات
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameInterval = 40; // سرعة الانتقال بين الفريمات بالمللي ثانية
    this.finished = false;
  }

  // 🟢 دالة داخلية مطهرة بالكامل تجلب الأصول الجاهزة فوراً من الرام
  static _preloadAssets() {
    if (!Explosion.assetsLoaded) {
      
      // 1️⃣ جلب فريمات انفجار الأعداء العاديين (من 1 إلى 10)
      Explosion.enemyFrames = Array.from({ length: 10 }, (_, i) => {
        return assetsManager.getImage(`explosion${i + 1}`);
      });

      // توجيه مرجع اللاعب لنفس مصفوفة الأعداء لتوفير الذاكرة
      Explosion.playerFrames = Explosion.enemyFrames; 

      // 2️⃣ جلب فريمات انفجار الزعيم الضخم XilosVex (من 1 إلى 17)
      Explosion.xilosFrames = Array.from({ length: 17 }, (_, i) => {
        // معاملة خاصة للفريم الثاني بسبب تسمية المفتاح الشاذة لديك "explosionC"
        const key = `explosionC${i + 1}`;
        return assetsManager.getImage(key);
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