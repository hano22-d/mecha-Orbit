export class InputsHandle {
  // نقوم بتمرير الكانفاس ومصفوفة الأزرار لكي نتمكن من فحص اللمس بداخلهم
  constructor(myCanvas, touchButtons) {
    this.myCanvas = myCanvas;
    this.touchButtons = touchButtons;

    // 🕹️ كائن الحالة الموحد: المحرك يقرأ من هنا فقط!
    this.keys = {
      right: false,
      left: false,
      up: false,
      down: false,
      space: false,
      missileKey: false
    };

    // 🎹 1. تفعيل أحداث الكيبورد (كما هي لديك)
    this._setupKeyboardEvents();

    // 📱 2. تفعيل أحداث اللمس للموبايل
    if (this.myCanvas) {
      this._setupTouchEvents();
    }
  }

  // ==========================================
  // 🎹 قسم الكيبورد (مغلف داخل دالة خاصة لنظافة الكود)
  // ==========================================
  _setupKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", " "].includes(e.key) || e.code === "Space") {
        e.preventDefault();
      }
      if (e.key === "ArrowRight") this.keys.right = true;
      if (e.key === "ArrowLeft") this.keys.left = true;
      if (e.key === "ArrowUp") this.keys.up = true;
      if (e.key === "ArrowDown") this.keys.down = true;
      if (e.code === "Space") this.keys.space = true;
      if (e.key === "q" || e.key === "Q") this.keys.missileKey = true;
    });

    window.addEventListener("keyup", (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key) || e.code === "Space") {
        e.preventDefault();
      }
      if (e.key === "ArrowRight") this.keys.right = false;
      if (e.key === "ArrowLeft") this.keys.left = false;
      if (e.key === "ArrowUp") this.keys.up = false;
      if (e.key === "ArrowDown") this.keys.down = false;
      if (e.code === "Space") this.keys.space = false;
      if (e.key === "q" || e.key === "Q") this.keys.missileKey = false;
    });
  }

  // ==========================================
  // 📱 قسم اللمس للموبايل (يربط الأزرار بـ this.keys)
  // ==========================================
  _setupTouchEvents() {
    this.myCanvas.addEventListener('touchstart', (e) => this._handleAllTouches(e), { passive: false });
    this.myCanvas.addEventListener('touchmove', (e) => this._handleAllTouches(e), { passive: false });
    this.myCanvas.addEventListener('touchend', (e) => this._handleAllTouches(e), { passive: false });
  }

  // دالة موحدة ومحترفة لمعالجة كافة الأصابع وتحديث الحالات
  _handleAllTouches(e) {
    e.preventDefault();

    // 1. تصفير حالات الضغط البصري لجميع الأزرار لإعادة فحصها
    this.touchButtons.forEach(btn => btn.isPressed = false);

    // 2. تصفير حالات أزرار القتال في الـ keys (الحركة عبر الجويستيك سنبرمجها في الخطوة القادمة)
    this.keys.space = false;
    this.keys.missileKey = false;

    // 3. مسح وفحص جميع الأصابع الموجودة على الشاشة حالياً
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const rect = this.myCanvas.getBoundingClientRect();
      
      // حساب الإحداثيات بالنسبة للكانفاس المنطقي
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      // فحص كل زر، وإذا تم لمسه نقوم بتحديث كائن الـ keys الموحد فوراً!
      this.touchButtons.forEach(button => {
        if (button.checkTouch(touchX, touchY)) {
          if (button.type === 'SHOOT')   this.keys.space = true;
          if (button.type === 'MISSILE') this.keys.missileKey = true;
          
          // ملاحظة: أزرار الجويستيك (JOY_BASE و JOY_KNOB) سنتعامل معها رياضياً في الخطوة التالية لحساب الاتجاهات بدقة
        }
      });
    }

    // 4. أمان: إذا رفعت كل الأصابع، نضمن إيقاف كل شيء
    if (e.touches.length === 0) {
      this.touchButtons.forEach(btn => btn.isPressed = false);
      this.keys.space = false;
      this.keys.missileKey = false;
    }
  }
}