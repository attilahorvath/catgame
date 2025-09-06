export default class {
  constructor(text, x, y, size, color) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;

    this.sprites = [];
    this.enabled = true;
  }
}
