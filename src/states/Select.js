import Grid from '../Grid';
import SpriteBatch from '../SpriteBatch';

import Minigame from './Minigame';
import Meowsweeper from '../minigames/Meowsweeper';
import PawPawToe from '../minigames/PawPawToe';
import Sudocat from '../minigames/Sudocat';
import Meowmory from '../minigames/Meowmory';
import Meowjong from '../minigames/Meowjong';
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
  #introText;

  init(game) {
    this.#game = game;
    this.#firstStart = game.firstStart;
    game.firstStart = false;

    const won = game.minigamesWon.size === 6;

    this.#grid = new Grid(game, CENTER, won ? 200 : 100, 6, 15, 128, 0, 0, null, '', 2);
    this.#grid.disabled = true;

    this.#buttons = new Grid(game, CENTER, won ? 232 : 132, 3, 7, 128, 64, 64, (button) => this.#buttonClick(button), '', 1);

    if (this.#firstStart) {
      this.#buttons.disabled = true;
      this.#camY = -game.renderer.h;
      this.#introText = game.text.write('THIS IS A TRUE STORY.\n\n\nTHE CATS DEPICTED HERE\nALL LIVE IN DUBLIN.', CENTER, CENTER, 32, INACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION]);
      game.scheduleTimer(9000, () => {
        this.#startBlackCat = true;
        this.#introText.enabled = false;
        game.text.changed();
      });
    } else if (!won) {
      game.text.write('HELP THE OTHER CATS\nIN THE BUILDING!!', CENTER, 10, 32, ACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION]);
    } else {
      game.text.write('CONGRATULATIONS!!', CENTER, 10, 48, HIGHLIGHT_COLOR, [SINE_ANIMATION]);
      game.text.write("YOU HELPED ALL THE CATS!\nYOU'VE BEEN ACCEPTED BY", CENTER, 75, 32, ACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION]);
      game.text.write('QUEEN KARA', CENTER, 150, 32, TABBYCAT_COLOR, [TYPING_ANIMATION, SINE_ANIMATION], 7000);
      game.text.write('THANKS FOR PLAYING!!', CENTER, 200, 32, INACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION], 10000);

      game.scheduleTimer(400, () => game.particles.emit(Math.random() * game.renderer.w, Math.random() * game.renderer.h, true, 256, 1000), true);
    }

    this.#spriteBatch = new SpriteBatch(game);

    const minigameClasses = [PawPawToe, Meowmory, Meowjong, Sudocat, Meowsterpiece, Meowsweeper];

    for (let i = 0; i < 21; i++) {
      if (minigameClasses[i] && (i == 0 || !this.#firstStart)) {
        let [_, color, sx, type, ..._rest] = minigameClasses[i].meta;
        this.#buttons.sprites[i].minigameClass = minigameClasses[i];
        let sy = 73;
        if (game.minigamesWon.has(minigameClasses[i])) {
          this.#buttons.sprites[i].activate(false);
          sx = 39;
          sy = 39;
          type = 1;
        }
        this.#spriteBatch.add(this.#buttons.sprites[i].x + sx, this.#buttons.sprites[i].y + sy, 50, type, color);
      } else {
        this.#buttons.sprites[i].activate(false);
      }
    }

    this.#blackCat = this.#spriteBatch.add(CENTER, game.renderer.h, 900, 1, VOID_COLOR);

    for (let i = 0; i < this.#buttons.sprites.length; i++) {
      const button = this.#buttons.sprites[i];
      if (game.minigamesWon.has(button.minigameClass)) {
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
        if (this.#blackCat.y <= this.#game.renderer.h / 2 - this.#blackCat.s / 2) {
          this.#blackCatArrived = true;
          this.#blackCat.y = this.#game.renderer.h / 2 - this.#blackCat.s / 2;
          const title = this.#game.text.write('  A VOIDING\nYOUR PROBLEMS', CENTER, CENTER, 48, null, [SINE_ANIMATION]);
          this.#game.text.write('  A GAME BY\nATTILA HORVATH', CENTER, title.y + 180, 36, WHITECAT_COLOR, [SHAKE_ANIMATION]);
          this.#game.text.write('TAP TO BEGIN', CENTER, title.y + 280, 36, INACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION], 1200);
          this.#game.shake(500);
        }
        this.#blackCat.x = this.#game.renderer.w / 2 - this.#blackCat.s / 2;
        this.#spriteBatch.changed();
      } else if (!this.#titleShown) {
        if (this.#game.input.click()) {
          this.#game.input.clickRead = true;
          this.#game.text.clear();
          const firstLine = this.#game.text.write('SO, I HEARD THIS\nIS THE DOMAIN OF', CENTER,  CENTER, 28, INACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION]);
          this.#game.text.write('QUEEN KARA', CENTER, firstLine.y + 60, 32, TABBYCAT_COLOR, [TYPING_ANIMATION, SINE_ANIMATION], 4000);
          this.#game.text.write("I HOPE SHE'LL ACCEPT ME\nIF I HELP THE OTHER CATS...", CENTER, firstLine.y + 120, 28, INACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION], 6000);
          this.#titleShown = true;
        }
      } else if (!this.#introOver) {
        if (this.#game.input.click()) {
          this.#game.input.clickRead = true;
          this.#blackCat.hidden = true;
          this.#spriteBatch.changed();
          this.#game.text.clear();
          this.#introOver = true;
          this.#game.text.write("LET'S START WITH THIS\nGENIUS ORANGE CAT HERE!", CENTER, 10, 32, ACTIVE_COLOR, [TYPING_ANIMATION, SHAKE_ANIMATION]);
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
      this.#minigameState = new Minigame(button.minigameClass);
    }
  }
}
