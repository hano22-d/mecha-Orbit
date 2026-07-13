export class Debris {
  // 💾 ذاكرة ساكنة لحفظ مصفوفة الصور لمرة واحدة فقط ومنع التكرار والـ Lag
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

    // تحميل الصور بشكل ساكن وآمن
    this._preloadAssets();

    this.currentDebris = 0;
    this.debrisTimer = 0;
    this.debrisInterval = 100;
    this.finished = false;
  }

  // دالة داخلية لشحن الصور داخل الـ Static Scope لمرة واحدة
  _preloadAssets() {
    if (!Debris.assetsLoaded) {
      const debrisSources = [
        "/assets/playerShip1_damage3.png",
        "/assets/playerShip1_damage2.png",
        "/assets/playerShip1_damage1.png",
      ];

      Debris.frames = debrisSources.map((src) => {
        const img = new Image();
        img.src = src;
        return img;
      });

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

    // تأثير التلاشي التدريجي (Fade Out) للشظايا لتأثير بصري احترافي
    this.alpha = Math.max(0, this.alpha - 0.02);
  }
}
