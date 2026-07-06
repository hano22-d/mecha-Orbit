import { UpdateAnimationFrame } from "../utils/helpers";
import { stateManager } from "./state";
import { dialog } from "../ui/introUi";

// IntroScene.js
export class IntroScene {
  constructor(canvas, ctx) {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.ctx = ctx;

    this.isFinished = false;
    this.timer = 0;
    this.duration = 16000;

    this.playerX = 680;
    this.playerY = 450;
    this.playerScale = 0.05;
    this.targetScale = 1.0; // الحجم النهائي الطبيعي للطائرة

    this.playerImage = new Image();
    this.playerImage.src =
      "/assets/Default_Prompt_Flat_2D_topdown_perspective_game_asset_sprite_h_0_f9c8efea-de69-412a-8cb1-d8a94ba66635_0.png"; // نفس مسار طائرتك الحالية

    //صور فريمات اللهب
    this.fireFrames = [
      "/assets/fire01.png",
      "/assets/fire02.png",
      "/assets/fire03.png",
    ].map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    //اعدادات الانيميشن للهب
    this.fireframeSettings = {
      currentFrame: 0,
      frameInterval: 40,
      frameTimer: 0,
    };

    this.stars = [];
    this.initStars();

    this.cameraShake = 0; // شدة الاهتزاز
    this.cameraAngle = -0.3;

    //ادارة اصوات الحوار
    this.dialogSoundSetting = {
      dialog1: false,
      dialog2: false,
      dialog3: false,
      dialog4: false,
    };
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        length: 25,
        speed: Math.random() * 1.5,
      });
    }
  }

  update(deltaTime) {
    this.timer += deltaTime;

    let timeFactor = Math.max(0, 1 - this.timer / this.duration);

    this.stars.forEach((star) => {
      star.y += star.speed * deltaTime * 1.5;
      star.length = 25 * timeFactor;
      star.speed = 1.5 * timeFactor;
      if (star.y > this.canvasHeight) {
        star.y = 0;
        star.x = Math.random() * this.canvasWidth;
      }
    });

    if (this.playerScale < this.targetScale) {
      this.playerScale += 0.0002 * deltaTime;
    } else {
      this.playerScale = this.targetScale;
    }

    //تحديث فريمات اللهب
    UpdateAnimationFrame(this.fireframeSettings, this.fireFrames, deltaTime);

    this.cameraAngle = Math.sin(this.timer * 0.002) * 0.25 * timeFactor;

    if (this.timer >= this.duration) {
      this.isFinished = true;
    }
    if (this.isFinished) stateManager.setState("playing");

 dialog(this,stateManager);
  }

  draw() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, myCanvas.height);
    gradient.addColorStop(0, "#000010");
    gradient.addColorStop(1, "#000000");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.save();

    this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.ctx.rotate(this.cameraAngle);

    this.ctx.translate(-this.canvasWidth / 2, -this.canvasHeight / 2);

    let glowFactor = this.timer / this.duration;
    let starAlpha = 0.3 + glowFactor * 0.7;

    this.ctx.save();

    this.ctx.shadowBlur = 4 * glowFactor;
    this.ctx.shadowColor = "rgba(46, 154, 255, 0.8)";
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${starAlpha})`;
    this.ctx.lineWidth = 1.5;
    this.stars.forEach((star) => {
      this.ctx.beginPath();
      this.ctx.moveTo(star.x, star.y);
      this.ctx.lineTo(star.x, star.y + star.length);
      this.ctx.stroke();
    });

    this.ctx.restore();

    //رسم الطائرة
    const currentWidth = 160 * this.playerScale;
    const currentHeight = 160 * this.playerScale;

    this.ctx.drawImage(
      this.playerImage,
      this.playerX - currentWidth / 2,
      this.playerY - currentHeight / 2,
      currentWidth,
      currentHeight
    );

    //رسم اللهب
    const currentFireWidth = 18 * this.playerScale;
    const currentFireHeight = 40 * this.playerScale;

    const frame = this.fireFrames[this.fireframeSettings.currentFrame];

    const fireY = this.playerY + currentHeight / 2 - 10 * this.playerScale;

    const leftFireX =
      this.playerX - 12 * this.playerScale - currentFireWidth / 2;
    const rightFireX =
      this.playerX + 12 * this.playerScale - currentFireWidth / 2;

    // 🔥 رسم لهب المحرك اليسار
    this.ctx.drawImage(
      frame,
      leftFireX,
      fireY,
      currentFireWidth,
      currentFireHeight
    );

    // 🔥 رسم لهب المحرك اليمين
    this.ctx.drawImage(
      frame,
      rightFireX,
      fireY,
      currentFireWidth,
      currentFireHeight
    );
    this.ctx.restore();

    // 🟢 3. رسم أشرطة السينما السوداء العريضة في الأعلى والأسفل (Letterboxing)
    /*  this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, this.canvasWidth, 60); // شريط علوي
      this.ctx.fillRect(0, this.canvasHeight - 60, this.canvasWidth, 60); // شريط سفلي*/
  }
}
