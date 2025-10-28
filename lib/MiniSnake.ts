import { Logic, type Dimensions } from "./Logic";
import { Renderer } from "./Renderer";

export class MiniSnake implements Disposable {
  private targetPixelSize: number = 20;
  private logic: Logic;
  private renderer: Renderer;
  private targetFps = 10;
  private targetFrameDuration = 1000 / this.targetFps;
  private lastFrameTime = 0;
  private playArea : HTMLElement;
  private logicDimensions : Dimensions;

  constructor(playArea: HTMLElement) {
    this.playArea = playArea;
    const rendererDimensions = MiniSnake.calculateRendererDimensions(this.playArea);
    this.renderer = new Renderer(this.targetPixelSize, rendererDimensions);

    this.logicDimensions = MiniSnake.calculateLogicDimensions(rendererDimensions, this.targetPixelSize);
    this.logic = new Logic({ dimensions: this.logicDimensions, startingLength: 10 });

    playArea.appendChild(this.renderer.canvas);
    this.playArea?.addEventListener("resize", this.onResize);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  [Symbol.dispose](): void {
    this.playArea?.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("keydown", this.onKeyDown);
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
    this.renderer.draw(changes);
  }

  public static createFullScreenOverlay() : HTMLElement {
    const fullScreenElement = document.createElement('div');
    fullScreenElement.style.cssText = "position:fixed;top:0;left:0;pointer-events:none;width:100%;height:100%;";
    return fullScreenElement;
  }

  private static calculateRendererDimensions(playArea: HTMLElement): Dimensions {
    return { width: playArea.clientWidth, height: playArea.clientHeight };
  }

  private static calculateLogicDimensions(rendererDimensions: Dimensions, targetPixelSize: number): Dimensions {
    return { width: (rendererDimensions.width / targetPixelSize) - 1, height: (rendererDimensions.height / targetPixelSize) - 1 };
  }

  private onResize = () => {
    const rendererDimensions = MiniSnake.calculateRendererDimensions(this.playArea);
    const logicDimensions = MiniSnake.calculateLogicDimensions(rendererDimensions, this.targetPixelSize);

    this.renderer.dimensions = rendererDimensions;
    this.logic.setWidthAndHeight(logicDimensions.width, logicDimensions.height);
  };

  private onKeyDown = (keydown: KeyboardEvent) => {
    const keyMap: Record<string, { x: number; y: number }> = {
      w: { x: 0, y: -1 },
      ArrowUp: { x: 0, y: -1 },
      a: { x: -1, y: 0 },
      ArrowLeft: { x: -1, y: 0 },
      s: { x: 0, y: 1 },
      ArrowDown: { x: 0, y: 1 },
      d: { x: 1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    const velocity = keyMap[keydown.key];
    if (velocity) {
      this.logic.setVelocity(velocity);
    }
  };

  private onPointerMove = (pointerEvent: PointerEvent) => {
    this.logic.setTarget({ x: pointerEvent.x / this.targetPixelSize, y: pointerEvent.y / this.targetPixelSize });
  };
}


