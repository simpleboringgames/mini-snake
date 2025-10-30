import type { Dimensions, Vector } from "./MiniSnake";

export class Renderer {
  private gridSize: number;
  ctx: CanvasRenderingContext2D;
  private canvas_: HTMLCanvasElement;

  constructor(gridSize: number, dimensions: Dimensions) {
    this.gridSize = gridSize;

    const canvas = document.createElement("canvas");

    canvas.style.cssText = `position:fixed;top:0;left:0;display:block;`;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new TypeError("Mini Snake canvas context unexpectedly null");
    }

    this.canvas_ = canvas;
    this.ctx = ctx;

    this.canvas.width = dimensions.width * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.canvas.style.width = `${dimensions.width}px`;

    this.canvas.height = dimensions.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.canvas.style.height = `${dimensions.height}px`;

    ctx.fillStyle = "gray";
    ctx.strokeStyle = "black";
    ctx.globalAlpha = 0.2;
  }

  get canvas() {
    return this.canvas_;
  }

  set dimensions(dimensions: Dimensions) {
    this.canvas.width = dimensions.width * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.canvas.width = dimensions.width;

    this.canvas.height = dimensions.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.canvas.height = dimensions.height;

    this.ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }

  public clear(coordinate: Vector) {
    this.ctx.clearRect(
      coordinate.x * this.gridSize,
      coordinate.y * this.gridSize,
      this.gridSize,
      this.gridSize
    );
  }

  public drawHead(coordinate: Vector) {
    this.ctx.fillStyle = "rgb(255, 81, 0)";
    this.ctx.fillRect(
      coordinate.x * this.gridSize + 1,
      coordinate.y * this.gridSize + 1,
      this.gridSize - 2,
      this.gridSize - 2
    );
    this.ctx.strokeRect(
      coordinate.x * this.gridSize + 1,
      coordinate.y * this.gridSize + 1,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }

  public drawBody(coordinate: Vector) {
    this.ctx.fillStyle = "rgb(128, 128, 128)";
    this.ctx.fillRect(
      coordinate.x * this.gridSize + 1,
      coordinate.y * this.gridSize + 1,
      this.gridSize - 2,
      this.gridSize - 2
    );
    this.ctx.strokeRect(
      coordinate.x * this.gridSize + 1,
      coordinate.y * this.gridSize + 1,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }
}
