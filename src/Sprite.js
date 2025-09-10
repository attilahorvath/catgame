export default class {
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
    case 'whitecat':
      this.r = 0.9;
      this.g = 0.9;
      this.b = 0.9;
      break;
    case 'tabbycat':
      this.r = 0.64;
      this.g = 0.56;
      this.b = 0.38;
      break;
    case 'silvercat':
      this.r = 0.6;
      this.g = 0.6;
      this.b = 0.6;
      break;

    case 'black':
      this.r = 0.0;
      this.g = 0.0;
      this.b = 0.0;
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

  write(text, content, size, color = 'active', animations = null, delay = null) {
    (this.content || {}).enabled = false;
    this.content = text.write(content.toString(), this.x + (this.size - size) / 2, this.y + (this.size - size) / 2, size, color, animations, delay);
  }

  draw(spriteBatch, size, type, color) {
    (this.content || {}).enabled = false;
    this.content = spriteBatch.add(this.x + (this.size - size) / 2, this.y + (this.size - size) / 2, size, type, color);
  }

  #fromRGB(r, g, b) {
    this.r = r / 255.0;
    this.g = g / 255.0;
    this.b = b / 255.0;
  }
}
