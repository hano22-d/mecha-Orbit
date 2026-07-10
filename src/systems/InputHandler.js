export class InputsHandle {
  constructor(myCanvas, touchButtons) {
    this.myCanvas = myCanvas;
    this.touchButtons = touchButtons;

    this.keys = {
      right: false,
      left: false,
      up: false,
      down: false,
      space: false,
      missileKey: false,
    };

    // تفعيل أحداث الكيبورد
    this._setupKeyboardEvents();

    // تفعيل أحداث اللمس للموبايل
    if (this.myCanvas) {
      this._setupTouchEvents();
    }
  }

  // ==========================================
  // قسم الكيبورد
  // ==========================================
  _setupKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      if (
        ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", " "].includes(
          e.key
        ) ||
        e.code === "Space"
      ) {
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
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
          e.key
        ) ||
        e.code === "Space"
      ) {
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
  // قسم اللمس للموبايل
  // ==========================================
  _setupTouchEvents() {
    this.myCanvas.addEventListener(
      "touchstart",
      (e) => this._handleAllTouches(e),
      { passive: false }
    );
    this.myCanvas.addEventListener(
      "touchmove",
      (e) => this._handleAllTouches(e),
      { passive: false }
    );
    this.myCanvas.addEventListener(
      "touchend",
      (e) => this._handleAllTouches(e),
      { passive: false }
    );
  }

  _handleAllTouches(e) {
    e.preventDefault();

    if (!this.touchButtons || this.touchButtons.length === 0) return;

    // العثور على كائنات الجويستيك داخل المصفوفة للتحكم بهما بشكل خاص
    const base = this.touchButtons.find((btn) => btn.type === "JOY_BASE");
    const knob = this.touchButtons.find((btn) => btn.type === "JOY_KNOB");

    // تصفير الحالات الرقمية (أزرار القتال والاتجاهات اللمسية) قبل إعادة الفحص
    this.touchButtons.forEach((btn) => (btn.isPressed = false));
    this.keys.space = false;
    this.keys.missileKey = false;

    // تصفير اتجاهات الجويستيك مؤقتاً لكي لا تستمر الطائرة بالتحرك إذا رفع اللاعب إصبعه
    this.keys.left = false;
    this.keys.right = false;
    this.keys.up = false;
    this.keys.down = false;

    let joystickTouched = false;

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const rect = this.myCanvas.getBoundingClientRect();

      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      this.touchButtons.forEach((button) => {
        if (button.type === "SHOOT" || button.type === "MISSILE") {
          if (button.checkTouch(touchX, touchY)) {
            if (button.type === "SHOOT") this.keys.space = true;
            if (button.type === "MISSILE") this.keys.missileKey = true;
          }
        }
      });

      // منطق الجويستيك
      if (base && knob) {
        // حساب الفارق الرياضي بين موقع إصبع اللاعب ومركز قاعدة الجويستيك الثابتة
        const dx = touchX - base.startX;
        const dy = touchY - base.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < base.radius * 1.5) {
          joystickTouched = true;
          base.isPressed = true;
          knob.isPressed = true;

          // حساب زاوية السحب بالراديان
          const angle = Math.atan2(dy, dx);

          // تحديد الحد الأقصى لحركة المقبض البصرية (نصف قطر القاعدة)
          const maxLimit = base.radius * 0.5;
          const currentLimit = Math.min(distance, maxLimit);

          knob.x = base.startX + Math.cos(angle) * currentLimit;
          knob.y = base.startY + Math.sin(angle) * currentLimit - 5;

          if (distance > 15) {
            // ال15 تمثل ادنى مسافة يجب ان يبتعد فيها المقبض عن القاعدة حتى تتم الاستجابة
            if (dx > 20) this.keys.right = true;
            if (dx < -20) this.keys.left = true;
            if (dy > 20) this.keys.down = true;
            if (dy < -20) this.keys.up = true;
          }
        }
      }
    }

    if (!joystickTouched && base && knob) {
      knob.x = base.startX;
      knob.y = base.startY;
    }

    // شبكة الأمان الكلية عند خلو الشاشة تماماً
    if (e.touches.length === 0) {
      this.touchButtons.forEach((btn) => (btn.isPressed = false));
      if (knob && base) {
        knob.x = base.startX;
        knob.y = base.startY;
      }
    }
  }
}
