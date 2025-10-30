import { Renderer } from "./Renderer";

export type Coordinate = { x: number; y: number };
export type Dimensions = { width: number; height: number };
export type Config = { dimensions: Dimensions; startingLength: number };
export type Vector = Coordinate;
export type Food = Coordinate;
export type Velocity = { x: number; y: number };
export type AlteredPieces = {
  head: Coordinate;
  bodyStart: Coordinate | undefined;
  bodyRemoved: Coordinate | undefined;
};
enum CollisionResult {
  Nothing,
  Snake,
  Food,
}

export class MiniSnake implements Disposable {
  private head: Vector;
  private body: Array<Vector>;
  private food: Vector;

  private fuelQueue: Array<Vector> = [];
  private fuel: Vector = { x: 0, y: 0 };
  private fuelPrevious: Vector = this.fuel;
  private currentMomentum: Vector = { x: 1, y: 0 };

  private targetPixelSize: number = 20;
  private renderer: Renderer;
  private targetFps = 10;
  private targetFrameDuration = 1000 / this.targetFps;
  private lastFrameTime = 0;
  private playArea: HTMLElement;
  private logicDimensions: Dimensions;
  private startingLength = 10;

  constructor(playArea: HTMLElement) {
    this.playArea = playArea;
    const rendererDimensions = MiniSnake.calculateRendererDimensions(
      this.playArea
    );
    this.renderer = new Renderer(this.targetPixelSize, rendererDimensions);

    this.logicDimensions = MiniSnake.calculateLogicDimensions(
      rendererDimensions,
      this.targetPixelSize
    );

    this.head = MiniSnake.generateRandomCoordinate({
      width: this.logicDimensions.width,
      height: this.logicDimensions.height,
    });
    this.body = Array.from({ length: this.startingLength }, () => ({
      x: this.head.x,
      y: this.head.y,
    }));
    this.food = MiniSnake.generateRandomCoordinate(
      {
        width: this.logicDimensions.width,
        height: this.logicDimensions.height,
      },
      { snake: [this.head] }
    );

    this.renderer.drawFood(this.food);

    playArea.appendChild(this.renderer.canvas);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  [Symbol.dispose](): void {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("keydown", this.onKeyDown);
  }

  get canvas() {
    return this.renderer.canvas;
  }

  public start() {
    this.onAnimationFrame(0);
  }

  private onAnimationFrame = (timestamp: number) => {
    requestAnimationFrame(this.onAnimationFrame);

    const delta = timestamp - this.lastFrameTime;
    if (delta < this.targetFrameDuration) {
      return;
    }
    this.lastFrameTime = timestamp - (delta % this.targetFrameDuration);
    this.update();
  };

  public static createFullScreenOverlay(): HTMLElement {
    const fullScreenElement = document.createElement("div");
    fullScreenElement.style.cssText =
      "position:fixed;top:0;left:0;pointer-events:none;width:100%;height:100%;";
    return fullScreenElement;
  }

  private static calculateRendererDimensions(
    playArea: HTMLElement
  ): Dimensions {
    return { width: playArea.clientWidth, height: playArea.clientHeight };
  }

  private static calculateLogicDimensions(
    rendererDimensions: Dimensions,
    targetPixelSize: number
  ): Dimensions {
    return {
      width: rendererDimensions.width / targetPixelSize - 1,
      height: rendererDimensions.height / targetPixelSize - 1,
    };
  }

  private onResize = () => {
    const rendererDimensions = MiniSnake.calculateRendererDimensions(
      this.playArea
    );
    const logicDimensions = MiniSnake.calculateLogicDimensions(
      rendererDimensions,
      this.targetPixelSize
    );

    this.renderer.dimensions = rendererDimensions;
    this.logicDimensions = logicDimensions;

    if (
      this.food.x < 0 ||
      this.food.x > this.logicDimensions.width ||
      this.food.y < 0 ||
      this.food.y > this.logicDimensions.height
    ) {
      this.food = MiniSnake.generateRandomCoordinate(this.logicDimensions, {
        snake: [this.head, ...this.body],
      });
    }

    this.renderer.drawFood(this.food);
    this.renderer.drawHead(this.head);
    for (const body of this.body) {
      this.renderer.drawBody(body);
    }
  };

  private onKeyDown = ({ key }: KeyboardEvent) => {
    const keyMap: Record<string, { x: number; y: number }> = {
      w: { x: 0, y: -Infinity },
      ArrowUp: { x: 0, y: -Infinity },
      a: { x: -Infinity, y: 0 },
      ArrowLeft: { x: -Infinity, y: 0 },
      s: { x: 0, y: Infinity },
      ArrowDown: { x: 0, y: Infinity },
      d: { x: Infinity, y: 0 },
      ArrowRight: { x: Infinity, y: 0 },
    };

    const velocity = keyMap[key];
    if (velocity) {
      this.setTarget(velocity);
    }
  };

  private onPointerMove = (pointerEvent: PointerEvent) => {
    this.setTarget({
      x: pointerEvent.x / this.targetPixelSize,
      y: pointerEvent.y / this.targetPixelSize,
    });
  };

  static checkForCollision(
    target: Coordinate,
    food?: Coordinate,
    snake?: Array<Coordinate>
  ): CollisionResult {
    if (food && target.x === food.x && target.y === food.y) {
      return CollisionResult.Food;
    }

    if (
      snake &&
      snake.some((body) => body.x === target.x && body.y === target.y)
    ) {
      return CollisionResult.Snake;
    }

    return CollisionResult.Nothing;
  }

  private static generateRandomCoordinate(
    within: Dimensions,
    avoids?: { food?: Coordinate; snake?: Coordinate[] }
  ): Coordinate {
    for (let i = 0; i < 20; i++) {
      const candidate = { x: randInt(within.width), y: randInt(within.height) };
      if (
        MiniSnake.checkForCollision(candidate, avoids?.food, avoids?.snake) ===
        CollisionResult.Nothing
      ) {
        return candidate;
      }
    }

    // Fallback (after 20 tries)
    return {
      x: randInt(within.width),
      y: randInt(within.height),
    };
  }

  private updateHead(
    position: Vector,
    currentMomentum: Vector,
    fuel: Vector,
    bounds: Dimensions
  ) {
    /// these first two if statements provide immediate feedback to the user (if, for example a mouse is move) by preferring the direction not currently moving in
    /// up or down and should go left or right
    if (currentMomentum.y != 0 && fuel.x != 0) {
      const direction = Math.sign(fuel.x);
      fuel.x -= direction;
      currentMomentum.y = 0;
      currentMomentum.x = direction;
      position.x += direction;
      /// left or right and should go up or down
    } else if (currentMomentum.x != 0 && fuel.y != 0) {
      const direction = Math.sign(fuel.y);
      fuel.y -= direction;
      currentMomentum.x = 0;
      currentMomentum.y = direction;
      position.y += direction;
      /// up or down and continues in that same direction
    } else if (
      (currentMomentum.y < 0 && fuel.y < 0) ||
      (currentMomentum.y > 0 && fuel.y > 0)
    ) {
      const direction = Math.sign(fuel.y);
      fuel.y -= direction;
      position.y += direction;
    } else if (
      (currentMomentum.x < 0 && fuel.x < 0) ||
      (currentMomentum.x > 0 && fuel.x > 0)
    ) {
      const direction = Math.sign(fuel.x);
      fuel.x -= direction;
      position.x += direction;
      // otherwise hold momentum
    } else {
      position.x += currentMomentum.x;
      position.y += currentMomentum.y;
    }

    // wrap around
    position.x = Math.floor((position.x + bounds.width) % bounds.width);
    position.y = Math.floor((position.y + bounds.height) % bounds.height);
  }

  update() {
    this.renderer.clear(this.head);

    this.body.unshift({ x: this.head.x, y: this.head.y });
    const bodyRemoved = this.body.pop();
    if (bodyRemoved !== undefined) {
      this.renderer.clear(bodyRemoved);
    }

    const nextFuel = this.fuelQueue.shift();
    if (nextFuel !== undefined) {
      this.fuel = { x: nextFuel.x, y: nextFuel.y };
      this.fuelPrevious = { x: nextFuel.x, y: nextFuel.y };
    }

    if (this.fuel.x === 0 && this.fuel.y === 0) {
      this.fuel.x = this.fuelPrevious.x;
      this.fuel.y = this.fuelPrevious.y;
    }

    this.updateHead(
      this.head,
      this.currentMomentum,
      this.fuel,
      this.logicDimensions
    );

    const collision = MiniSnake.checkForCollision(
      this.head,
      this.food,
      this.body
    );
    if (collision === CollisionResult.Food) {
      this.addLength(1);
      this.food = MiniSnake.generateRandomCoordinate(
        {
          width: this.logicDimensions.width,
          height: this.logicDimensions.height,
        },
        { food: this.food, snake: [this.head, ...this.body] }
      );
      this.renderer.drawFood(this.food);
    } else if (collision === CollisionResult.Snake) {
      this.reset();
    }

    this.renderer.drawHead(this.head);

    const bodyStart = this.body[0];
    if (bodyStart !== undefined) {
      this.renderer.drawBody(bodyStart);
    }
  }

  public addLength(amount: number) {
    if (amount > 0) {
      const lastBody = this.body[this.body.length - 1];
      const x = lastBody !== undefined ? lastBody.x : this.head.x;
      const y = lastBody !== undefined ? lastBody.y : this.head.y;

      for (let i = 0; i < amount; i++) {
        this.body.push({ x, y });
      }
    } else if (amount < 0) {
      for (let i = amount; i < 0; i++) {
        this.body.pop();
      }
    }
  }

  public setTarget = (target: Coordinate) => {
    const dx = target.x - this.head.x;
    const dy = target.y - this.head.y;

    const velocity = normalizeVelocity({ x: dx, y: dy }, 5);

    if (velocity === undefined) {
      return;
    }
    if (this.fuelQueue.length < 3) {
      this.fuelQueue.push(velocity);
    } else {
      this.fuelQueue[3] = velocity;
    }
  };

  reset() {
    this.renderer.clear(this.head);
    for (const body of this.body) {
      this.renderer.clear(body);
    }

    this.addLength(0 - this.body.length);
    this.head = MiniSnake.generateRandomCoordinate({
      width: this.logicDimensions.width,
      height: this.logicDimensions.height,
    });

    this.addLength(this.startingLength);
  }
}

export function normalizeVelocity(velocity: Velocity, constant: number) {
  if (
    (velocity.x === Infinity || velocity.x === -Infinity) &&
    (velocity.y === Infinity || velocity.y === -Infinity)
  ) {
    return undefined;
  }

  if (velocity.x === Infinity) {
    return { x: constant, y: 0 };
  } else if (velocity.x === -Infinity) {
    return { x: -constant, y: 0 };
  } else if (velocity.y === Infinity) {
    return { x: 0, y: constant };
  } else if (velocity.y === -Infinity) {
    return { x: 0, y: -constant };
  }

  const magnitude = Math.hypot(velocity.x, velocity.y);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: Math.floor((velocity.x / magnitude) * constant),
    y: Math.floor((velocity.y / magnitude) * constant),
  };
}

const randInt = (max: number) => {
  return Math.floor(Math.random() * max);
};
