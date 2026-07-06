const BUFFER_ZONE = 200; // المنطقة العازلة خارج حدود الشاشة لتوليد النجوم
const TWINKLE_SPEED = 0.05; // سرعة وميض وتغير لمعان النجوم

export class Background {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;

    this.layers = [
      { starCount: 120, movementSpeed: 0.2, starSize: 1, stars: [] }, // الطبقة البعيدة (صغيرة وبطيئة)
      { starCount: 80,  movementSpeed: 0.5, starSize: 2, stars: [] }, // الطبقة المتوسطة
      { starCount: 60,  movementSpeed: 1.0, starSize: 3, stars: [] }, // الطبقة القريبة (كبيرة وسريعة)
    ];

    // حركة الكاميرا السابقة لحساب حركة النجوم العكسية
    this.previousCameraX = null;
    this.previousCameraY = null;

    this.spaceGradient = null;

    this._initSpaceGradient();
    this.init();
  }

// ========== دالة توليد التدرج اللوني للخلفية السوداء ========= //
  _initSpaceGradient() {
    const ctx = this.canvas.getContext("2d");
    this.spaceGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    this.spaceGradient.addColorStop(0, "#000010"); // أزرق ليلي داكن جداً في الأعلى
    this.spaceGradient.addColorStop(1, "#000000"); // أسود مطلق في الأسفل
  }

// ============ دالة توليد النجوم =========== //
  init() {
    for (let layer of this.layers) {
      for (let i = 0; i < layer.starCount; i++) {
        layer.stars.push({
          // توزيع النجوم عشوائياً داخل الكانفاس + المنطقة العازلة المحيطة به
          x: this.camera.x - BUFFER_ZONE + Math.random() * (this.canvas.width + BUFFER_ZONE * 2),
          y: this.camera.y - BUFFER_ZONE + Math.random() * (this.canvas.height + BUFFER_ZONE * 2),
          opacity: Math.random(), // درجة لمعان عشوائية بدايةً
        });
      }
    }
  }

  // ========= دالة اعادة تدوير النجوم ========== //
  _recycleStarIfOutOfBounds(star) {
    const isPastBottom = star.y > this.camera.y + this.canvas.height + BUFFER_ZONE;
    const isPastTop    = star.y < this.camera.y - BUFFER_ZONE;
    const isPastRight  = star.x > this.camera.x + this.canvas.width + BUFFER_ZONE;
    const isPastLeft   = star.x < this.camera.x - BUFFER_ZONE;

    if (isPastBottom || isPastTop || isPastRight || isPastLeft) {
      star.x = this.camera.x - BUFFER_ZONE + Math.random() * (this.canvas.width + BUFFER_ZONE * 2);
      star.y = this.camera.y - BUFFER_ZONE + Math.random() * (this.canvas.height + BUFFER_ZONE * 2);
    }
  }

  update() {
    //اذا لم تكن هناك قيمة للكاميرا في الفريم السابق, نجعل الفريم السابق هو نفسه الحالي
    const prevCamX = this.previousCameraX !== null ? this.previousCameraX : this.camera.x;
    const prevCamY = this.previousCameraY !== null ? this.previousCameraY : this.camera.y;

    // حساب مقدار المسافة التي تحركتها الكاميرا فعلياً في هذا الفريم
    const cameraDeltaX = this.camera.x - prevCamX;
    const cameraDeltaY = this.camera.y - prevCamY;

    for (let layer of this.layers) {
      for (let star of layer.stars) {
        
        star.y += layer.movementSpeed;

        //النجوم تتحرك عكس اتجاه الكاميرا وبسرعات متفاوتة
        star.x += cameraDeltaX * layer.movementSpeed;
        star.y += cameraDeltaY * layer.movementSpeed;

        //تغير الشفافية
        star.opacity += (Math.random() - 0.5) * TWINKLE_SPEED;

        // إعادة تدوير النجوم الخارجة عن نطاق الكاميرا
        this._recycleStarIfOutOfBounds(star);
      }
    }

    // حفظ إحداثيات الكاميرا الحالية لتصبح هي المرجع في الفريم القادم
    this.previousCameraX = this.camera.x;
    this.previousCameraY = this.camera.y;
  }
 
  draw(ctx, camera) {
    // رسم الخلفية السوداء المتدرحة
    ctx.fillStyle = this.spaceGradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // رسم النجوم لكل طبقة بحجمها وشفافيتها الخاصة
    for (let layer of this.layers) {
      for (let star of layer.stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;

        ctx.fillRect(
          star.x - camera.x,
          star.y - camera.y,
          layer.starSize,
          layer.starSize
        );
      }
    }
  }
}