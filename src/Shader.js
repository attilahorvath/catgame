export default class {
  #program;
  #viewUniformLocation;
  #projectionUniformLocation;
  #texUniformLocation;
  #imageSizeUniformLocation;

  constructor(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = this.#compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = this.#compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    this.#program = gl.createProgram();

    const attachShader = gl.attachShader.bind(gl);
    const bindAttribLocation = gl.bindAttribLocation.bind(gl);
    const getUniformLocation = gl.getUniformLocation.bind(gl);

    attachShader(this.#program, vertexShader);
    attachShader(this.#program, fragmentShader);

    bindAttribLocation(this.#program, POSITION_ATTRIBUTE_LOCATION, 'vertexPosition');
    bindAttribLocation(this.#program, COLOR_ATTRIBUTE_LOCATION, 'vertexColor');
    bindAttribLocation(this.#program, TEX_COORD_ATTRIBUTE_LOCATION, 'vertexTexCoord');

    bindAttribLocation(this.#program, SPRITE_POSITION_ATTRIBUTE_LOCATION, 'spritePosition');
    bindAttribLocation(this.#program, SPRITE_SIZE_ATTRIBUTE_LOCATION, 'spriteSize');
    bindAttribLocation(this.#program, SPRITE_TYPE_ATTRIBUTE_LOCATION, 'spriteType');
    bindAttribLocation(this.#program, SPRITE_COLOR_ATTRIBUTE_LOCATION, 'spriteColor');
    bindAttribLocation(this.#program, SPRITE_ANGLE_ATTRIBUTE_LOCATION, 'spriteAngle');

    gl.linkProgram(this.#program);

    this.#viewUniformLocation = getUniformLocation(this.#program, 'view');
    this.#projectionUniformLocation = getUniformLocation(this.#program, 'projection');
    this.#texUniformLocation = getUniformLocation(this.#program, 'tex');
    this.#imageSizeUniformLocation = getUniformLocation(this.#program, 'imageSize');
  }

  use(gl, view, projection) {
    gl.useProgram(this.#program);

    this.setup(gl, view, projection);
  }

  setup(gl, view, projection) {
    if (this.#viewUniformLocation != null) {
      gl.uniformMatrix3fv(this.#viewUniformLocation, false, view);
    }

    if (this.#projectionUniformLocation != null) {
      gl.uniformMatrix3fv(this.#projectionUniformLocation, false, projection);
    }

    if (this.#texUniformLocation != null) {
      gl.uniform1i(this.#texUniformLocation, 0);
    }

    if (this.#imageSizeUniformLocation != null) {
      gl.uniform1f(this.#imageSizeUniformLocation, IMAGE_SIZE);
    }
  }

  #compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    return shader;
  }
}
