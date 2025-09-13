import Grid from '../Grid';
import SpriteBatch from '../SpriteBatch';

export default class {
  #game;
  #onwin;
  #onlose;
  #grid;
  #spriteBatch;
  #timer;
  #over;

  static meta = [
    'PAW PAW TOE',
    ORANGECAT_COLOR,
    73,
    2,
    '     ORANGE CAT,\nTHE USELESS BOYFRIEND',
    "BET YOU CAN'T BEAT ME\nIN PAW PAW TOE!\n\n\nI'M THE SMARTEST\nORANGE CAT EVER!!!",
    "WELL, THAT'S\nNOT SAYING MUCH...\n\n\nLET'S SEE!"
  ];

  constructor(game, onwin, onlose) {
    this.#game = game;
    this.#onwin = onwin;
    this.#onlose = onlose;

    this.#grid = new Grid(game, CENTER, CENTER, 3, 3, 96, 20, 20, (cell) => this.#click(cell));
    this.#spriteBatch = new SpriteBatch(game);
  }

  update() {
    this.#grid.update();
    this.#spriteBatch.update();
  }

  draw() {
    this.#grid.draw();
    this.#spriteBatch.draw();
  }

  #click(cell) {
    if (!cell.symbol) {
      this.#mark(cell, X_SYMBOL);

      this.#grid.disabled = true;

      this.#timer = this.#game.scheduleTimer(1000, () => {
        if (!this.#over) {
          const available = this.#grid.sprites.filter(sprite => !sprite.symbol);

          if (available.length > 0) {
            this.#mark(available[Math.floor(Math.random() * available.length)], O_SYMBOL);

            this.#grid.disabled = false;
            this.#grid.changed();
          }
        }
      });
    }
  }

  #mark(cell, symbol) {
    if (!this.#over) {
      this.#game.shake(200);

      cell.symbol = symbol;

      cell.activate(false);

      cell.draw(this.#spriteBatch, 64, 0, symbol === X_SYMBOL ? BLACKCAT_COLOR : ORANGECAT_COLOR);

      this.#checkGrid();
    }
  }

  #checkGrid() {
    for (let y = 0; y < 3; y++) {
      const symbolCounts = new Map();

      for (let x = 0; x < 3; x++) {
        const cell = this.#grid.cellAt(x, y);

        symbolCounts.set(cell.symbol, (symbolCounts.get(cell.symbol) || 0) + 1);
      }

      if (symbolCounts.get(X_SYMBOL) === 3) {
        return this.#win(X_SYMBOL);
      }

      if (symbolCounts.get(O_SYMBOL) === 3) {
        return this.#win(O_SYMBOL);
      }
    }

    for (let x = 0; x < 3; x++) {
      const symbolCounts = new Map();

      for (let y = 0; y < 3; y++) {
        const cell = this.#grid.cellAt(x, y);

        symbolCounts.set(cell.symbol, (symbolCounts.get(cell.symbol) || 0) + 1);
      }

      if (symbolCounts.get(X_SYMBOL) === 3) {
        return this.#win(X_SYMBOL);
      }

      if (symbolCounts.get(O_SYMBOL) === 3) {
        return this.#win(O_SYMBOL);
      }
    }

    if (this.#grid.cellAt(0, 0).symbol === X_SYMBOL && this.#grid.cellAt(1, 1).symbol === X_SYMBOL && this.#grid.cellAt(2, 2).symbol === X_SYMBOL) {
      return this.#win(X_SYMBOL);
    }

    if (this.#grid.cellAt(0, 0).symbol === O_SYMBOL && this.#grid.cellAt(1, 1).symbol === O_SYMBOL && this.#grid.cellAt(2, 2).symbol === O_SYMBOL) {
      return this.#win(O_SYMBOL);
    }

    if (this.#grid.cellAt(2, 0).symbol === X_SYMBOL && this.#grid.cellAt(1, 1).symbol === X_SYMBOL && this.#grid.cellAt(0, 2).symbol === X_SYMBOL) {
      return this.#win(X_SYMBOL);
    }

    if (this.#grid.cellAt(2, 0).symbol === O_SYMBOL && this.#grid.cellAt(1, 1).symbol === O_SYMBOL && this.#grid.cellAt(0, 2).symbol === O_SYMBOL) {
      return this.#win(O_SYMBOL);
    }
  }

  #win(symbol) {
    this.#over = true;
    this.#grid.disabled = true;
    (this.#timer || {}).disabled = true;

    if (symbol === X_SYMBOL) {
      this.#onwin();
    } else if (symbol === O_SYMBOL) {
      this.#grid.disabled = true;
      this.#game.scheduleTimer(2000, () => this.#onlose());
    }
  }
}
