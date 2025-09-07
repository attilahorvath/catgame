(function () {
  'use strict';

  class Matrix3 extends Float32Array {
    static projection(width, height) {
      return new Matrix3([
        2.0 / width, 0.0, 0.0,
        0.0, -2 / height, 0.0,
        -1, 1.0, 1.0,
      ]);
    }
  }

  class Shader {
    #program;
    #projectionUniformLocation;
    #texUniformLocation;
    #imageSizeUniformLocation;

    constructor(gl, vertexShaderSource, fragmentShaderSource) {
      const vertexShader = this.#compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = this.#compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

      this.#program = gl.createProgram();

      gl.attachShader(this.#program, vertexShader);
      gl.attachShader(this.#program, fragmentShader);

      gl.bindAttribLocation(this.#program, 0, 'vertexPosition');
      gl.bindAttribLocation(this.#program, 1, 'vertexColor');
      gl.bindAttribLocation(this.#program, 2, 'vertexTexCoord');

      gl.bindAttribLocation(this.#program, 3, 'spritePosition');
      gl.bindAttribLocation(this.#program, 4, 'spriteSize');
      gl.bindAttribLocation(this.#program, 5, 'spriteType');
      gl.bindAttribLocation(this.#program, 6, 'spriteColor');
      gl.bindAttribLocation(this.#program, 7, 'spriteAngle');

      gl.linkProgram(this.#program);

      this.#projectionUniformLocation = gl.getUniformLocation(this.#program, 'projection');
      this.#texUniformLocation = gl.getUniformLocation(this.#program, 'tex');
      this.#imageSizeUniformLocation = gl.getUniformLocation(this.#program, 'imageSize');

      console.log(gl.getProgramInfoLog(this.#program));
    }

    use(gl, projection) {
      gl.useProgram(this.#program);

      this.setUniforms(gl, projection);
    }

    setUniforms(gl, projection) {
      if (this.#projectionUniformLocation != null) {
        gl.uniformMatrix3fv(this.#projectionUniformLocation, false, projection);
      }

      if (this.#texUniformLocation != null) {
        gl.uniform1i(this.#texUniformLocation, 0);
      }

      if (this.#imageSizeUniformLocation != null) {
        gl.uniform1f(this.#imageSizeUniformLocation, this.imageSize);
      }
    }

    #compileShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      console.log(gl.getShaderInfoLog(shader));

      return shader;
    }
  }

  class Renderer {
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
      this.canvas.width = 800;
      this.canvas.height = 600;
      this.canvas.style.cursor = 'none';
      this.canvas.style.touchAction = 'none';

      document.body.appendChild(this.canvas);

      this.#gl = this.canvas.getContext('webgl2');

      this.#gl.viewport(0, 0, 800, 600);
      this.#gl.clearColor(0.68, 0.68, 0.94, 1.0);

      this.#gl.enable(this.#gl.BLEND);
      this.#gl.blendFunc(this.#gl.SRC_ALPHA, this.#gl.ONE_MINUS_SRC_ALPHA);

      this.quadBuffer = this.#createQuadBuffer();

      this.#shaders = new Map();
      this.#textures = new Map();
      this.#images = [];

      this.#projection = Matrix3.projection(800, 600);
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

  class Input {
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
        this.x = event.offsetX;
        this.y = event.offsetY;
      });

      game.renderer.canvas.addEventListener('pointerdown', event => {
        this.x = event.offsetX;
        this.y = event.offsetY;

        this.#newPress = true;
      });

      game.renderer.canvas.addEventListener('pointerup', event => {
        this.x = event.offsetX;
        this.y = event.offsetY;

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
    }
  }

  var vertexShaderSource = "#version 300 es\nuniform mat3 projection;uniform float imageSize;uniform sampler2D tex;in vec2 vertexPosition;in vec2 vertexTexCoord;in vec2 spritePosition;in float spriteSize;in float spriteType;in vec4 spriteColor;in float spriteAngle;out vec2 texCoord;out vec4 tint;void main(){vec2 texOffset=vec2(imageSize/float(textureSize(tex,0)),imageSize/float(textureSize(tex,0).y));texCoord=vec2(texOffset.x,0.0)*spriteType+vertexTexCoord*texOffset;tint=spriteColor;gl_Position=vec4(projection*vec3(vertexPosition*spriteSize+spritePosition,1.0),1.0);}";

  var fragmentShaderSource = "#version 300 es\nprecision highp float;uniform sampler2D tex;in vec2 texCoord;in vec4 tint;out vec4 fragmentColor;void main(){fragmentColor=texture(tex,texCoord)*tint;}";

  class Sprite {
    constructor(x, y, size, type, color) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.type = type;
      this.angle = 0.0;
      this.enabled = true;
      this.hidden = false;
      this.a = 1.0;

      this.setColor(color);
    }

    attributes() {
      return [this.x, this.y, this.size, this.type, this.r, this.g, this.b, this.hidden ? 0 : this.a, this.angle];
    }

    setBaseColor(color) {
      this.baseColor = color;
      this.setColor(color);
    }

    setColor(color) {
      switch (color) {
      case 'primary':
        this.r = 0.85;
        this.g = 0.86;
        this.b = 1.0;
        break;
      case 'background':
        this.r = 0.68;
        this.g = 0.68;
        this.b = 0.94;
      case 'highlight':
        this.r = 0.76;
        this.g = 0.55;
        this.b = 0.58;
        break;
      case 'active':
        this.r = 0.65;
        this.g = 0.4;
        this.b = 0.44;
        break;
      case 'inactive':
        this.r = 0.34;
        this.g = 0.34;
        this.b = 0.46;
        break;

      case 'blackcat':
        this.r = 0.33;
        this.g = 0.33;
        this.b = 0.33;
        break;
      case 'orangecat':
        this.r = 0.7;
        this.g = 0.45;
        this.b = 0.08;
        break;

      // TODO: Choose darker primary colors that are easily readable on the primary background
      case 'primary1':
        this.#fromRGB(144, 168, 195);
        break;
      case 'primary2':
        this.#fromRGB(70, 157, 137);
        break;
      case 'primary3':
        this.#fromRGB(181, 201, 154);
        break;
      case 'primary4':
        this.#fromRGB(0, 166, 251);
        break;
      case 'primary5':
        this.#fromRGB(76, 201, 240);
        break;
      case 'primary6':
        this.#fromRGB(244, 202, 224);
        break;
      case 'primary7':
        this.#fromRGB(229, 0, 164);
        break;
      case 'primary8':
        this.#fromRGB(242, 0, 137);
        break;
      case 'primary9':
        this.#fromRGB(255, 255, 255);
        break;
      case 'primary10':
        this.r = 1.0;
        this.g = 0.8;
        this.b = 0.94;
        break;

      case 'inactive1':
        this.#fromRGB(144, 168, 195);
        break;
      case 'inactive2':
        this.#fromRGB(70, 157, 137);
        break;
      case 'inactive3':
        this.#fromRGB(181, 201, 154);
        break;
      case 'inactive4':
        this.#fromRGB(0, 166, 251);
        break;
      case 'inactive5':
        this.#fromRGB(76, 201, 240);
        break;
      case 'inactive6':
        this.#fromRGB(244, 202, 224);
        break;
      case 'inactive7':
        this.#fromRGB(229, 0, 164);
        break;
      case 'inactive8':
        this.#fromRGB(242, 0, 137);
        break;
      case 'inactive9':
        this.#fromRGB(255, 255, 255);
        break;
      case 'inactive10':
        this.r = 1.0;
        this.g = 0.8;
        this.b = 0.94;
        break;

      default:
        this.r = 1.0;
        this.g = 1.0;
        this.b = 1.0;
        break;
      }
    }

    activate(active) {
      this.inactive = !active;
      this.setColor(active ? (this.baseColor || 'primary') : 'inactive');
    }

    write(text, content, size, color = 'active') {
      (this.content || {}).enabled = false;
      this.content = text.write(content.toString(), this.x + (this.size - size) / 2, this.y + (this.size - size) / 2, size, color);
    }

    draw(spriteBatch, size, type, color) {
      (this.content || {}).enabled = false;
      this.content = spriteBatch.addSprite(this.x + (this.size - size) / 2, this.y + (this.size - size) / 2, size, type, color);
    }

    #fromRGB(r, g, b) {
      this.r = r / 255.0;
      this.g = g / 255.0;
      this.b = b / 255.0;
    }
  }

  class SpriteBatch {
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

      this.#game.renderer.setAttribute(0, 2, 16, 0);
      this.#game.renderer.setAttribute(2, 2, 16, 8);

      this.#instanceBuffer = this.#game.renderer.createBuffer(new Float32Array(), true);

      this.#game.renderer.setAttribute(3, 2, 36, 0, 1);
      this.#game.renderer.setAttribute(4, 1, 36, 8, 1);
      this.#game.renderer.setAttribute(5, 1, 36, 12, 1);
      this.#game.renderer.setAttribute(6, 4, 36, 16, 1);
      this.#game.renderer.setAttribute(7, 1, 36, 32, 1);

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

  class TextSegment {
    constructor(text, x, y, size, color, animations, delay) {
      this.text = text;
      this.x = x;
      this.y = y;
      this.size = size;
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

  class Text extends SpriteBatch {
    #segments;

    constructor(game) {
      super(game, 'textures/font.png', 16.0);

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

  class Grid extends SpriteBatch {
    #game;
    #cellSize;
    #spacingX;
    #spacingY;
    #onrelease;
    #color;
    #active;
    #pressed;

    constructor(game, x, y, width, height, cellSize, spacingX, spacingY, onrelease, color = 'primary', type = 0) {
      super(game, 'textures/cells.png', 16.0, false);

      this.#game = game;

      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.#cellSize = cellSize;
      this.#spacingX = spacingX ?? 0;
      this.#spacingY = spacingY ?? 0;
      this.#onrelease = onrelease;
      this.#color = color;

      for (let gridY = 0; gridY < height; gridY++) {
        for (let gridX = 0; gridX < width; gridX++) {
          const cell = this.addSprite(this.x + gridX * this.#fullW, this.y + gridY * this.#fullH, this.#cellSize, type, color);
          cell.setColor(color);
          cell.gridX = gridX;
          cell.gridY = gridY;
        }
      }
    }

    update() {
      if (!this.disabled) {
        if (this.#game.input.moved) {
          let newActive = this.#cellAtPosition(this.#game.input.x, this.#game.input.y);
          if (newActive?.inactive) {
            newActive = null;
          }

          if (newActive !== this.#active && !this.#pressed) {
            if (this.onactivate || this.#onrelease) {
              if (!this.#active?.inactive) {
                this.#active?.setColor(this.#active?.baseColor || this.#color);
              }
              newActive?.setColor('highlight');
              this.changed();
            }

            // if (this.onactivate) {
            //   this.onactivate(newActive, this.#active);
            //   this.changed();
            // }
          }

          this.#active = newActive;
        }

        if (this.#game.input.press) {
          this.#pressed = this.#active;

          if (this.onpress || this.#onrelease) {
            this.#pressed?.setColor('active');
            this.changed();
          }

          // if (this.onpress) {
          //   this.onpress(this.#pressed);
          //   this.changed();
          // }
        }

        if (this.#game.input.release) {
          if (this.#onrelease) {
            this.#pressed?.setColor(this.#pressed?.baseColor || this.#color);
            this.#onrelease(this.#active === this.#pressed ? this.#pressed : null, this.#pressed);
            this.changed();
          }

          this.#pressed = null;
        }
      }

      super.update();
    }

    cellAt(x, y) {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        return this.sprites[this.width * y + x];
      }
    }

    #cellAtPosition(x, y) {
      const index = this.#indexAtPosition(x, y);

      if (index) {
        return this.cellAt(index[0], index[1]);
      }
    }

    #indexAtPosition(x, y) {
      const relX = x - this.x;
      const relY = y - this.y;
      const indexX = Math.trunc(relX / this.#fullW);
      const indexY = Math.trunc(relY / this.#fullH);

      if (relX >= 0 && relY >= 0 &&
          relX - indexX * this.#fullW < this.#cellSize &&
          relY - indexY * this.#fullH < this.#cellSize &&
          indexX >= 0 && indexX < this.width && indexY >= 0 && indexY < this.height) {
        return [indexX, indexY];
      }
    }

    get #fullW() {
      return this.#cellSize + this.#spacingX;
    }

    get #fullH() {
      return this.#cellSize + this.#spacingY;
    }
  }

  class Minigame {
    #game;
    #minigameClass;
    #minigame;
    #buttons;
    #exitButton;
    #exit;

    constructor(game, minigameClass) {
      this.#game = game;
      this.#minigameClass = minigameClass;

      this.#buttons = new Grid(this.#game, 750, 10, 1, 1, 32, 0, 0, (button) => this.#buttonRelease(button));

      this.#exitButton = this.#buttons.sprites[0];

      this.#setup();
    }

    update() {
      if (this.#exit) {
        this.#game.text.clear();
        this.#exitButton.content.enabled = false;

        return new Select(this.#game);
      } else {
        this.#minigame.update();
        this.#buttons.update();

        return this;
      }
    }

    draw() {
      this.#minigame.draw();
      this.#buttons.draw();
    }

    #setup() {
      this.#game.text.clear();
      this.#minigame = new this.#minigameClass(this.#game, () => this.#win(), () => this.#lose());

      this.#exitButton = this.#buttons.sprites[0];
      this.#exitButton.write(this.#game.text, 'X', 24, 'active');
    }

    #win() {
      this.#game.scheduleTimer(500, () => {
        this.#game.minigamesWon.add(this.#minigameClass);
        this.#exit = true;
      });
    }

    #lose() {
      this.#game.scheduleTimer(500, () => { this.#setup(); });
    }

    #buttonRelease(button) {
      if (button === this.#exitButton) {
        this.#exit = true;
      }
    }
  }

  class Meowsweeper {
    #game;
    #onwin;
    #onlose;
    #grid;
    #buttons;
    #digButton;
    #flagButton;
    #mode;
    #started;

    constructor(game, onwin, onlose) {
      this.#game = game;
      this.#onwin = onwin;
      this.#onlose = onlose;

      this.#grid = new Grid(this.#game, 100, 150, 10, 10, 32, 4, 4, (cell) => this.#release(cell));

      this.#buttons = new Grid(this.#game, 10, 10, 2, 1, 32, 10, 0, (button) => this.#buttonRelease(button));

      this.#digButton = this.#buttons.cellAt(0, 0);
      this.#digButton.write(this.#game.text, 'O', 30, 'active');

      this.#flagButton = this.#buttons.cellAt(1, 0);
      this.#flagButton.write(this.#game.text, 'X', 30, 'active');

      this.#setMode('dig');

      this.#game.text.write('MEOWSWEEPER', 50, 50, 32, 'inactive', ['sine']);
      this.#game.text.write('SCRATCH MY BACK BUT\nONLY WHERE I LIKE IT', 50, 525, 32, 'active', ['typing']);
    }

    update() {
      if (this.#game.input.keyPresses['KeyA'] || this.#game.input.keyPresses['ArrowLeft']) {
        this.#setMode('dig');
      }

      if (this.#game.input.keyPresses['KeyD'] || this.#game.input.keyPresses['ArrowRight']) {
        this.#setMode('flag');
      }

      this.#grid.update();
      this.#buttons.update();
    }

    draw() {
      this.#grid.draw();
      this.#buttons.draw();
    }

    #release(cell) {
      if (cell) {
        switch (this.#mode) {
        case 'dig':
          if (!this.#started) {
            this.#start(cell);
          }

          this.#open(cell.gridX, cell.gridY);

          if (cell.mine) {
            this.#grid.disabled = true;

            this.#game.scheduleTimer(2000, () => {
              for (const cell of this.#grid.sprites) {
                (cell.content || {}).enabled = false;
              }

              this.#game.text.changed();

              if (this.#onlose) {
                this.#onlose();
              }
            });
          }

          break;
        case 'flag':
          if (cell.flagged) {
            cell.flagged = false;
            cell.content.enabled = false;
            this.#game.text.changed();
          } else {
            cell.flagged = true;
            cell.write(this.#game.text, 'X', 26, 'highlight');
          }
          break;
        }
      }
    }

    #start(cell) {
      const available = this.#grid.sprites.filter(availableCell => availableCell !== cell && (Math.abs(availableCell.gridX - cell.gridX) > 1 || Math.abs(availableCell.gridY - cell.gridY) > 1));

      for (let i = 0; i < 10; i++) {
        const index = Math.floor(Math.random() * available.length);
        const mineCell = available[index];
        available.splice(index, 1);

        mineCell.mine = true;
      }

      for (let y = 0; y < this.#grid.height; y++) {
        for (let x = 0; x < this.#grid.width; x++) {
          let cell = this.#grid.cellAt(x, y);
          if (!cell.mine) {
            cell.mines = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (this.#grid.cellAt(x + dx, y + dy)?.mine) {
                  cell.mines += 1;
                }
              }
            }
          }
        }
      }

      this.#started = true;
    }

    #open(x, y) {
      navigator.vibrate(200);
      const cell = this.#grid.cellAt(x, y);

      if (cell?.flagged) {
        cell.flagged = false;
        cell.content.enabled = false;
      }

      if (cell?.enabled && !cell?.opened) {
        cell.opened = true;

        cell.activate(false);

        if (cell.mines === 0) {
          cell.hidden = true;

          this.#open(x, y - 1);
          this.#open(x, y + 1);
          this.#open(x - 1, y);
          this.#open(x + 1, y);
        } else {
          if (cell.mine) {
            for (const mineCell of this.#grid.sprites.filter(cell => cell.mine)) {
              mineCell.activate(false);
              mineCell.write(this.#game.text, 'X', 26, 'inactive10');
            }
          } else {
            cell.write(this.#game.text, cell.mines, 26, `inactive${cell.mines}`);
          }
        }
      }

      if (this.#grid.sprites.filter(cell => !cell.opened).every(cell => cell.mine)) {
        if (this.#onwin) {
          this.#onwin();
        }
      }
    }

    #buttonRelease(button) {
      if (button === this.#flagButton) {
        this.#setMode('flag');
      } else if (button === this.#digButton) {
        this.#setMode('dig');
      }
    }

    #setMode(mode) {
      this.#mode = mode;

      this.#digButton.activate(this.#mode !== 'dig');
      this.#flagButton.activate(this.#mode !== 'flag');

      this.#buttons.changed();
    }
  }

  class PawPawToe {
    #game;
    #onwin;
    #onlose;
    #grid;
    #spriteBatch;
    #timer;
    #over;

    constructor(game, onwin, onlose) {
      this.#game = game;
      this.#onwin = onwin;
      this.#onlose = onlose;

      this.#grid = new Grid(this.#game, 100, 150, 3, 3, 64, 20, 20, (cell) => this.#release(cell));
      this.#spriteBatch = new SpriteBatch(this.#game, 'textures/sprites.png', 16, false);

      this.#game.text.write('PAW PAW TOE', 50, 50, 32, 'inactive', ['sine']);
      this.#game.text.write('BET YOU CANT BEAT ME', 50, 400, 32, 'active', ['typing']);
    }

    update() {
      this.#grid.update();
      this.#spriteBatch.update();
    }

    draw() {
      this.#grid.draw();
      this.#spriteBatch.draw();
    }

    #release(cell) {
      if (cell && !cell.symbol) {
        this.#mark(cell, 'X');

        this.#grid.disabled = true;

        this.#timer = this.#game.scheduleTimer(1000, () => {
          if (!this.#over) {
            const available = this.#grid.sprites.filter(sprite => !sprite.symbol);

            if (available.length > 0) {
              this.#mark(available[Math.floor(Math.random() * available.length)], 'O');

              this.#grid.disabled = false;
              this.#grid.changed();
            }
          }
        });
      }
    }

    #mark(cell, symbol) {
      if (!this.#over) {
        cell.symbol = symbol;

        cell.activate(false);

        cell.draw(this.#spriteBatch, 32, 0, symbol === 'X' ? 'blackcat' : 'orangecat');

        this.#checkGrid();
      }
    }

    #checkGrid() {
      for (let y = 0; y < 3; y++) {
        const symbolCounts = new Map();

        for (let x = 0; x < 3; x++) {
          const cell = this.#grid.cellAt(x, y);

          symbolCounts.set(cell.symbol, (symbolCounts.get(cell.symbol) || 0) + 1);
        }

        if (symbolCounts.get('X') === 3) {
          return this.#win('X');
        }

        if (symbolCounts.get('O') === 3) {
          return this.#win('O');
        }
      }

      for (let x = 0; x < 3; x++) {
        const symbolCounts = new Map();

        for (let y = 0; y < 3; y++) {
          const cell = this.#grid.cellAt(x, y);

          symbolCounts.set(cell.symbol, (symbolCounts.get(cell.symbol) || 0) + 1);
        }

        if (symbolCounts.get('X') === 3) {
          return this.#win('X');
        }

        if (symbolCounts.get('O') === 3) {
          return this.#win('O');
        }
      }

      if (this.#grid.cellAt(0, 0).symbol === 'X' && this.#grid.cellAt(1, 1).symbol === 'X' && this.#grid.cellAt(2, 2).symbol === 'X') {
        return this.#win('X');
      }

      if (this.#grid.cellAt(0, 0).symbol === 'O' && this.#grid.cellAt(1, 1).symbol === 'O' && this.#grid.cellAt(2, 2).symbol === 'O') {
        return this.#win('O');
      }

      if (this.#grid.cellAt(2, 0).symbol === 'X' && this.#grid.cellAt(1, 1).symbol === 'X' && this.#grid.cellAt(0, 2).symbol === 'X') {
        return this.#win('X');
      }

      if (this.#grid.cellAt(2, 0).symbol === 'O' && this.#grid.cellAt(1, 1).symbol === 'O' && this.#grid.cellAt(0, 2).symbol === 'O') {
        return this.#win('O');
      }
    }

    #win(symbol) {
      this.#over = true;
      this.#grid.disabled = true;
      (this.#timer || {}).disabled = true;

      if (symbol === 'X') {
        if (this.#onwin) {
          this.#onwin();
        }
      } else if (symbol === 'O') {
        if (this.#onlose) {
          this.#onlose();
        }
      }
    }
  }

  class Sudocat {
    #game;
    #onwin;
    #grids;
    #buttons;
    #digit;

    constructor(game, onwin) {
      this.#game = game;
      this.#onwin = onwin;

      this.#grids = [];

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const grid = new Grid(this.#game, 100 + x * 100, 100 + y * 100, 3, 3, 24, 5, 5, (cell) => this.#release(cell));
          this.#grids.push(grid);
        }
      }

      this.#buttons = new Grid(this.#game, 10, 10, 10, 1, 32, 10, 0, (button) => this.#buttonRelease(button));

      for (let digit = 1; digit <= 10; digit++) {
        const button = this.#buttons.sprites[digit - 1];
        button.write(this.#game.text, digit <= 9 ? digit : 'X', 30, digit <= 9 ? `inactive${digit}` : 'active');
        button.digit = digit <= 9 ? digit : null;
      }

      this.#setGrid();
      this.#selectDigit(1);
    }

    update() {
      for (let digit = 1; digit <= 9; digit++) {
        if (this.#game.input.keyPresses[`Digit${digit}`]) {
          this.#selectDigit(digit);
        }
      }

      if (this.#game.input.keyPresses['KeyA'] || this.#game.input.keyPresses['ArrowLeft']) {
        if (this.#digit > 1) {
          this.#selectDigit(this.#digit - 1);
        }
      }

      if (this.#game.input.keyPresses['KeyD'] || this.#game.input.keyPresses['ArrowRight']) {
        if (this.#digit < 9) {
          this.#selectDigit(this.#digit + 1);
        }
      }

      if (this.#game.input.keyPresses['KeyX'] || this.#game.input.keyPresses['Digit0']) {
        this.#selectDigit(null);
      }

      for (const grid of this.#grids) {
        grid.update();
      }

      this.#buttons.update();
    }

    draw() {
      for (const grid of this.#grids) {
        grid.draw();
      }

      this.#buttons.draw();
    }

    #gridAt(x, y) {
      return this.#grids[Math.floor(y / 3) * 3 + Math.floor(x / 3)];
    }

    #cellAt(x, y) {
      return this.#gridAt(x, y).cellAt(x % 3, y % 3);
    }

    #setGrid() {
      const starts = [
        [
          6, 8, 0, 1, 0, 0, 0, 9, 0,
          0, 3, 4, 5, 0, 8, 0, 2, 0,
          2, 1, 0, 0, 6, 0, 3, 0, 0,
          5, 0, 0, 4, 0, 7, 0, 0, 9,
          3, 4, 2, 9, 0, 0, 0, 0, 6,
          0, 0, 7, 0, 8, 0, 5, 0, 0,
          9, 2, 0, 8, 0, 0, 0, 5, 3,
          0, 0, 3, 2, 0, 0, 9, 1, 8,
          0, 0, 0, 3, 0, 0, 0, 6, 7,
        ]
      ];

      const start = starts[Math.floor(Math.random() * starts.length)];

      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          const digit = start[y * 9 + x];
          if (digit !== 0) {
            const cell = this.#cellAt(x, y);
            cell.activate(false);
            cell.digit = digit;
            cell.write(this.#game.text, digit, 20, `inactive${digit}`);
          }
        }
      }
    }

    #release(cell) {
      if (cell) {
        cell.digit = this.#digit;
        (cell.content || {}).enabled = false;

        if (this.#digit) {
          cell.write(this.#game.text, this.#digit, 20, `inactive${this.#digit}`);
        }

        if (this.#checkCells()) {
          if (this.#onwin) {
            this.#onwin();
          }
        }

        this.#game.text.changed();
      }
    }

    #checkCells() {
      let valid = true;

      this.#resetCells();

      for (let i = 0; i < 9; i++) {
        valid &= this.#checkRow(i);
        valid &= this.#checkColumn(i);
        valid &= this.#checkGrid(i);
      }

      return valid;
    }

    #resetCells() {
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          const cell = this.#cellAt(x, y);
          if (!cell.inactive) {
            cell.setBaseColor('primary');
          }
        }
      }

      for (let i = 0; i < 9; i++) {
        this.#grids[i].changed();
      }
    }

    #checkRow(x) {
      let valid = true;
      const digitCounts = new Map();

      for (let y = 0; y < 9; y++) {
        const cell = this.#cellAt(x, y);
        digitCounts.set(cell.digit, (digitCounts.get(cell.digit) || 0) + 1);
      }

      for (const [digit, digitCount] of digitCounts.entries()) {
        if (digit == null) {
          valid = false;
        } else if (digitCount > 1) {
          valid = false;

          for (let y = 0; y < 9; y++) {
            const cell = this.#cellAt(x, y);
            if (!cell.inactive && cell.digit == digit) {
              cell.setBaseColor('active');
              this.#gridAt(x, y).changed();
            }
          }
        }
      }

      return valid;
    }

    #checkColumn(y) {
      let valid = true;
      const digitCounts = new Map();

      for (let x = 0; x < 9; x++) {
        const cell = this.#cellAt(x, y);
        digitCounts.set(cell.digit, (digitCounts.get(cell.digit) || 0) + 1);
      }

      for (const [digit, digitCount] of digitCounts.entries()) {
        if (digit == null) {
          valid = false;
        } else if (digitCount > 1) {
          valid = false;

          for (let x = 0; x < 9; x++) {
            const cell = this.#cellAt(x, y);
            if (!cell.inactive && cell.digit == digit) {
              cell.setBaseColor('active');
              this.#gridAt(x, y).changed();
            }
          }
        }
      }

      return valid;
    }

    #checkGrid(index) {
      let valid = true;
      const digitCounts = new Map();

      const grid = this.#grids[index];

      for (let i = 0; i < 9; i++) {
        const cell = grid.sprites[i];
        digitCounts.set(cell.digit, (digitCounts.get(cell.digit) || 0) + 1);
      }

      for (const [digit, digitCount] of digitCounts.entries()) {
        if (digit == null) {
          valid = false;
        } else if (digitCount > 1) {
          valid = false;

          for (let i = 0; i < 9; i++) {
            const cell = grid.sprites[i];
            if (!cell.inactive && cell.digit == digit) {
              cell.setBaseColor('active');
              grid.changed();
            }
          }
        }
      }

      return valid;
    }

    #buttonRelease(button) {
      if (button) {
        this.#selectDigit(button.digit);
      }
    }

    #selectDigit(digit) {
      this.#digit = digit;

      for (const button of this.#buttons.sprites) {
        button.activate(true);
      }

      this.#buttons.sprites[digit != null ? digit - 1 : 9].activate(false);

      this.#buttons.changed();
    }
  }

  class Meowmory {
    #game;
    #onwin;
    #width;
    #height;
    #grid;
    #opened;
    #showingA;
    #showingB;
    #timer;

    constructor(game, onwin) {
      this.#game = game;
      this.#onwin = onwin;

      this.#width = 6;
      this.#height = 5;

      this.#grid = new Grid(this.#game, 100, 100, this.#width, this.#height, 64, 16, 16, (cell) => this.#release(cell));

      const available = this.#grid.sprites.slice();

      for (let i = 1; i <= (this.#width * this.#height) / 2; i++) {
        const indexA = Math.floor(Math.random() * available.length);
        const cellA = available[indexA];
        available.splice(indexA, 1);

        const indexB = Math.floor(Math.random() * available.length);
        const cellB = available[indexB];
        available.splice(indexB, 1);

        cellA.secret = i;
        cellB.secret = i;
      }

      this.#game.text.write('MEOWMORY', 50, 50, 32, 'inactive', ['sine']);
    }

    update() {
      this.#grid.update();
    }

    draw() {
      this.#grid.draw();
    }

    #release(cell) {
      if (cell && !cell.open) {
        if (this.#showingA && this.#showingB) {
          this.#cancelShowing();
        }

        cell.open = true;
        cell.write(this.#game.text, cell.secret, 16, 'highlight');
        cell.setBaseColor('active');

        if (this.#opened) {
          if (cell.secret === this.#opened.secret) {
            cell.found = true;
            cell.activate(false);

            this.#opened.found = true;
            this.#opened.activate(false);

            if (this.#grid.sprites.every(cell => cell.found)) {
              if (this.#onwin) {
                this.#onwin();
              }
            }
          } else {
            this.#showingA = this.#opened;
            this.#showingB = cell;

            this.#timer = this.#game.scheduleTimer(1000, () => this.#cancelShowing());
          }

          this.#opened = false;
        } else {
          this.#opened = cell;
        }
      }
    }

    #cancelShowing() {
      (this.#timer || {}).disabled = true;

      this.#showingA.open = false;
      this.#showingA.content.enabled = false;
      this.#showingA.setBaseColor('primary');

      this.#showingB.open = false;
      this.#showingB.content.enabled = false;
      this.#showingB.setBaseColor('primary');

      this.#grid.changed();
      this.#game.text.changed();

      this.#showingA = null;
      this.#showingB = null;
    }
  }

  class Jigspaw {
    #game;
    #onwin;
    #width;
    #height;
    #grid;
    #selected;

    constructor(game, onwin) {
      this.#game = game;
      this.#onwin = onwin;

      this.#width = 10;
      this.#height = 10;

      this.#grid = new Grid(this.#game, 100, 100, this.#width, this.#height, 32, 0, 0, (cell) => this.#release(cell));

      for (let i = 0; i < this.#width * this.#height; i++) {
        const cell = this.#grid.sprites[i];
        cell.index = i;
        cell.write(this.#game.text, i, 12, 'highlight');
      }

      for (let i = 0; i < (this.#width * this.#height) / 2; i++) {
        const cellA = this.#grid.sprites[Math.floor(Math.random() * this.#grid.sprites.length)];
        const cellB = this.#grid.sprites[Math.floor(Math.random() * this.#grid.sprites.length)];

        this.#swap(cellA, cellB);
      }

      this.#game.text.write('JIGSPAW', 50, 50, 32, 'inactive', ['sine']);
    }

    update() {
      this.#grid.update();
    }

    draw() {
      this.#grid.draw();
    }

    #release(cell) {
      if (cell) {
        if (this.#selected) {
          this.#selected.activate(true);
          this.#swap(this.#selected, cell);
          this.#selected = null;
          this.#checkGrid();
        } else {
          cell.activate(false);
          this.#selected = cell;
        }
      }
    }

    #swap(cellA, cellB) {
      const index = cellA.index;
      cellA.index = cellB.index;
      cellB.index = index;

      cellA.write(this.#game.text, cellA.index, 12, 'highlight');
      cellB.write(this.#game.text, cellB.index, 12, 'highlight');
    }

    #checkGrid() {
      for (let i = 0; i < this.#width * this.#height; i++) {
        if (this.#grid.sprites[i].index !== i) {
          return;
        }
      }

      this.#grid.disabled = true;

      if (this.#onwin) {
        this.#onwin();
      }
    }
  }

  class Select {
    #game;
    #grid;
    #buttons;
    #minigameState;

    constructor(game) {
      this.#game = game;

      this.#grid = new Grid(this.#game, 50, 100, 6, 12, 64, 0, 0, null, '', 2);

      this.#buttons = new Grid(this.#game, 100, 150, 3, 4, 64, 32, 32, (button) => this.#buttonRelease(button), '', 1);

      this.#buttons.sprites[0].minigame = PawPawToe;
      this.#buttons.sprites[1].minigame = Meowsweeper;
      this.#buttons.sprites[2].minigame = Meowmory;
      this.#buttons.sprites[3].minigame = Sudocat;
      this.#buttons.sprites[4].minigame = Jigspaw;

      this.#buttons.sprites[5].activate(false);
      this.#buttons.sprites[6].activate(false);
      this.#buttons.sprites[7].activate(false);
      this.#buttons.sprites[8].activate(false);
      this.#buttons.sprites[9].activate(false);
      this.#buttons.sprites[10].activate(false);
      this.#buttons.sprites[11].activate(false);

      this.#game.text.write('HELP THE OTHER CATS\nIN THE BUILDING', 10, 10, 32, 'active', ['typing', 'shake']);

      for (let i = 0; i < this.#buttons.sprites.length; i++) {
        const button = this.#buttons.sprites[i];
        if (this.#game.minigamesWon.has(button.minigame)) {
          button.activate(false);
        }
      }
    }

    update() {
      this.#grid.update();
      if (this.#minigameState) {
        return this.#minigameState;
      } else {
        this.#buttons.update();

        return this;
      }
    }

    draw() {
      this.#grid.draw();
      this.#buttons.draw();
    }

    #buttonRelease(button) {
      if (button) {
        this.#minigameState = new Minigame(this.#game, button.minigame);
      }
    }
  }

  class Title {
    #game;

    constructor(game) {
      this.#game = game;

      this.#game.text.write('CAT GAME', 10, 10, 52, 'blackcat', ['sine']);
      // const story = this.#game.text.write('STORY MODE', 10, 100, 32, 'active', 'typing');
      // this.#game.text.write('FREE PLAY', 10, 150, 32, 'active', 'typing');
      // this.#game.text.write('CREDITS', 10, 200, 32, 'active', 'shake');
      this.#game.text.write('CLICK TO BEGIN', 10, 150, 32, 'highlight', ['typing', 'shake']);
      this.#game.text.write('A GAME BY ATTILA HORVATH', 10, 300, 32, 'active', ['typing', 'sine']);

      this.#game.text.write('THIS IS THE DOMAIN OF', 10, 400, 32, 'active', ['typing']);
      this.#game.text.write('QUEEN KARA', 10, 500, 32, 'active', ['typing', 'sine'], 4000);

      // story.setColor('highlight');
      // this.#game.text.changed();
    }

    update() {
      if (this.#game.input.keyPresses['Space'] || this.#game.input.keyPresses['Enter'] || this.#game.input.release) {
        this.#game.text.clear();
        return new Select(this.#game);
      }

      return this;
    }

    draw() {}
  }

  class Game {
    #timers;
    #spriteBatch;
    #cursor;
    #state;

    constructor() {
      this.renderer = new Renderer();
      this.input = new Input(this);
      this.#timers = [];

      this.text = new Text(this);
      this.#spriteBatch = new SpriteBatch(this, 'textures/sprites.png', 16);
      this.#cursor = this.#spriteBatch.addSprite(0, 0, 26, 0, 'blackcat');

      // this.#state = new Select(this);
      this.#state = new Title(this);
      // this.#state = new Minigame(this, Meowsweeper);
      // this.#cursor.a = 0.5;

      // this.scheduleTimer(500, () => { console.log('hi'); }, true);
      this.minigamesWon = new Set();
    }

    step(timestamp) {
      this.timestamp = timestamp;
      this.#update(timestamp);
      this.#draw();
    }

    scheduleTimer(delay, onexpire, repeat) {
      const timer = { start: this.timestamp ?? 0, delay: delay, onexpire: onexpire, repeat: repeat };
      this.#timers.push(timer);
      return timer;
    }

    #update(timestamp) {
      this.input.update();

      if (this.input.moved) {
        this.#cursor.x = this.input.x - 6;
        this.#cursor.y = this.input.y - 6;

        this.#spriteBatch.changed();
      }

      this.#updateTimers(timestamp);
      this.#state = this.#state.update();
      this.text.update(timestamp);
      this.#spriteBatch.update();
    }

    #updateTimers(timestamp) {
      for (const timer of this.#timers) {
        if (timestamp >= timer.start + timer.delay && !timer.disabled) {
          if (timer.repeat) {
            timer.start = timestamp;
          } else {
            timer.expired = true;
          }

          if (timer.onexpire) {
            timer.onexpire();
          }
        }
      }

      if (this.#timers.some(timer => timer.expired || timer.disabled)) {
        this.#timers = this.#timers.filter(timer => !timer.expired && !timer.disabled);
      }
    }

    #draw() {
      this.renderer.clear();

      this.#state.draw();

      this.text.draw();

      this.#spriteBatch.draw();
    }
  }

  const game = new Game();

  function step(timestamp) {
    requestAnimationFrame(step);
    game.step(timestamp);
  }

  requestAnimationFrame(step);

})();
//# sourceMappingURL=bundle.js.map
