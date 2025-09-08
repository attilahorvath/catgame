import Renderer from './Renderer';
import Input from './Input';

import Text from './Text';
import Title from './states/Title';
import SpriteBatch from './SpriteBatch';
import Select from './states/Select';

export default class {
  #timers;
  #spriteBatch;
  #cursor;
  #state;

  constructor() {
    this.renderer = new Renderer();
    this.input = new Input(this);
    this.#timers = [];

    this.text = new Text(this);
    this.#spriteBatch = new SpriteBatch(this, 'textures/sprites.png', 16);
    this.#cursor = this.#spriteBatch.add(0, 0, 26, 0, 'blackcat');
    this.#cursor.hidden = true;

    // this.#state = new Select(this);
    this.#state = new Title(this);
    // this.#state = new Minigame(this, Meowsweeper);
    // this.#cursor.a = 0.5;

    this.minigamesWon = new Set();
  }

  step(timestamp) {
    this.timestamp = timestamp;
    this.#update(timestamp);
    this.#draw();
  }

  scheduleTimer(delay, onexpire, repeat) {
    const timer = { start: this.timestamp ?? 0, delay: delay, onexpire: onexpire, repeat: repeat };
    this.#timers.push(timer);
    return timer;
  }

  #update(timestamp) {
    this.input.update();

    if (this.input.mouse && this.#cursor.hidden) {
      this.#cursor.hidden = false;
      this.#spriteBatch.changed();
    }

    if (this.input.moved) {
      this.#cursor.x = this.input.x - 6;
      this.#cursor.y = this.input.y - 6;

      this.#spriteBatch.changed();
    }

    this.#updateTimers(timestamp);
    this.#state = this.#state.update();
    this.text.update(timestamp);
    this.#spriteBatch.update();
  }

  #updateTimers(timestamp) {
    for (const timer of this.#timers) {
      if (timestamp >= timer.start + timer.delay && !timer.disabled) {
        if (timer.repeat) {
          timer.start = timestamp;
        } else {
          timer.expired = true;
        }

        if (timer.onexpire) {
          timer.onexpire();
        }
      }
    }

    if (this.#timers.some(timer => timer.expired || timer.disabled)) {
      this.#timers = this.#timers.filter(timer => !timer.expired && !timer.disabled);
    }
  }

  #draw() {
    this.renderer.clear();

    this.#state.draw();

    this.text.draw();

    this.#spriteBatch.draw();
  }
}
