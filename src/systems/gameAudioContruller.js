import { audioManager } from "./SoundsSystem";

export function setupAudioAndEnvironment(stateManager) {
  
  // 1. مراقبة تغيير الحالات لتشغيل الأصوات المناسبة
  stateManager.stateOnchange((state) => {
    audioManager.pause("bg");
    audioManager.pause("engineSound");
    audioManager.pause("menuSound");

    if (state === "playing") {
      audioManager.play("bg", true, false);
      audioManager.volume("bg", 0.5);
      audioManager.play("engineSound", true);
    } else if (state === "menu") {
      audioManager.play("menuSound", true);
    }
  });

  // 2. حل مشكلة تفادي حظر المتصفح عند أول تفاعل
  const startMenuMusic = () => {
    if (stateManager.getState() === "menu") {
      audioManager.play("menuSound");
    }
    window.removeEventListener("click", startMenuMusic);
    window.removeEventListener("keydown", startMenuMusic);
  };
  window.addEventListener("click", startMenuMusic);
  window.addEventListener("keydown", startMenuMusic);

  // 3.إيقاف اللعب تلقائياً عند تصغير التبويب
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (stateManager.getState() === "playing") {
        stateManager.setState("pause");

        audioManager.pause("menuSound")
      }
    } else {
      console.log("game resume");
      audioManager.play("menuSound")
    }
  });
}