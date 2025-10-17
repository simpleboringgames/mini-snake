import { Application, Container, Graphics, type FillInput } from "pixi.js";
import { GRID_SIZE, type Coordinate } from "./OfflineLogic";

export class Renderer {
  // private exactHead: Graphics = new Graphics().circle(0, 0, 4).fill("red");
  private head: Graphics = this.newPixel("rgb(255, 81, 0)");
  private bodies: Container = new Container();

  private normalfood = this.newPixel("rgb(0, 156, 52)");
  private specialFood = this.newPixel("rgb(107, 0, 168)");
  private poisonFood = this.newPixel("rgba(155, 10, 0, 1)");

  constructor(app: Application) {
    app.stage.addChild(this.bodies);
    app.stage.addChild(this.head);
    app.stage.addChild(this.normalfood);
    app.stage.addChild(this.specialFood);
    app.stage.addChild(this.poisonFood);
    // app.stage.addChild(this.exactHead);
  }

  public set = (
    head: Coordinate,
    bodies: Array<Coordinate>,
    normalfood: Coordinate,
    specialFood: Coordinate,
    poisonFood: Coordinate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exactHead: Coordinate
  ) => {
    this.head.position.x = head.x;
    this.head.position.y = head.y;

    // const difference = this.bodies.children.length - bodies.length;

    // if (difference > 0) {
    //   for (let i = 0; i < difference; i++) {
    //     this.bodies.children.pop();
    //   }
    // } else if (difference < 0) {
    //   for (let i = difference; i < 0; i++) {
    //     const bodyGraphicContainer = new Container();
    //     const bodyGraphic = this.newPixel("gray");
    //     bodyGraphicContainer.addChild(bodyGraphic);

    //     this.bodies.addChild(bodyGraphicContainer);
    //   }
    // }

    this.bodies.removeChildren();

    for (let i = 0; i < bodies.length; i++) {
      const bodyGraphicContainer = new Container();
      const bodyGraphic = this.newPixel("gray");
      bodyGraphicContainer.addChild(bodyGraphic);
      this.bodies.addChild(bodyGraphicContainer);
    }

    this.bodies.children.forEach((body, i) => {
      const newBody = bodies[i];
      if (newBody === undefined) {
        return;
      }

      body.position.x = newBody.x;
      body.position.y = newBody.y;
    });

    this.normalfood.position.set(normalfood.x, normalfood.y);
    this.specialFood.position.set(specialFood.x, specialFood.y);
    this.poisonFood.position.set(poisonFood.x, poisonFood.y);
    // this.exactHead.position.set(exactHead.x, exactHead.y);
  };
  private newPixel(fill: FillInput) {
    const pixel = new Graphics()
      .rect(0, 0, GRID_SIZE, GRID_SIZE)
      .fill(fill)
      .stroke({
        width: 2,
        color: "gray",
      });
    pixel.alpha = 0.2;
    return pixel;
  }
}
