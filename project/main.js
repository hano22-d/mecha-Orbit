import { InputsHandle } from "../src/systems/InputHandler";
import { Game } from "../src/core/gameEngine";
import { stateManager } from "../src/core/state";
import { Background } from "../src/entities/Background";
import { IntroScene } from "../src/core/introScene";
import { initAllGameSounds } from "../src/systems/audioManiFest";
import { myCanvas,ctx } from "../src/systems/canvasManager";
import { setupAudioAndEnvironment } from "../src/systems/gameAudioContruller";
import { initAllGameUI } from "../src/systems/UiManager";


const input = new InputsHandle();
export const game = new Game(myCanvas, ctx, stateManager);
const background = new Background(myCanvas, game.camera);
const intro = new IntroScene(myCanvas, ctx);

//=== توليد جميع اصوات اللعبة ===//
initAllGameSounds();
// ===============================//

// === دالة تشغيل اصوات الخلفية + ادارة حالة اغلاق التبويب === //
setupAudioAndEnvironment(stateManager)
// =============================================================== //

// === UI تشغيل دالات === //
initAllGameUI(stateManager,game)
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
      game.draw(ctx);
      break;
    case "menu":
      background.update();
      background.draw(ctx, game.camera);
      break;
    case "win":
      game.update(input, time, deltaTime);
      game.draw(ctx);
      break;
    case "gameOver":
      background.update();
      background.draw(ctx, game.camera);
  }

  requestAnimationFrame(gameLoop);
}
gameLoop();
