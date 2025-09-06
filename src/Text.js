import SpriteBatch from './SpriteBatch';
import TextSegment from './TextSegment';

export default class extends SpriteBatch {
  #segments;

  constructor(game) {
    super(game, 'textures/font.png', LETTER_SIZE);

    this.#segments = [];
  }

  write(text, x, y, size, color = 'active') {
    const segment = new TextSegment(text, x, y, size, color);

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
        segment.sprites.push(this.addSprite(currX, currY, size, type, color));
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

  update() {
    for (const segment of this.#segments.filter(segment => !segment.enabled)) {
      for (const sprite of segment.sprites) {
        sprite.enabled = false;
      }
    }

    this.#segments = this.#segments.filter(segment => segment.enabled);

    super.update();
  }
}
