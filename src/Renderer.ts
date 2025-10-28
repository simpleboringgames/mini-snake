import { Application, Container, Graphics, type FillInput } from "./external/pixi.js";
import { type Coordinate } from "./OfflineLogic";

export class Renderer {
  private bodies: Container = new Container();
  private head;
  private normalfood;

  private gridSize: number;
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;

  constructor(app: Application, gridSize: number, width: number, height: number) {
    this.gridSize = gridSize;
    this.width = width;
    this.height = height;

    // this.head = Renderer.newPixel("rgb(255, 81, 0)", this.gridSize);
    // this.normalfood = Renderer.newPixel("rgb(0, 156, 52)", this.gridSize);

    app.stage.addChild(this.bodies);
    app.stage.addChild(this.head);
    app.stage.addChild(this.normalfood);
  }

  public setWidthAndHeight = (width: number, height: number) => {
    this.width = width;
    this.height = height;
  }

  public draw = (head: Coordinate, body: Coordinate, remove: Coordinate) => {
    this.ctx.clearRect(remove.x, remove.y, this.gridSize, this.gridSize);

    // this.ctx.col

    this.ctx.fillRect();
    this.ctx.fillRect();

    const multiplierWidth = 1 + this.width % this.gridSize / this.width;
    const multiplierHeight = 1 + this.height % this.gridSize / this.height;

    const gridSizeWidth = multiplierWidth * this.gridSize;
    const gridSizeHeight = multiplierHeight * this.gridSize;

    this.head.position.x = head.x * gridSizeWidth;
    this.head.position.y = head.y * gridSizeHeight;

    const difference = this.bodies.children.length - bodies.length;

    if (difference > 0) {
      this.bodies.removeChildren();
    } else if (difference < 0) {
      for (let i = difference; i < 0; i++) {
        const body = Renderer.newPixel("gray", this.gridSize);
        this.bodies.addChild(body);
      }
    }

    this.bodies.children.forEach((body, i) => {
      const newBody = bodies[i];
      if (newBody === undefined) {
        return;
      }

      body.position.set(newBody.x * gridSizeWidth, newBody.y * gridSizeHeight);
    });

    this.normalfood.position.set(normalfood.x * gridSizeWidth, normalfood.y * gridSizeHeight);
  };

  private static newPixel = (ctx: CanvasRenderingContext2D, fill: FillInput, gridSize: number) => {
    ctx.rect(0, 0, gridSize, gridSize);

    const pixel = new Graphics()
      .rect(0, 0, gridSize, gridSize)
      .fill(fill)
      .stroke({
        width: 2,
        color: "gray",
      });
    pixel.alpha = 0.2;
    pixel.position.set(0 - gridSize, 0 - gridSize);
    return pixel;
  }
}
