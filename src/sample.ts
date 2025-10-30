import { MiniSnake } from "../src/MiniSnake";

const snakePlayArea = MiniSnake.createFullScreenOverlay();
document.documentElement.appendChild(snakePlayArea);

const miniSnake = new MiniSnake(snakePlayArea);
miniSnake.start();
