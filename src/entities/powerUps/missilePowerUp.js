import { assetsManager } from "../../systems/AssetsManager";
import { PowerUp } from "../PowerUp";


export class MissilePowerUp extends PowerUp {
  constructor(canvas, x, y) {
    super(canvas, x, y, 70, 120); 
    this.image = assetsManager.getImage("missilwP");

    this.hitBox = [
      { 
        x: 0, y: 0, 
        width: this.width * 0.57, 
        height: this.height * 0.375, 
        offsetX: this.width * 0.214, 
        offsetY: this.height * 0.333 
      }
    ];
  }

  apply(player, gameTimer, game) {
    player.missileCount++;
  }
}