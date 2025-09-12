import Matrix3 from './Matrix3';

import Shader from './Shader';

export default class {
  #onresize;
  #gl;
  #shaders;
  #textures;
  #images;
  #currentShader;
  #currentVao;
  #currentTexture;

  constructor(onresize) {
    this.#onresize = onresize;

    document.body.style.margin = '0';
    document.body.style.padding = '0';

    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100dvw';
    this.canvas.style.height = '100dvh';
    this.canvas.style.cursor = 'none';
    this.canvas.style.touchAction = 'none';

    new ResizeObserver(() => {
      this.w = this.canvas.clientWidth;
      this.h = this.canvas.clientHeight;

      this.canvas.width = this.w;
      this.canvas.height = this.h;

      this.horizontal = this.w > this.h;

      this.#gl.viewport(0, 0, this.w, this.h);
      this.projection = Matrix3.ortho(0, this.w, this.h, 0);

      this.#onresize();
    }).observe(this.canvas, { box: 'content-box' });

    document.body.appendChild(this.canvas);

    this.#gl = this.canvas.getContext('webgl2');

    this.#gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.#gl.clearColor(0.68, 0.68, 0.94, 1.0);

    this.#gl.pixelStorei(this.#gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    this.#gl.enable(this.#gl.BLEND);
    this.#gl.blendFunc(this.#gl.ONE, this.#gl.ONE_MINUS_SRC_ALPHA);

    this.quadBuffer = this.#createQuadBuffer();

    this.#shaders = new Map();
    this.#textures = new Map();
    this.#images = [];

    this.view = Matrix3.identity();
    this.projection = Matrix3.ortho(0, 0, this.canvas.width, this.canvas.height);
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

  loadTexture(name, smooth) {
    const path = `textures/${name}.png`;
    const cachedTexture = this.#textures.get(`${path}_${smooth}`);

    if (cachedTexture) {
      return cachedTexture;
    }

    const texture = this.#gl.createTexture();
    this.#prepareTexture(texture, null, smooth);

    const imageIndex = this.#images.length;
    const image = new Image();

    image.src = path;
    image.onload = () => this.#prepareTexture(texture, imageIndex, smooth);

    this.#textures.set(`${path}_${smooth}`, texture);
    this.#images[imageIndex] = image;

    return texture;
  }

  clear() {
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
  }

  draw(shader, vao, texture, vertexCount, instanceCount) {
    if (shader !== this.#currentShader) {
      shader.use(this.#gl, this.view, this.projection);
      this.#currentShader = shader;
    } else {
      this.#currentShader.setup(this.#gl, this.view, this.projection);
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
    const gl = this.#gl;
    const texture0 = gl.TEXTURE0;
    const texture2d = gl.TEXTURE_2D;
    const texImage2D = gl.texImage2D.bind(gl);
    const texParameteri = gl.texParameteri.bind(gl);
    const rgba = gl.RGBA;
    const unsignedByte = gl.UNSIGNED_BYTE;
    const filter = smooth ? gl.LINEAR : gl.NEAREST;

    gl.activeTexture(texture0);
    gl.bindTexture(texture2d, texture);

    if (imageIndex != null) {
      texImage2D(texture2d, 0, rgba, rgba, unsignedByte, this.#images[imageIndex]);
    } else {
      texImage2D(texture2d, 0, rgba, 1, 1, 0, rgba, unsignedByte, new Uint8Array([255, 0, 255, 255,]));
    }

    texParameteri(texture2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    texParameteri(texture2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    texParameteri(texture2d, gl.TEXTURE_MIN_FILTER, filter);
    texParameteri(texture2d, gl.TEXTURE_MAG_FILTER, filter);
  }
}
