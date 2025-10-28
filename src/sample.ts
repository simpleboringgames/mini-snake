import { MiniSnake } from './MiniSnake';

(async () => {
    const miniSnake = new MiniSnake();

    const fullScreen = MiniSnake.createFullScreenOverlay();
    document.documentElement.appendChild(fullScreen);

    miniSnake.attachTo(fullScreen);
})();
