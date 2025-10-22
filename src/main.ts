import { OfflineLogic } from "./OfflineLogic";
// import { Interaction } from "./Interaction";
import { Application } from "pixi.js";
import { Renderer } from "./Renderer";
import { Interaction } from "./Interaction";

export class MiniSnakes implements Disposable {
  private app: Application = new Application();

  private targetPixelSize: number = 20;

  private logic: OfflineLogic = new OfflineLogic({
    width: document.documentElement.clientWidth / this.targetPixelSize,
    height: document.documentElement.clientHeight / this.targetPixelSize,
    startingLength: 10
  });

  private interaction: Interaction;

  private renderer: Renderer = new Renderer(this.app, this.targetPixelSize);

  constructor() {
    this.interaction = new Interaction(
      this.logic.head,
      this.logic.setVelocity,
      this.logic.setTarget
    );

    window.addEventListener("resize", this.onResize);
  }

  [Symbol.dispose](): void {
    window.removeEventListener("resize", this.onResize);

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
    this.onTick();
  }

  public onTick = () => {
    this.logic.update();
    this.renderer.set(
      this.logic.head,
      this.logic.bodies,
      this.logic.food,
    );
  };
}

(async () => {
  const miniSnakes = new MiniSnakes();
  await miniSnakes.init();
})();

