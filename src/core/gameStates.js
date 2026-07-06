//الحالات
let gameStates = {
  menu: "menu",
  playing: "playing",
  gameOver: "gameOver",
  pause: "pause",
  win: "win",
  intro: "intro"
};

export class StateManager {
  constructor() {
    this.current = gameStates.menu;
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

    callBack(this.current)
  }
}

//ملاحظات//
//1- نستخدم دالة getState للتحقق من الحالة بشكل مستمر,
// يكون موطن الاستخدام في gameLoop او gameLogic
//2- نستخدم دالة stateOnchange لاعلام المستمعين بحدوث تغير في الحالة ,
//  يكون موطن الاستخدام في الui او عند تطبيق شيء مع تغير الحالة مرة واحدة
