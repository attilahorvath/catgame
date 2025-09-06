import Grid from '../Grid';

export default class {
  #game;
  #onwin;
  #width;
  #height;
  #grid;
  #opened;
  #showingA;
  #showingB;
  #timer;

  constructor(game, onwin) {
    this.#game = game;
    this.#onwin = onwin;

    this.#width = 6;
    this.#height = 5;

    this.#grid = new Grid(this.#game, 100, 100, this.#width, this.#height, 64, 16, 16, (cell) => this.#release(cell));

    const available = this.#grid.sprites.slice();

    for (let i = 1; i <= (this.#width * this.#height) / 2; i++) {
      const indexA = Math.floor(Math.random() * available.length);
      const cellA = available[indexA];
      available.splice(indexA, 1);

      const indexB = Math.floor(Math.random() * available.length);
      const cellB = available[indexB];
      available.splice(indexB, 1);

      cellA.secret = i;
      cellB.secret = i;
    }
  }

  update() {
    this.#grid.update();
  }

  draw() {
    this.#grid.draw();
  }

  #release(cell) {
    if (cell && !cell.open) {
      if (this.#showingA && this.#showingB) {
        this.#cancelShowing();
      }

      cell.open = true;
      cell.write(this.#game.text, cell.secret, 16, 'highlight');
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

    this.#showingA = null;
    this.#showingB = null;
  }
}
