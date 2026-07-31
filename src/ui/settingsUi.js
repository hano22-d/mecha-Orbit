import { stateManager } from "../core/state";
import { settingsManager } from "../systems/settingsManager";

export class SettingsUI {
  constructor() {
    // 1️⃣ عناصر الواجهة الأساسية
    this.overlay = document.getElementById("settings-overlay");
    this.btnClose = document.getElementById("btn-close-settings");
    this.btnSave = document.getElementById("btn-save-settings");
    this.btnReset = document.getElementById("btn-reset-settings");

    // عناصر التحكم بالمرحلة الأولى (FPS & Graphics)
    this.selectFps = document.getElementById("select-fps");
    this.radioGraphics = document.querySelectorAll('input[name="graphics-quality"]');

    // أزرار التبويبات والمحتويات (Tabs)
    this.tabButtons = document.querySelectorAll(".settings-tabs .tab-btn");
    this.tabContents = document.querySelectorAll(".settings-body .tab-content");

    // تهيئة الأحداث والربط فور إنشاء الكائن
    this.init();
  }

  init() {
    if (!this.overlay) return;

    if(stateManager.stateOnchange(state => {
        if (state === "loading" || state === "menu") {
            this.hide()
        }
    }))

    // 🎯 تنشيط نظام التبويبات (Tabs Switching)
    this.initTabs();

    // 🎯 ربط أزرار الإغلاق والحفظ والإعادة
    if (this.btnClose) {
      this.btnClose.addEventListener("click", () => this.hide());
    }

    if (this.btnSave) {
      this.btnSave.addEventListener("click", () => {
        this.applyAndSave();
        this.hide();
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener("click", () => this.resetToDefaults());
    }

    // إغلاق الشاشة عند الضغط على الخلفية الخارجية Muted Area
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.hide();
    });
  }

  // 🔄 1️⃣ التنقل بين التبويبات (Tabs)
  initTabs() {
    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTabId = btn.getAttribute("data-tab");

        // إزالة حالة التنشيط من جميع الأزرار والمحتويات
        this.tabButtons.forEach((b) => b.classList.remove("active"));
        this.tabContents.forEach((c) => c.classList.remove("active"));

        // تنشيط التبويب المكتوب عليه
        btn.classList.add("active");
        const activeContent = document.getElementById(targetTabId);
        if (activeContent) activeContent.classList.add("active");
      });
    });
  }

  // 👁️ 2️⃣ إظهار شاشة الإعدادات وتحميل القيم الحالية
  show() {
    this.syncUIWithSettings(); // تزامن القيم الحالية من settingsManager مع عناصر الواجهة
    if (this.overlay) {
      this.overlay.style.display = "flex";
      this.overlay.classList.add("active");
    }
  }

  // 🙈 3️⃣ إخفاء شاشة الإعدادات
  hide() {
    if (this.overlay) {
      this.overlay.style.display = "none";
      this.overlay.classList.remove("active");
    }
  }

  // 🔄 4️⃣ تحديث عناصر الواجهة (Select/Radio) بالقيم المخزنة في الـ SettingsManager
  syncUIWithSettings() {
    // 1. مزامنة الـ FPS
    const currentFps = settingsManager.getFpsLimit();
    if (this.selectFps) {
      this.selectFps.value = String(currentFps);
    }

    // 2. مزامنة الجرافيكس
    const currentGraphics = settingsManager.getGraphicsQuality();
    this.radioGraphics.forEach((radio) => {
      radio.checked = radio.value === currentGraphics;
    });
  }

  // 💾 5️⃣ تطبيق وقراءة القيم من الواجهة وحفظها في SettingsManager
  applyAndSave() {
    // حفظ خيار الـ FPS
    if (this.selectFps) {
      const selectedFps = this.selectFps.value;
      // إذا كانت القيمة رقماً نحولها لرقم، وإلا نتركها 'unlimited'
      const parsedFps = isNaN(selectedFps) ? selectedFps : Number(selectedFps);
      settingsManager.setFpsLimit(parsedFps);
    }

    // حفظ خيار الجرافيكس
    const selectedGraphics = Array.from(this.radioGraphics).find((r) => r.checked);
    if (selectedGraphics) {
      settingsManager.setGraphicsQuality(selectedGraphics.value);
    }

    console.log("✅ تم تطبيق وحفظ إعدادات الأداء والجرافيكس بنجاح!");
  }

  // 🔄 6️⃣ إعادة الإعدادات للافتراضي
  resetToDefaults() {
    settingsManager.setFpsLimit(60);
    settingsManager.setGraphicsQuality("high");
    this.syncUIWithSettings();
  }
}