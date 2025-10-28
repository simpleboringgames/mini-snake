import { type Coordinate, type Dimensions } from "./OfflineLogic";

export class Renderer {
  private gridSize: number;
  private ctx: CanvasRenderingContext2D;
  private canvas_: HTMLCanvasElement;

  constructor(gridSize: number, dimensions: Dimensions) {
    this.gridSize = gridSize;
    
    const canvas = document.createElement('canvas');

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

    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 100, 100);
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

  public draw = (head: Coordinate, body: Coordinate, remove: Coordinate) => {
    this.ctx.clearRect(remove.x * this.gridSize, remove.y * this.gridSize, this.gridSize, this.gridSize);
    this.ctx.fillRect(head.x * this.gridSize, head.y * this.gridSize, this.gridSize, this.gridSize);
    this.ctx.fillRect(body.x * this.gridSize, body.y * this.gridSize, this.gridSize, this.gridSize);
  };
}
