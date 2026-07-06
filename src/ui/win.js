import { audioManager } from "../systems/SoundsSystem";
import { calculateStars, playerRank } from "../utils/helpers";

export function win(stateManager, game) {
  const win = document.getElementById("win");
  const btnMenu = document.getElementById("btnMenu");
  const btnRestart = document.getElementById("btnRestart");

  btnRestart.addEventListener("click", () => {
    audioManager.pause("bossSound")
    audioManager.pause("winSound");
    audioManager.play("bg", true, true);
    game.reset();
    stateManager.setState("intro");
  });

  btnMenu.addEventListener("click", () => {
    stateManager.setState("menu");

    audioManager.pause("winSound");
  });

  stateManager.stateOnchange((state) => {
    if (state === "win") {
      win.classList.add("showWinBar");
    } else {
      win.classList.remove("showWinBar");
    }
  });
}
export function winUpdate(game) {
  //تحديث السكور في شاشة الفوز
  const winScore = document.getElementById("winScore");
  winScore.textContent = game.score;

  //تحديث دقة التصويب
  const winAccuracy = document.getElementById("winAccuracy");
  let accuracyRate;

  if (game.bulletsFired === 0) {
    accuracyRate = 100;
  } else {
    accuracyRate = Math.min(100, (game.bulletsColision / game.bulletsFired) * 100);
  }
  winAccuracy.textContent = `${accuracyRate.toFixed(1)}%`;

  //حساب اداء اللاعب بعد الفوز
  const winStars = document.getElementsByClassName("star");
  const currentStarsCount = calculateStars(
    accuracyRate,
    game.player.health,
    game.combo,
    game.enemyType
  ); //helpers.js استدعينا دالة الحساب من

  for (let i = 0; i < winStars.length; i++) {
    if (i < currentStarsCount) {
      winStars[i].classList.add("active");
    } else {
      winStars[i].classList.remove("active");
    }
  }

  //حساب عدد السكور حسب النوع
  const deadNormal = document.getElementById("deadNormal");
  const deadChaser = document.getElementById("deadChaser");
  const deadDodger = document.getElementById("deadDodger");
  const deadShooter = document.getElementById("deadShooter");

  deadNormal.textContent = game.enemyType.normal;
  deadChaser.textContent = game.enemyType.chaser;
  deadDodger.textContent = game.enemyType.dodger;
  deadShooter.textContent = game.enemyType.shooter;

  //عرض المستوى الحالي للاعب
  const rankWin = document.getElementById("rankWin");
  let lastTotalScore = localStorage.getItem("totalScore") || 0;
  playerRank(rankWin, lastTotalScore);
}
