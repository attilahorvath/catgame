import SpriteBatch from './SpriteBatch';

export default class extends SpriteBatch {
  #game;
  #spacingX;
  #spacingY;
  #onclick;
  #color;
  #active;
  #pressed;

  constructor(game, x, y, w, h, s, spacingX, spacingY, onclick, color = 'primary', type = 0) {
    super(game, false, 'cells');

    this.#game = game;

    if (x === 'center') {
      x = game.renderer.w / 2 - w * (s + (spacingX ?? 0) * (w - 1) / w) / 2;
    }

    if (y === 'center') {
      y = game.renderer.h / 2 - h * (s + (spacingY ?? 0) * (h - 1) / h) / 2;
    }

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h
    this.s = s;
    this.#spacingX = spacingX ?? 0;
    this.#spacingY = spacingY ?? 0;
    this.#onclick = onclick;
    this.#color = color;

    for (let gridY = 0; gridY < h; gridY++) {
      for (let gridX = 0; gridX < w; gridX++) {
        const cell = this.add(x + gridX * this.#fullW, y + gridY * this.#fullH, s, type, color);
        cell.setColor(color);
        cell.gridX = gridX;
        cell.gridY = gridY;
      }
    }
  }

  update() {
    if (!this.disabled) {
      if (this.#game.input.moved) {
        let newActive = this.#cellAtPosition(this.#game.input.x, this.#game.input.y);
        if (newActive?.inactive) {
          newActive = null;
        }

        if (newActive !== this.#active && !this.#pressed) {
          if (this.#onclick) {
            if (this.#game.input.mouse) {
              if (!this.#active?.inactive) {
                this.#active?.setColor(this.#active?.baseColor || this.#color);
              }

              newActive?.setColor('highlight');
              this.changed();
            }
          }
        }

        this.#active = newActive;
      }

      if (this.#game.input.press) {
        this.#pressed = this.#active;

        if (this.#onclick) {
          if (this.#game.input.mouse) {
            this.#pressed?.setColor('active');
            this.changed();
          }
        }
      }

      if (this.#game.input.click()) {
        if (this.#onclick) {
          this.#pressed?.setColor(this.#pressed?.baseColor || this.#color);
          if (this.#active && this.#active === this.#pressed) {
            this.#game.input.clickRead = true;
            this.#onclick(this.#pressed);
          }
          this.changed();
        }

        this.#pressed = null;
      }
    }

    super.update();
  }

  cellAt(x, y) {
    if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
      return this.sprites[this.w * y + x];
    }
  }

  #cellAtPosition(x, y) {
    const index = this.#indexAtPosition(x, y);

    if (index) {
      return this.cellAt(index[0], index[1]);
    }
  }

  #indexAtPosition(x, y) {
    const relX = x - this.x;
    const relY = y - this.y;
    const indexX = Math.trunc(relX / this.#fullW);
    const indexY = Math.trunc(relY / this.#fullH);

    if (relX >= 0 && relY >= 0 &&
        relX - indexX * this.#fullW < this.s &&
        relY - indexY * this.#fullH < this.s &&
        indexX >= 0 && indexX < this.w && indexY >= 0 && indexY < this.h) {
      return [indexX, indexY];
    }
  }

  get #fullW() {
    return this.s + this.#spacingX;
  }

  get #fullH() {
    return this.s + this.#spacingY;
  }
}
