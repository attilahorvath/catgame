export default class {
  #newKeyPresses;
  #newKeyReleases;
  #newPress;
  #newRelease;
  #lastX;
  #lastY;

  constructor(game) {
    this.#newKeyPresses = {};
    this.#newKeyReleases = {};

    game.renderer.canvas.addEventListener('pointermove', event => {
      this.mouse = event.pointerType === 'mouse';

      this.x = event.offsetX * game.renderer.multiplier;
      this.y = event.offsetY * game.renderer.multiplier;
    });

    game.renderer.canvas.addEventListener('pointerdown', event => {
      this.mouse = event.pointerType === 'mouse';

      this.x = event.offsetX * game.renderer.multiplier;
      this.y = event.offsetY * game.renderer.multiplier;

      this.#newPress = true;
    });

    game.renderer.canvas.addEventListener('pointerup', event => {
      this.mouse = event.pointerType === 'mouse';

      this.x = event.offsetX * game.renderer.multiplier;
      this.y = event.offsetY * game.renderer.multiplier;

      this.#newRelease = true;
    });

    addEventListener('keydown', event => {
      this.#newKeyPresses[event.code] = true;
    });

    addEventListener('keyup', event => {
      this.#newKeyReleases[event.code] = true;
    });
  }

  update() {
    if (this.x !== this.#lastX || this.y !== this.#lastY) {
      this.#lastX = this.x;
      this.#lastY = this.y;
      this.moved = true;
    }

    this.press = false;

    if (this.#newPress) {
      this.press = true;
      this.#newPress = false;
    }

    this.release = false;

    if (this.#newRelease) {
      this.release = true;
      this.#newRelease = false;
    }

    this.keyPresses = {};

    for (const [newKeyPress, newKeyPressValue] of Object.entries(this.#newKeyPresses)) {
      if (newKeyPressValue) {
        this.keyPresses[newKeyPress] = true;
        this.#newKeyPresses[newKeyPress] = false;
      }
    }

    this.keyReleases = {};

    for (const [newKeyRelease, newKeyReleaseValue] of Object.entries(this.#newKeyReleases)) {
      if (newKeyReleaseValue) {
        this.keyReleases[newKeyRelease] = true;
        this.#newKeyReleases[newKeyRelease] = false;
      }
    }

    this.clickRead = false;
  }

  click() {
    return !this.clickRead && ((this.mouse && this.release) || (!this.mouse && this.press));
  }

  left() {
    return this.keyPresses['KeyA'] || this.keyPresses['ArrowLeft'];
  }

  right() {
    return this.keyPresses['KeyD'] || this.keyPresses['ArrowRight'];
  }

  cancel() {
    return this.keyPresses['KeyX'] || this.keyPresses['Digit0'];
  }
}
