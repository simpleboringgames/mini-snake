import { Application, Container, Graphics, type FillInput } from "pixi.js";
import { DEFAULT_GRID_SIZE, type Coordinate } from "./OfflineLogic";

export class Renderer {
  private bodies: Container = new Container();
  private head;
  private normalfood;

  private gridSize: number;

  constructor(app: Application, gridSize: number | undefined) {
    this.gridSize = gridSize ?? DEFAULT_GRID_SIZE;

    this.head = Renderer.newPixel("rgb(255, 81, 0)", this.gridSize);
    this.normalfood = Renderer.newPixel("rgb(0, 156, 52)", this.gridSize);

    app.stage.addChild(this.bodies);
    app.stage.addChild(this.head);
    app.stage.addChild(this.normalfood);
  }

  public set = (
    head: Coordinate,
    bodies: Array<Coordinate>,
    normalfood: Coordinate,
  ) => {
    this.head.position.x = head.x * this.gridSize;
    this.head.position.y = head.y * this.gridSize;

    const difference = this.bodies.children.length - bodies.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        this.bodies.children.pop();
      }
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

      body.position.set(newBody.x * this.gridSize, newBody.y * this.gridSize);
    });

    this.normalfood.position.set(normalfood.x, normalfood.y);
  };

  private static newPixel = (fill: FillInput, gridSize: number) => {
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
