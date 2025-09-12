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
  #won;
  #lost;
  #lostText;
  #lostTextInfo;
  #timer;

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

    this.#cat = this.#spriteBatch.add(CENTER, 100, 64, 1, color);
    this.#leftPaw = this.#spriteBatch.add(this.#cat.x - 12, this.#cat.y + 60, 24, 0, color);
    this.#rightPaw = this.#spriteBatch.add(this.#cat.x + 46, this.#cat.y + 60, 24, 0, color);

    this.#catNameText = game.text.write(catName, CENTER, 10, 24, color, [SINE_ANIMATION]);
    this.#catTextText = game.text.write(catText, CENTER, this.#cat.y + 100, 32, color, [TYPING_ANIMATION, SHAKE_ANIMATION]);
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
      this.#catNameText = this.#game.text.write('VICKI', CENTER, 10, 24, BLACKCAT_COLOR, [SINE_ANIMATION]);
      this.#catTextText = this.#game.text.write(response, CENTER, this.#cat.y + 100, 32, BLACKCAT_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION]);
      this.#catMet = true;
    } else if (!this.#started && this.#game.input.click()) {
      this.#game.input.clickRead = true;
      this.#cat.enabled = false;
      this.#leftPaw.enabled = false;
      this.#rightPaw.enabled = false;
      this.#catNameText.enabled = false;
      this.#catTextText.enabled = false;
      this.#spriteBatch.changed();
      this.#setup();
      this.#started = true;
    }

    if (this.#started && !this.#won && !this.#lost) {
      this.#minigame.update();
    }

    this.#spriteBatch.update();

    if (this.#won && this.#game.input.click()) {
      this.#timer.disabled = true;
      this.#exit = true;
    }

    if (this.#lost && this.#game.input.click()) {
      this.#setup();
    }
  }

  draw() {
    if (this.#started && !this.#exit) {
      this.#minigame.draw();
    }

    this.#spriteBatch.draw();
    this.#buttons.draw();
  }

  #setup() {
    this.#won = false;
    this.#lost = false;

    (this.#lostText || {}).enabled = false;
    (this.#lostTextInfo || {}).enabled = false;

    this.#game.text.clear();

    this.#minigame = new this.#minigameClass(this.#game, () => this.#win(), () => this.#lose());

    this.#game.text.write(this.#minigameClass.meta[0], CENTER, 10, 48, INACTIVE_COLOR, [SINE_ANIMATION]);

    this.#exitButton = this.#buttons.sprites[0];
    this.#exitButton.write(this.#game.text, 'X', 32, ACTIVE_COLOR);
  }

  #win() {
    this.#won = true;
    this.#game.minigamesWon.add(this.#minigameClass);

    const texts = ['CONGRATS!!', 'WELL DONE!!', 'GOOD JOB!!', 'PAWSOME!!', 'AMEOWZING!!'];
    const text = this.#game.text.write(texts[Math.floor(Math.random() * texts.length)], CENTER, CENTER, 48, HIGHLIGHT_COLOR, [SINE_ANIMATION]);
    this.#game.text.write('NOW GO HELP THE OTHER CATS!', CENTER, text.y + 75, 32, ACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION], 1200);

    this.#timer = this.#game.scheduleTimer(400, () => this.#game.particles.emit(Math.random() * this.#game.renderer.w, Math.random() * this.#game.renderer.h, true, 256, 1000), true);
  }

  #lose() {
    this.#lost = true;

    const texts = ['OOPS!!', 'BETTER LUCK NEXT TIME!!', 'OH WELL!!'];
    this.#lostText = this.#game.text.write(texts[Math.floor(Math.random() * texts.length)], CENTER, CENTER, 48, HIGHLIGHT_COLOR, [SINE_ANIMATION]);
    this.#lostTextInfo = this.#game.text.write("LET'S TRY AGAIN!", CENTER, this.#lostText.y + 75, 32, ACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION], 1200);
  }

  #buttonClick(button) {
    if (button === this.#exitButton) {
      this.#exit = true;
    }
  }
}
