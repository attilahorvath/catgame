import Select from './Select';

export default class {
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
