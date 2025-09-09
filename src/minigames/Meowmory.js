import Grid from '../Grid';
import SpriteBatch from '../SpriteBatch';

export default class {
  #game;
  #onwin;
  #cellSize;
  #grid;
  #spriteBatch;
  #opened;
  #showingA;
  #showingB;
  #timer;

  constructor(game, onwin) {
    this.#game = game;
    this.#onwin = onwin;

    const width = 6;
    const height = 5;

    const spacing = 16;

    this.#cellSize = Math.floor(Math.min((this.#game.renderer.width - 20) / width - (spacing * (width - 1) / width), (this.#game.renderer.height - 110) / height - (spacing * (height - 1) / height)));

    this.#grid = new Grid(this.#game, 'center', 100, width, height, this.#cellSize, spacing, spacing, (cell) => this.#click(cell));

    this.#spriteBatch = new SpriteBatch(this.#game, 'textures/sprites.png', 16, true);

    const available = this.#grid.sprites.slice();

    for (let i = 0; i < (width * height) / 2; i++) {
      const indexA = Math.floor(Math.random() * available.length);
      const cellA = available[indexA];
      available.splice(indexA, 1);

      const indexB = Math.floor(Math.random() * available.length);
      const cellB = available[indexB];
      available.splice(indexB, 1);

      cellA.secret = i;
      cellB.secret = i;
    }

    this.#game.text.write('MEOWMORY', 'center', 10, 48, 'inactive', ['sine']);
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
    if (cell && !cell.open) {
      if (this.#showingA && this.#showingB) {
        this.#cancelShowing();
      }

      cell.open = true;
      cell.draw(this.#spriteBatch, this.#cellSize * 2 / 3, cell.secret, cell.secret < 5 ? 'tabbycat' : null);
      cell.setBaseColor('active');

      if (this.#opened) {
        if (cell.secret === this.#opened.secret) {
          cell.found = true;
          cell.activate(false);

          this.#opened.found = true;
          this.#opened.activate(false);

          if (this.#grid.sprites.every(cell => cell.found)) {
            if (this.#onwin) {
              this.#onwin();
            }
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
