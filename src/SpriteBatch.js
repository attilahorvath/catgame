import vertexShaderSource from '../shaders/sprite.vert';
import fragmentShaderSource from '../shaders/sprite.frag';

import Sprite from './Sprite';

export default class {
  #game;
  #shader;
  #vao;
  #instanceBuffer;
  #texture;
  #spritesChanged;

  constructor(game, smooth = false, textureName = 'sprites') {
    this.#game = game;
    const renderer = game.renderer;

    this.#shader = renderer.createShader('sprite', vertexShaderSource, fragmentShaderSource);

    this.#vao = renderer.createVao();

    renderer.useBuffer(renderer.quadBuffer);

    renderer.setAttribute(POSITION_ATTRIBUTE_LOCATION, 2, 16, 0);
    renderer.setAttribute(TEX_COORD_ATTRIBUTE_LOCATION, 2, 16, 8);

    this.#instanceBuffer = renderer.createBuffer(new Float32Array(), true);

    renderer.setAttribute(SPRITE_POSITION_ATTRIBUTE_LOCATION, 2, 32, 0, 1);
    renderer.setAttribute(SPRITE_SIZE_ATTRIBUTE_LOCATION, 1, 32, 8, 1);
    renderer.setAttribute(SPRITE_TYPE_ATTRIBUTE_LOCATION, 1, 32, 12, 1);
    renderer.setAttribute(SPRITE_COLOR_ATTRIBUTE_LOCATION, 4, 32, 16, 1);

    this.#texture = renderer.loadTexture(textureName, smooth);

    this.sprites = [];
    this.changed();
  }

  add(x, y, s, type, color) {
    if (x === 'center') {
      x = this.#game.renderer.w / 2 - s / 2;
    }

    if (y === 'center') {
      y = this.#game.renderer.h / 2 - s / 2;
    }

    const sprite = new Sprite(x, y, s, type, color);

    this.sprites.push(sprite);
    this.changed();

    return sprite;
  }

  changed() {
    this.#spritesChanged = true;
  }

  update() {
    if (this.#spritesChanged) {
      this.sprites = this.sprites.filter(sprite => sprite.enabled);

      this.#game.renderer.updateBuffer(this.#instanceBuffer, new Float32Array(
        this.sprites
            .map(sprite => sprite.attributes())
            .flat()
      ), true);

      this.#spritesChanged = false;
    }
  }

  draw() {
    this.#game.renderer.draw(this.#shader, this.#vao, this.#texture, 6, this.sprites.length);
  }
}
