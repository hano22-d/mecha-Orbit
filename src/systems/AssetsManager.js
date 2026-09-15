export class AssetsManager {
  constructor() {
    this.images = {}; // تخزين كائنات الصور الجاهزة
    this.sounds = {}; // تخزين كائنات الأصوات الجاهزة

    this.totalAssets = 0; // إجمالي الملفات المطلوب تحميلها
    this.loadedAssets = 0; // عدد الملفات التي تحمّلت بنجاح

    this.onProgressCallback = null; // دالة نرسل عبرها النسبة المئوية لشاشة الـ CSS
    this.onCompleteCallback = null; // دالة نخبر بها اللعبة أن التحميل انتهى تماماً
  }

  /* =============================
     دالة التصفير لمنع تراكم أو تضارب الأصول
     ============================= */
  reset() {
    this.images = {};
    this.sounds = {};
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.onProgressCallback = null;
    this.onCompleteCallback = null;
  }

  /* ===============================
      دالة تسجيل مسارات الصور قبل بدء التحميل
     =============================== */
  queueImage(key, src) {
    this.images[key] = { src: src, item: null };
    this.totalAssets++;
  }
  
  /* ==============================
     دالة تسجيل مسارات الأصوات قبل بدء التحميل
     ============================== */
  queueSound(key, src) {
    this.sounds[key] = { src: src, item: null };
    this.totalAssets++;
  }

  /* =================
      دالة بدء عملية التحميل 
     ================= */
  startLoading(onProgress, onComplete) {
    this.onProgressCallback = onProgress;
    this.onCompleteCallback = onComplete;

    // إنهاء التحميل في حال عدم وجود أصول
    if (this.totalAssets === 0) {
      this._checkCompletion();
      return;
    }

    // بدء تحميل الصور المسجلة
    for (let key in this.images) {
      const imgObj = this.images[key];
      imgObj.item = new Image();

      imgObj.item.onload = () => {
        imgObj.item.onload = null; // منع استدعاء الحدث مرة أخرى
        imgObj.item.onerror = null;
        this._assetLoaded();
      };

      imgObj.item.onerror = () => {
        imgObj.item.onload = null;
        imgObj.item.onerror = null;
        this._assetLoadError(key, imgObj.src);
      };

      imgObj.item.src = imgObj.src;
    }

    // بدء تحميل الأصوات المسجلة
    for (let key in this.sounds) {
      const soundObj = this.sounds[key];
      soundObj.item = new Audio();

      soundObj.item.oncanplaythrough = () => {
        soundObj.item.oncanplaythrough = null; // إفراغ المستمع فور الاستدعاء الأول
        soundObj.item.onerror = null;
        this._assetLoaded();
      };

      soundObj.item.onerror = () => {
        soundObj.item.oncanplaythrough = null;
        soundObj.item.onerror = null;
        this._assetLoadError(key, soundObj.src);
      };

      soundObj.item.src = soundObj.src;
      soundObj.item.load(); // أمر إجباري لبعض المتصفحات لبدء التحميل
    }
  }

  /* ================
      دالة نجاح تحميل ملف
     ================ */
  _assetLoaded() {
    this.loadedAssets++;

    // حساب النسبة المئوية
    const calculatedPercentage = Math.round(
      (this.loadedAssets / this.totalAssets) * 100
    );
    const progressPercentage = Math.min(100, Math.max(0, calculatedPercentage));

    // إرسال النسبة الحالية لدالة التحديث
    if (this.onProgressCallback) {
      this.onProgressCallback(progressPercentage);
    }

    this._checkCompletion();
  }

  /* ===============
     دالة فشل تحميل ملف
     =============== */
  _assetLoadError(key, src) {
    console.error(
      `🚨 خطأ هندسي: فشل تحميل الملف البرمجي [${key}] من المسار: ${src}`
    );
    this._assetLoaded();
  }

  /* ==========================
     دالة التحقق من اكتمال تحميل الأصول
     ========================== */
  _checkCompletion() {
    const completionRate = this.loadedAssets / this.totalAssets;

    if (this.loadedAssets >= this.totalAssets || completionRate >= 0.98) {
      if (this.onCompleteCallback) {
        const callback = this.onCompleteCallback;
        this.onCompleteCallback = null;

        setTimeout(() => {
          callback();
        }, 200);
      }
    }
  }

  /* ==================================
     دالتي جلب الأصول الجاهزة بعد التحميل لاستخدامها
     =================================== */
  getImage(key) {
    return this.images[key]?.item || null;
  }

  getSound(key) {
    return this.sounds[key]?.item || null;
  }
}

export const assetsManager = new AssetsManager();
