import Renderer from './Renderer';
import Input from './Input';

import Text from './Text';
import SpriteBatch from './SpriteBatch';
import Select from './states/Select';

export default class {
  #started;
  #timers;
  #spriteBatch;
  #cursor;
  #state;
  #shakeScreen;

  constructor() {
    this.renderer = new Renderer(() => {
      if (!this.#started) {
        this.#state = new Select(this);
        this.#started = true;
      }
    });

    this.input = new Input(this);
    this.#timers = [];

    this.text = new Text(this);
    this.#spriteBatch = new SpriteBatch(this, 'textures/sprites.png', 16);
    this.#cursor = this.#spriteBatch.add(0, 0, 26, 0, 'blackcat');
    this.#cursor.hidden = true;

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

  shake(length) {
    navigator.vibrate(length);
    this.#shakeScreen = true;
    this.scheduleTimer(length, () => this.#shakeScreen = false);
  }

  #update(timestamp) {
    if (this.#shakeScreen) {
      this.renderer.view[6] = Math.random() * 5;
      this.renderer.view[7] = Math.random() * 5;
    }

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

    if (this.#state) {
      this.#state = this.#state.update();
    }

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

    if (this.#state) {
      this.#state.draw();
    }

    this.text.draw();

    this.#spriteBatch.draw();
  }
}
