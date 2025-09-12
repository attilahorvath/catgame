import SpriteBatch from './SpriteBatch';
import TextSegment from './TextSegment';

export default class extends SpriteBatch {
  #game;
  #segments;

  constructor(game) {
    super(game, false, 'font');

    this.#game = game;
    this.#segments = [];
  }

  write(text, x, y, s, color = ACTIVE_COLOR, animations = null, delay = null) {
    if (x === CENTER) {
      x = Math.floor(this.#game.renderer.w / 2 - (Math.max(...text.split('\n').map(s => s.length)) * s) / 2);
    }

    if (y === CENTER) {
      y = Math.floor(this.#game.renderer.h / 2 - (text.split('\n').length * s) / 2);
    }

    const segment = new TextSegment(text, x, y, s, color, animations, delay);

    let currX = x;
    let currY = y;

    for (const c of text) {
      let type;

      if (c === '\n') {
        currY += s;
        currX = x;

        continue;
      }

      if (c >= 'A' && c <= 'Z') {
        type = c.charCodeAt(0) - 'A'.charCodeAt(0);
      } else if (c >= '0' && c <= '9') {
        type = 26 + c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if (c === '?') {
        type = 36;
      } else if (c === '!') {
        type = 37;
      } else if (c === ',') {
        type = 38;
      } else if (c === '.') {
        type = 39;
      } else if (c === "'") {
        type = 40;
      }

      if (type != null) {
        const sprite = this.add(currX, currY, s, type, color);
        sprite.baseX = currX;
        sprite.baseY = currY;
        segment.sprites.push(sprite);
      }

      currX += s;
    }

    this.#segments.push(segment);
    this.changed();

    return segment;
  }

  clear() {
    for (const segment of this.#segments) {
      for (const sprite of segment.sprites) {
        sprite.enabled = false;
      }
    }

    this.#segments = [];
    this.changed();
  }

  update(timestamp) {
    for (const segment of this.#segments.filter(segment => !segment.enabled)) {
      for (const sprite of segment.sprites) {
        sprite.enabled = false;
      }
    }

    this.#segments = this.#segments.filter(segment => segment.enabled);

    for (const segment of this.#segments) {
      if (segment.update(timestamp)) {
        this.changed();
      }
    }

    super.update();
  }
}
