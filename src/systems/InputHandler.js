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
  
  _handleAllTouches(e) {
    e.preventDefault();

    if (!this.touchButtons || this.touchButtons.length === 0) return;

    const base = this.touchButtons.find(btn => btn.type === 'JOY_BASE');
    const knob = this.touchButtons.find(btn => btn.type === 'JOY_KNOB');

    // ⚡ التعديل الهام: نصفر الأزرار التي سنقوم بفحصها حالاً فقط لكي نترك أحداث اللمس الحية تعيد تفعيلها
    this.keys.space = false;
    this.keys.missileKey = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.up = false;
    this.keys.down = false;

    // 🔥 نقوم بتصفير حالة الضغط بشكل مبدئي، وإذا كان الإصبع ما زال فوق الزر، سيعاد تفعيله في الحلقة بالأسفل فوراً
    this.touchButtons.forEach(btn => btn.isPressed = false);

    let joystickTouched = false;

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const rect = this.myCanvas.getBoundingClientRect();
      
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      // فحص أزرار القتال
      this.touchButtons.forEach(button => {
        if (button.type === 'SHOOT' || button.type === 'MISSILE') {
          // دالة checkTouch ستقوم بتفعيل isPressed = true إذا كان الإصبع موجوداً
          if (button.checkTouch(touchX, touchY)) {
            if (button.type === 'SHOOT')   this.keys.space = true;
            if (button.type === 'MISSILE') this.keys.missileKey = true;
          }
        }
      });

      // منطق الجويستيك
      if (base && knob) {
        const dx = touchX - base.startX;
        const dy = touchY - base.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < base.radius * 1.5) {
          joystickTouched = true;
          base.isPressed = true;
          knob.isPressed = true;

          const angle = Math.atan2(dy, dx);
          const maxLimit = base.radius; 
          const currentLimit = Math.min(distance, maxLimit);

          knob.x = base.startX + Math.cos(angle) * currentLimit;
          knob.y = base.startY + Math.sin(angle) * currentLimit;

          if (distance > 15) {
            if (dx > 20)  this.keys.right = true;
            if (dx < -20) this.keys.left = true;
            if (dy > 20)  this.keys.down = true;
            if (dy < -20) this.keys.up = true;
          }
        }
      }
    }

    // إذا لم يلمس أحد الجويستيك، نعيد المقبض للمركز ونلغي ضغطه
    if (!joystickTouched && base && knob) {
      knob.x = base.startX;
      knob.y = base.startY;
      base.isPressed = false;
      knob.isPressed = false;
    }

    // شبكة الأمان عند رفع كل الأصابع تماماً من الشاشة
    if (e.touches.length === 0) {
      this.touchButtons.forEach(btn => btn.isPressed = false);
      if (knob && base) {
        knob.x = base.startX;
        knob.y = base.startY;
      }
    }
  }
}