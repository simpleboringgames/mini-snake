import { OfflineLogic } from "./OfflineLogic";
import { Application } from "pixi.js";
import { Renderer } from "./Renderer";
import { Interaction } from "./Interaction";

export class MiniSnake implements Disposable {
  private app: Application = new Application();

  private targetPixelSize: number = 20;

  private logic: OfflineLogic;

  private interaction: Interaction;

  private renderer: Renderer;

  constructor() {
    const rendererDimensions = MiniSnake.calculateRendererDimensions();
    this.renderer = new Renderer(this.app, this.targetPixelSize, rendererDimensions.width, rendererDimensions.height);

    const logicDimensions = MiniSnake.calculateLogicDimensions(rendererDimensions, this.targetPixelSize);
    this.logic = new OfflineLogic({ width: logicDimensions.width, height: logicDimensions.height, startingLength: 10 });

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

  static calculateRendererDimensions(): { width: number, height: number } {
    const fullScreenGameDiv = document.getElementById("full-screen-game")!;
    return { width: fullScreenGameDiv.clientWidth, height: fullScreenGameDiv.clientHeight };
  }

  static calculateLogicDimensions(rendererDimensions: { width: number, height: number }, targetPixelSize: number): { width: number, height: number } {
    return { width: (rendererDimensions.width / targetPixelSize) - 1, height: (rendererDimensions.height / targetPixelSize) - 1 };
  }

  private onResize = () => {
    const rendererDimensions = MiniSnake.calculateRendererDimensions();
    const logicDimensions = MiniSnake.calculateLogicDimensions(rendererDimensions, this.targetPixelSize);

    this.renderer.setWidthAndHeight(rendererDimensions.width, rendererDimensions.height);
    this.logic.setWidthAndHeight(logicDimensions.width, logicDimensions.height);
  };

  async init() {
    const fullScreenGameDiv = document.getElementById("full-screen-game")!;

    await this.app.init({
      backgroundAlpha: 0,
      resizeTo: fullScreenGameDiv,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      antialias: false,
      autoStart: false,
    });

    this.app.ticker.maxFPS = 10;
    this.app.start();
    this.app.ticker.add(this.onTick);

    fullScreenGameDiv.appendChild(this.app.canvas);
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


