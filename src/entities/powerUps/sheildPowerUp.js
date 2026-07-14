import { assetsManager } from "../../systems/AssetsManager";
import { PowerUp } from "../PowerUp";

const SHIELD_DURATION = 5000; // مدة الدرع

export class ShieldPowerUp extends PowerUp {
  constructor(canvas,x, y) {
    super(canvas,x, y);
    this.image = assetsManager.getImage("sheildP");
  }

  apply(player, gameTimer, game) {
    player.shieldEffect = true;
    game.shieldActive = true;
    game.shieldEndTime = gameTimer + SHIELD_DURATION;

    game.flash.alpha = 0.5;
    game.flash.color = "blue";
  }
}