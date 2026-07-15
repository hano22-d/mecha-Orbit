import { InputsHandle } from "../src/systems/InputHandler";
import { Game } from "../src/core/gameEngine";
import { stateManager } from "../src/core/state";
import { IntroScene } from "../src/core/introScene";
import { setupAudioAndEnvironment } from "../src/systems/gameAudioContruller";
import { initAllGameUI } from "../src/systems/UiManager";
import { myCanvas, bgCanvas, ctx, bgCtx } from "../src/systems/canvasManager";

export const game = new Game(myCanvas, ctx, bgCanvas, bgCtx, stateManager);
const input = new InputsHandle(myCanvas, game.touchButtons);
const intro = new IntroScene(myCanvas, ctx);


// === دالة تشغيل اصوات الخلفية + ادارة حالة اغلاق التبويب === //
setupAudioAndEnvironment(stateManager);
// =============================================================== //

// === UI تشغيل دالات === //
initAllGameUI(stateManager, game);
// ======================== //

let lastTime = 0;

function gameLoop(time) {
  let deltaTime = time - lastTime;
  lastTime = time;

  if (deltaTime > 100) deltaTime = 16.6;

  ctx.clearRect(0, 0, myCanvas.logicalWidth, myCanvas.logicalHeight);

  switch (stateManager.getState()) {
    case "intro":
      intro.update(deltaTime);
      intro.draw(ctx);
      break;
    case "playing":
      game.update(input, time, deltaTime);
      game.draw(ctx);
      break;
    case "pause":
      game.draw(ctx, bgCtx);
      break;
    case "menu":
    case "gameOver":
    case "win":
      game.background.update();
      game.background.draw(bgCtx, game.camera);
  }

  requestAnimationFrame(gameLoop);
}
gameLoop(0);
