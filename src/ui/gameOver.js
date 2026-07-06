import { audioManager } from "../systems/SoundsSystem";

let totalScore = Number(localStorage.getItem("totalScore")) || 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;
let credits = Number(localStorage.getItem("credits")) || 0;

class GameOverUi {
  constructor() {

    this.gameOverDiv = document.getElementById("gameOver");
    this.restartBtn = document.getElementById("btnOverRestart");
    this.btnOverMenu = document.getElementById("btnOverMenu");
  
    this.overScore = document.getElementById("overScore");
    this.overAccuracy = document.getElementById("overAccuracy");
    this.sectorProgress = document.getElementById("sectorProgress");
  }
  //دالة التحديث الرئيسية
  update(game) {
    this.updateVar(game);
  }

  // === main.js دالة إظهار وأخفاء شاشة الخسارة مع وظائف الازرار, توضع في === //
  gameOver(stateManager,game) {
    stateManager.stateOnchange((state) => {
      if (state === "gameOver") {
        this.gameOverDiv.classList.add("showGameOverBar");
  
        totalScore += game.score;
        localStorage.setItem("totalScore", totalScore);
  
        if (game.score > highScore) {
          highScore = game.score;
        }
        localStorage.setItem("highScore", highScore);
  
        credits += game.credits;
        localStorage.setItem("credits", credits);
      } else {
        this.gameOverDiv.classList.remove("showGameOverBar");
      }
    });

    //زر اعادة اللعب
    this.restartBtn.addEventListener("click", () => {
      audioManager.pause("bossSound");
      audioManager.play("bg", true, true);
      game.reset();
      stateManager.setState("playing");
    });
  
    //زر العودة للقائمة الرئيسية
    this.btnOverMenu.addEventListener("click", () => {
      audioManager.pause("bossSound");
      stateManager.setState("menu");
    });
  }

  // === Game دالة التحديث المتكرر لعناصر شاشة الخسارة, يوضع في === //
  updateVar(game) {
    this.overScore.textContent = game.score;

    //تحديث دقة التصويب
    let accuracyRate;

    if (game.bulletsFired === 0) {
      accuracyRate = 100;
    } else {
      accuracyRate = (game.bulletsColision / game.bulletsFired) * 100;
    }
    this.overAccuracy.textContent = `${accuracyRate.toFixed(1)}%`;

    //تحديث شريط المدة المتبقية لظهور زايلوس
    if (sectorProgress) {
      sectorProgress.style.width = `${game.remainingTimeBoss}%`; //استقبال المدة المتبقية لظهور زايلوس وتحويله لشريط
    }
  }
}

export const gameOverUi = new GameOverUi();
