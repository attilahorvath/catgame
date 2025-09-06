#version 300 es

uniform mat3 projection;
uniform float imageSize;

uniform sampler2D tex;

in vec2 vertexPosition;
in vec2 vertexTexCoord;

in vec2 spritePosition;
in float spriteSize;
in float spriteType;
in vec4 spriteColor;
in float spriteAngle;

out vec2 texCoord;
out vec4 tint;

void main() {
  vec2 texOffset = vec2(imageSize / float(textureSize(tex, 0)),
                        imageSize / float(textureSize(tex, 0).y));

  texCoord = vec2(texOffset.x, 0.0) * spriteType + vertexTexCoord * texOffset;
  tint = spriteColor;
  // TODO: Calculate rotation based on spriteAngle
  gl_Position = vec4(projection * vec3(vertexPosition * spriteSize + spritePosition, 1.0), 1.0);
}
