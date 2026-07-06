const ranks = [
  "src/assets/UI/rankIcon/ChatGPT Image 1 يونيو 2026، 08_07_57 م (1).png",
  "src/assets/UI/rankIcon/22.png",
  "src/assets/UI/rankIcon/13.png",
  "src/assets/UI/rankIcon/2-1.png",
  "src/assets/UI/rankIcon/rookie2.png",
  "src/assets/UI/rankIcon/rookie3.png",
  "src/assets/UI/rankIcon/pilot1.png",
  "src/assets/UI/rankIcon/pilot2.png",
  "src/assets/UI/rankIcon/pilot3.png",
  "src/assets/UI/rankIcon/veteran1.png",
  "src/assets/UI/rankIcon/veteran2.png",
  "src/assets/UI/rankIcon/veteran3.png",
  "src/assets/UI/rankIcon/ace1.png",
  "src/assets/UI/rankIcon/ace2.png",
  "src/assets/UI/rankIcon/ace3.png",
  "src/assets/UI/rankIcon/eliteAce1.png",
  "src/assets/UI/rankIcon/eliteAce2.png",
  "src/assets/UI/rankIcon/eliteAce3.png",
  "src/assets/UI/rankIcon/squadron1.png",
  "src/assets/UI/rankIcon/squadron2.png",
  "src/assets/UI/rankIcon/squadron3.png",
  "src/assets/UI/rankIcon/starcommander1.png",
  "src/assets/UI/rankIcon/starcommander3.png",
  "src/assets/UI/rankIcon/guardian1.png",
  "src/assets/UI/rankIcon/gua.png",
  "src/assets/UI/rankIcon/guardian3.png",
  "src/assets/UI/rankIcon/legend1.png",
  "src/assets/UI/rankIcon/legend2.png",
  "src/assets/UI/rankIcon/legend3.png",
];

//دالة تحديد مستوى اللاعب
export function playerRank(showScore, score) {
  const pointsPerLevel = 100;

  const totalLevel = Math.floor(score / pointsPerLevel);
  const rankIndex = Math.floor(totalLevel);
  const safeRankIndex = Math.min(rankIndex, ranks.length - 1);

  const rankName = ranks[safeRankIndex];

  showScore.src = rankName;
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

