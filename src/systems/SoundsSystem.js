import { PoolishSound } from "./PoolishSound";

class AudioManager {
  constructor() {
    this.sounds = {};
    this.poolSounds = {};
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
