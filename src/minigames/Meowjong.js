import Grid from '../Grid';
import SpriteBatch from '../SpriteBatch';

export default class {
  #game;
  #onwin;
  #grids;
  #selected;

  static meta = [
    'MEOWJONG',
    SILVERCAT_COLOR,
    73,
    4,
    'PABLO',
    "HOLA!! SOY PABLO!\n\n\nLET'S PLAY MEOWJONG!\nJUST MATCH THE SAME\nTILES BUT ONLY WHEN\nTHEY'RE FREE TO MOVE\nLEFT OR RIGHT.",
    'OH, SI SENOR?!'
  ];

  constructor(game, onwin) {
    this.#game = game;
    this.#onwin = onwin;

    const w = game.renderer.horizontal ? 12 : 8;
    const h = game.renderer.horizontal ? 8 : 12;

    const s = Math.floor(Math.min((game.renderer.w - 20) / w, (game.renderer.h - 110) / h));
    const offset = Math.ceil(s / 16);

    this.#grids = [];

    const baseGrid = new Grid(game, CENTER, 100, w, h, s, 0, 0, (cell) => this.#click(cell), INACTIVE3_COLOR);
    baseGrid.spriteBatch = new SpriteBatch(game, true);

    for (let [x, y] of [[0, 1], [1, 1], [0, 2], [0, 5], [0, 6], [1, 6], [10, 1], [11, 1], [11, 2], [11, 5], [10, 6], [11, 6]]) {
      if (!game.renderer.horizontal) {
        let i = x;
        x = y;
        y = i;
      }

      baseGrid.cellAt(x, y).activate(false);
      baseGrid.cellAt(x, y).hidden = true;
    }

    this.#grids.push(baseGrid);

    const gridA = new Grid(game, baseGrid.x + ((game.renderer.horizontal ? 3 : 1) * s - offset), baseGrid.y + ((game.renderer.horizontal ? 1 : 3) * s - offset), 6, 6, s, 0, 0, (cell) => this.#click(cell), INACTIVE4_COLOR);
    gridA.spriteBatch = new SpriteBatch(game, true);

    const gridB = new Grid(game, gridA.x + (s - offset), gridA.y + (s - offset), 4, 4, s, 0, 0, (cell) => this.#click(cell), INACTIVE5_COLOR);
    gridB.spriteBatch = new SpriteBatch(game, true);

    const gridC = new Grid(game, gridB.x + (s - offset), gridB.y + (s - offset), 2, 2, s, 0, 0, (cell) => this.#click(cell), INACTIVE6_COLOR);
    gridC.spriteBatch = new SpriteBatch(game, true);

    this.#grids.push(gridA);
    this.#grids.push(gridB);
    this.#grids.push(gridC);

    const available = [];

    for (let type = 0; type < 15; type++) {
      for (let count = 0; count < 4; count++) {
        if (type < 5) {
          for (let color = BLACKCAT_COLOR; color <= SILVERCAT_COLOR; color++) {
            available.push([type, color]);
          }
        } else {
          available.push([type, null]);
        }
      }
    }

    for (let grid of this.#grids) {
      for (let cell of grid.sprites) {
        if (!cell.inactive) {
          const index = Math.floor(Math.random() * available.length);
          const [type, color] = available[index];
          available.splice(index, 1);

          cell.symbol = `${type}_${color}`;
          cell.draw(grid.spriteBatch, s * 2 / 3, type, color);
        }
      }
    }
  }

  update() {
    let pressHandled = false;
    for (let i = this.#grids.length - 1; i >= 0; i--) {
      pressHandled = this.#grids[i].update(pressHandled);
      this.#grids[i].spriteBatch.update();
    }
  }

  draw() {
    for (const grid of this.#grids) {
      grid.draw();
      grid.spriteBatch.draw();
    }
  }

  #click(cell) {
    const leftCell = cell.grid.cellAt(cell.gridX - 1, cell.gridY);
    const rightCell = cell.grid.cellAt(cell.gridX + 1, cell.gridY);
    const freeCell =!leftCell || leftCell.inactive || !rightCell || rightCell.inactive

    if (!this.#selected && freeCell) {
      this.#selected = cell;
      cell.setBaseColor(ACTIVE_COLOR);
    } else if (cell === this.#selected) {
      cell.setBaseColor(cell.grid.color);
      this.#selected = null;
    } else if (this.#selected && freeCell && this.#selected.symbol === cell.symbol) {
      this.#game.particles.emit(this.#selected.x + this.#selected.grid.s / 2, this.#selected.y + this.#selected.grid.s / 2);
      this.#game.particles.emit(cell.x + cell.grid.s / 2, cell.y + cell.grid.s / 2);
      this.#game.shake(200);

      this.#selected.activate(false);
      this.#selected.hidden = true;
      this.#selected.content.enabled = false;

      cell.activate(false);
      cell.hidden = true;
      cell.content.enabled = false;

      this.#selected = null;
      this.#checkGrids();
    }

    for (const grid of this.#grids) {
      grid.changed();
      grid.spriteBatch.changed();
    }
  }

  #checkGrids() {
    for (let grid of this.#grids) {
      for (let cell of grid.sprites) {
        if (!cell.inactive) {
          return;
        }
      }
    }

    this.#onwin();
  }
}
