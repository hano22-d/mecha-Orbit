import { audioManager } from "../systems/SoundsSystem";

export function pauseMenu(stateManager, game) {
  const pauseMenu = document.getElementById("pause");
  const resumeGame = document.getElementById("resumeGame");
  const menenuBtn = document.getElementById("menmenu");

  resumeGame.addEventListener("click", () => {
    stateManager.setState("playing");
    audioManager.play("bg", true);
  });
  menenuBtn.addEventListener("click", () => {
    game.reset();
    stateManager.setState("menu");
  });

  stateManager.stateOnchange((state) => {
    if (state === "pause") {
      pauseMenu.classList.add("showPauseBar");
    } else {
      pauseMenu.classList.remove("showPauseBar")
    }
  });
}
