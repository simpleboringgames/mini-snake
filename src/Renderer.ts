import { type AlteredPieces, type Dimensions } from "./OfflineLogic";

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

  public draw = (alteredPieces: AlteredPieces) => {
    if (alteredPieces.bodyRemoved !== undefined) {
      this.ctx.clearRect(alteredPieces.bodyRemoved.x * this.gridSize, alteredPieces.bodyRemoved.y * this.gridSize, this.gridSize, this.gridSize);
    }

    this.ctx.fillStyle = "rgb(255, 81, 0)";
    this.ctx.fillRect(alteredPieces.head.x * this.gridSize + 1, alteredPieces.head.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
    this.ctx.strokeRect(alteredPieces.head.x * this.gridSize + 1, alteredPieces.head.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);

    if (alteredPieces.bodyStart !== undefined) {
      this.ctx.clearRect(alteredPieces.bodyStart.x * this.gridSize, alteredPieces.bodyStart.y * this.gridSize, this.gridSize, this.gridSize);
      this.ctx.fillStyle = "grey";
      this.ctx.fillRect(alteredPieces.bodyStart.x * this.gridSize + 1, alteredPieces.bodyStart.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
      this.ctx.strokeRect(alteredPieces.bodyStart.x * this.gridSize + 1, alteredPieces.bodyStart.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
    }


  };
}
