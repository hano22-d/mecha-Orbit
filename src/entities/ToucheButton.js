// ==========================================================================
// 🕹️ Mecha-Orbit: Touch Controls Engine - TouchButton Class with Juice
// ==========================================================================

export class TouchButton {
    constructor({ canvas, type, imageSrc, relativeX, relativeY, radius }) {
      this.canvas = canvas; 
      this.type = type;     
  
      this.x = relativeX; 
      this.y = relativeY;
      this.startX = relativeX;
      this.startY = relativeY;
      
      this.radius = radius; 
      this.isPressed = false;
  
      this.image = new Image();
      this.image.src = imageSrc;
      
      this.isMobile = canvas.logicalHeight < 500 || canvas.logicalWidth < 768;
  
      this.opacity = 0.5;       
      this.fadeTimer = 0;      
      this.delayDuration = 1000; 
    }
  
    checkTouch(touchX, touchY) {
      const dx = touchX - this.x;
      const dy = touchY - this.y;
      const distanceSquared = dx * dx + dy * dy;
      
      let currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;
      const radiusSquared = currentRadius * currentRadius;
  
      if (distanceSquared <= radiusSquared) {
        this.isPressed = true;
        return true;
      }
      return false;
    }
  
    update(deltaTime) {
      let targetOpacity = 0.5; 
  
      if (this.isPressed) {
        targetOpacity = 1.0;
        this.fadeTimer = 0; 
      } else {
        this.fadeTimer += deltaTime;
  
        if (this.fadeTimer < this.delayDuration) {
          targetOpacity = 1.0;
        } else {
          targetOpacity = 0.5;
        }
      }

      this.opacity += (targetOpacity - this.opacity) * (0.008 * deltaTime);
      
      // تأمين الحدود برمجياً بين 0.5 و 1.0
      if (this.opacity < 0.5) this.opacity = 0.5;
      if (this.opacity > 1.0) this.opacity = 1.0;
    }
  
    draw(ctx) {
      ctx.save(); 
  
      ctx.globalAlpha = this.opacity;
  
      let currentRadius = this.isMobile ? this.radius * 0.7 : this.radius;
  
      if (this.isPressed) {
        currentRadius = currentRadius * 0.9;
      }
  
      ctx.drawImage(
        this.image,
        this.x - currentRadius,
        this.y - currentRadius,
        currentRadius * 2,
        currentRadius * 2
      );
  
      ctx.restore(); 
    }
  }