import { UpdateAnimationFrame } from "../utils/helpers";
import { stateManager } from "./state";
import { dialog } from "../ui/introUi";
import { assetsManager } from "../systems/AssetsManager";

export class IntroScene {

  static planeImage = null;
  static fireFrames = [];
  static imagesPreloaded = false;

  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.canvasWidth = canvas.logicalWidth;
    this.canvasHeight = canvas.logicalHeight;
    this.ctx = ctx;

    this.isMobile = this.canvasHeight < 500 || this.canvasWidth < 768;

    this.planeBaseWidth = this.isMobile ? 80 : 160;
    this.planeBaseHeight = this.isMobile ? 80 : 160;

    this.isFinished = false;
    this.timer = 0;
    this.duration = 16000;

    this.playerX = this.canvasWidth / 2;
    this.playerY = this.canvasHeight * 0.65;

    this.playerScale = 0.05;
    this.targetScale = 1.0; 

    // 🔥 إنشاء التدرج اللوني وتخزينه كـ Cache مرة واحدة فقط لراحة المعالج
    this.spaceGradient = null;
    this._initGradient();

    // 🟢 جلب الأصول المسرعة فوراً من الذاكرة الرام ومنع الـ Lag عند إقلاع المشهد
    if (!IntroScene.imagesPreloaded) {
      
      // 1️⃣ جلب صورة الطائرة الأساسية عبر مفتاحها الثابت
      IntroScene.planeImage = assetsManager.getImage("playerShip");

      // 2️⃣ جلب فريمات لهب المحرك الثلاثة (fire1, fire2, fire3) بنظام مصفوفة مدمج ونظيف
      IntroScene.fireFrames = Array.from({ length: 3 }, (_, i) => {
        return assetsManager.getImage(`fire${i + 1}`);
      });

      IntroScene.imagesPreloaded = true;
      console.log("🎬 تم شحن صور وفريمات مشهد الإنترو من الذاكرة بنجاح كامل!");
    }

    this.fireframeSettings = {
      currentFrame: 0,
      frameInterval: 40,
      frameTimer: 0,
    };

    this.stars = [];
    this.initStars();

    this.cameraShake = 0; 
    this.cameraAngle = -0.3;

    this.dialogSoundSetting = {
      dialog1: false,
      dialog2: false,
      dialog3: false,
      dialog4: false,
    };
  }

  // دالة مخصصة لإنشاء التدرج اللوني عند بدء المشهد أو تحديث أبعاد الكانفاس
  _initGradient() {
    this.spaceGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    this.spaceGradient.addColorStop(0, "#000010");
    this.spaceGradient.addColorStop(1, "#000000");
  }

  initStars() {
    this.stars = [];
    const starCount = this.isMobile ? 80 : 150;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        percentX: Math.random(),
        y: Math.random() * this.canvasHeight,
        length: this.isMobile ? 12 : 25,
        speed: Math.random() * 1.5,
      });
    }
  }

  update(deltaTime) {
    this.timer += deltaTime;

    // إذا تغيرت أبعاد الشاشة، نعيد حساب حجم الكانفاس والتدرج
    if (this.canvasWidth !== this.canvas.logicalWidth || this.canvasHeight !== this.canvas.logicalHeight) {
      this.canvasWidth = this.canvas.logicalWidth;
      this.canvasHeight = this.canvas.logicalHeight;
      this._initGradient(); // تحديث أبعاد التدرج لكي لا يتمطط رسومياً
    }

    this.isMobile = this.canvasHeight < 500 || this.canvasWidth < 768;
    this.planeBaseWidth = this.isMobile ? 80 : 160;
    this.planeBaseHeight = this.isMobile ? 80 : 160;

    let timeFactor = Math.max(0, 1 - this.timer / this.duration);

    const len = this.stars.length;
    for (let i = 0; i < len; i++) {
      const star = this.stars[i];
      star.y += star.speed * deltaTime * 1.5;
      star.length = (this.isMobile ? 12 : 25) * timeFactor;
      star.speed = 1.5 * timeFactor;

      if (star.y > this.canvasHeight) {
        star.y = 0;
        star.percentX = Math.random(); 
      }
    }

    if (this.playerScale < this.targetScale) {
      this.playerScale += 0.0002 * deltaTime;
    } else {
      this.playerScale = this.targetScale;
    }

    UpdateAnimationFrame(this.fireframeSettings, IntroScene.fireFrames, deltaTime);

    this.cameraAngle = Math.sin(this.timer * 0.002) * 0.25 * timeFactor;

    if (this.timer >= this.duration) {
      this.isFinished = true;
    }
    
    if (this.isFinished) {
      stateManager.setState("playing");
      return;
    }

    if (typeof dialog === "function") {
      dialog(this, stateManager);
    }
  }

  draw() {
    // 🚀 استدعاء التدرج المخزن في الذاكرة مسبقاً (سريع جداً)
    this.ctx.fillStyle = this.spaceGradient;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.save();

    this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.ctx.rotate(this.cameraAngle);
    this.ctx.translate(-this.canvasWidth / 2, -this.canvasHeight / 2);

    let glowFactor = this.timer / this.duration;
    let starAlpha = 0.3 + glowFactor * 0.7;

    const starLen = this.stars.length;

    // الممر الأول (Meme/Pass 1): رسم هالة التوهج الزرقاء العريضة خلف النجوم بـ Draw Call واحد
    this.ctx.strokeStyle = `rgba(46, 154, 255, ${0.4 * glowFactor})`;
    this.ctx.lineWidth = 3.5; // الخط أعرض ليعطي شعور التوهج المحيط
    this.ctx.beginPath();
    for (let i = 0; i < starLen; i++) {
      const star = this.stars[i];
      const drawX = Math.round(star.percentX * this.canvasWidth);
      const drawY = Math.round(star.y);
      this.ctx.moveTo(drawX, drawY);
      this.ctx.lineTo(drawX, Math.round(drawY + star.length));
    }
    this.ctx.stroke();

    // الممر الثاني (Pass 2): رسم النجمة البيضاء الأساسية الحادة فوق التوهج مباشرة
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${starAlpha})`;
    this.ctx.lineWidth = 1.5; // خط أنحف بالمنتصف
    this.ctx.beginPath();
    for (let i = 0; i < starLen; i++) {
      const star = this.stars[i];
      const drawX = Math.round(star.percentX * this.canvasWidth);
      const drawY = Math.round(star.y);
      this.ctx.moveTo(drawX, drawY);
      this.ctx.lineTo(drawX, Math.round(drawY + star.length));
    }
    this.ctx.stroke();

    // حساب حجم وموقع طائرة اللاعب بشكل تفاعلي مقرب هندسياً
    const currentWidth = Math.round(this.planeBaseWidth * this.playerScale);
    const currentHeight = Math.round(this.planeBaseHeight * this.playerScale);

    this.playerX = this.canvasWidth / 2;
    this.playerY = this.canvasHeight * 0.65;

    const drawPlayerX = Math.round(this.playerX - currentWidth / 2);
    const drawPlayerY = Math.round(this.playerY - currentHeight / 2);

    if (IntroScene.planeImage) {
      this.ctx.drawImage(IntroScene.planeImage, drawPlayerX, drawPlayerY, currentWidth, currentHeight);
    }

    // حساب حجم ومواقع لهب المحركات المزدوجة المتناسقة نسبياً
    const currentFireWidth = Math.round((this.isMobile ? 9 : 18) * this.playerScale);
    const currentFireHeight = Math.round((this.isMobile ? 20 : 40) * this.playerScale);
    const frame = IntroScene.fireFrames[this.fireframeSettings.currentFrame];

    if (frame) {
      const fireY = Math.round(this.playerY + currentHeight / 2 - (this.isMobile ? 5 : 10) * this.playerScale);
      const offset = (this.isMobile ? 6 : 12) * this.playerScale;
      
      const leftFireX = Math.round(this.playerX - offset - currentFireWidth / 2);
      const rightFireX = Math.round(this.playerX + offset - currentFireWidth / 2);

      this.ctx.drawImage(frame, leftFireX, fireY, currentFireWidth, currentFireHeight);
      this.ctx.drawImage(frame, rightFireX, fireY, currentFireWidth, currentFireHeight);
    }

    this.ctx.restore();
  }
}