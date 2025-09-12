import Grid from '../Grid';

export default class {
  #game;
  #onwin;
  #rows;
  #columns;
  #maxRows;
  #maxColumns;
  #w;
  #h;
  #grid;
  #buttons;
  #markButton;
  #flagButton;
  #mode;

  static meta = [
    'MEOWSTERPIECE',
    WHITECAT_COLOR,
    8,
    3,
    'CHA CHA',
    'TODAY I DECIDED TO BE\nAN ARTIST!!\nHELP ME WITH THIS\nPAINT BY NUMBER!\n\n\nTHE CLUES WILL TELL YOU\nHOW MANY BLOCKS SHOULD\nBE PAINTED IN EACH ROW\nAND IN EACH COLUMN!',
    'SURE SURE, ARTIST TODAY,\nSOMETHING ELSE TOMORROW!\n\n\nTYPICAL KITTY...'
  ];

  constructor(game, onwin) {
    this.#game = game;
    this.#onwin = onwin;

    this.#rows = [[0], [1, 1], [2, 2], [5], [2, 1, 2, 1], [5, 2], [3, 1], [6, 2], [1, 5, 1], [8], [2, 4]];
    this.#columns = [[1, 2], [4, 1, 1], [3, 6], [7], [3, 6], [4, 4], [1, 3], [2], [3, 1], [2, 3]];

    this.#maxRows = Math.max(...this.#rows.map(row => row.length));
    this.#maxColumns = Math.max(...this.#columns.map(column => column.length));

    this.#w = this.#columns.length + this.#maxRows;
    this.#h = this.#rows.length + this.#maxColumns;

    const spacing = 2;

    const s = Math.floor(Math.min((game.renderer.w - 20) / this.#w - (spacing * (this.#w - 1) / this.#w), (game.renderer.h - 110) / this.#h - (spacing * (this.#h - 1) / this.#h)));

    this.#grid = new Grid(game, CENTER, 100, this.#w, this.#h, s, spacing, spacing, (cell) => this.#click(cell));

    for (let x = 0; x < this.#w; x++) {
      for (let y = 0; y < this.#maxColumns; y++) {
        const cell = this.#grid.cellAt(x, y);
        if (x < this.#maxRows || y < this.#maxColumns - this.#columns[x - this.#maxRows].length) {
          cell.hidden = true;
        } else {
          cell.write(game.text, this.#columns[x - this.#maxRows][y - (this.#maxColumns - this.#columns[x - this.#maxRows].length)], s * 2 / 3, HIGHLIGHT_COLOR);
          cell.activate(false);
        }
      }
    }

    for (let y = 0; y < this.#w; y++) {
      for (let x = 0; x < this.#maxRows; x++) {
        const cell = this.#grid.cellAt(x, y);
        if (y < this.#maxColumns || x < this.#maxRows - this.#rows[y - this.#maxColumns].length) {
          cell.hidden = true;
        } else {
          cell.write(game.text, this.#rows[y - this.#maxColumns][x - (this.#maxRows - this.#rows[y - this.#maxColumns].length)], this.#grid.s * 2 / 3, HIGHLIGHT_COLOR);
          cell.activate(false);
        }
      }
    }

    this.#buttons = new Grid(game, 10, 10, 2, 1, 64, 10, 0, (button) => this.#buttonClick(button));

    this.#markButton = this.#buttons.sprites[0];
    this.#markButton.write(game.text, 'O', 30, ACTIVE_COLOR);

    this.#flagButton = this.#buttons.sprites[1];
    this.#flagButton.write(game.text, 'X', 30, ACTIVE_COLOR);

    this.#setMode(MARK);

    this.#grid.changed();
  }

  update() {
    if (this.#game.input.left()) {
      this.#setMode(MARK);
    }

    if (this.#game.input.right()) {
      this.#setMode(FLAG);
    }

    this.#grid.update();
    this.#buttons.update();
  }

  draw() {
    this.#grid.draw();
    this.#buttons.draw();
  }

  #click(cell) {
    (cell.content || {}).enabled = false;

    switch (this.#mode) {
    case MARK:
      if (cell.state !== MARKED) {
        cell.state = MARKED;
        cell.setBaseColor(ACTIVE_COLOR);
      } else {
        cell.state = null;
        cell.setBaseColor(PRIMARY_COLOR);
      }
      break;

    case FLAG:
      cell.setBaseColor(PRIMARY_COLOR);
      if (cell.state !== FLAGGED) {
        cell.state = FLAGGED;
        cell.write(this.#game.text, 'X', this.#grid.s * 2 / 3, HIGHLIGHT_COLOR);
      } else {
        cell.state = null;
      }
      break;
    }

    this.#game.text.changed();

    this.#checkGrid();
  }

  #buttonClick(button) {
    if (button === this.#flagButton) {
      this.#setMode(FLAG);
    } else if (button === this.#markButton) {
      this.#setMode(MARK);
    }
  }

  #setMode(mode) {
    this.#mode = mode;

    this.#markButton.activate(this.#mode !== MARK);
    this.#flagButton.activate(this.#mode !== FLAG);

    this.#buttons.changed();
  }

  #checkGrid() {
    let gridCorrect = 0;

    for (let x = this.#maxRows; x < this.#w; x++) {
      for (let y = 0; y < this.#maxColumns; y++) {
        this.#grid.cellAt(x, y).setBaseColor(INACTIVE_COLOR);
      }

      let current = 0;
      let index = 0;
      let correct = 0;

      for (let y = this.#maxColumns; y < this.#h; y++) {
        if (this.#grid.cellAt(x, y).state === MARKED) {
          current++;
        }

        if (this.#grid.cellAt(x, y).state !== MARKED || y === this.#h - 1) {
          if ((current > 0 || y === this.#h - 1) && index < this.#columns[x - this.#maxRows].length) {
            if (current > this.#columns[x - this.#maxRows][index]) {
              this.#grid.cellAt(x, index + (this.#maxColumns - this.#columns[x - this.#maxRows].length)).setBaseColor(HIGHLIGHT_COLOR);
            } else if (current === this.#columns[x - this.#maxRows][index]) {
              this.#grid.cellAt(x, index + (this.#maxColumns - this.#columns[x - this.#maxRows].length)).setBaseColor(INACTIVE1_COLOR);
              correct++;
            }

            index++;
          }

          current = 0;
        }
      }

      if (correct === this.#columns[x - this.#maxRows].length) {
        gridCorrect++;
      }
    }

    for (let y = this.#maxColumns; y < this.#h; y++) {
      for (let x = 0; x < this.#maxRows; x++) {
        this.#grid.cellAt(x, y).setBaseColor(INACTIVE_COLOR);
      }

      let current = 0;
      let index = 0;
      let correct = 0;

      for (let x = this.#maxRows; x < this.#w; x++) {
        if (this.#grid.cellAt(x, y).state === MARKED) {
          current++;
        }

        if (this.#grid.cellAt(x, y).state !== MARKED || x === this.#w - 1) {
          if ((current > 0 || x === this.#w - 1) && index < this.#rows[y - this.#maxColumns].length) {
            if (current > this.#rows[y - this.#maxColumns][index]) {
              this.#grid.cellAt(index + (this.#maxRows - this.#rows[y - this.#maxColumns].length), y).setBaseColor(HIGHLIGHT_COLOR);
            } else if (current === this.#rows[y - this.#maxColumns][index]) {
              this.#grid.cellAt(index + (this.#maxRows - this.#rows[y - this.#maxColumns].length), y).setBaseColor(INACTIVE1_COLOR);
              correct++;
            }

            index++;
          }

          current = 0;
        }
      }

      if (correct === this.#rows[y - this.#maxColumns].length) {
        gridCorrect++;
      }
    }

    if (gridCorrect === (this.#w - this.#maxRows) + (this.#h - this.#maxColumns)) {
      this.#game.shake(200);
      this.#onwin();
    }
  }
}
