export class AssetsManager {
  constructor() {
    this.images = {}; // لتخزين كائنات الصور الجاهزة
    this.sounds = {}; // لتخزين كائنات الأصوات الجاهزة

    this.totalAssets = 0; // إجمالي الملفات المطلوب تحميلها
    this.loadedAssets = 0; // عدد الملفات التي تحمّلت بنجاح

    this.onProgressCallback = null; // دالة نرسل عبرها النسبة المئوية لشاشة الـ CSS
    this.onCompleteCallback = null; // دالة نخبر بها اللعبة أن التحميل انتهى تماماً
  }

  // 1️⃣ دالة لتسجيل المسارات قبل بدء التحميل
  queueImage(key, src) {
    this.images[key] = { src: src, item: null };
    this.totalAssets++;
  }

  queueSound(key, src) {
    this.sounds[key] = { src: src, item: null };
    this.totalAssets++;
  }

  // 2️⃣ دالة انطلاق عملية التحميل الفعلي لجميع الملفات في الخلفية
  startLoading(onProgress, onComplete) {
    this.onProgressCallback = onProgress;
    this.onCompleteCallback = onComplete;

    // إذا لم يكن هناك ملفات أصلاً، ننهي التحميل فوراً بأمان
    if (this.totalAssets === 0) {
      this._checkCompletion();
      return;
    }

    // بدء تحميل الصور المسجلة
    for (let key in this.images) {
      const imgObj = this.images[key];
      imgObj.item = new Image();

      imgObj.item.onload = () => {
        imgObj.item.onload = null; // 🟢 تطهير: منع استدعاء الحدث مرة أخرى
        imgObj.item.onerror = null;
        this._assetLoaded();
      };

      imgObj.item.onerror = () => {
        imgObj.item.onload = null;
        imgObj.item.onerror = null;
        this._assetLoadError(key, imgObj.src);
      };

      imgObj.item.src = imgObj.src; // هنا يبدأ المتصفح بالتحميل الفعلي
    }

    // بدء تحميل الأصوات المسجلة
    for (let key in this.sounds) {
      const soundObj = this.sounds[key];
      soundObj.item = new Audio();

      // 🟢 تصفية فخ الـ oncanplaythrough المتكرر
      soundObj.item.oncanplaythrough = () => {
        soundObj.item.oncanplaythrough = null; // 🟢 تطهير جذري: إفراغ المستمع فور الاستدعاء الأول
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

  // 3️⃣ دالة داخلية تُستدعى فور نجاح تحميل أي ملف
  _assetLoaded() {
    this.loadedAssets++;

    // حساب النسبة المئوية بدقة منطقية مع ضمان عدم تخطيها 100% كحماية إضافية
    const calculatedPercentage = Math.round(
      (this.loadedAssets / this.totalAssets) * 100
    );
    const progressPercentage = Math.min(100, Math.max(0, calculatedPercentage));

    // إرسال النسبة الحالية لدالة التحديث (شاشة الـ CSS)
    if (this.onProgressCallback) {
      this.onProgressCallback(progressPercentage);
    }

    this._checkCompletion();
  }

  // دالة الطوارئ في حال فشل تحميل ملف (تمنع تعليق شاشة التحميل)
  _assetLoadError(key, src) {
    console.error(
      `🚨 خطأ هندسي: فشل تحميل الملف البرمجي [${key}] من المسار: ${src}`
    );
    this._assetLoaded();
  }

  // التحقق من وصول نسبة التحميل إلى مرحلة النهاية الآمنة
  _checkCompletion() {
    // 🟢 حل وقائي: إذا وصلنا لـ 98% أو أعلى، نعتبر اللعبة جاهزة لتجنب قيود المتصفح على الأصوات
    const completionRate = this.loadedAssets / this.totalAssets;

    if (this.loadedAssets >= this.totalAssets || completionRate >= 0.98) {
      if (this.onCompleteCallback) {
        // فك الارتباط لضمان عدم تكرار الاستدعاء
        const callback = this.onCompleteCallback;
        this.onCompleteCallback = null;

        // ننتظر لمحة بصرية بسيطة (200 مللي ثانية) لضمان اكتمال حركة الـ Progress Bar بصرياً أمام اللاعب
        setTimeout(() => {
          callback();
        }, 200);
      }
    }
  }

  // 4️⃣ دالات جلب الأصول الجاهزة لاستخدامها داخل الكلاسات لاحقاً
  getImage(key) {
    return this.images[key]?.item || null;
  }

  getSound(key) {
    return this.sounds[key]?.item || null;
  }
}

// تصدير نسخة موحدة وجاهزة للاستخدام في كل ملفات المشروع (Singleton Pattern)
export const assetsManager = new AssetsManager();
