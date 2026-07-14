export class PoolishSound {
  constructor(audioElement, size = 10) {
   this.pool = [];
   this.index = 0;

   // إذا لم يكن الصوت موجوداً لسبب ما، نضع حماية لمنع الانهيار
   if (!audioElement) {
     console.warn("⚠️ PoolishSound: تم تمرير كائن صوت فارغ!");
     return;
   }

   for(let i = 0; i < size; i++) {
       // 🔄 استنساخ الكائن المحمل مسبقاً في الذاكرة دون طلب شبكة جديد!
       this.pool.push(audioElement.cloneNode(true));
   }
  }

  play() {
   const sound = this.pool[this.index];
   if (sound) {
     sound.currentTime = 0;
     sound.play().catch(() => {}); 
   }
 
   this.index = (this.index + 1) % this.pool.length; 
 }
}