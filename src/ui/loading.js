import { assetsManager } from "../systems/AssetsManager.js";
import { Explosion } from "../entities/Explosion.js";
import { Debris } from "../entities/Debris.js";

export class LoadingScene {
  constructor(onCompleteCallback) {
    this.onCompleteCallback = onCompleteCallback;

    // الإمساك بعناصر الـ HTML مرة واحدة فقط عند البناء
    this.progressBar = document.getElementById("progress-bar");
    this.loadingPercentage = document.getElementById("loading-percentage");
    this.loadingText = document.getElementById("loading-text");
    this.loadingScreen = document.getElementById("loading-screen");

    // الجمل العشوائية التشويقية
    this.hints = [
      "Calibrating thruster propulsion systems...",
      "Charging advanced plasma lasers...",
      "Triangulating boss XilosVex coordinates...",
      "Initializing energy cores and optical shields...",
    ];
    // قائمة الأصول المركزية الخاصة باللعبة

    // 📋 مصفوفة البيانات المركزية لجميع صور اللعبة (سهلة التعديل والإضافة مستقبلاً)
    this.gameImages = [
      { key: "rock", src: "/assets/rock2.png" },
      { key: "playerShip", src: "/assets/player.png" },
      { key: "enemyNormal", src: "/assets/normalEnemy.png" },
      { key: "enemyChaser", src: "/assets/chaser.png" },
      { key: "enemyDodger", src: "/assets/dodger.png" },
      { key: "enemyShooter", src: "/assets/shooter.png" },

      { key: "healthP", src: "/assets/powerUp/powerupGreen_bolt.png" },
      { key: "missilwP", src: "/assets/powerUp/missilePowerUp.png" },
      { key: "weaponP", src: "/assets/powerUp/things_gold.png" },
      { key: "sheildP", src: "/assets/powerUp/shield_bronze.png" },

      //فريمات الشيلد
      { key: "sheildFrame1", src: "/assets/powerUp/00.png" },
      { key: "sheildFrame2", src: "/assets/powerUp/01.png" },
      { key: "sheildFrame3", src: "/assets/powerUp/02.png" },
      { key: "sheildFrame4", src: "/assets/powerUp/03.png" },
      { key: "sheildFrame5", src: "/assets/powerUp/04.png" },
      { key: "sheildFrame6", src: "/assets/powerUp/05.png" },
      { key: "sheildFrame7", src: "/assets/powerUp/06.png" },
      { key: "sheildFrame8", src: "/assets/powerUp/07.png" },
      { key: "sheildFrame9", src: "/assets/powerUp/08.png" },
      { key: "sheildFrame10", src: "/assets/powerUp/09.png" },
      { key: "sheildFrame11", src: "/assets/powerUp/10.png" },

      //فريمات لهب محرك الطائرة
      { key: "fire1", src: "/assets/fire01.png" },
      { key: "fire2", src: "/assets/fire02.png" },
      { key: "fire3", src: "/assets/fire03.png" },

      //فريمات الشظايا
      { key: "debris1", src: "/assets/playerShip1_damage1.png" },
      { key: "debris2", src: "/assets/playerShip1_damage2.png" },
      { key: "debris3", src: "/assets/playerShip1_damage3.png" },

      //الاسلحة
      { key: "bossW", src: "/assets/weapon/bossWeapon.png" },
      { key: "enemyW", src: "/assets/weapon/enemyWeapon.png" },
      { key: "fastW", src: "/assets/weapon/fastWeapon.png" },
      { key: "heavyW", src: "/assets/weapon/heavyWeapon.png" },
      { key: "missile", src: "/assets/weapon/missile.png" },
      { key: "normalW", src: "/assets/weapon/normalWeapon.png" },

      //الانفجارات
      {
        key: "explosion1",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_1.png",
      },
      {
        key: "explosion2",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_2.png",
      },
      {
        key: "explosion3",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_3.png",
      },
      {
        key: "explosion4",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_4.png",
      },
      {
        key: "explosion5",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_5.png",
      },
      {
        key: "explosion6",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_6.png",
      },
      {
        key: "explosion7",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_7.png",
      },
      {
        key: "explosion8",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_8.png",
      },
      {
        key: "explosion9",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_9.png",
      },
      {
        key: "explosion10",
        src: "/assets/explotionFrame/enemyExFrame/Explosion_10.png",
      },

      //صور boss
      {
        key: "bossFrame1",
        src: "/assets/bossFrame1.png",
      },
      {
        key: "bossFrame2",
        src: "/assets/bossFrame2.png",
      },

      //انفجارات الزعيم
      //الانفجارات
      {
        key: "explosionB1",
        src: "/assets/explotionFrame/xilosexplotionFrame/0009.png",
      },
      {
        key: "explosionB2",
        src: "/assets/explotionFrame/xilosexplotionFrame/0011.png",
      },
      {
        key: "explosionB3",
        src: "/assets/explotionFrame/xilosexplotionFrame/0013.png",
      },
      {
        key: "explosionB4",
        src: "/assets/explotionFrame/xilosexplotionFrame/0015.png",
      },
      {
        key: "explosionB5",
        src: "/assets/explotionFrame/xilosexplotionFrame/0017.png",
      },
      {
        key: "explosionB6",
        src: "/assets/explotionFrame/xilosexplotionFrame/0019.png",
      },
      {
        key: "explosionB7",
        src: "/assets/explotionFrame/xilosexplotionFrame/0021.png",
      },
      {
        key: "explosionB8",
        src: "/assets/explotionFrame/xilosexplotionFrame/0023.png",
      },
      {
        key: "explosionB9",
        src: "/assets/explotionFrame/xilosexplotionFrame/0025.png",
      },
      {
        key: "explosionB10",
        src: "/assets/explotionFrame/xilosexplotionFrame/0027.png",
      },
      {
        key: "explosionB11",
        src: "/assets/explotionFrame/xilosexplotionFrame/0029.png",
      },
      {
        key: "explosionB12",
        src: "/assets/explotionFrame/xilosexplotionFrame/0031.png",
      },
      {
        key: "explosionB13",
        src: "/assets/explotionFrame/xilosexplotionFrame/0031.png",
      },
      {
        key: "explosionB14",
        src: "/assets/explotionFrame/xilosexplotionFrame/0035.png",
      },
      {
        key: "explosionB15",
        src: "/assets/explotionFrame/xilosexplotionFrame/0037.png",
      },
      {
        key: "explosionB16",
        src: "/assets/explotionFrame/xilosexplotionFrame/0039.png",
      },
      {
        key: "explosionB17",
        src: "/assets/explotionFrame/xilosexplotionFrame/0041.png",
      },

      //انفجارات الزعيم2
      {
        key: "explosionC1",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0005.png",
      },
      {
        key: "explosionC2",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0010.png",
      },
      {
        key: "explosionC3",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0012.png",
      },
      {
        key: "explosionC4",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0014.png",
      },
      {
        key: "explosionC5",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0016.png",
      },
      {
        key: "explosionC6",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0018.png",
      },
      {
        key: "explosionC7",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0020.png",
      },
      {
        key: "explosionC8",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0022.png",
      },
      {
        key: "explosionC9",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0024.png",
      },
      {
        key: "explosionC10",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0026.png",
      },
      {
        key: "explosionC11",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0028.png",
      },
      {
        key: "explosionC12",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0030.png",
      },
      {
        key: "explosionC13",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0032.png",
      },
      {
        key: "explosionC14",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0034.png",
      },
      {
        key: "explosionC15",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0036.png",
      },
      {
        key: "explosionC16",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0038.png",
      },
      {
        key: "explosionC17",
        src: "/assets/explotionFrame/xilosexplotionFrame/explosion1_0040.png",
      },

      //ui
      { key: "baseG", src: "/assets/UI/Base_Goistik.png" },
      { key: "knobG", src: "/assets/UI/knob_Goistik.png" },
      { key: "bulletButton", src: "/assets/UI/bulletButton.png" },
      { key: "missileButton", src: "/assets/UI/missileButton.png" },

      { key: "menuImage", src: "/assets/UI/menuImage.png" },

      //ranks Images
      {
        key: "rank1-1",
        src: "/assets/UI/rankIcon/ChatGPT Image 1 يونيو 2026، 08_07_57 م (1).png",
      },
      { key: "rank1-2", src: "/assets/UI/rankIcon/22.png" },
      { key: "rank1-3", src: "/assets/UI/rankIcon/13.png" },
      { key: "rank2-1", src: "/assets/UI/rankIcon/2-1.png" },
      { key: "rank2-2", src: "/assets/UI/rankIcon/rookie2.png" },
      { key: "rank2-3", src: "/assets/UI/rankIcon/rookie3.png" },
      { key: "rank3-1", src: "/assets/UI/rankIcon/pilot1.png" },
      { key: "rank3-2", src: "/assets/UI/rankIcon/pilot2.png" },
      { key: "rank3-3", src: "/assets/UI/rankIcon/pilot3.png" },
      { key: "rank4-1", src: "/assets/UI/rankIcon/veteran1.png" },
      { key: "rank4-2", src: "/assets/UI/rankIcon/veteran2.png" },
      { key: "rank4-3", src: "/assets/UI/rankIcon/veteran3.png" },
      { key: "rank5-1", src: "/assets/UI/rankIcon/ace1.png" },
      { key: "rank5-2", src: "/assets/UI/rankIcon/ace1.png" },
      { key: "rank5-3", src: "/assets/UI/rankIcon/ace3.png" },
      { key: "rank6-1", src: "/assets/UI/rankIcon/eliteAce1.png" },
      { key: "rank6-2", src: "/assets/UI/rankIcon/eliteAce2.png" },
      { key: "rank6-3", src: "/assets/UI/rankIcon/eliteAce3.png" },
      { key: "rank7-1", src: "/assets/UI/rankIcon/squadron1.png" },
      { key: "rank7-2", src: "/assets/UI/rankIcon/squadron2.png" },
      { key: "rank7-3", src: "/assets/UI/rankIcon/squadron3.png" },
      { key: "rank8-1", src: "/assets/UI/rankIcon/starcommander1.png" },
      { key: "rank8-2", src: "/assets/UI/rankIcon/starcommander3.png" },
      { key: "rank9-1", src: "/assets/UI/rankIcon/guardian1.png" },
      { key: "rank9-2", src: "/assets/UI/rankIcon/gua.png" },
      { key: "rank9-3", src: "/assets/UI/rankIcon/guardian3.png" },
      { key: "rank10-1", src: "/assets/UI/rankIcon/legend1.png" },
      { key: "rank10-2", src: "/assets/UI/rankIcon/legend2.png" },
      { key: "rank10-3", src: "/assets/UI/rankIcon/legend3.png" },
    ];

    this.gameSounds = [
      //backgrounds Sounds
      {
        key: "winSound",
        src: "/assets/audio/starostin-awards-ceremony-winner-music-263142.mp3",
      },
      {
        key: "menuSound",
        src: "/assets/audio/background audius/ObservingTheStar.ogg",
      },
      {
        key: "playingBgSound",
        src: "/assets/audio/background audius/pioneers_meets_space-mix2.ogg",
      },
      {
        key: "zilosBgSound",
        src: "/assets/audio/background audius/Project Ex - Genesis One (freetouse.com).mp3",
      },

      //intro Sounds
      { key: "pep", src: "/assets/audio/alexis_gaming_cam-radio-338296.mp3" },
      {
        key: "tushh",
        src: "/assets/audio/freesound_community-fm-radio-static-82334_[cut_2sec].mp3",
      },
      { key: "dialog1", src: "/assets/audio/صوت الحوار 1 معدل_104846549.mp3" },
      { key: "dialog2", src: "/assets/audio/صوت الحوار 2 معدل_105048685.mp3" },
      { key: "dialog3", src: "/assets/audio/صوت الحوار 3_105241023.mp3" },

      //explosion
      {
        key: "playerExp",
        src: "/assets/audio/cannon_hit.ogg",
      },
      {
        key: "bossExp",
        src: "/assets/audio/explosion1.flac",
      },

      {
        key: "missileSound",
        src: "/assets/audio/engine_takeoff.wav",
      },
      {
        key: "bulletEnemy",
        src: "/assets/audio/FX061.mp3",
      },
      {
        key: "bulletPlayer",
        src: "/assets/audio/sfx_laser2.ogg",
      },
      {
        key: "playerHit",
        src: "/assets/audio/hit01.wav",
      },
      {
        key: "powerUps",
        src: "/assets/audio/sfx_shieldUp.ogg",
      },

      {
        key: "zilos",
        src: "/assets/audio/xailosVex.mp3",
      },
    ];
  }

  // دالة تشغيل خط إنتاج التحميل
  start() {
    // 1. تسجيل الصور تلقائياً
    const imagesLen = this.gameImages.length;
    for (let i = 0; i < imagesLen; i++) {
      assetsManager.queueImage(this.gameImages[i].key, this.gameImages[i].src);
    }

    // 2. تسجيل الأصوات تلقائياً
    const soundsLen = this.gameSounds.length;
    for (let i = 0; i < soundsLen; i++) {
      assetsManager.queueSound(this.gameSounds[i].key, this.gameSounds[i].src);
    }

    // 3. إطلاق عملية التحميل الفعلي
    assetsManager.startLoading(
      // الـ Callback الخاص بالتقدم وتحديث الـ DOM
      (percentage) => this.updateUI(percentage),

      // الـ Callback الخاص بالانتهاء والتلاشي
      () => this.finish()
    );
  }

  // تحديث عناصر الـ HTML برمجياً بشكل مستقل وخارج كلاس الـ Game
  updateUI(percentage) {
    if (this.progressBar) this.progressBar.style.width = `${percentage}%`;
    if (this.loadingPercentage)
      this.loadingPercentage.innerText = `${percentage}%`;

    if (percentage < 30) this.loadingText.innerText = this.hints[0];
    else if (percentage < 60) this.loadingText.innerText = this.hints[1];
    else if (percentage < 85) this.loadingText.innerText = this.hints[2];
    else this.loadingText.innerText = this.hints[3];
  }

  // إنهاء التحميل وإخفاء الشاشة
  finish() {
    // 🟢 حماية الكود بـ try-catch لضمان عدم توقف المتصفح في حال عدم وجود الدوال
    try {
      if (typeof Explosion._preloadAssets === "function") {
        Explosion._preloadAssets();
      } else {
        console.warn("⚠️ Explosion._preloadAssets ليست دالة معرفة.");
      }

      if (typeof Debris._preloadAssets === "function") {
        Debris._preloadAssets();
      } else {
        console.warn("⚠️ Debris._preloadAssets ليست دالة معرفة.");
      }
    } catch (error) {
      console.error("⚠️ فشل تحميل الأصول المسبق ولكن سنتابع التشغيل:", error);
    }

    // 🟢 الآن سيصل المتصفح إلى هنا دائماً وتختفي الشاشة بأمان!
    if (this.loadingScreen) {
      this.loadingScreen.classList.add("hide");

      // إزالة العنصر تماماً من المتصفح بعد انتهاء أنيميشن التلاشي (800ms)
      setTimeout(() => {
        if (this.loadingScreen && this.loadingScreen.parentNode) {
          this.loadingScreen.remove();
        }
      }, 800);
    }

    // إرسال إشارة لكلاس اللعبة الرئيسي بأن كل شيء جاهز للانطلاق!
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }
}
