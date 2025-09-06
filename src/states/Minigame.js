import Grid from '../Grid';
import Select from './Select';

export default class {
  #game;
  #minigameClass;
  #minigame;
  #buttons;
  #exitButton;
  #exit;

  constructor(game, minigameClass) {
    this.#game = game;
    this.#minigameClass = minigameClass;

    this.#buttons = new Grid(this.#game, 750, 10, 1, 1, 32, 0, 0, (button) => this.#buttonRelease(button));

    this.#exitButton = this.#buttons.sprites[0];

    this.#setup();
  }

  update() {
    if (this.#exit) {
      this.#game.text.clear();
      this.#exitButton.content.enabled = false;

      return new Select(this.#game);
    } else {
      this.#minigame.update();
      this.#buttons.update();

      return this;
    }
  }

  draw() {
    this.#minigame.draw();
    this.#buttons.draw();
  }

  #setup() {
    this.#game.text.clear();
    this.#minigame = new this.#minigameClass(this.#game, () => this.#win(), () => this.#lose());
    
    this.#exitButton = this.#buttons.sprites[0];
    this.#exitButton.write(this.#game.text, 'X', 24, 'active');
  }

  #win() {
    this.#game.scheduleTimer(500, () => { alert('win'); this.#exit = true; });
  }

  #lose() {
    this.#game.scheduleTimer(500, () => { this.#setup(); });
  }

  #buttonRelease(button) {
    if (button === this.#exitButton) {
      this.#exit = true;
    }
  }
}
