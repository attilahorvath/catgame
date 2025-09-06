export default class {
  #program;
  #projectionUniformLocation;
  #texUniformLocation;
  #imageSizeUniformLocation;

  constructor(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = this.#compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = this.#compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    this.#program = gl.createProgram();

    gl.attachShader(this.#program, vertexShader);
    gl.attachShader(this.#program, fragmentShader);

    gl.bindAttribLocation(this.#program, POSITION_ATTRIBUTE_LOCATION, 'vertexPosition');
    gl.bindAttribLocation(this.#program, COLOR_ATTRIBUTE_LOCATION, 'vertexColor');
    gl.bindAttribLocation(this.#program, TEX_COORD_ATTRIBUTE_LOCATION, 'vertexTexCoord');

    gl.bindAttribLocation(this.#program, SPRITE_POSITION_ATTRIBUTE_LOCATION, 'spritePosition');
    gl.bindAttribLocation(this.#program, SPRITE_SIZE_ATTRIBUTE_LOCATION, 'spriteSize');
    gl.bindAttribLocation(this.#program, SPRITE_TYPE_ATTRIBUTE_LOCATION, 'spriteType');
    gl.bindAttribLocation(this.#program, SPRITE_COLOR_ATTRIBUTE_LOCATION, 'spriteColor');
    gl.bindAttribLocation(this.#program, SPRITE_ANGLE_ATTRIBUTE_LOCATION, 'spriteAngle');

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
