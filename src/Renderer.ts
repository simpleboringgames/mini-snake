import { type Coordinate } from "./OfflineLogic";

export class Renderer {
  private gridSize: number;
  private width_: number = 0;
  private height_: number = 0;
  private ctx: CanvasRenderingContext2D;
  private canvas_: HTMLCanvasElement;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    const canvas = document.createElement('canvas');
	  canvas.style.cssText = `position:fixed;top:0;left:0;display:block;width:${this.width_}px;height:${this.height_}px`;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new TypeError("Mini Snake canvas context unexpectedly null");
    }
    ctx.fillRect(0, 0, 100, 100);

    this.canvas_ = canvas;
    this.ctx = ctx;
  }

  get canvas() {
    return this.canvas_;
  }

  set width(width: number) {
    this.width_ = width;
  }

  set height(height: number) {
    this.height_ = height;
  }

  public draw = (head: Coordinate, body: Coordinate, remove: Coordinate) => {
    this.ctx.clearRect(remove.x * this.gridSize, remove.y * this.gridSize, this.gridSize, this.gridSize);
    this.ctx.fillRect(head.x * this.gridSize, head.y * this.gridSize, this.gridSize, this.gridSize);
    this.ctx.fillRect(body.x * this.gridSize, body.y * this.gridSize, this.gridSize, this.gridSize);
  };
}
