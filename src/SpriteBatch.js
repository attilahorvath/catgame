import vertexShaderSource from '../shaders/sprite.vert';
import fragmentShaderSource from '../shaders/sprite.frag';

import Sprite from './Sprite';

export default class {
  #game;
  #imageSize;
  #shader;
  #vao;
  #instanceBuffer;
  #texture;
  #spritesChanged;

  constructor(game, texturePath, imageSize, smooth) {
    this.#game = game;
    this.#imageSize = imageSize;

    this.#shader = this.#game.renderer.createShader('sprite', vertexShaderSource, fragmentShaderSource);

    this.#vao = this.#game.renderer.createVao();

    this.#game.renderer.useBuffer(this.#game.renderer.quadBuffer);

    this.#game.renderer.setAttribute(POSITION_ATTRIBUTE_LOCATION, 2, 16, 0);
    this.#game.renderer.setAttribute(TEX_COORD_ATTRIBUTE_LOCATION, 2, 16, 8);

    this.#instanceBuffer = this.#game.renderer.createBuffer(new Float32Array(), true);

    this.#game.renderer.setAttribute(SPRITE_POSITION_ATTRIBUTE_LOCATION, 2, 36, 0, 1);
    this.#game.renderer.setAttribute(SPRITE_SIZE_ATTRIBUTE_LOCATION, 1, 36, 8, 1);
    this.#game.renderer.setAttribute(SPRITE_TYPE_ATTRIBUTE_LOCATION, 1, 36, 12, 1);
    this.#game.renderer.setAttribute(SPRITE_COLOR_ATTRIBUTE_LOCATION, 4, 36, 16, 1);
    this.#game.renderer.setAttribute(SPRITE_ANGLE_ATTRIBUTE_LOCATION, 1, 36, 32, 1);

    this.#texture = this.#game.renderer.loadTexture(texturePath, smooth);

    this.sprites = [];
    this.changed();
  }

  addSprite(x, y, size, type, color) {
    const sprite = new Sprite(x, y, size, type, color);

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
            .filter(sprite => sprite.enabled && !sprite.hidden)
            .map(sprite => sprite.attributes())
            .flat()
      ), true);

      this.#spritesChanged = false;
    }
  }

  draw() {
    this.#shader.imageSize = this.#imageSize;
    this.#game.renderer.draw(this.#shader, this.#vao, this.#texture, 6, this.sprites.length);
  }
}
