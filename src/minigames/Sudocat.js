import Grid from '../Grid';
import SpriteBatch from '../SpriteBatch';

export default class {
  #game;
  #onwin;
  #spriteBatch;
  #grids;
  #cellSize;
  #buttons;
  #activeButtons;
  #digit;

  static meta = [
    'SUDOCAT',
    BLACKCAT_COLOR,
    73,
    4,
    'KUMBA',
    "I NEED ALL MY TREATS AND\nTOYS NEATLY ORGANISED!!\n\n\nTHERE SHOULD BE ONLY ONE\nTYPE IN EACH ROW, EACH\nCOLUMN AND IN EACH BOX!!",
    'KITTY MUST HAVE OCD...'
  ];

  constructor(game, onwin) {
    this.#game = game;
    this.#onwin = onwin;

    this.#spriteBatch = new SpriteBatch(game, true);

    this.#grids = [];

    const gridSpacing = 16;

    const gridSize = Math.floor(Math.min((game.renderer.w - 20) / 3 - (gridSpacing * (3 - 1) / 3), (game.renderer.h - 200) / 3 - (gridSpacing * (3 - 1) / 3)));

    const spacing = 5;

    this.#cellSize = Math.floor(Math.min((gridSize - 0) / 3 - (spacing * (3 - 1) / 3), (gridSize - 0) / 3 - (spacing * (3 - 1) / 3)));

    const startX = game.renderer.w / 2 - 3 * (gridSize + gridSpacing * (3 - 1) / 3) / 2;

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const grid = new Grid(game, startX + x * (gridSize + gridSpacing), 100 + y * (gridSize + gridSpacing), 3, 3, this.#cellSize, spacing, spacing, (cell) => this.#click(cell));
        this.#grids.push(grid);
      }
    }

    let buttonSize = 64;
    let buttonSpacing = 10;

    if (game.renderer.h - (100 + 3 * (gridSize + gridSpacing) + 20) >= 256) {
      buttonSize = Math.min(Math.floor(Math.min((game.renderer.w - 20) / 3 - (buttonSpacing * (3 - 1) / 3), (game.renderer.h - (100 + 3 * (gridSize + buttonSpacing) + 20)) / 4 - (buttonSpacing * (4 - 1) / 4))), 128);

      this.#buttons = new Grid(game, CENTER, 100 + 3 * (gridSize + gridSpacing), 3, 4, buttonSize, buttonSpacing, buttonSpacing, (button) => this.#buttonClick(button));
      this.#buttons.cellAt(0, 3).activate(false);
      this.#buttons.cellAt(0, 3).hidden = true;

      this.#buttons.cellAt(2, 3).activate(false);
      this.#buttons.cellAt(2, 3).hidden = true;
    } else {
      this.#buttons = new Grid(game, CENTER, 100 + 3 * (gridSize + gridSpacing), 10, 1, buttonSize, buttonSpacing, 0, (button) => this.#buttonClick(button));
    }

    this.#activeButtons = this.#buttons.sprites.filter(button => !button.inactive);

    for (let digit = 1; digit <= 10; digit++) {
      const button = this.#activeButtons[digit - 1];
      if (digit === 10) {
        button.write(game.text, 'X', buttonSize * 2 / 3, ACTIVE_COLOR);
      } else {
        button.draw(this.#spriteBatch, buttonSize * 2 / 3, digit + 5);
      }
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

    if (this.#game.input.left()) {
      if (this.#digit > 1) {
        this.#selectDigit(this.#digit - 1);
      }
    }

    if (this.#game.input.right()) {
      if (this.#digit < 9) {
        this.#selectDigit(this.#digit + 1);
      }
    }

    if (this.#game.input.cancel()) {
      this.#selectDigit(null);
    }

    this.#spriteBatch.update();

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
    this.#spriteBatch.draw();
  }

  #gridAt(x, y) {
    return this.#grids[Math.floor(y / 3) * 3 + Math.floor(x / 3)];
  }

  #cellAt(x, y) {
    return this.#gridAt(x, y).cellAt(x % 3, y % 3);
  }

  #setGrid() {
    const start = [
      6, 8, 0, 1, 0, 0, 0, 9, 0,
      0, 3, 4, 5, 0, 8, 0, 2, 0,
      2, 1, 0, 0, 6, 0, 3, 0, 0,
      5, 0, 0, 4, 0, 7, 0, 0, 9,
      3, 4, 2, 9, 0, 0, 0, 0, 6,
      0, 0, 7, 0, 8, 0, 5, 0, 0,
      9, 2, 0, 8, 0, 0, 0, 5, 3,
      0, 0, 3, 2, 0, 0, 9, 1, 8,
      0, 0, 0, 3, 0, 0, 0, 6, 7,
    ];

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const digit = start[y * 9 + x];
        if (digit !== 0) {
          const cell = this.#cellAt(x, y);
          cell.activate(false);
          cell.digit = digit;
          cell.draw(this.#spriteBatch, this.#cellSize * 2 / 3, digit + 5);
        }
      }
    }
  }

  #click(cell) {
    cell.digit = this.#digit;
    (cell.content || {}).enabled = false;

    if (this.#digit) {
      cell.draw(this.#spriteBatch, this.#cellSize * 2 / 3, this.#digit + 5);
    }

    if (this.#checkCells()) {
      this.#game.shake(200);
      this.#onwin();
    }

    this.#game.text.changed();
    this.#spriteBatch.changed();
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
          cell.setBaseColor(PRIMARY_COLOR);
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
            cell.setBaseColor(ACTIVE_COLOR);
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
            cell.setBaseColor(ACTIVE_COLOR);
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
            cell.setBaseColor(ACTIVE_COLOR);
            grid.changed();
          }
        }
      }
    }

    return valid;
  }

  #buttonClick(button) {
    if (button) {
      this.#selectDigit(button.digit);
    }
  }

  #selectDigit(digit) {
    this.#digit = digit;

    for (const button of this.#activeButtons) {
      button.activate(true);
    }

    this.#activeButtons[digit != null ? digit - 1 : 9].activate(false);

    this.#buttons.changed();
  }
}
