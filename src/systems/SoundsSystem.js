import { PoolishSound } from "./PoolishSound";

class AudioManager {
  constructor() {
    this.sounds = {};
    this.poolSounds = {};

    this.musicKeys = ["bg", "menuSound", "winSound", "bossSound"];
  }

  // 1️⃣ تسجيل الأصوات الفردية الجاهزة من الذاكرة
  registerSound(name, audioElement) {
    if (audioElement) {
      this.sounds[name] = audioElement;
    }
  }

  // 2️⃣ تسجيل الأصوات المتكررة الجاهزة وتحويلها لـ Pool
  registerPoolSound(name, audioElement, size = 10) {
    if (audioElement) {
      this.poolSounds[name] = new PoolishSound(audioElement, size);
    }
  }

  // 🎵 1. دالة تحديث حجم صوت الموسيقى فقط
  setMusicVolume(vol) {
    this.musicKeys.forEach((key) => {
      if (this.sounds[key]) {
        this.sounds[key].volume = vol;
      }
    });
  }

  // 💥 2. دالة تحديث حجم صوت كافة المؤثرات الصوتية (الفردية والـ Pools)
  setSfxVolume(vol) {
    // أ) تحديث الأصوات الفردية التي ليست موسيقى
    Object.keys(this.sounds).forEach((key) => {
      if (!this.musicKeys.includes(key)) {
        this.sounds[key].volume = vol;
      }
    });

    // ب) تحديث جميع المسبحات الصوتية (Pools)
    Object.keys(this.poolSounds).forEach((key) => {
      if (this.poolSounds[key]) {
        this.poolSounds[key].setVolume(vol);
      }
    });
  }

  // 🔄 3. دالة تطبيق إعدادات الصوت المخزنة بلمسة واحدة عند بدء اللعبة
  applyInitialVolumes(musicVol, sfxVol) {
    this.setMusicVolume(musicVol);
    this.setSfxVolume(sfxVol);
  }

  // 👇 تبقى بقية الدوال كما هي تماماً دون أي تغيير لتجنب كسر اللعبة!
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
/*
notes:
1- لدينا نوعين من الاصوات في اللعبة, اصوات فردية وهي التي لا تتكرر بسرعة ,وأصوات متكررة بسرعة
2- if (name !== "bg") sound.currentTime = 0; ==> تصفير كل الاصوات ما عدا الخلفية
*/
