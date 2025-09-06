import Game from "./Game";

const game = new Game();

function step(timestamp) {
  requestAnimationFrame(step);
  game.step(timestamp);
}

requestAnimationFrame(step);
