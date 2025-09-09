import Grid from '../Grid';
import SpriteBatch from '../SpriteBatch';

import Minigame from './Minigame';
import Meowsweeper from '../minigames/Meowsweeper';
import PawPawToe from '../minigames/PawPawToe';
import Sudocat from '../minigames/Sudocat';
import Meowmory from '../minigames/Meowmory';
import Jigspaw from '../minigames/Jigspaw';
import Meowsterpiece from '../minigames/Meowsterpiece';

export default class {
  #game;
  #grid;
  #buttons;
  #spriteBatch;
  #minigameState;

  constructor(game) {
    this.#game = game;

    this.#grid = new Grid(this.#game, 'center', 100, 6, 12, 128, 0, 0, null, '', 2);

    this.#buttons = new Grid(this.#game, 'center', 132, 3, 4, 128, 64, 64, (button) => this.#buttonClick(button), '', 1);

    this.#spriteBatch = new SpriteBatch(this.#game, 'textures/sprites.png', 16, false);

    const minigames = [PawPawToe, Meowsweeper, Meowmory, Sudocat, Jigspaw, Meowsterpiece];
    const xs = [73, 8, 73, 8, 73, 73];
    const ys = [73, 73, 73, 73, 73, 73];
    const types = [4, 2, 3, 3, 4, 2];
    const colors = ['orangecat', 'whitecat', 'tabbycat', 'silvercat', 'blackcat', 'orangecat'];

    for (let i = 0; i < 12; i++) {
      if (minigames[i]) {
        this.#buttons.sprites[i].minigame = minigames[i];
        if (this.#game.minigamesWon.has(minigames[i])) {
          this.#buttons.sprites[i].activate(false);
          xs[i] = 39;
          ys[i] = 39;
          types[i] = 1;
        }
        this.#spriteBatch.add(this.#buttons.sprites[i].x + xs[i], this.#buttons.sprites[i].y + ys[i], 50, types[i], colors[i]);
      } else {
        this.#buttons.sprites[i].activate(false);
      }
    }

    this.#game.text.write('HELP THE OTHER CATS\nIN THE BUILDING!', 'center', 10, 32, 'active', ['typing', 'shake']);

    for (let i = 0; i < this.#buttons.sprites.length; i++) {
      const button = this.#buttons.sprites[i];
      if (this.#game.minigamesWon.has(button.minigame)) {
        button.activate(false);
      }
    }
  }

  update() {
    this.#grid.update();
    this.#spriteBatch.update();
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
    this.#spriteBatch.draw();
  }

  #buttonClick(button) {
    if (button) {
      this.#minigameState = new Minigame(this.#game, button.minigame);
    }
  }
}
