import Renderer from './Renderer';
import Input from './Input';

import Text from './Text';
import SpriteBatch from './SpriteBatch';
import Select from './states/Select';
import Minigame from './states/Minigame';
import Matrix3 from './Matrix3';
import PawPawToe from './minigames/PawPawToe';

export default class {
  #started;
  #timers;
  #backgroundBatch;
  #spriteBatch;
  #cursor;
  #state;
  #nextState;
  #shakeScreen;

  constructor() {
    this.renderer = new Renderer(() => {
      if (!this.#started) {
        for (let i = 0; i < 100; i++) {
          const type = Math.floor(Math.random() * 15);
          let color = null;
          if (type < 5) {
            color = ['blackcat', 'orangecat', 'whitecat', 'tabbycat', 'silvercat'][Math.floor(Math.random() * 5)];
          }
          const sprite = this.#backgroundBatch.add(Math.random() * this.renderer.w, Math.random() * this.renderer.h, 16 + Math.random() * 100, type, color);
          sprite.dx = -0.5 + Math.random();
          sprite.dy = -0.5 + Math.random();
          sprite.ds = -0.1 + Math.random() * 0.2;
        }

        this.#state = new Select();
        // this.#state = new Minigame(PawPawToe);
        this.#state.init(this);
        this.#started = true;
      }
    });

    this.input = new Input(this);
    this.#timers = [];

    this.#backgroundBatch = new SpriteBatch(this, true);

    this.text = new Text(this);
    this.#spriteBatch = new SpriteBatch(this);
    this.#cursor = this.#spriteBatch.add(0, 0, 26, 0, 'blackcat');
    this.#cursor.hidden = true;

    this.minigamesWon = new Set();

    this.firstStart = true;
  }

  step(timestamp) {
    this.timestamp = timestamp;
    this.#update(timestamp);
    this.#draw();

    if (this.#nextState) {
      this.text.clear();
      this.#state = this.#nextState;
      this.#state.init(this);
      this.#nextState = null;
    }
  }

  scheduleTimer(delay, onexpire, repeat) {
    const timer = { start: this.timestamp ?? 0, delay: delay, onexpire: onexpire, repeat: repeat };
    this.#timers.push(timer);
    return timer;
  }

  shake(duration) {
    navigator.vibrate(duration);
    this.#shakeScreen = true;
    this.scheduleTimer(duration, () => this.#shakeScreen = false);
  }

  #update(timestamp) {
    if (this.#shakeScreen) {
      this.renderer.view[6] = Math.random() * 7;
      this.renderer.view[7] = Math.random() * 7;
    } else {
      this.renderer.view[6] = 0;
      this.renderer.view[7] = 0;
    }

    // this.renderer.view[0] += 0.005;
    // this.renderer.view[4] += 0.005;

    // this.renderer.view[6] -= 1;
    // this.renderer.view[7] -= 1;

    // this.w ||= 1000;
    // this.h ||= 1000;

    // this.w -= 1;
    // this.h -= 1;

    // this.renderer.projection = Matrix3.ortho(100, this.renderer.w - 100, this.renderer.h - 100, 100);

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

    for (const sprite of this.#backgroundBatch.sprites) {
      sprite.x += sprite.dx;
      sprite.y += sprite.dy;
      sprite.size += sprite.ds;

      if (sprite.x < 0) {
        sprite.dx = -sprite.dx;
        sprite.x = 0;
      }

      if (sprite.y < 0) {
        sprite.dy = -sprite.dy;
        sprite.y = 0;
      }

      if (sprite.x > this.renderer.w) {
        sprite.dx = -sprite.dx;
        sprite.x = this.renderer.w;
      }

      if (sprite.y > this.renderer.h) {
        sprite.dy = -sprite.dy;
        sprite.y = this.renderer.h;
      }

      if (sprite.size < 16) {
        sprite.ds = -sprite.ds;
        sprite.size = 16;
      }

      if (sprite.size > 116) {
        sprite.ds = -sprite.ds;
        sprite.size = 116;
      }
    }

    this.#backgroundBatch.changed();
    this.#backgroundBatch.update();

    this.#updateTimers(timestamp);

    if (this.#state) {
      this.#nextState = this.#state.update();
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

    const currProjection = this.renderer.projection;

    this.renderer.projection = Matrix3.ortho(0, this.renderer.w, this.renderer.h, 0);
    this.#backgroundBatch.draw();
    this.renderer.projection = currProjection;

    if (this.#state) {
      this.#state.draw();
    }

    this.text.draw();

    this.renderer.projection = Matrix3.ortho(0, this.renderer.w, this.renderer.h, 0);
    this.#spriteBatch.draw();
    this.renderer.projection = currProjection;
  }
}
