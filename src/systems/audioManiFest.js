import { audioManager } from "./SoundsSystem";

// systems/audioManifest.js
audioManager;

// 🟢 دالة موحدة يتم استدعاؤها "مرة واحدة فقط" عند إقلاع اللعبة
export function initAllGameSounds() {
  // 1️⃣ أولاً: الأصوات الفردية المستمرة (الموسيقى، المحركات)
  audioManager.loadSound(
    //موسيقى الخلفية
    "bg",
    "src/assets/audio/background audius/pioneers_meets_space-mix2.ogg"
  );
  audioManager.loadSound(
    "engineSound",
    "src/assets/audio/rocket_engine.001.wav"
  );
  audioManager.loadSound(
    "menuSound",
    "src/assets/audio/background audius/ObservingTheStar.ogg"
  ); //صوت المحرك

  //صوت الفوز
  audioManager.loadSound(
    "winSound",
    "src/assets/audio/starostin-awards-ceremony-winner-music-263142.mp3"
  );

  //موسيقى boss
  audioManager.loadSound(
    "bossSound",
    "src/assets/audio/background audius/Project Ex - Genesis One (freetouse.com).mp3"
  );

  //جملة زايلوس
  audioManager.loadSound("bossSentance", "src/assets/xailosVex.mp3");

  //صوت انفجار زايلوس الاول
  audioManager.loadSound("explotionXilos1", "src/assets/audio/explosion1.flac");

  //صوت انفجار زايلوس الثاني
  audioManager.loadSound("explotionXilos2", "src/assets/audio/explosion1.mp3");

   //صوت اطلاق الصاروخ للاعب
   audioManager.loadSound("missileSound", "src/assets/audio/engine_takeoff.wav");

   //صوت انفجار العدو
   audioManager.loadSound("explosionEnemy", "src/assets/audio/explosion1.flac");

   //صوت الضرر للاعب
   audioManager.loadSound("damageSound", "src/assets/audio/hit01.wav");

   //صوت الباور ابس 
   audioManager.loadSound("powerUp", "src/assets/audio/sfx_shieldUp.ogg");

    // == اصوات الحوار في حالة انترو == //
  //صوت الصفير
  audioManager.loadSound(
    "pep",
    "src/assets/audio/alexis_gaming_cam-radio-338296.mp3"
  );

  //صوت التشفير
  audioManager.loadSound(
    "tech",
    "src/assets/audio/freesound_community-fm-radio-static-82334_[cut_2sec].mp3"
  );

  //صوت الحوار 1
  audioManager.loadSound(
    "dialog1",
    "src/assets/audio/صوت الحوار 1 معدل_104846549.mp3"
  );

  //صوت الحوار 2
  audioManager.loadSound(
    "dialog2",
    "src/assets/audio/صوت الحوار 2 معدل_105048685.mp3"
  );

  //صوت الحوار 3
  audioManager.loadSound(
    "dialog3",
    "src/assets/audio/صوت الحوار 3_105241023.mp3"
  );

  //======== اصوات متكررة ========//

  //صوت رصاص اللاعب
  audioManager.loadPoolSound("fire", "src/assets/audio/sfx_laser2.ogg", 10);

  //صوت رصاص العدو
  audioManager.loadPoolSound("EnemyWeapon", "src/assets/audio/FX061.mp3", 10);
}
