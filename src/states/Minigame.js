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
    this.#exitButton.write(game.text, 'X', 32, ACTIVE_COLOR);

    this.#spriteBatch = new SpriteBatch(game);

    const [_title, color, _sx, _type, catName, catText, _response] = this.#minigameClass.meta;

    this.#cat = this.#spriteBatch.add('center', 100, 64, 1, color);
    this.#leftPaw = this.#spriteBatch.add(this.#cat.x - 12, this.#cat.y + 60, 24, 0, color);
    this.#rightPaw = this.#spriteBatch.add(this.#cat.x + 46, this.#cat.y + 60, 24, 0, color);

    this.#catNameText = game.text.write(catName, 'center', 10, 24, color, ['sine']);
    this.#catTextText = game.text.write(catText, 'center', this.#cat.y + 100, 32, color, ['typing', 'shake']);
  }

  update() {
    const [title, _color, _sx, _type, _catName, _catText, response] = this.#minigameClass.meta;

    if (this.#exit) {
      return new Select(this.#game);
    }

    this.#buttons.update();

    if (!this.#catMet && this.#game.input.click()) {
      this.#game.input.clickRead = true;
      this.#cat.setColor(BLACKCAT_COLOR);
      this.#leftPaw.setColor(BLACKCAT_COLOR);
      this.#rightPaw.setColor(BLACKCAT_COLOR);
      this.#spriteBatch.changed();
      this.#catNameText.enabled = false;
      this.#catTextText.enabled = false;
      this.#catNameText = this.#game.text.write('VICKI', 'center', 10, 24, BLACKCAT_COLOR, ['sine']);
      this.#catTextText = this.#game.text.write(response, 'center', this.#cat.y + 100, 32, BLACKCAT_COLOR, ['typing', 'shake']);
      this.#catMet = true;
    } else if (!this.#started && this.#game.input.click()) {
      this.#game.input.clickRead = true;
      this.#cat.enabled = false;
      this.#leftPaw.enabled = false;
      this.#rightPaw.enabled = false;
      this.#catNameText.enabled = false;
      this.#catTextText.enabled = false;
      this.#spriteBatch.changed();
      this.#game.text.write(title, 'center', 10, 48, INACTIVE_COLOR, ['sine']);
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
    this.#exitButton.write(this.#game.text, 'X', 32, ACTIVE_COLOR);
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
