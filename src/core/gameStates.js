// الحالات الرسمية للعبة
let gameStates = {
  loading: "loading", // 🟢 تمت الإضافة هنا كحالة أولى
  intro: "intro",
  menu: "menu",
  playing: "playing",
  pause: "pause",
  gameOver: "gameOver",
  win: "win",
};

export class StateManager {
  constructor() {
    // 🟢 نبدأ اللعبة بحالة التحميل كحالة افتراضية
    this.current = gameStates.loading; 
    this.listeners = [];
  }

  setState(state) {
    this.current = state;
    this.listeners.forEach((cb) => cb(state));
  }

  getState() {
    return this.current;
  }

  stateOnchange(callBack) {
    this.listeners.push(callBack);
    callBack(this.current);
  }
}