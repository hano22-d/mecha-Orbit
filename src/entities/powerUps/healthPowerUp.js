import { assetsManager } from "../../systems/AssetsManager";
import { PowerUp } from "../PowerUp";

export class HealthPowerUp extends PowerUp {
  constructor(canvas,x, y) {
    super(canvas,x, y); 
    this.image = assetsManager.getImage("healthP");
  }

  apply(player, gameTimer, game) {
    player.heal(10);
    game.flash.alpha = 0.5;
    game.flash.color = "green";
  }
}