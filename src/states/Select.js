import Grid from '../Grid';

import Minigame from './Minigame';
import Meowsweeper from '../minigames/Meowsweeper';
import PawPawToe from '../minigames/PawPawToe';
import Sudocat from '../minigames/Sudocat';
import Meowmory from '../minigames/Meowmory';
import Jigspaw from '../minigames/Jigspaw';

export default class {
  #game;
  #grid;
  #buttons;
  #minigameState;

  constructor(game) {
    this.#game = game;

    this.#grid = new Grid(this.#game, 50, 100, 6, 12, 64, 0, 0, null, '', 2);

    this.#buttons = new Grid(this.#game, 100, 150, 3, 4, 64, 32, 32, (button) => this.#buttonRelease(button), '', 1);

    this.#buttons.sprites[0].minigame = PawPawToe;
    this.#buttons.sprites[1].minigame = Meowsweeper;
    this.#buttons.sprites[2].minigame = Meowmory;
    this.#buttons.sprites[3].minigame = Sudocat;
    this.#buttons.sprites[4].minigame = Jigspaw;

    this.#buttons.sprites[5].activate(false);
    this.#buttons.sprites[6].activate(false);
    this.#buttons.sprites[7].activate(false);
    this.#buttons.sprites[8].activate(false);
    this.#buttons.sprites[9].activate(false);
    this.#buttons.sprites[10].activate(false);
    this.#buttons.sprites[11].activate(false);

    this.#game.text.write('HELP THE OTHER CATS\nIN THE BUILDING', 10, 10, 32, 'active', ['typing', 'shake']);

    for (let i = 0; i < this.#buttons.sprites.length; i++) {
      const button = this.#buttons.sprites[i];
      if (this.#game.minigamesWon.has(button.minigame)) {
        button.activate(false);
      }
    }
  }

  update() {
    this.#grid.update();
    if (this.#minigameState) {
      return this.#minigameState;
    } else {
      this.#buttons.update();

      return this;
    }
  }

  draw() {
    this.#grid.draw();
    this.#buttons.draw();
  }

  #buttonRelease(button) {
    if (button) {
      this.#minigameState = new Minigame(this.#game, button.minigame);
    }
  }
}
