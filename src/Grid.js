import SpriteBatch from './SpriteBatch';

export default class extends SpriteBatch {
  #game;
  #cellSize;
  #spacingX;
  #spacingY;
  #onrelease;
  #color;
  #active;
  #pressed;

  constructor(game, x, y, width, height, cellSize, spacingX, spacingY, onrelease, color = 'primary') {
    super(game, 'textures/cells.png', CELL_SIZE, true);

    this.#game = game;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height
    this.#cellSize = cellSize;
    this.#spacingX = spacingX ?? 0;
    this.#spacingY = spacingY ?? 0;
    this.#onrelease = onrelease;
    this.#color = color;

    for (let gridY = 0; gridY < height; gridY++) {
      for (let gridX = 0; gridX < width; gridX++) {
        const cell = this.addSprite(this.x + gridX * this.#fullW, this.y + gridY * this.#fullH, this.#cellSize, 0, color);
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
          if (this.onactivate || this.#onrelease) {
            if (!this.#active?.inactive) {
              this.#active?.setColor(this.#active?.baseColor || this.#color);
            }
            newActive?.setColor('highlight');
            this.changed();
          }

          // if (this.onactivate) {
          //   this.onactivate(newActive, this.#active);
          //   this.changed();
          // }
        }

        this.#active = newActive;
      }

      if (this.#game.input.press) {
        this.#pressed = this.#active;

        if (this.onpress || this.#onrelease) {
          this.#pressed?.setColor('active');
          this.changed();
        }

        // if (this.onpress) {
        //   this.onpress(this.#pressed);
        //   this.changed();
        // }
      }

      if (this.#game.input.release) {
        if (this.#onrelease) {
          this.#pressed?.setColor(this.#pressed?.baseColor || this.#color);
          this.#onrelease(this.#active === this.#pressed ? this.#pressed : null, this.#pressed);
          this.changed();
        }

        this.#pressed = null;
      }
    }

    super.update();
  }

  cellAt(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.sprites[this.width * y + x];
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
        relX - indexX * this.#fullW < this.#cellSize &&
        relY - indexY * this.#fullH < this.#cellSize &&
        indexX >= 0 && indexX < this.width && indexY >= 0 && indexY < this.height) {
      return [indexX, indexY];
    }
  }

  get #fullW() {
    return this.#cellSize + this.#spacingX;
  }

  get #fullH() {
    return this.#cellSize + this.#spacingY;
  }
}
