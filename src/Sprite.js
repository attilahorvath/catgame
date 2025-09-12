export default class {
  constructor(x, y, s, type, color) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.type = type;
    this.angle = 0.0;
    this.enabled = true;
    this.hidden = false;
    this.a = 1.0;

    this.setColor(color);
  }

  attributes() {
    return [this.x, this.y, this.s, this.type, this.r, this.g, this.b, this.hidden ? 0 : this.a, this.angle];
  }

  setBaseColor(color) {
    this.baseColor = color;
    this.setColor(color);
  }

  setColor(index) {
    let color = [0xd9dcff, 0xadadf0, 0xc28c94, 0xa66670, 0x575775,
                 0x545454, 0xb36e14, 0xe6e6e6, 0xa38f61, 0x999999,
                 0x90a8c3, 0x469d89, 0xb5c99a, 0x00a6fb, 0x4cc9f0,
                 0xf4cae0, 0xe500a4, 0xf20089, 0xffffff, 0xffccf0,
                 0x000000][index];
    if (color == null) {
      color = 0xffffff;
    }
    this.r = ((color & 0xff0000) >> 16) / 255.0;
    this.g = ((color & 0x00ff00) >> 8) / 255.0;
    this.b = (color & 0x0000ff) / 255.0;
  }

  activate(active) {
    this.inactive = !active;
    this.setColor(active ? (this.baseColor || PRIMARY_COLOR) : INACTIVE_COLOR);
  }

  write(text, content, s, color = ACTIVE_COLOR, animations = null, delay = null) {
    (this.content || {}).enabled = false;
    this.content = text.write(content.toString(), this.x + (this.s - s) / 2, this.y + (this.s - s) / 2, s, color, animations, delay);
  }

  draw(spriteBatch, s, type, color) {
    (this.content || {}).enabled = false;
    this.content = spriteBatch.add(this.x + (this.s - s) / 2, this.y + (this.s - s) / 2, s, type, color);
  }
}
