export default class {
  constructor(text, x, y, s, color, animations, delay) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.s = s;
    this.color = color;
    this.animations = animations ?? [];
    this.delay = delay ?? 0;

    this.sprites = [];
    this.enabled = true;

    this.time = 0;
    this.begin = null;
  }

  setColor(color) {
    for (const sprite of this.sprites) {
      sprite.setColor(color);
    }
  }

  update(timestamp) {
    let updated = false;

    for (const animation of this.animations) {
      switch (animation) {
      case 'sine':
        for (let i = 0; i < this.sprites.length; i++) {
          const sprite = this.sprites[i];
          sprite.y = sprite.baseY + Math.sin(i + timestamp / 200) * 10;
        }
        updated = true;
        break;
      case 'shake':
        this.time += 1;

        if (this.time === 7) {
          this.time = 0;
          for (let i = 0; i < this.sprites.length; i++) {
            const sprite = this.sprites[i];
            sprite.x = sprite.baseX + Math.random() * 5;
            sprite.y = sprite.baseY + Math.random() * 5;
          }
        }
        updated = true;
        break;
      case 'typing':
        if (!this.begin) {
          this.begin = timestamp;
        }
        for (let i = 0; i < this.sprites.length; i++) {
          const sprite = this.sprites[i];
          sprite.hidden = (timestamp - this.begin - this.delay) / 150 < i;
        }
        updated = true;
        break;
      }
    }

    return updated;
  }
}
