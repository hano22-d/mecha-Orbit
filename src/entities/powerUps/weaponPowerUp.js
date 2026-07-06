import { PowerUp } from "../PowerUp";
import { FastWeapon } from "../../weapons/FastWeapon";
import { HeavyWeapon } from "../../weapons/HeavyWeapon";

const weaponPowerUpImage = new Image();
weaponPowerUpImage.src = "src/assets/powerUp/things_gold.png";

const WEAPON_DURATION = 5000; // مدة السلاح الخارق

export class WeaponPowerUp extends PowerUp {
  constructor(canvas,x, y) {
    super(canvas,x, y);
    this.image = weaponPowerUpImage;
  }

  apply(player, gameTimer, game) {
    const weaponTypes = [FastWeapon, HeavyWeapon];
    const RandomWeaponClass = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];

    player.weaponEffect = true;
    player.weapon = new RandomWeaponClass(player);
    
    game.weaponEndTime = gameTimer + WEAPON_DURATION;
    game.flash.alpha = 0.5;
    game.flash.color = "orange";
  }
}