#version 300 es

precision highp float;

uniform sampler2D tex;

in vec2 texCoord;
in vec4 tint;

out vec4 fragmentColor;

void main() {
  fragmentColor = texture(tex, texCoord) * tint;
}
