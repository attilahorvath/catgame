import Grid from '../Grid';

export default class {
  #game;
  #onwin;
  #grids;
  #buttons;
  #digit;

  constructor(game, onwin) {
    this.#game = game;
    this.#onwin = onwin;

    this.#grids = [];

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const grid = new Grid(this.#game, 100 + x * 100, 100 + y * 100, 3, 3, 24, 5, 5, (cell) => this.#release(cell));
        this.#grids.push(grid);
      }
    }

    this.#buttons = new Grid(this.#game, 10, 10, 10, 1, 32, 10, 0, (button) => this.#buttonRelease(button));

    for (let digit = 1; digit <= 10; digit++) {
      const button = this.#buttons.sprites[digit - 1];
      button.write(this.#game.text, digit <= 9 ? digit : 'X', 30, digit <= 9 ? `inactive${digit}` : 'active');
      button.digit = digit <= 9 ? digit : null;
    }

    this.#setGrid();
    this.#selectDigit(1);
  }

  update() {
    for (let digit = 1; digit <= 9; digit++) {
      if (this.#game.input.keyPresses[`Digit${digit}`]) {
        this.#selectDigit(digit);
      }
    }

    if (this.#game.input.keyPresses['KeyA'] || this.#game.input.keyPresses['ArrowLeft']) {
      if (this.#digit > 1) {
        this.#selectDigit(this.#digit - 1);
      }
    }

    if (this.#game.input.keyPresses['KeyD'] || this.#game.input.keyPresses['ArrowRight']) {
      if (this.#digit < 9) {
        this.#selectDigit(this.#digit + 1);
      }
    }

    if (this.#game.input.keyPresses['KeyX'] || this.#game.input.keyPresses['Digit0']) {
      this.#selectDigit(null);
    }

    for (const grid of this.#grids) {
      grid.update();
    }

    this.#buttons.update();
  }

  draw() {
    for (const grid of this.#grids) {
      grid.draw();
    }

    this.#buttons.draw();
  }

  #gridAt(x, y) {
    return this.#grids[Math.floor(y / 3) * 3 + Math.floor(x / 3)];
  }

  #cellAt(x, y) {
    return this.#gridAt(x, y).cellAt(x % 3, y % 3);
  }

  #setGrid() {
    const starts = [
      [
        6, 8, 0, 1, 0, 0, 0, 9, 0,
        0, 3, 4, 5, 0, 8, 0, 2, 0,
        2, 1, 0, 0, 6, 0, 3, 0, 0,
        5, 0, 0, 4, 0, 7, 0, 0, 9,
        3, 4, 2, 9, 0, 0, 0, 0, 6,
        0, 0, 7, 0, 8, 0, 5, 0, 0,
        9, 2, 0, 8, 0, 0, 0, 5, 3,
        0, 0, 3, 2, 0, 0, 9, 1, 8,
        0, 0, 0, 3, 0, 0, 0, 6, 7,
      ]
    ];

    const start = starts[Math.floor(Math.random() * starts.length)];

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const digit = start[y * 9 + x];
        if (digit !== 0) {
          const cell = this.#cellAt(x, y);
          cell.activate(false);
          cell.digit = digit;
          cell.write(this.#game.text, digit, 20, `inactive${digit}`);
        }
      }
    }
  }

  #release(cell) {
    if (cell) {
      cell.digit = this.#digit;
      (cell.content || {}).enabled = false;

      if (this.#digit) {
        cell.write(this.#game.text, this.#digit, 20, `inactive${this.#digit}`);
      }

      if (this.#checkCells()) {
        if (this.#onwin) {
          this.#onwin();
        }
      }

      this.#game.text.changed();
    }
  }

  #checkCells() {
    let valid = true;

    this.#resetCells();

    for (let i = 0; i < 9; i++) {
      valid &= this.#checkRow(i);
      valid &= this.#checkColumn(i);
      valid &= this.#checkGrid(i);
    }

    return valid;
  }

  #resetCells() {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const cell = this.#cellAt(x, y);
        if (!cell.inactive) {
          cell.setBaseColor('primary');
        }
      }
    }

    for (let i = 0; i < 9; i++) {
      this.#grids[i].changed();
    }
  }

  #checkRow(x) {
    let valid = true;
    const digitCounts = new Map();

    for (let y = 0; y < 9; y++) {
      const cell = this.#cellAt(x, y);
      digitCounts.set(cell.digit, (digitCounts.get(cell.digit) || 0) + 1);
    }

    for (const [digit, digitCount] of digitCounts.entries()) {
      if (digit == null) {
        valid = false;
      } else if (digitCount > 1) {
        valid = false;

        for (let y = 0; y < 9; y++) {
          const cell = this.#cellAt(x, y);
          if (!cell.inactive && cell.digit == digit) {
            cell.setBaseColor('active');
            this.#gridAt(x, y).changed();
          }
        }
      }
    }

    return valid;
  }

  #checkColumn(y) {
    let valid = true;
    const digitCounts = new Map();

    for (let x = 0; x < 9; x++) {
      const cell = this.#cellAt(x, y);
      digitCounts.set(cell.digit, (digitCounts.get(cell.digit) || 0) + 1);
    }

    for (const [digit, digitCount] of digitCounts.entries()) {
      if (digit == null) {
        valid = false;
      } else if (digitCount > 1) {
        valid = false;

        for (let x = 0; x < 9; x++) {
          const cell = this.#cellAt(x, y);
          if (!cell.inactive && cell.digit == digit) {
            cell.setBaseColor('active');
            this.#gridAt(x, y).changed();
          }
        }
      }
    }

    return valid;
  }

  #checkGrid(index) {
    let valid = true;
    const digitCounts = new Map();

    const grid = this.#grids[index];

    for (let i = 0; i < 9; i++) {
      const cell = grid.sprites[i];
      digitCounts.set(cell.digit, (digitCounts.get(cell.digit) || 0) + 1);
    }

    for (const [digit, digitCount] of digitCounts.entries()) {
      if (digit == null) {
        valid = false;
      } else if (digitCount > 1) {
        valid = false;

        for (let i = 0; i < 9; i++) {
          const cell = grid.sprites[i];
          if (!cell.inactive && cell.digit == digit) {
            cell.setBaseColor('active');
            grid.changed();
          }
        }
      }
    }

    return valid;
  }

  #buttonRelease(button) {
    if (button) {
      this.#selectDigit(button.digit);
    }
  }

  #selectDigit(digit) {
    this.#digit = digit;

    for (const button of this.#buttons.sprites) {
      button.activate(true);
    }

    this.#buttons.sprites[digit != null ? digit - 1 : 9].activate(false);

    this.#buttons.changed();
  }
}
