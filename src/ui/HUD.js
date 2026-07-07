import { stateManager } from "../core/state";
import { audioManager } from "../systems/SoundsSystem";

export class Hud {
  constructor() {
    this.hudDiv = document.getElementById("hud");
    this.pauseBtn = document.getElementById("pauseBtn");

    this.enemyHealthBar = document.getElementById("enemyHealthBar");
    this.healthbar = document.getElementById("healthbar");

    this.scoreBar = document.getElementById("scoreBar");
    this.scoreValue = document.getElementById("scoreValue");
    this.playerHealthBar = document.getElementById("playerHealthBar");
    this.healthPercent = document.getElementById("healthPercent");
    this.lastScore = 0;

    this.countNumber = document.getElementById("count-number");
  }

  update(game, canvas) {
    this.healthBarChanged(game, canvas);
    this.updateScoreAndhealth(game, canvas);
  }

  showHud() {
    stateManager.stateOnchange((state) => {
      if (state === "playing") {
        this.hudDiv.style.display = "block";
      } else {
        this.hudDiv.style.display = "none";
      }
    });
  }

  toPauseState() {
    this.pauseBtn.addEventListener("click", () => {
      audioManager.pause("bg");
      audioManager.pause("engineSound");
      audioManager.pause("bossSound");
      audioManager.pause("bossSentance");

      stateManager.setState("pause");
    });
  }

  healthBarChanged(game, canvas) {
    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    //شرط عرض شريط صحة زايلوس
    if (game.bossStart) {
      this.enemyHealthBar.style.right = "-10%";
    } else {
      this.enemyHealthBar.style.right = "-100%";
    }

    //ضبط عرض الشريط بحسب نسبة صحة زايلوس
    let healthRate = Math.max(0, game.boss.health / 300);
    let healthbarWidth = healthRate * (isMobile ? 175 : 350);
    this.healthbar.style.width = `${healthbarWidth}px`;
  }

  showScoreBar(stateManager) {
    stateManager.stateOnchange((state) => {
      if (state === "playing") {
        setTimeout(() => {
          this.scoreBar.style.left = "0";
        }, 1000);
      } else {
        this.scoreBar.style.left = "-40%";
      }
    });
  }

  updateScoreAndhealth(game, canvas) {
    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    //تحديث الscore
    this.scoreValue.textContent = game.score;

    //اضافة نبضة لرم الscore
    if (game.score > this.lastScore) {
      this.scoreValue.style.animation = "none";
      void this.scoreValue.offsetWidth;
      this.scoreValue.style.animation = "scoreReward .45s ease-out";
      this.lastScore = game.score;
    }

    //تحديث عرض شريط حياة اللاعب
    let healthRate = Math.max(0, game.player.health / 100);
    let playerBarWidth = healthRate * (isMobile ? 170 : 240);
    this.playerHealthBar.style.width = `${playerBarWidth}px`;

    //تحديث نسبة حياة اللاعب
    this.healthPercent.textContent = `${healthRate * 100}%`;

    //تحديث الصواريخ
    this.countNumber.textContent = game.player.missileCount;
  }
}

export const hud = new Hud();
