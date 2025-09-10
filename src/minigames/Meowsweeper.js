import Grid from '../Grid';

export default class {
  #game;
  #onwin;
  #onlose;
  #w;
  #h;
  #mines;
  #fontSize;
  #grid;
  #buttons;
  #digButton;
  #flagButton;
  #mode;
  #started;

  static color = 'tabbycat';
  static sx = 73;
  static type = 4;
  static catName = 'ORANGE CAT, THE USELESS BOYFRIEND';
  static catText = "BET YOU CAN'T BEAT ME!\nI'M THE SMARTEST ORANGE EVER!!";
  static title = 'MEOWSWEEPER';

  constructor(game, onwin, onlose) {
    this.#game = game;
    this.#onwin = onwin;
    this.#onlose = onlose;

    this.#w = this.#game.renderer.horizontal ? 20 : 10;
    this.#h = this.#game.renderer.horizontal ? 10 : 20;
    this.#mines = 10;

    this.#fontSize = 26;

    const spacing = 4;

    const s = Math.floor(Math.min((this.#game.renderer.w - 20) / this.#w - (spacing * (this.#w - 1) / this.#w), (this.#game.renderer.h - 110) / this.#h - (spacing * (this.#h - 1) / this.#h)));

    this.#grid = new Grid(this.#game, 'center', 100, this.#w, this.#h, s, spacing, spacing, (cell) => this.#click(cell));

    this.#buttons = new Grid(this.#game, 10, 10, 2, 1, 64, 10, 0, (button) => this.#buttonClick(button));

    this.#digButton = this.#buttons.sprites[0];
    this.#digButton.write(this.#game.text, 'O', 30, 'active');

    this.#flagButton = this.#buttons.sprites[1];
    this.#flagButton.write(this.#game.text, 'X', 30, 'active');

    this.#setMode('dig');

    this.#game.text.write('MEOWSWEEPER', 'center', 10, 48, 'inactive', ['sine']);
    // this.#game.text.write('SCRATCH MY BACK, BUT\nONLY WHERE I LIKE IT!', 50, 525, 32, 'active', ['typing', 'shake']);
  }

  update() {
    if (this.#game.input.keyPresses['KeyA'] || this.#game.input.keyPresses['ArrowLeft']) {
      this.#setMode('dig');
    }

    if (this.#game.input.keyPresses['KeyD'] || this.#game.input.keyPresses['ArrowRight']) {
      this.#setMode('flag');
    }

    this.#grid.update();
    this.#buttons.update();
  }

  draw() {
    this.#grid.draw();
    this.#buttons.draw();
  }

  #click(cell) {
    switch (this.#mode) {
    case 'dig':
      if (!this.#started) {
        this.#start(cell);
      }

      this.#open(cell.gridX, cell.gridY);

      if (cell.mine) {
        this.#grid.disabled = true;

        this.#game.scheduleTimer(2000, () => {
          for (const cell of this.#grid.sprites) {
            (cell.content || {}).enabled = false;
          }

          this.#game.text.changed();

          this.#onlose();
        });
      }

      break;
    case 'flag':
      if (cell.flagged) {
        cell.flagged = false;
        cell.content.enabled = false;
        this.#game.text.changed();
      } else {
        cell.flagged = true;
        cell.write(this.#game.text, 'X', this.#fontSize, 'highlight');
      }
      break;
    }
  }

  #start(cell) {
    const available = this.#grid.sprites.filter(availableCell => availableCell !== cell && (Math.abs(availableCell.gridX - cell.gridX) > 1 || Math.abs(availableCell.gridY - cell.gridY) > 1));

    for (let i = 0; i < this.#mines; i++) {
      const index = Math.floor(Math.random() * available.length);
      const mineCell = available[index];
      available.splice(index, 1);

      mineCell.mine = true;
    }

    for (let y = 0; y < this.#grid.h; y++) {
      for (let x = 0; x < this.#grid.w; x++) {
        let cell = this.#grid.cellAt(x, y);
        if (!cell.mine) {
          cell.mines = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (this.#grid.cellAt(x + dx, y + dy)?.mine) {
                cell.mines += 1;
              }
            }
          }
        }
      }
    }

    this.#started = true;
  }

  #open(x, y) {
    this.#game.shake(200);
    const cell = this.#grid.cellAt(x, y);

    if (cell?.flagged) {
      cell.flagged = false;
      cell.content.enabled = false;
    }

    if (cell?.enabled && !cell?.opened) {
      cell.opened = true;

      cell.activate(false);

      if (cell.mines === 0) {
        cell.hidden = true;

        this.#open(x, y - 1);
        this.#open(x, y + 1);
        this.#open(x - 1, y);
        this.#open(x + 1, y);
      } else {
        if (cell.mine) {
          for (const mineCell of this.#grid.sprites.filter(cell => cell.mine)) {
            mineCell.activate(false);
            mineCell.write(this.#game.text, 'X', this.#fontSize, 'inactive10');
          }
        } else {
          cell.write(this.#game.text, cell.mines, this.#fontSize, `inactive${cell.mines}`);
        }
      }
    }

    if (this.#grid.sprites.filter(cell => !cell.opened).every(cell => cell.mine)) {
      this.#onwin();
    }
  }

  #buttonClick(button) {
    if (button === this.#flagButton) {
      this.#setMode('flag');
    } else if (button === this.#digButton) {
      this.#setMode('dig');
    }
  }

  #setMode(mode) {
    this.#mode = mode;

    this.#digButton.activate(this.#mode !== 'dig');
    this.#flagButton.activate(this.#mode !== 'flag');

    this.#buttons.changed();
  }
}
