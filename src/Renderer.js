import Matrix3 from './Matrix3';

import Shader from './Shader';

export default class {
  #gl;
  #shaders;
  #textures;
  #images;
  #projection;
  #currentShader;
  #currentVao;
  #currentTexture;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.canvas.style.cursor = 'none';
    this.canvas.style.touchAction = 'none';

    document.body.appendChild(this.canvas);

    this.#gl = this.canvas.getContext('webgl2');

    this.#gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.#gl.clearColor(0.68, 0.68, 0.94, 1.0);

    this.#gl.enable(this.#gl.BLEND);
    this.#gl.blendFunc(this.#gl.SRC_ALPHA, this.#gl.ONE_MINUS_SRC_ALPHA);

    this.quadBuffer = this.#createQuadBuffer();

    this.#shaders = new Map();
    this.#textures = new Map();
    this.#images = [];

    this.#projection = Matrix3.projection(CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  createShader(name, vertexShaderSource, fragmentShaderSource) {
    const cachedShader = this.#shaders.get(name);

    if (cachedShader) {
      return cachedShader;
    }

    const shader = new Shader(this.#gl, vertexShaderSource, fragmentShaderSource);
    this.#shaders.set(name, shader);

    return shader;
  }

  createVao() {
    const vao = this.#gl.createVertexArray();

    this.#gl.bindVertexArray(vao);

    return vao;
  }

  createBuffer(data, dynamic) {
    const buffer = this.#gl.createBuffer();

    this.updateBuffer(buffer, data, dynamic);

    return buffer;
  }

  updateBuffer(buffer, data, dynamic) {
    this.useBuffer(buffer);

    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, data, dynamic ? this.#gl.DYNAMIC_DRAW : this.#gl.STATIC_DRAW);
  }

  useBuffer(buffer) {
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer);
  }

  setAttribute(location, size, stride, offset, divisor) {
    this.#gl.vertexAttribPointer(location, size, this.#gl.FLOAT, false, stride, offset);
    this.#gl.enableVertexAttribArray(location);

    if (divisor != null) {
      this.#gl.vertexAttribDivisor(location, divisor);
    }
  }

  loadTexture(path, smooth) {
    const cachedTexture = this.#textures.get(path);

    if (cachedTexture) {
      return cachedTexture;
    }

    const texture = this.#gl.createTexture();
    this.#prepareTexture(texture, null, smooth);

    const imageIndex = this.#images.length;
    const image = new Image();

    image.src = path;
    image.onload = () => this.#prepareTexture(texture, imageIndex, smooth);

    this.#textures.set(path, texture);
    this.#images[imageIndex] = image;

    return texture;
  }

  clear() {
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
  }

  draw(shader, vao, texture, vertexCount, instanceCount) {
    if (shader !== this.#currentShader) {
      shader.use(this.#gl, this.#projection);
      this.#currentShader = shader;
    } else {
      this.#currentShader.setUniforms(this.#gl, this.#projection);
    }

    if (vao !== this.#currentVao) {
      this.#gl.bindVertexArray(vao);
      this.#currentVao = vao;
    }

    if (texture !== this.#currentTexture) {
      this.#gl.activeTexture(this.#gl.TEXTURE0);
      this.#gl.bindTexture(this.#gl.TEXTURE_2D, texture);
      this.#currentTexture = texture;
    }

    if (instanceCount != null) {
      this.#gl.drawArraysInstanced(this.#gl.TRIANGLES, 0, vertexCount, instanceCount);
    } else {
      this.#gl.drawArrays(this.#gl.TRIANGLES, 0, vertexCount);
    }
  }

  #createQuadBuffer() {
    return this.createBuffer(new Float32Array([
      0.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 1.0,
      1.0, 0.0, 1.0, 0.0,

      1.0, 0.0, 1.0, 0.0,
      0.0, 1.0, 0.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
    ]), false);
  }

  #prepareTexture(texture, imageIndex, smooth) {
    this.#gl.activeTexture(this.#gl.TEXTURE0);
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, texture);

    this.#gl.pixelStorei(this.#gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    if (imageIndex != null) {
      this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE, this.#images[imageIndex]);
    } else {
      this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, 1, 1, 0, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255,]));
    }

    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MIN_FILTER, smooth ? this.#gl.LINEAR : this.#gl.NEAREST);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, smooth ? this.#gl.LINEAR : this.#gl.NEAREST);
  }
}
