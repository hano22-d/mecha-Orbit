import { audioManager } from "../systems/SoundsSystem";

//دالة عرض الانترو الكامل
export function introUi(stateManager, intro) {
  const introDiv = document.getElementById("intro");
  const skipBtn = document.getElementById("skipBtn");

  skipBtn.addEventListener("click", () => {
    stateManager.setState("playing");

      audioManager.pause("pep")
      audioManager.pause("tech")
      audioManager.pause("dialog1")
      audioManager.pause("dialog2")
      audioManager.pause("dialog3")
  
  });

  stateManager.stateOnchange((state) => {
    if (state === "intro") {
      introDiv.style.display = "block";
    } else {
      introDiv.style.display = "none";
    }
  });
}
//دالة عرض الحوار
export function dialog(intro,stateManager) {

  const dialog1 = document.getElementById("dialog1");
  const dialog2 = document.getElementById("dialog2");
  const dialog3 = document.getElementById("dialog3");

  if (intro.timer > 500 && !intro.dialogSoundSetting.dialog1) {
    audioManager.play("pep");
    audioManager.play("tech");

    intro.dialogSoundSetting.dialog1 = true;
  }
  if (intro.timer > 2000 && !intro.dialogSoundSetting.dialog2) {
    dialog1.classList.add("active");

    audioManager.play("dialog1");
    intro.dialogSoundSetting.dialog2 = true;
  }
  if (intro.timer > 7000 && !intro.dialogSoundSetting.dialog3) {
    dialog2.classList.add("active");

    audioManager.play("dialog2");
    intro.dialogSoundSetting.dialog3 = true;
  }
  if (intro.timer > 11500 && !intro.dialogSoundSetting.dialog4) {
    dialog3.classList.add("active");

    audioManager.play("dialog3");
    intro.dialogSoundSetting.dialog4 = true;
  }
}
