export class PoolishSound {
   constructor(path,size = 10) {
    this.pool = [];
    this.index = 0

    for(let i = 0; i < size; i++) {
        this.pool.push(new Audio(path))
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