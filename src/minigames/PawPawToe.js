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
  // #orangeCat;
  // #orangeCatLeftPaw;
  // #orangeCatRightPaw;
  // #orangeName;
  // #orangeText;

  static color = 'orangecat';
  static sx = 73;
  static type = 2;
  static catName = 'ORANGE CAT, THE USELESS BOYFRIEND';
  static catText = "BET YOU CAN'T BEAT ME!\nI'M THE SMARTEST ORANGE EVER!!";
  static title = 'PAW PAW TOE';

  constructor(game, onwin, onlose) {
    this.#game = game;
    this.#onwin = onwin;
    this.#onlose = onlose;

    this.#grid = new Grid(this.#game, 'center', 'center', 3, 3, 96, 20, 20, (cell) => this.#click(cell));
    // this.#grid.disabled = true;
    this.#spriteBatch = new SpriteBatch(this.#game);

    // this.#orangeCat = this.#spriteBatch.add('center', 'center', 64, 1, 'orangecat');
    // this.#orangeCatLeftPaw = this.#spriteBatch.add(this.#orangeCat.x - 12, this.#orangeCat.y + 60, 24, 0, 'orangecat');
    // this.#orangeCatRightPaw = this.#spriteBatch.add(this.#orangeCat.x + 46, this.#orangeCat.y + 60, 24, 0, 'orangecat');

    // this.#orangeName = this.#game.text.write('ORANGE CAT, THE USELESS BOYFRIEND', 'center', 10, 24, 'orangecat', ['sine']);
    // this.#orangeText = this.#game.text.write("BET YOU CAN'T BEAT ME!\nI'M THE SMARTEST ORANGE EVER!!", 'center', this.#orangeCat.y + 100, 32, 'orangecat', ['typing', 'shake']);
  }

  update() {
    // if (this.#game.input.click()) {
    //   this.#grid.disabled = false;
    //   this.#orangeCat.enabled = false;
    //   this.#orangeCatLeftPaw.enabled = false;
    //   this.#orangeCatRightPaw.enabled = false;
    //   this.#spriteBatch.changed();
    //   this.#orangeText.enabled = false;
    //   this.#orangeName.enabled = false;
    //   this.#game.text.write('PAW PAW TOE', 'center', 10, 48, 'inactive', ['sine']);
    // }

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
