import { InputsHandle } from "../src/systems/InputHandler";
import { Game } from "../src/core/gameEngine";
import { stateManager } from "../src/core/state";
import { IntroScene } from "../src/core/introScene";
import { setupAudioAndEnvironment } from "../src/systems/gameAudioContruller";
import { initAllGameUI } from "../src/systems/UiManager";
import { myCanvas, bgCanvas, ctx, bgCtx } from "../src/systems/canvasManager";
import { settingsManager } from "../src/systems/settingsManager";

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
let accumulatedTime = 0; // 👈 الوقت التراكمي للتحكم بالفريمات

function gameLoop(time) {
  let deltaTime = time - lastTime;
  lastTime = time;

  if (deltaTime > 100) deltaTime = 16.6;

  // جلب الزمن المستهدف للفريم بناءً على الإعدادات
  const targetInterval = settingsManager.getTargetInterval();

  if (targetInterval === 0) {
    // 🚀 حالة Unlimited: تنفيذ الرسم والتحديث مباشرة بدون تقييد
    renderAndUpdate(time, deltaTime);
  } else {
    // ⏱️ حالة تحديد الإطارات (30, 60, 120 FPS)
    accumulatedTime += deltaTime;

    if (accumulatedTime >= targetInterval) {
      renderAndUpdate(time, accumulatedTime);
      accumulatedTime %= targetInterval; // خصم الوقت المستهلك مع حفظ الباقي
    }
  }

  requestAnimationFrame(gameLoop);
}

// 🎯 دالة مساعدة تحتفظ بنفس منطق الرسم والتحديث الخاص بك تماماً
function renderAndUpdate(time, deltaTime) {
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
      break;
  }
}

gameLoop(0);