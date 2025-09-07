import SpriteBatch from './SpriteBatch';
import TextSegment from './TextSegment';

export default class extends SpriteBatch {
  #segments;

  constructor(game) {
    super(game, 'textures/font.png', LETTER_SIZE);

    this.#segments = [];
  }

  write(text, x, y, size, color = 'active', animations, delay) {
    const segment = new TextSegment(text, x, y, size, color, animations, delay);

    let currX = x;
    let currY = y;

    for (const c of text) {
      let type;

      if (c === '\n') {
        currY += size;
        currX = x;

        continue;
      }

      if (c >= 'A' && c <= 'Z') {
        type = c.charCodeAt(0) - 'A'.charCodeAt(0);
      } else if (c >= '0' && c <= '9') {
        type = 26 + c.charCodeAt(0) - '0'.charCodeAt(0);
      }

      if (type != null) {
        const sprite = this.addSprite(currX, currY, size, type, color);
        sprite.baseX = currX;
        sprite.baseY = currY;
        segment.sprites.push(sprite);
      }

      currX += size;
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
