import Grid from '../Grid';
import SpriteBatch from '../SpriteBatch';

export default class {
  #game;
  #onwin;
  #grid;
  #spriteBatch;
  #opened;
  #showingA;
  #showingB;
  #timer;

  static color = 'whitecat';
  static sx = 8;
  static type = 2;
  static catName = 'ORANGE CAT, THE USELESS BOYFRIEND';
  static catText = "BET YOU CAN'T BEAT ME!\nI'M THE SMARTEST ORANGE EVER!!";
  static title = 'MEOWMORY';

  constructor(game, onwin) {
    this.#game = game;
    this.#onwin = onwin;

    const w = 6;
    const h = 5;

    const spacing = 16;

    const s = Math.floor(Math.min((game.renderer.w - 20) / w - (spacing * (w - 1) / w), (game.renderer.h - 110) / h - (spacing * (h - 1) / h)));

    this.#grid = new Grid(game, 'center', 100, w, h, s, spacing, spacing, (cell) => this.#click(cell));

    this.#spriteBatch = new SpriteBatch(game, true);

    const available = this.#grid.sprites.slice();

    for (let i = 0; i < (w * h) / 2; i++) {
      const indexA = Math.floor(Math.random() * available.length);
      const cellA = available[indexA];
      available.splice(indexA, 1);

      const indexB = Math.floor(Math.random() * available.length);
      const cellB = available[indexB];
      available.splice(indexB, 1);

      cellA.secret = i;
      cellB.secret = i;
    }

    game.text.write('MEOWMORY', 'center', 10, 48, 'inactive', ['sine']);
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
    if (!cell.open) {
      if (this.#showingA && this.#showingB) {
        this.#cancelShowing();
      }

      cell.open = true;
      cell.draw(this.#spriteBatch, this.#grid.s * 2 / 3, cell.secret, cell.secret < 5 ? 'tabbycat' : null);
      cell.setBaseColor('active');

      if (this.#opened) {
        if (cell.secret === this.#opened.secret) {
          cell.found = true;
          cell.activate(false);

          this.#opened.found = true;
          this.#opened.activate(false);

          if (this.#grid.sprites.every(cell => cell.found)) {
            this.#onwin();
          }
        } else {
          this.#showingA = this.#opened;
          this.#showingB = cell;

          this.#timer = this.#game.scheduleTimer(1000, () => this.#cancelShowing());
        }

        this.#opened = false;
      } else {
        this.#opened = cell;
      }
    }
  }

  #cancelShowing() {
    (this.#timer || {}).disabled = true;

    this.#showingA.open = false;
    this.#showingA.content.enabled = false;
    this.#showingA.setBaseColor('primary');

    this.#showingB.open = false;
    this.#showingB.content.enabled = false;
    this.#showingB.setBaseColor('primary');

    this.#grid.changed();
    this.#game.text.changed();
    this.#spriteBatch.changed();

    this.#showingA = null;
    this.#showingB = null;
  }
}
