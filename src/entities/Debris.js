import { assetsManager } from "../systems/AssetsManager";

export class Debris {
  static frames = [];
  static assetsLoaded = false;

  constructor(canvas, x, y) {
    this.x = x;
    this.y = y;

    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    this.width = isMobile ? 50 : 150;
    this.height = isMobile ? 50 : 150;

    // مركز الارتكاز لضمان خروج الشظايا من منتصف مكان الانفجار بدقة
    this.offsetX = this.width / 2;
    this.offsetY = this.height / 2;

    this.alpha = 1;

    //تحميل الصور
    Debris._preloadAssets();

    this.currentDebris = 0;
    this.debrisTimer = 0;
    this.debrisInterval = 100;
    this.finished = false;
  }

  // دالة لجلب الصور الجاهزة
  static _preloadAssets() {
    if (!Debris.assetsLoaded) {
      // جلب الصور من الذاكرة بناءً على مفاتيحها بترتيب الضرر التنازلي
      Debris.frames = [
        assetsManager.getImage("debris3"), // الأكثر تضرراً
        assetsManager.getImage("debris2"),
        assetsManager.getImage("debris1")  // الأقل تضرراً
      ];

      Debris.assetsLoaded = true;
    }
  }

  update(deltaTime) {
    this.debrisTimer += deltaTime;

    // تحديث فريم الشظية الحالي بناءً على الوقت المنقضي
    if (this.debrisTimer > this.debrisInterval) {
      this.currentDebris++;
      this.debrisTimer = 0;
    }

    // التحقق من انتهاء الفريمات باستخدام المصفوفة الساكنة للكلاس
    if (this.currentDebris >= Debris.frames.length) {
      this.finished = true;
    }

    // تأثير التلاشي التدريجي للشظايا لتأثير بصري احترافي
    this.alpha = Math.max(0, this.alpha - 0.02);
  }
}