import { DEFAULT_GRID_SIZE, OfflineLogic } from "./OfflineLogic";
import { Interaction } from "./Interaction";
import { Application } from "pixi.js";
import { Renderer } from "./Renderer";

export class MiniSnakes implements Disposable {
  private app: Application = new Application();

  private logic: OfflineLogic = new OfflineLogic({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  });
  private interaction: Interaction;
  private renderer: Renderer = new Renderer(this.app, DEFAULT_GRID_SIZE);

  constructor() {
    this.interaction = new Interaction(
      this.logic.head,
      this.logic.setVelocity,
      this.logic.setTarget
    );

    window.addEventListener("resize", this.onResize);
  }

  [Symbol.dispose](): void {
    this.interaction[Symbol.dispose]();
  }

  private onResize = () => {
    this.logic.setWidthAndHeight(
      document.documentElement.clientWidth,
      document.documentElement.clientHeight
    );
  };

  async init() {
    await this.app.init({
      backgroundAlpha: 0,
      resizeTo: document.documentElement,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      antialias: false,
      autoStart: false,
    });

    this.app.ticker.maxFPS = 10;
    this.app.start();
    this.app.ticker.add(this.onTick);

    document.body.appendChild(this.app.canvas);
    this.update();
  }

  public onTick = () => {
    this.update();
  };

  public update = () => {
    this.logic.update();

    this.renderer.set(
      this.logic.head,
      this.logic.bodies,
      this.logic.normalfood,
    );
  };
}

(async () => {
  const miniSnakes = new MiniSnakes();
  await miniSnakes.init();
})();
