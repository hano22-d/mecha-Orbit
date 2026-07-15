import { audioManager } from "../systems/SoundsSystem";
import { playerRank } from "../utils/helpers";

export function menu(stateManager, game) {
  const menu = document.getElementById("menu");
  const totalScore = document.getElementById("total-score");
  const highScore = document.getElementById("high-score");
  const credits = document.getElementById("credits-amount");
  const startGamebtn = document.getElementById("btn");
  const rank = document.getElementById("rank-name");

  const playyes = document.getElementById("playYES");

  let lastTotalScore = localStorage.getItem("totalScore") || 0;

  totalScore.textContent = lastTotalScore;
  highScore.textContent = localStorage.getItem("highScore") || 0;
  credits.textContent = localStorage.getItem("credits") || 0;

  playerRank(rank, lastTotalScore); //دالة حساب الشارة الحالية

  playyes.addEventListener("click", () => {
    enterFullScreen()
  })

  startGamebtn.addEventListener("click", () => {
    enterFullScreen()
    audioManager.play("bg", true, true);
    game.reset();
    stateManager.setState("intro");
  });

  stateManager.stateOnchange((state) => {
    if (state === "menu") {
      menu.style.display = "block";
    } else {
      menu.style.display = "none";
    }
  });
}

// دالة لتفعيل ملء الشاشة بالكامل متوافقة مع جميع الهواتف والمتصفحات
function enterFullScreen() {
  const element = document.documentElement;

  // استخدام try catch لضمان عدم توقف اللعبة إذا رفض المتصفح الإذن
  try {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { /* Firefox */
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE/Edge */
        element.msRequestFullscreen();
    }
  } catch (error) {
     console.log("حجب المتصفح ميزة ملء الشاشة التلقائي:", error);
  }
}