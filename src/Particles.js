import SpriteBatch from './SpriteBatch';

export default class extends SpriteBatch {
  #game;

  constructor(game) {
    super(game, false, null);

    this.#game = game;
  }

  emit(x, y, colorful = false, count = 128, t = 1000) {
    for (let i = 0; i < count; i++) {
      const particle = this.add(x, y, 5);

      if (colorful) {
        particle.r = Math.random();
        particle.g = Math.random();
        particle.b = Math.random();
      } else {
        const color = 0.5 + Math.random() * 0.5;
        particle.r = color;
        particle.g = color;
        particle.b = color;
      }

      const angle = Math.random() * Math.PI * 2;
      particle.dx = Math.cos(angle) * Math.random() * 5;
      particle.dy = Math.sin(angle) * Math.random() * 5;
      particle.t = t;
    }

    this.changed();
  }

  clear() {
    for (const particle of this.sprites) {
      particle.enabled = false;
    }

    this.changed();
  }

  update(timestamp) {
    for (const particle of this.sprites) {
      particle.x += particle.dx;
      particle.y += particle.dy;

      if (!particle.begin) {
        particle.begin = timestamp;
      }

      if (particle.begin + particle.t <= timestamp) {
        particle.enabled = false;
      } else {
        particle.a = 1.0 - (timestamp - particle.begin) / particle.t;
      }
    }

    this.changed();

    super.update();
  }
}
