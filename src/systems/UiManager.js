import { menu } from "../ui/Menu";
import { pauseMenu } from "../ui/PauseMenu";
import { hud } from "../ui/HUD";
import { gameOverUi } from "../ui/gameOver";
import { win } from "../ui/win";
import { introUi } from "../ui/introUi";

//دالة تشغيل UI
export function initAllGameUI(stateManager, game) {
  menu(stateManager, game);
  pauseMenu(stateManager, game);
  gameOverUi.gameOver(stateManager, game);
  win(stateManager, game);
  hud.showHud();
  hud.toPauseState();
  hud.showScoreBar(stateManager);
  introUi(stateManager);
}