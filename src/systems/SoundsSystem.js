import { PoolishSound } from "./PoolishSound";

class AudioManager {
  constructor() {
    this.sounds = {};
    this.poolSounds = {};

    this.musicKeys = ["bg", "menuSound", "winSound", "bossSound"];

    // حفظ النسب الحالية داخل المدير
    this.masterVolume = 0.8;
    this.musicVolume = 0.8;
    this.sfxVolume = 0.8;
  }

  /* ==========================================
      دالة حساب حجم الصوت المدمج مع الماستر 
      ========================================= */
  getEffectiveVolume(type) {
    if (type === "music") return this.masterVolume * this.musicVolume;
    if (type === "sfx") return this.masterVolume * this.sfxVolume;
    return this.masterVolume;
  }

  /* ===============================
      دالة تسجيل الأصوات الفردية
     =============================== */
  registerSound(name, audioElement) {
    if (audioElement) {
      this.sounds[name] = audioElement;

      // تطبيق حجم الصوت فور التسجيل حسب نوع الصوت
      const isMusic = this.musicKeys.includes(name);
      const effectiveVol = this.getEffectiveVolume(isMusic ? "music" : "sfx");
      this.sounds[name].volume = effectiveVol;
    }
  }
  
  /* ===============================
      دالة تسجيل الأصوات المتكررة
     =============================== */
  registerPoolSound(name, audioElement, size = 10) {
    if (audioElement) {
      const pool = new PoolishSound(audioElement, size);
      this.poolSounds[name] = pool;

      const isMusic = this.musicKeys.includes(name);
      const effectiveVol = this.getEffectiveVolume(isMusic ? "music" : "sfx");
      pool.setVolume(effectiveVol);
    }
  }

  /* ============================
      دالة تحديث صوت الماستتر
     ============================ */
  setMasterVolume(vol) {
    this.masterVolume = vol > 1 ? vol / 100 : vol;
    this.updateAllVolumes();
  }

  /* ================================
     دالة تحديث حجم صوت الموسيقى
     ================================ */
  setMusicVolume(vol) {
    this.musicVolume = vol > 1 ? vol / 100 : vol;
    this.updateMusicVolumes();
  }

  /* ================================
     دالة تحديث المؤثرات الصوتية
     ================================ */
  setSfxVolume(vol) {
    this.sfxVolume = vol > 1 ? vol / 100 : vol;
    this.updateSfxVolumes();
  }

  /* ==================================
      تحديث أصوات الموسيقى المسجلة 
     ================================== */
  updateMusicVolumes() {
    const effectiveVol = this.getEffectiveVolume("music");
    this.musicKeys.forEach((key) => {
      if (this.sounds[key]) {
        this.sounds[key].volume = effectiveVol;
      }
    });
  }

  /* ==================================
      تحديث أصوات المؤثرات المسجلة 
     ================================== */
  updateSfxVolumes() {
    const effectiveVol = this.getEffectiveVolume("sfx");

    Object.keys(this.sounds).forEach((key) => {
      if (!this.musicKeys.includes(key)) {
        this.sounds[key].volume = effectiveVol;
      }
    });

    Object.keys(this.poolSounds).forEach((key) => {
      if (this.poolSounds[key]) {
        this.poolSounds[key].setVolume(effectiveVol);
      }
    });
  }

  /* ======================
       تحديث كل الأصوات 
     ====================== */
  updateAllVolumes() {
    this.updateMusicVolumes();
    this.updateSfxVolumes();
  }

  /* =====================================================
     دالة تطبيق إعدادات الصوت المخزنة عند بدء اللعبة
     ===================================================== */
  applyInitialVolumes(musicVol, sfxVol, masterVol = 80) {
    this.masterVolume = masterVol > 1 ? masterVol / 100 : masterVol;
    this.musicVolume = musicVol > 1 ? musicVol / 100 : musicVol;
    this.sfxVolume = sfxVol > 1 ? sfxVol / 100 : sfxVol;

    this.updateAllVolumes();
  }

  /* ==============================
      دالة تشغيل الأصوات الفردية
     ============================== */
  play(name, loop, forceRestart = false) {
    const audio = this.sounds[name];
    if (!audio) return;
    if (name !== "bg" || forceRestart) {
      audio.currentTime = 0;
    }
    audio.play().catch(() => {});
    audio.loop = loop;
  }

  /* ===============================
      دالة إيقاف الأصوات الفردية
     =============================== */
  pause(name) {
    const audio = this.sounds[name];
    if (!audio) return;
    audio.pause();
    if (name !== "bg") audio.currentTime = 0;
  }

  /* ======================================
     دالة التحكم بمستوى الأصوات الفردية
     ====================================== */
  volume(name, vol) {
    const audio = this.sounds[name];
    if (!audio) return;
    audio.volume = vol;
  }

  /* ===============================
     دالة تشغيل الأصوات المتكررة
     =============================== */
  poolPlay(name) {
    const pool = this.poolSounds[name];
    if (!pool) return;
    pool.play();
  }
}

export const audioManager = new AudioManager();
