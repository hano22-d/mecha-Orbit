import { PowerUp } from "../PowerUp";

//تحميل الصورة مرة واحدة
const healthImage = new Image();
healthImage.src = "/assets/powerUp/powerupGreen_bolt.png";

export class HealthPowerUp extends PowerUp {
  constructor(canvas,x, y) {
    super(canvas,x, y); 
    this.image = healthImage;
  }

  apply(player, gameTimer, game) {
    player.heal(10);
    game.flash.alpha = 0.5;
    game.flash.color = "green";
  }
}