// SettingsManager.js - مدير الإعدادات المركزية
class SettingsManager {
    constructor() {
      // المفتاح الذي سنحفظ به الإعدادات في ذاكرة المتصفح
      this.STORAGE_KEY = "mecha_orbit_settings";
  
      // الإعدادات الافتراضية للمرحلة الأولى (FPS والجرافيكس)
      this.settings = {
        fpsLimit: 60, // الخيارات: 30, 60, 120, أو 'unlimited'
        graphicsQuality: "high", // الخيارات: 'low', 'medium', 'high'
      };
  
      // تحميل الإعدادات المحفوظة إن وجدت فور إنشاء الكائن
      this.loadSettings();
    }
  
    // 1️⃣ دالة تحميل الإعدادات من ذاكرة المتصفح
    loadSettings() {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // دمج الإعدادات المحفوظة مع الافتراضية للأمان
          this.settings = { ...this.settings, ...parsed };
        }
      } catch (e) {
        console.warn("فشل قراءة الإعدادات من LocalStorage، تم استخدام الإعدادات الافتراضية.", e);
      }
    }
  
    // 2️⃣ دالة حفظ الإعدادات في ذاكرة المتصفح
    saveSettings() {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
      } catch (e) {
        console.warn("فشل حفظ الإعدادات في LocalStorage.", e);
      }
    }
  
    // -------------------------------------------------------------
    // 🎯 دوال الإطارات (FPS Limiter Controls)
    // -------------------------------------------------------------
  
    setFpsLimit(fps) {
      // التأكد من أن القيمة مدعومة (إما رقم أو كلمة 'unlimited')
      this.settings.fpsLimit = fps;
      this.saveSettings();
    }
  
    getFpsLimit() {
      return this.settings.fpsLimit;
    }
  
    // حساب زمن الإطار المستهدف بالمللي ثانية (Target Frame Interval)
    getTargetInterval() {
      if (this.settings.fpsLimit === "unlimited" || !this.settings.fpsLimit) {
        return 0; // بدون قفل
      }
      return 1000 / Number(this.settings.fpsLimit);
    }
  
    // -------------------------------------------------------------
    // 🎨 دوال الجرافيكس (Graphics Quality Controls)
    // -------------------------------------------------------------
  
    setGraphicsQuality(quality) {
      if (["low", "medium", "high"].includes(quality)) {
        this.settings.graphicsQuality = quality;
        this.saveSettings();
      }
    }
  
    getGraphicsQuality() {
      return this.settings.graphicsQuality;
    }
  }
  
  // تصدير نسخة واحدة موحدة (Singleton) لاستخدامها في كافة الملفات
  export const settingsManager = new SettingsManager();