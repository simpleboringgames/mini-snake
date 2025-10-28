import { OfflineLogic, type Dimensions } from "./OfflineLogic";
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
  private playArea : HTMLElement;

  constructor(playArea: HTMLElement) {
    this.playArea = playArea;
    const rendererDimensions = MiniSnake.calculateRendererDimensions(this.playArea);
    this.renderer = new Renderer(this.targetPixelSize, rendererDimensions);

    const logicDimensions = MiniSnake.calculateLogicDimensions(rendererDimensions, this.targetPixelSize);
    this.logic = new OfflineLogic({ dimensions: logicDimensions, startingLength: 10 });

    this.interaction = new Interaction(
      this.logic.head,
      this.logic.setVelocity,
      this.logic.setTarget
    );

    playArea.appendChild(this.renderer.canvas);
    this.playArea?.addEventListener("resize", this.onResize);
  }

  [Symbol.dispose](): void {
    this.interaction[Symbol.dispose]();
    this.playArea?.removeEventListener("resize", this.onResize);
  }

  get canvas() {
    return this.renderer.canvas;
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
    fullScreenElement.style.cssText = "position:fixed;top:0;left:0;pointer-events:none;width:100%;height:100%;";
    return fullScreenElement;
  }

  static calculateRendererDimensions(playArea: HTMLElement): Dimensions {
    return { width: playArea.clientWidth, height: playArea.clientHeight };
  }

  static calculateLogicDimensions(rendererDimensions: Dimensions, targetPixelSize: number): Dimensions {
    return { width: (rendererDimensions.width / targetPixelSize) - 1, height: (rendererDimensions.height / targetPixelSize) - 1 };
  }

  private onResize = () => {
    const rendererDimensions = MiniSnake.calculateRendererDimensions(this.playArea);
    const logicDimensions = MiniSnake.calculateLogicDimensions(rendererDimensions, this.targetPixelSize);

    this.renderer.dimensions = rendererDimensions;
    this.logic.setWidthAndHeight(logicDimensions.width, logicDimensions.height);
  };
}


