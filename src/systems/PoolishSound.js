export class PoolishSound {
  constructor(audioElement, size = 10) {
    this.pool = [];
    this.index = 0;
    this.currentVolume = 1.0; // مستوى الصوت الحالي

    // حماية لمنع الانهيار في حال عدم وجود الصوت لسبب معين
    if (!audioElement) {
      console.warn("⚠️ PoolishSound: تم تمرير كائن صوت فارغ!");
      return;
    }

    for (let i = 0; i < size; i++) {
      // استنساخ الكائن المحمل مسبقاً في الذاكرة دون طلب شبكة جديد
      this.pool.push(audioElement.cloneNode(true));
    }
  }

  setVolume(vol) {
    this.currentVolume = vol;
    this.pool.forEach((sound) => {
      sound.volume = vol;
    });
  }

  play() {
    const sound = this.pool[this.index];
    if (sound) {
      sound.volume = this.currentVolume; //ضبط مستوى الصوت حسب القيمة المرسلة مرة اخرى كحماية إضافية
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }

    this.index = (this.index + 1) % this.pool.length;
  }
}
