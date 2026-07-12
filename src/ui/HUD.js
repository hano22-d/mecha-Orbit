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
    this.healthBarChanged(game);
    this.updateScoreAndhealth(game);
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

  healthBarChanged(game) {
    if (game.bossStart) {
      this.enemyHealthBar.style.right = "-10%";
    } else {
      this.enemyHealthBar.style.right = "-100%";
    }

    let healthRate = 0;
    
    if (game.boss && game.boss.alive) {
      healthRate = Math.max(0, game.boss.health / 300);
    }

    this.healthbar.style.transform = `scaleX(${healthRate})`;
  }

  showScoreBar(stateManager) {
    stateManager.stateOnchange((state) => {
      if (state === "playing") {
        setTimeout(() => {
          this.scoreBar.style.transform = "translateX(0px) translateZ(0)";
        }, 1000);
      } else {
        this.scoreBar.style.transform = "translateX(-120%) translateZ(0)";
      }
    });
  }

  updateScoreAndhealth(game) {
    // تحديث الـ score
    this.scoreValue.textContent = game.score;

    // إضافة نبضة لـ score
    if (game.score > this.lastScore) {
      this.scoreValue.style.animation = "none";
      void this.scoreValue.offsetWidth;
      this.scoreValue.style.animation = "scoreReward .45s ease-out";
      this.lastScore = game.score;
    }

    let healthRate = Math.max(0, game.player.health / 100);
    this.playerHealthBar.style.transform = `scaleX(${healthRate})`;

    // تحديث نسبة حياة اللاعب
    this.healthPercent.textContent = `${Math.round(healthRate * 100)}%`;

    // تحديث الصواريخ
    this.countNumber.textContent = game.player.missileCount;
  }
}

export const hud = new Hud();