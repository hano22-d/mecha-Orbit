import { UpdateAnimationFrame } from "../utils/helpers";
import { stateManager } from "./state";
import { dialog } from "../ui/introUi";

export class IntroScene {
  constructor(canvas, ctx) {
    // 🟢 الاعتماد الكامل على الأبعاد المنطقية الحقيقية للشاشة المرئية
    this.canvas = canvas;
    this.canvasWidth = canvas.logicalWidth;
    this.canvasHeight = canvas.logicalHeight;
    this.ctx = ctx;

    // 📱 فحص شرط الموبايل بناءً على الأبعاد المنطقية الخاصة بنا
    this.isMobile = this.canvasHeight < 500 || this.canvasWidth < 768;

    // 📐 تحديد أبعاد الطائرة بناءً على نوع الجهاز
    this.planeBaseWidth = this.isMobile ? 80 : 160;
    this.planeBaseHeight = this.isMobile ? 80 : 160;

    this.isFinished = false;
    this.timer = 0;
    this.duration = 16000;

    // 🎯 سنتر الطائرة ديناميكياً: في منتصف العرض تماماً، وقريبة من الأسفل نسبياً
    this.playerX = this.canvasWidth / 2;
    this.playerY = this.canvasHeight * 0.65; // توليد متناسب عمودياً مع كل شاشة

    this.playerScale = 0.05;
    this.targetScale = 1.0; 

    this.playerImage = new Image();
    this.playerImage.src =
      "/assets/Default_Prompt_Flat_2D_topdown_perspective_game_asset_sprite_h_0_f9c8efea-de69-412a-8cb1-d8a94ba66635_0.png";

    // صور فريمات اللهب
    this.fireFrames = [
      "/assets/fire01.png",
      "/assets/fire02.png",
      "/assets/fire03.png",
    ].map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    // إعدادات الانيميشن للهب
    this.fireframeSettings = {
      currentFrame: 0,
      frameInterval: 40,
      frameTimer: 0,
    };

    this.stars = [];
    this.initStars();

    this.cameraShake = 0; 
    this.cameraAngle = -0.3;

    // إدارة أصوات الحوار
    this.dialogSoundSetting = {
      dialog1: false,
      dialog2: false,
      dialog3: false,
      dialog4: false,
    };
  }

  initStars() {
    this.stars = [];
    // جعل عدد النجوم أقل قليلاً على الموبايل لتحسين الأداء
    const starCount = this.isMobile ? 80 : 150;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        length: this.isMobile ? 12 : 25, // نجوم أقصر لتناسب الشاشة الصغيرة
        speed: Math.random() * 1.5,
      });
    }
  }

  update(deltaTime) {
    this.timer += deltaTime;

    // تحديث الأبعاد ديناميكياً في حال تم تغيير حجم النافذة أو تدوير الهاتف
    this.canvasWidth = this.canvas.logicalWidth;
    this.canvasHeight = this.canvas.logicalHeight;
    this.isMobile = this.canvasHeight < 500 || this.canvasWidth < 768;
    this.planeBaseWidth = this.isMobile ? 80 : 160;
    this.planeBaseHeight = this.isMobile ? 80 : 160;

    let timeFactor = Math.max(0, 1 - this.timer / this.duration);

    this.stars.forEach((star) => {
      star.y += star.speed * deltaTime * 1.5;
      star.length = (this.isMobile ? 12 : 25) * timeFactor;
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

    // تحديث فريمات اللهب
    UpdateAnimationFrame(this.fireframeSettings, this.fireFrames, deltaTime);

    this.cameraAngle = Math.sin(this.timer * 0.002) * 0.25 * timeFactor;

    if (this.timer >= this.duration) {
      this.isFinished = true;
    }
    if (this.isFinished) stateManager.setState("playing");

    dialog(this, stateManager);
  }

  draw() {
    // 🟢 استخدام الـ logicalHeight لتصحيح التدرج اللوني بناءً على عالم المنطق المرئي
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, "#000010");
    gradient.addColorStop(1, "#000000");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.save();

    // 📐 دوران الكاميرا حول مركز الشاشة المنطقية تماماً
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
      // تقريب الإحداثيات لمنع تعرج الخطوط النجمية أثناء دوران الكاميرا
      const drawX = Math.round(star.x);
      const drawY = Math.round(star.y);
      this.ctx.moveTo(drawX, drawY);
      this.ctx.lineTo(drawX, Math.round(drawY + star.length));
      this.ctx.stroke();
    });
    this.ctx.restore();

    // 🛸 حساب حجم الطائرة التفاعلي المقرب بناءً على نوع الجهاز الحالي
    const currentWidth = Math.round(this.planeBaseWidth * this.playerScale);
    const currentHeight = Math.round(this.planeBaseHeight * this.playerScale);

    // تحديث موقع الطائرة ليكون دائماً في منتصف العرض الفعلي الحالي للشاشة
    this.playerX = this.canvasWidth / 2;
    this.playerY = this.canvasHeight * 0.65;

    const drawPlayerX = Math.round(this.playerX - currentWidth / 2);
    const drawPlayerY = Math.round(this.playerY - currentHeight / 2);

    this.ctx.drawImage(
      this.playerImage,
      drawPlayerX,
      drawPlayerY,
      currentWidth,
      currentHeight
    );

    // 🔥 حساب حجم وموقع اللهب المتناسب نسبياً
    const currentFireWidth = Math.round((this.isMobile ? 9 : 18) * this.playerScale);
    const currentFireHeight = Math.round((this.isMobile ? 20 : 40) * this.playerScale);

    const frame = this.fireFrames[this.fireframeSettings.currentFrame];

    const fireY = Math.round(this.playerY + currentHeight / 2 - (this.isMobile ? 5 : 10) * this.playerScale);

    // حساب الإزاحة الجانبية للمحركين الأيسر والأيمن حسب حجم الطائرة الحالي
    const offset = (this.isMobile ? 6 : 12) * this.playerScale;
    const leftFireX = Math.round(this.playerX - offset - currentFireWidth / 2);
    const rightFireX = Math.round(this.playerX + offset - currentFireWidth / 2);

    // رسم لهب المحرك الأيسر والأيمن بإحداثيات مقربة صلبة
    this.ctx.drawImage(frame, leftFireX, fireY, currentFireWidth, currentFireHeight);
    this.ctx.drawImage(frame, rightFireX, fireY, currentFireWidth, currentFireHeight);

    this.ctx.restore();
  }
}