import { OfflineLogic } from "./OfflineLogic";
import { Renderer } from "./Renderer";
import { Interaction } from "./Interaction";

export class MiniSnake implements Disposable {
  private targetPixelSize: number = 20;
  private logic: OfflineLogic;
  private interaction: Interaction;
  private renderer: Renderer;
  private targetFps = 10;
  private targetFrameDuration = 1000 / this.targetFps;
  private lastFrameTime = 0;
  private attachedToElement : HTMLElement | undefined;

  constructor() {
    const rendererDimensions = MiniSnake.calculateRendererDimensions();
    this.renderer = new Renderer(this.targetPixelSize);

    const logicDimensions = MiniSnake.calculateLogicDimensions(rendererDimensions, this.targetPixelSize);
    this.logic = new OfflineLogic({ width: logicDimensions.width, height: logicDimensions.height, startingLength: 10 });

    this.interaction = new Interaction(
      this.logic.head,
      this.logic.setVelocity,
      this.logic.setTarget
    );
  }

  [Symbol.dispose](): void {
    this.interaction[Symbol.dispose]();

    this.attachedToElement?.removeEventListener("resize", this.onResize);
  }

  get canvas() {
    return this.renderer.canvas;
  }

  public attachTo(element: HTMLElement) {
    this.attachedToElement = element;
    this.attachedToElement.addEventListener("resize", this.onResize)
  }

  public start () {
    this.onAnimationFrame(0);
  }

  private onAnimationFrame = (timestamp: number) => {
    requestAnimationFrame(this.onAnimationFrame);

    const delta = timestamp - this.lastFrameTime;
    if (delta < this.targetFrameDuration) {
      return;
    }
    this.lastFrameTime = timestamp - (delta % this.targetFrameDuration);
    const changes = this.logic.update();
    this.renderer.draw(
      changes.added,
      changes.modified,
      changes.removed,
    );
  }

  public static createFullScreenOverlay() : HTMLElement {
    const fullScreenElement = document.createElement('div');
    return fullScreenElement;
  }

  static calculateRendererDimensions(): { width: number, height: number } {
    return { width: document.body.clientWidth, height: document.body.clientHeight };
  }

  static calculateLogicDimensions(rendererDimensions: { width: number, height: number }, targetPixelSize: number): { width: number, height: number } {
    return { width: (rendererDimensions.width / targetPixelSize) - 1, height: (rendererDimensions.height / targetPixelSize) - 1 };
  }

  private onResize = () => {
    const rendererDimensions = MiniSnake.calculateRendererDimensions();
    const logicDimensions = MiniSnake.calculateLogicDimensions(rendererDimensions, this.targetPixelSize);

    this.renderer.width = rendererDimensions.width;
    this.renderer.height = rendererDimensions.height;
    this.logic.setWidthAndHeight(logicDimensions.width, logicDimensions.height);
  };
}


