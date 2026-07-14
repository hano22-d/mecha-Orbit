import { assetsManager } from "../systems/AssetsManager";

// 🟢 مصفوفة المفاتيح (Keys) المرتبة تِبعاً لنفس الترتيب القديم للصور لديك
const rankKeys = [
  "rank1-1", "rank1-2", "rank1-3",
  "rank2-1", "rank2-2", "rank2-3",
  "rank3-1", "rank3-2", "rank3-3",
  "rank4-1", "rank4-2", "rank4-3",
  "rank5-1", "rank5-2", "rank5-3",
  "rank6-1", "rank6-2", "rank6-3",
  "rank7-1", "rank7-2", "rank7-3",
  "rank8-1", "rank8-2", // هنا لديك مفتاحان فقط في هذه الفئة بناءً على مصفوفتك
  "rank9-1", "rank9-2", "rank9-3",
  "rank10-1", "rank10-2", "rank10-3"
];

// دالة تحديد مستوى اللاعب وتحديث واجهة المستخدم فوراً
export function playerRank(showScore, score) {
  const pointsPerLevel = 100;

  const totalLevel = Math.floor(score / pointsPerLevel);
  const rankIndex = Math.floor(totalLevel);
  const safeRankIndex = Math.min(rankIndex, rankKeys.length - 1);

  // 1️⃣ جلب المفتاح المقابل لمستوى اللاعب الحالي
  const currentRankKey = rankKeys[safeRankIndex];

  // 2️⃣ سحب كائن الصورة الجاهز فوراً من الذاكرة الرام
  const rankImageObject = assetsManager.getImage(currentRankKey);

  if (rankImageObject && showScore) {
    // 3️⃣ تمرير الصورة المحملة مسبقاً لعنصر الواجهة ليتم عرضها بلمح البصر دون تحميل
    showScore.src = rankImageObject.src;
  }
}

//دالة ادارة فريمات الانيميشن
export function UpdateAnimationFrame(object, frame,deltaTime) {
  object.frameTimer += deltaTime;
  if (object.frameTimer > object.frameInterval) {
    object.currentFrame++;

    if (object.currentFrame >= frame.length) {
      object.currentFrame = 0;
    }
    object.frameTimer = 0;
  }
}

//دالة تحديد اداء اللاعب بعد الفوز
export function calculateStars(accuracy, healthPercentage,comboAchieved,enemyType) {
  let stars = 1; // يحصل على نجمة تلقائية بمجرد الفوز وإنهاء المرحلة

  // النجمة الثانية: للدقة العالية
  if (accuracy >= 75) stars++;

  // النجمة الثالثة: للحفاظ على سلامة المركبة
  if (healthPercentage >= 80) stars++;

  //النجمة الرابعة: تحقيق عشر سكور متتالي بدون اصابة
  if(comboAchieved >= 10) stars++

  //النجمة الخامسة: تحقيق الاعداد التالية من السكور
  if(enemyType.chaser >= 10 && enemyType.dodger >= 10 && enemyType.shooter >= 5) stars++

  return stars; 
}

