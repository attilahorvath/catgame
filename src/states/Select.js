import Grid from '../Grid';

import Minigame from './Minigame';
import Meowsweeper from '../minigames/Meowsweeper';
import PawPawToe from '../minigames/PawPawToe';
import Sudocat from '../minigames/Sudocat';
import Meowmory from '../minigames/Meowmory';
import Jigspaw from '../minigames/Jigspaw';

export default class {
  #game;
  #buttons;
  #minigameState;

  constructor(game) {
    this.#game = game;

    this.#buttons = new Grid(this.#game, 100, 100, 3, 3, 64, 32, 32, (button) => this.#buttonRelease(button));

    this.#buttons.sprites[0].minigame = PawPawToe;
    this.#buttons.sprites[1].minigame = Meowsweeper;
    this.#buttons.sprites[2].minigame = Meowmory;
    this.#buttons.sprites[3].minigame = Sudocat;
    this.#buttons.sprites[4].minigame = Jigspaw;

    this.#buttons.sprites[5].activate(false);
    this.#buttons.sprites[6].activate(false);
    this.#buttons.sprites[7].activate(false);
    this.#buttons.sprites[8].activate(false);
  }

  update() {
    if (this.#minigameState) {
      return this.#minigameState;
    } else {
      this.#buttons.update();

      return this;
    }
  }

  draw() {
    this.#buttons.draw();
  }

  #buttonRelease(button) {
    if (button) {
      this.#minigameState = new Minigame(this.#game, button.minigame);
    }
  }
}
