import { audioManager } from "../systems/SoundsSystem";
import { playerRank } from "../utils/helpers";

export function menu(stateManager, game) {
  const menu = document.getElementById("menu");
  const totalScore = document.getElementById("total-score");
  const highScore = document.getElementById("high-score");
  const credits = document.getElementById("credits-amount");
  const startGamebtn = document.getElementById("btn");
  const rank = document.getElementById("rank-name");

  let lastTotalScore = localStorage.getItem("totalScore") || 0;

  totalScore.textContent = lastTotalScore;
  highScore.textContent = localStorage.getItem("highScore") || 0;
  credits.textContent = localStorage.getItem("credits") || 0;

  playerRank(rank, lastTotalScore); //دالة حساب الشارة الحالية

  startGamebtn.addEventListener("click", () => {
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
