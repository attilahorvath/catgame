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

  static title = 'PAW PAW TOE';
  static color = 'orangecat';
  static sx = 73;
  static type = 2;
  static catName = 'ORANGE CAT, THE USELESS BOYFRIEND';
  static catText = "BET YOU CAN'T BEAT ME\nIN PAW PAW TOE!\n\n\nI'M THE SMARTEST\nORANGE CAT EVER!!!";
  static response = "WELL, THAT'S\nNOT SAYING MUCH...\n\n\nLET'S SEE!"

  constructor(game, onwin, onlose) {
    this.#game = game;
    this.#onwin = onwin;
    this.#onlose = onlose;

    this.#grid = new Grid(this.#game, 'center', 'center', 3, 3, 96, 20, 20, (cell) => this.#click(cell));
    this.#spriteBatch = new SpriteBatch(this.#game);
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
      this.#mark(cell, 'X');

      this.#grid.disabled = true;

      this.#timer = this.#game.scheduleTimer(1000, () => {
        if (!this.#over) {
          const available = this.#grid.sprites.filter(sprite => !sprite.symbol);

          if (available.length > 0) {
            this.#mark(available[Math.floor(Math.random() * available.length)], 'O');

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

      cell.draw(this.#spriteBatch, 64, 0, symbol === 'X' ? 'blackcat' : 'orangecat');

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

      if (symbolCounts.get('X') === 3) {
        return this.#win('X');
      }

      if (symbolCounts.get('O') === 3) {
        return this.#win('O');
      }
    }

    for (let x = 0; x < 3; x++) {
      const symbolCounts = new Map();

      for (let y = 0; y < 3; y++) {
        const cell = this.#grid.cellAt(x, y);

        symbolCounts.set(cell.symbol, (symbolCounts.get(cell.symbol) || 0) + 1);
      }

      if (symbolCounts.get('X') === 3) {
        return this.#win('X');
      }

      if (symbolCounts.get('O') === 3) {
        return this.#win('O');
      }
    }

    if (this.#grid.cellAt(0, 0).symbol === 'X' && this.#grid.cellAt(1, 1).symbol === 'X' && this.#grid.cellAt(2, 2).symbol === 'X') {
      return this.#win('X');
    }

    if (this.#grid.cellAt(0, 0).symbol === 'O' && this.#grid.cellAt(1, 1).symbol === 'O' && this.#grid.cellAt(2, 2).symbol === 'O') {
      return this.#win('O');
    }

    if (this.#grid.cellAt(2, 0).symbol === 'X' && this.#grid.cellAt(1, 1).symbol === 'X' && this.#grid.cellAt(0, 2).symbol === 'X') {
      return this.#win('X');
    }

    if (this.#grid.cellAt(2, 0).symbol === 'O' && this.#grid.cellAt(1, 1).symbol === 'O' && this.#grid.cellAt(0, 2).symbol === 'O') {
      return this.#win('O');
    }
  }

  #win(symbol) {
    this.#over = true;
    this.#grid.disabled = true;
    (this.#timer || {}).disabled = true;

    if (symbol === 'X') {
      this.#onwin();
    } else if (symbol === 'O') {
      this.#onlose();
    }
  }
}
