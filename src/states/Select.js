import Grid from '../Grid';
import SpriteBatch from '../SpriteBatch';

import Minigame from './Minigame';
import Meowsweeper from '../minigames/Meowsweeper';
import PawPawToe from '../minigames/PawPawToe';
import Sudocat from '../minigames/Sudocat';
import Meowmory from '../minigames/Meowmory';
import Meowsterpiece from '../minigames/Meowsterpiece';

import Matrix3 from '../Matrix3';

export default class {
  #game;
  #firstStart;
  #grid;
  #buttons;
  #spriteBatch;
  #minigameState;
  #camY;
  #startBlackCat;
  #blackCat;
  #blackCatArrived;
  #titleShown;
  #introOver;

  init(game) {
    this.#game = game;
    this.#firstStart = game.firstStart;
    game.firstStart = false;

    this.#grid = new Grid(this.#game, 'center', 100, 6, 15, 128, 0, 0, null, '', 2);
    this.#grid.disabled = true;

    this.#buttons = new Grid(this.#game, 'center', 132, 3, 7, 128, 64, 64, (button) => this.#buttonClick(button), '', 1);

    if (this.#firstStart) {
      this.#buttons.disabled = true;
      this.#camY = -this.#game.renderer.h;
      this.#game.text.write('THIS IS A TRUE STORY\n\n\nTHE CATS DEPICTED HERE\nALL LIVE IN DUBLIN', 'center', 'center', 32, 'inactive', ['typing', 'shake']);
      this.#game.scheduleTimer(9000, () => {
        this.#startBlackCat = true;
        this.#game.text.clear();
      });
    } else {
      this.#game.text.write('HELP THE OTHER CATS\nIN THE BUILDING!!', 'center', 10, 32, 'active', ['typing', 'shake']);
    }

    this.#spriteBatch = new SpriteBatch(this.#game);

    const minigames = [PawPawToe, Meowmory, Meowsweeper, Sudocat, Meowsterpiece];

    for (let i = 0; i < 21; i++) {
      if (minigames[i] && (i == 0 || !this.#firstStart)) {
        this.#buttons.sprites[i].minigame = minigames[i];
        let sx = minigames[i].sx;
        let sy = 73;
        let type = minigames[i].type;
        if (this.#game.minigamesWon.has(minigames[i])) {
          this.#buttons.sprites[i].activate(false);
          sx = 39;
          sy = 39;
          type = 1;
        }
        this.#spriteBatch.add(this.#buttons.sprites[i].x + sx, this.#buttons.sprites[i].y + sy, 50, type, minigames[i].color);
      } else {
        this.#buttons.sprites[i].activate(false);
      }
    }

    this.#blackCat = this.#spriteBatch.add('center', game.renderer.h, 900, 1, 'black');

    for (let i = 0; i < this.#buttons.sprites.length; i++) {
      const button = this.#buttons.sprites[i];
      if (this.#game.minigamesWon.has(button.minigame)) {
        button.activate(false);
      }
    }
  }

  update() {
    if (this.#firstStart) {
      if (this.#camY < 0) {
        this.#camY += 3;
        if (this.#camY >= 0) {
          this.#camY = 0;
          this.#game.shake(200);
        }
        this.#game.renderer.projection = Matrix3.ortho(0, this.#game.renderer.w, this.#game.renderer.h + this.#camY, this.#camY);
      } else if (this.#startBlackCat && !this.#blackCatArrived) {
        this.#blackCat.y -= 3;
        if (this.#blackCat.y <= this.#game.renderer.h / 2 - this.#blackCat.size / 2) {
          this.#blackCatArrived = true;
          this.#blackCat.y = this.#game.renderer.h / 2 - this.#blackCat.size / 2;
          const title = this.#game.text.write('  A VOIDING\nYOUR PROBLEMS', 'center', 'center', 48, null, ['sine']);
          this.#game.text.write('  A GAME BY\nATTILA HORVATH', 'center', title.y + 180, 36, 'whitecat', ['shake']);
          this.#game.text.write('TAP TO BEGIN', 'center', title.y + 280, 36, 'inactive', ['typing', 'shake'], 1200);
          this.#game.shake(500);
        }
        this.#blackCat.x = this.#game.renderer.w / 2 - this.#blackCat.size / 2;
        this.#spriteBatch.changed();
      } else if (!this.#titleShown) {
        if (this.#game.input.click()) {
          this.#game.input.clickRead = true;
          this.#game.text.clear();
          const firstLine = this.#game.text.write('SO, I HEARD THIS\nIS THE DOMAIN OF', 'center',  'center', 28, 'inactive', ['typing', 'shake']);
          this.#game.text.write('QUEEN KARA', 'center', firstLine.y + 60, 32, 'tabbycat', ['typing', 'sine'], 4000);
          this.#game.text.write("I HOPE SHE'LL ACCEPT ME\nIF I HELP THE OTHER CATS...", 'center', firstLine.y + 120, 28, 'inactive', ['typing', 'shake'], 6000);
          this.#titleShown = true;
        }
      } else if (!this.#introOver) {
        if (this.#game.input.click()) {
          this.#game.input.clickRead = true;
          this.#blackCat.hidden = true;
          this.#spriteBatch.changed();
          this.#game.text.clear();
          this.#introOver = true;
          this.#game.text.write("LET'S START WITH THIS\nGENIUS ORANGE CAT!", 'center', 10, 32, 'active', ['typing', 'shake']);
        }
      } else {
        this.#buttons.disabled = false;
      }
    }

    this.#grid.update();
    this.#spriteBatch.update();

    if (this.#minigameState) {
      return this.#minigameState;
    } else {
      this.#buttons.update();
    }
  }

  draw() {
    this.#grid.draw();
    this.#buttons.draw();
    this.#spriteBatch.draw();
  }

  #buttonClick(button) {
    if (button) {
      this.#minigameState = new Minigame(button.minigame);
    }
  }
}
