import Grid from '../Grid';

export default class {
  #game;
  #onwin;
  #grid;
  #selected;

  constructor(game, onwin) {
    this.#game = game;
    this.#onwin = onwin;

    const w = 10;
    const h = 10;

    const s = Math.floor(Math.min((this.#game.renderer.w - 20) / w, (this.#game.renderer.h - 110) / h));

    this.#grid = new Grid(this.#game, 'center', 100, w, h, s, 0, 0, (cell) => this.#click(cell));

    for (let i = 0; i < w * h; i++) {
      const cell = this.#grid.sprites[i];
      cell.index = i;
      cell.write(this.#game.text, i, 12, 'highlight');
    }

    for (let i = 0; i < (w * h) / 2; i++) {
      const cellA = this.#grid.sprites[Math.floor(Math.random() * this.#grid.sprites.length)];
      const cellB = this.#grid.sprites[Math.floor(Math.random() * this.#grid.sprites.length)];

      this.#swap(cellA, cellB);
    }

    this.#game.text.write('JIGSPAW', 'center', 10, 48, 'inactive', ['sine']);
  }

  update() {
    this.#grid.update();
  }

  draw() {
    this.#grid.draw();
  }

  #click(cell) {
    if (this.#selected) {
      this.#selected.activate(true);
      this.#swap(this.#selected, cell);
      this.#selected = null;
      this.#checkGrid();
    } else {
      cell.activate(false);
      this.#selected = cell;
    }
  }

  #swap(cellA, cellB) {
    const index = cellA.index;
    cellA.index = cellB.index;
    cellB.index = index;

    cellA.write(this.#game.text, cellA.index, 12, 'highlight');
    cellB.write(this.#game.text, cellB.index, 12, 'highlight');
  }

  #checkGrid() {
    for (let i = 0; i < this.#grid.w * this.#grid.h; i++) {
      if (this.#grid.sprites[i].index !== i) {
        return;
      }
    }

    this.#grid.disabled = true;

    this.#onwin();
  }
}
