import { PoolishSound } from "./PoolishSound";

class AudioManager {
  constructor() {
    this.sounds = {};
    this.poolSounds = {};
  }
  //sound
  loadSound(name, path) {
    const audio = new Audio(path);
    this.sounds[name] = audio;
  }
  play(name, loop,forceRestart = false) {
    const audio = this.sounds[name];
    if (!audio) return;
    if (name !== "bg" || forceRestart) {
      audio.currentTime = 0;
    } 
    //تصفير كل الاصوات ما عدا الخلفية
    audio.play();
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
  //poolSound
  loadPoolSound(name, path, size = 10) {
    const audio = new PoolishSound(path, size);
    this.poolSounds[name] = audio;
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
