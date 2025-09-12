export default class {
  #program;
  #viewUniformLocation;
  #projectionUniformLocation;
  #texUniformLocation;
  #imageSizeUniformLocation;

  constructor(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = this.#compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = this.#compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();

    const attachShader = gl.attachShader.bind(gl);
    const bindAttribLocation = gl.bindAttribLocation.bind(gl);
    const getUniformLocation = gl.getUniformLocation.bind(gl);

    attachShader(program, vertexShader);
    attachShader(program, fragmentShader);

    bindAttribLocation(program, POSITION_ATTRIBUTE_LOCATION, 'vertexPosition');
    bindAttribLocation(program, COLOR_ATTRIBUTE_LOCATION, 'vertexColor');
    bindAttribLocation(program, TEX_COORD_ATTRIBUTE_LOCATION, 'vertexTexCoord');

    bindAttribLocation(program, SPRITE_POSITION_ATTRIBUTE_LOCATION, 'spritePosition');
    bindAttribLocation(program, SPRITE_SIZE_ATTRIBUTE_LOCATION, 'spriteSize');
    bindAttribLocation(program, SPRITE_TYPE_ATTRIBUTE_LOCATION, 'spriteType');
    bindAttribLocation(program, SPRITE_COLOR_ATTRIBUTE_LOCATION, 'spriteColor');

    gl.linkProgram(program);

    this.#viewUniformLocation = getUniformLocation(program, 'view');
    this.#projectionUniformLocation = getUniformLocation(program, 'projection');
    this.#texUniformLocation = getUniformLocation(program, 'tex');
    this.#imageSizeUniformLocation = getUniformLocation(program, 'imageSize');

    this.#program = program;
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
