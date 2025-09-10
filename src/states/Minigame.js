import Grid from '../Grid';
import SpriteBatch from '../SpriteBatch';
import Select from './Select';

export default class {
  #minigameClass;
  #game;
  #minigame;
  #buttons;
  #spriteBatch;
  #cat;
  #leftPaw;
  #rightPaw;
  #catNameText;
  #catTextText;
  #exitButton;
  #exit;
  #catMet;
  #started;

  constructor(minigameClass) {
    this.#minigameClass = minigameClass;
  }

  init(game) {
    this.#game = game;

    this.#buttons = new Grid(game, game.renderer.w - 74, 10, 1, 1, 64, 0, 0, (button) => this.#buttonClick(button));

    this.#exitButton = this.#buttons.sprites[0];

    this.#exitButton = this.#buttons.sprites[0];
    this.#exitButton.write(game.text, 'X', 32, 'active');

    this.#spriteBatch = new SpriteBatch(game);

    this.#cat = this.#spriteBatch.add('center', 100, 64, 1, this.#minigameClass.color);
    this.#leftPaw = this.#spriteBatch.add(this.#cat.x - 12, this.#cat.y + 60, 24, 0, this.#minigameClass.color);
    this.#rightPaw = this.#spriteBatch.add(this.#cat.x + 46, this.#cat.y + 60, 24, 0, this.#minigameClass.color);

    this.#catNameText = game.text.write(this.#minigameClass.catName, 'center', 10, 24, this.#minigameClass.color, ['sine']);
    this.#catTextText = game.text.write(this.#minigameClass.catText, 'center', this.#cat.y + 100, 32, this.#minigameClass.color, ['typing', 'shake']);
  }

  update() {
    if (this.#exit) {
      return new Select(this.#game);
    }

    this.#buttons.update();

    if (!this.#catMet && this.#game.input.click()) {
      this.#game.input.clickRead = true;
      this.#cat.setColor('blackcat');
      this.#leftPaw.setColor('blackcat');
      this.#rightPaw.setColor('blackcat');
      this.#spriteBatch.changed();
      this.#catNameText.enabled = false;
      this.#catTextText.enabled = false;
      this.#catNameText = this.#game.text.write('VICKI', 'center', 10, 24, 'blackcat', ['sine']);
      this.#catTextText = this.#game.text.write(this.#minigameClass.response, 'center', this.#cat.y + 100, 32, 'blackcat', ['typing', 'shake']);
      this.#catMet = true;
    } else if (!this.#started && this.#game.input.click()) {
      this.#game.input.clickRead = true;
      this.#cat.enabled = false;
      this.#leftPaw.enabled = false;
      this.#rightPaw.enabled = false;
      this.#catNameText.enabled = false;
      this.#catTextText.enabled = false;
      this.#spriteBatch.changed();
      this.#game.text.write(this.#minigameClass.title, 'center', 10, 48, 'inactive', ['sine']);
      this.#setup();
      this.#started = true;
    }

    if (this.#started) {
      this.#minigame.update();
    }

    this.#spriteBatch.update();
  }

  draw() {
    if (this.#started && !this.#exit) {
      this.#minigame.draw();
    }

    this.#spriteBatch.draw();
    this.#buttons.draw();
  }

  #setup() {
    this.#minigame = new this.#minigameClass(this.#game, () => this.#win(), () => this.#lose());

    this.#exitButton = this.#buttons.sprites[0];
    this.#exitButton.write(this.#game.text, 'X', 32, 'active');
  }

  #win() {
    this.#game.scheduleTimer(500, () => {
      this.#game.minigamesWon.add(this.#minigameClass);
      this.#exit = true;
    });
  }

  #lose() {
    this.#game.scheduleTimer(500, () => { this.#setup(); });
  }

  #buttonClick(button) {
    if (button === this.#exitButton) {
      this.#exit = true;
    }
  }
}
