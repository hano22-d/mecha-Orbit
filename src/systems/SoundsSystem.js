import { PoolishSound } from "./PoolishSound";

class AudioManager {
  constructor() {
    this.sounds = {};
    this.poolSounds = {};

    this.musicKeys = ["bg", "menuSound", "winSound", "bossSound"];

    // 🎯 حفظ النسب الحالية داخل المدير (قيم من 0.0 إلى 1.0)
    this.masterVolume = 0.8;
    this.musicVolume = 0.8;
    this.sfxVolume = 0.8;
  }

  // 🎯 دالة مساعدة لحساب حجم الصوت الفعلي المدموج مع الماستر
  getEffectiveVolume(type) {
    if (type === "music") return this.masterVolume * this.musicVolume;
    if (type === "sfx") return this.masterVolume * this.sfxVolume;
    return this.masterVolume;
  }

  // 1️⃣ تسجيل الأصوات الفردية الجاهزة وتطبيق الصوت الفعلي فوراً (يحل مشكلة التوقيت)
  registerSound(name, audioElement) {
    if (audioElement) {
      this.sounds[name] = audioElement;

      // 🎯 تطبيق حجم الصوت فور التسجيل حسب نوع الصوت
      const isMusic = this.musicKeys.includes(name);
      const effectiveVol = this.getEffectiveVolume(isMusic ? "music" : "sfx");
      this.sounds[name].volume = effectiveVol;
    }
  }

  // 2️⃣ تسجيل الأصوات المتكررة (Pools) وتطبيق الصوت الفعلي فوراً
  registerPoolSound(name, audioElement, size = 10) {
    if (audioElement) {
      const pool = new PoolishSound(audioElement, size);
      this.poolSounds[name] = pool;

      const isMusic = this.musicKeys.includes(name);
      const effectiveVol = this.getEffectiveVolume(isMusic ? "music" : "sfx");
      pool.setVolume(effectiveVol);
    }
  }

  // 🔊 دالة تحديث الماستر فوليوم
  setMasterVolume(vol) {
    this.masterVolume = vol > 1 ? vol / 100 : vol;
    this.updateAllVolumes();
  }

  // 🎵 1. دالة تحديث حجم صوت الموسيقى
  setMusicVolume(vol) {
    this.musicVolume = vol > 1 ? vol / 100 : vol;
    this.updateMusicVolumes();
  }

  // 💥 2. دالة تحديث حجم صوت كافة المؤثرات الصوتية
  setSfxVolume(vol) {
    this.sfxVolume = vol > 1 ? vol / 100 : vol;
    this.updateSfxVolumes();
  }

  // تحديث أصوات الموسيقى المسجلة حالياً
  updateMusicVolumes() {
    const effectiveVol = this.getEffectiveVolume("music");
    this.musicKeys.forEach((key) => {
      if (this.sounds[key]) {
        this.sounds[key].volume = effectiveVol;
      }
    });
  }

  // تحديث أصوات المؤثرات المسجلة حالياً
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

  // تحديث كل الأصوات
  updateAllVolumes() {
    this.updateMusicVolumes();
    this.updateSfxVolumes();
  }

  // 🔄 3. دالة تطبيق إعدادات الصوت المخزنة عند بدء اللعبة
  applyInitialVolumes(musicVol, sfxVol, masterVol = 80) {
    this.masterVolume = masterVol > 1 ? masterVol / 100 : masterVol;
    this.musicVolume = musicVol > 1 ? musicVol / 100 : musicVol;
    this.sfxVolume = sfxVol > 1 ? sfxVol / 100 : sfxVol;

    this.updateAllVolumes();
  }

  // -------------------------------------------------------------
  // بقية الدوال كما هي تماماً
  // -------------------------------------------------------------
  play(name, loop, forceRestart = false) {
    const audio = this.sounds[name];
    if (!audio) return;
    if (name !== "bg" || forceRestart) {
      audio.currentTime = 0;
    }
    audio.play().catch(() => {});
    audio.loop = loop;
  }

  pause(name) {
    const audio = this.sounds[name];
    if (!audio) return;
    audio.pause();
    if (name !== "bg") audio.currentTime = 0;
  }

  volume(name, vol) {
    const audio = this.sounds[name];
    if (!audio) return;
    audio.volume = vol;
  }

  poolPlay(name) {
    const pool = this.poolSounds[name];
    if (!pool) return;
    pool.play();
  }
}

export const audioManager = new AudioManager();