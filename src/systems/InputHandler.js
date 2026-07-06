  //كلاس المدخلات
  export class InputsHandle {
    constructor() {
      this.keys = {
        right: false,
        left: false,
        up: false,
        down: false,
        space: false,
        missileKey: false
      };

      window.addEventListener("keydown", (e) => {
        if (
          ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", " "].includes(
            e.key
          ) ||
          e.code === "Space"
        ) {
          e.preventDefault();
        }

        if (e.key === "ArrowRight") this.keys.right = true;
        if (e.key === "ArrowLeft") this.keys.left = true;
        if (e.key === "ArrowUp") this.keys.up = true;
        if (e.key === "ArrowDown") this.keys.down = true;
        if (e.code === "Space") this.keys.space  = true;
        if(e.key === "q") this.keys.missileKey = true;
      });

      window.addEventListener("keyup", (e) => {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
            e.key
          ) ||
          e.code === "Space"
        ) {
          e.preventDefault();
        }
        if (e.key === "ArrowRight") this.keys.right = false;
        if (e.key === "ArrowLeft") this.keys.left = false;
        if (e.key === "ArrowUp") this.keys.up = false;
        if (e.key === "ArrowDown") this.keys.down = false;
        if (e.code === "Space") this.keys.space = false;
        if(e.key === "q") this.keys.missileKey = false;
      });
    }
  }