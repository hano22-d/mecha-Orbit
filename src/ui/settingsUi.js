import { stateManager } from "../core/state";
import { settingsManager } from "../systems/settingsManager";
import { audioManager } from "../systems/SoundsSystem";

export class SettingsUI {
  constructor() {
    // عناصر الواجهة الأساسية
    this.overlay = document.getElementById("settings-overlay");
    this.btnClose = document.getElementById("btn-close-settings");
    this.btnSave = document.getElementById("btn-save-settings");
    this.btnReset = document.getElementById("btn-reset-settings");

    // عناصر التحكم بالمرحلة الأولى (FPS & Graphics)
    this.selectFps = document.getElementById("select-fps");
    this.radioGraphics = document.querySelectorAll(
      'input[name="graphics-quality"]'
    );

    // عناصر التحكم بالصوت (Audio Sliders & Values)
    this.sliderMusic = document.getElementById("slider-music-volume");
    this.valMusic = document.getElementById("val-music-volume");

    this.sliderSfx = document.getElementById("slider-sfx-volume");
    this.valSfx = document.getElementById("val-sfx-volume");

    // أزرار التبويبات والمحتويات (Tabs)
    this.tabButtons = document.querySelectorAll(".settings-tabs .tab-btn");
    this.tabContents = document.querySelectorAll(".settings-body .tab-content");

    // تهيئة الأحداث والربط فور إنشاء الكائن
    this.init();
  }

  init() {
    if (!this.overlay) return;

    stateManager.stateOnchange((state) => {
      if (state === "loading" || state === "menu") {
        this.hide();
      }
    });

    // تنشيط نظام التبويبات (Tabs Switching)
    this.initTabs();

    this.initAudioSliders();

    // ربط أزرار الإغلاق والحفظ والإعادة
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

  // التنقل بين التبويبات (Tabs)
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

  // ربط حركة السلايدر بتحديث نص النسبة المئوية (مثلاً: 80%) فوراً أثناء السحب
  initAudioSliders() {
    const bindSlider = (slider, valSpan) => {
      if (slider && valSpan) {
        slider.addEventListener("input", (e) => {
          valSpan.textContent = `${e.target.value}%`;
        });
      }
    };

    bindSlider(this.sliderMusic, this.valMusic);
    bindSlider(this.sliderSfx, this.valSfx);
  }

  // إظهار شاشة الإعدادات وتحميل القيم الحالية
  show() {
    this.syncUIWithSettings(); // تزامن القيم الحالية من settingsManager مع عناصر الواجهة
    if (this.overlay) {
      this.overlay.style.display = "flex";
      this.overlay.classList.add("active");
    }
  }

  // إخفاء شاشة الإعدادات
  hide() {
    if (this.overlay) {
      this.overlay.style.display = "none";
      this.overlay.classList.remove("active");
    }
  }

  // تحديث عناصر الواجهة (Select/Radio) بالقيم المخزنة في الـ SettingsManager
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

    // 3. مزامنة مستويات الصوت والسلايدات
    if (this.sliderMusic && this.valMusic) {
      const musicVal = settingsManager.getMusicVolume
        ? settingsManager.getMusicVolume()
        : 80;
      this.sliderMusic.value = musicVal;
      this.valMusic.textContent = `${musicVal}%`;
    }

    if (this.sliderSfx && this.valSfx) {
      const sfxVal = settingsManager.getSfxVolume
        ? settingsManager.getSfxVolume()
        : 80;
      this.sliderSfx.value = sfxVal;
      this.valSfx.textContent = `${sfxVal}%`;
    }
  }

  // تطبيق وقراءة القيم من الواجهة وحفظها في SettingsManager
  applyAndSave() {
    // حفظ خيار الـ FPS
    if (this.selectFps) {
      const selectedFps = this.selectFps.value;
      // إذا كانت القيمة رقماً نحولها لرقم، وإلا نتركها 'unlimited'
      const parsedFps = isNaN(selectedFps) ? selectedFps : Number(selectedFps);
      settingsManager.setFpsLimit(parsedFps);
    }

    // حفظ خيار الجرافيكس
    const selectedGraphics = Array.from(this.radioGraphics).find(
      (r) => r.checked
    );
    if (selectedGraphics) {
      settingsManager.setGraphicsQuality(selectedGraphics.value);
    }

    // حفظ خيارات الصوت في settingsManager
    if (this.sliderMusic && settingsManager.setMusicVolume) {
      settingsManager.setMusicVolume(Number(this.sliderMusic.value));
    }
    if (this.sliderSfx && settingsManager.setSfxVolume) {
      settingsManager.setSfxVolume(Number(this.sliderSfx.value));
    }

    if (audioManager) {
      // تمرير القيمة المحولة إلى 0..1 لـ audioManager
      audioManager.setMusicVolume(settingsManager.settings.musicVolume);
      audioManager.setSfxVolume(settingsManager.settings.sfxVolume);
    }
  }

  // إعادة الإعدادات الافتراضية
  resetToDefaults() {
    settingsManager.setFpsLimit(60);
    settingsManager.setGraphicsQuality("high");

    if (settingsManager.setMusicVolume) settingsManager.setMusicVolume(80); // 🎯 تم تعديلها إلى 80
    if (settingsManager.setSfxVolume) settingsManager.setSfxVolume(80);     // 🎯 تم تعديلها إلى 80

    // تطبيق التغييرات فوراً على محرك الصوت
    if (audioManager) {
      audioManager.setMusicVolume(settingsManager.settings.musicVolume);
      audioManager.setSfxVolume(settingsManager.settings.sfxVolume);
    }

    // تحديث عناصر الواجهة والسلايدات بالقيم الجديدة
    this.syncUIWithSettings();
  }
}
