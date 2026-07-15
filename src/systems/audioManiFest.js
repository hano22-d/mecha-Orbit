import { audioManager } from "./SoundsSystem.js";
import { assetsManager } from "../systems/AssetsManager.js";

export function initAllGameSounds() {
  // 🟢 أولاً: ربط الأصوات الفردية والموسيقى
  audioManager.registerSound("bg", assetsManager.getSound("playingBgSound"));
  audioManager.registerSound("menuSound", assetsManager.getSound("menuSound"));
  audioManager.registerSound("winSound", assetsManager.getSound("winSound"));
  audioManager.registerSound("bossSound", assetsManager.getSound("zilosBgSound"));
  audioManager.registerSound("bossSentance", assetsManager.getSound("zilos"));
  audioManager.registerSound("explotionXilos1", assetsManager.getSound("bossExp"));
  audioManager.registerSound("missileSound", assetsManager.getSound("missileSound"));
  audioManager.registerSound("playerExp",assetsManager.getSound("playerExp"))
  audioManager.registerSound("explosionEnemy", assetsManager.getSound("bossExp")); 
  audioManager.registerSound("damageSound", assetsManager.getSound("playerHit"));
  audioManager.registerSound("powerUp", assetsManager.getSound("powerUps"));
  audioManager.registerSound("pep", assetsManager.getSound("pep"));
  audioManager.registerSound("tech", assetsManager.getSound("tushh"));
  audioManager.registerSound("dialog1", assetsManager.getSound("dialog1"));
  audioManager.registerSound("dialog2", assetsManager.getSound("dialog2"));
  audioManager.registerSound("dialog3", assetsManager.getSound("dialog3"));

  // 🟢 ثانياً: ربط الأصوات المتكررة (Pools) بلمسة واحدة
  audioManager.registerPoolSound("fire", assetsManager.getSound("bulletPlayer"), 10);
  audioManager.registerPoolSound("EnemyWeapon", assetsManager.getSound("bulletEnemy"), 10);
}