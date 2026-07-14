import { Weapon } from "./Weapon";
import { Bullet } from "../entities/Bullet";
import { assetsManager } from "../systems/AssetsManager";

// 🛑 قمنا بحذف السطر القديم من هنا لمنع جلبه قبل اكتمال التحميل

export class NormalWeapon extends Weapon {
  constructor(...arg) {
    super(...arg);
    // 🟢 نجلب الصورة هنا داخل الباني (Constructor) 
    // لأن الباني لا يُستدعى إلا بعد انتهاء شاشة التحميل وبدء اللعبة، مما يضمن وجود الصورة!
    this.image = assetsManager.getImage("normalW");
  }

  shoot(bullets, canvas) {
    // زاوية ميلان اللاعب
    let angle = this.owner.currentAngle || 0;
    const fireAngle = angle * 2.5; // تضخيم زاوية ميلان اللاعب

    // زاوية الرصاصة الديناميكية
    const bulletSpeed = 8;
    const velocityX = bulletSpeed * Math.sin(fireAngle);
    const velocityY = -bulletSpeed * Math.cos(fireAngle);

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const centerX = this.owner.x;
    const centerY = this.owner.y;

    // الحسابات المحلية النسبية المعتمدة على حجم الطائرة الحالي (متجاوب بالفعل)
    const localX = this.owner.width / 2 - this.owner.width / 12;
    const localY = -(this.owner.height / 10);

    // 📱 فحص الشاشة المتجاوب للرصاصة
    const isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;

    // جعل حجم الرصاصة ديناميكياً (اللابتوب: 5x20 | الموبايل: 2.5x10)
    const bulletW = isMobile ? 2.5 : 5;
    const bulletH = isMobile ? 10 : 20;

    const bulletCenterOffset = bulletW / 2;

    // ضبط الاحداثيات الاولية للرصاصة الديناميكية حسب زاوية اللاعب
    const spawnX = centerX + (localX * cos - localY * sin) - bulletCenterOffset;
    const spawnY = centerY + (localX * sin + localY * cos);

    bullets.push(
      new Bullet({
        x: spawnX,
        y: spawnY,
        velocityX: velocityX,
        velocityY: velocityY,
        width: bulletW,
        height: bulletH,
        image: this.image, // 🟢 ستمرر الصورة الآن ككائن HTMLImageElement سليم تماماً!
        damage: 10,
        angle: fireAngle,
      })
    );
  }
}