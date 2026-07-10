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

    // 1️⃣ تأمين المرجع الحي للمصفوفة: نضمن أننا نقرأ الأزرار النشطة دائماً في اللعبة
    // إذا كنت مخزن كلاس المدخلات داخل كلاس اللعبة، سنضمن الوصول للمصفوفة الحية
    if (!this.touchButtons || this.touchButtons.length === 0) return;


    // 2️⃣ حساب الـ DPR الحقيقي للشاشة لحل مشكلة الفجوة البكسلية
    const dpr = window.devicePixelRatio || 1;

    // تصفير الحالات مؤقتاً للأمان
    this.touchButtons.forEach(btn => btn.isPressed = false);
    this.keys.space = false;
    this.keys.missileKey = false;

    // 3️⃣ مسح الأصابع وتحويل إحداثياتها بدقة هندسية
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const rect = this.myCanvas.getBoundingClientRect();
      
      // 📐 الحل العبقري: نطرح الحواف ثم نضرب بالـ dpr لكي تتطابق نقطة إصبعك مع نقطة الرسم الحقيقية!
      const touchX = (touch.clientX - rect.left) * dpr;
      const touchY = (touch.clientY - rect.top) * dpr;

      // فحص الأزرار
      this.touchButtons.forEach(button => {
        if (button.checkTouch(touchX, touchY)) {
          if (button.type === 'SHOOT')   this.keys.space = true;
          if (button.type === 'MISSILE') this.keys.missileKey = true;
        }
      });
    }

    // 4️⃣ شبكة الأمان عند رفع كل الأصابع
    if (e.touches.length === 0) {
      this.touchButtons.forEach(btn => btn.isPressed = false);
      this.keys.space = false;
      this.keys.missileKey = false;
    }
  }
}