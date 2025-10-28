import { MiniSnake } from '../lib/MiniSnake';

(async () => {
    const snakePlayArea = MiniSnake.createFullScreenOverlay();
    document.documentElement.appendChild(snakePlayArea);

    const miniSnake = new MiniSnake(snakePlayArea);
    miniSnake.start();
})();
