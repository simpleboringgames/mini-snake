/* eslint-disable @typescript-eslint/no-unused-vars */
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
export enum Direction {
  Up,
  Left,
  Down,
  Right,
}
enum CollisionResult {
  Nothing,
  Snake,
  Food,
}

export class Renderable<T> {
  old: T;
  currrent: T;

  constructor(value: T) {
    this.old = value;
    this.currrent = value;
  }

  public listener: ((old: T, current: T) => void) | undefined;
}

export class Logic {
  private config: Config;

  head: Vector;
  food: Vector;
  bodies: Array<Vector>;

  fuelQueue: Array<Vector> = [];
  fuel: Vector = { x: 0, y: 0 };
  fuelPrevious: Vector = this.fuel;
  currentMomentum: Vector = { x: 1, y: 0 };

  constructor(config: Config) {
    this.config = config;

    this.head = Logic.generateRandomCoordinate({
      width: this.config.dimensions.width,
      height: this.config.dimensions.height,
    });
    this.bodies = Array.from({ length: this.config.startingLength }, () => ({
      x: this.head.x,
      y: this.head.y,
    }));
    this.food = Logic.generateRandomCoordinate(
      {
        width: this.config.dimensions.width,
        height: this.config.dimensions.height,
      },
      { snake: [this.head] }
    );
  }

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
        Logic.checkForCollision(candidate, avoids?.food, avoids?.snake) ===
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

  set dimensions(dimensions: Dimensions) {
    this.config.dimensions = dimensions;

    if (
      this.food.x < 0 ||
      this.food.x > this.config.dimensions.width ||
      this.food.y < 0 ||
      this.food.y > this.config.dimensions.height
    ) {
      this.food = Logic.generateRandomCoordinate(this.config.dimensions, {
        snake: [this.head, ...this.bodies],
      });
    }
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
    position.x = (position.x + bounds.width) % bounds.width;
    position.y = (position.y + bounds.height) % bounds.height;
  }

  update(this: Logic) {
    const bodyStart = { x: this.head.x, y: this.head.y };
    this.bodies.unshift(bodyStart);
    const bodyRemoved = this.bodies.pop();

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
      this.config.dimensions
    );

    // const collision = Logic.checkForCollision(
    //   this.head,
    //   this.food,
    //   this.bodies
    // );
    // if (collision === CollisionResult.Food) {
    //   this.addLength(1);
    //   this.food = Logic.generateRandomCoordinate(
    //     {
    //       width: this.config.dimensions.width,
    //       height: this.config.dimensions.height,
    //     },
    //     { food: this.food, snake: [this.head, ...this.bodies] }
    //   );
    // } else if (collision === CollisionResult.Snake) {
    //   this.reset();
    // }

    return {
      head: {
        x: this.head.x,
        y: this.head.y,
      },
      bodyStart,
      bodyRemoved,
    };
  }

  public addLength(this: Logic, amount: number) {
    if (amount > 0) {
      const lastBody = this.bodies[this.bodies.length - 1];
      const x = lastBody !== undefined ? lastBody.x : this.head.x;
      const y = lastBody !== undefined ? lastBody.y : this.head.y;

      for (let i = 0; i < amount; i++) {
        this.bodies.push({ x, y });
      }
    } else if (amount < 0) {
      for (let i = amount; i < 0; i++) {
        this.bodies.pop();
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

  reset(this: Logic) {
    this.addLength(0 - this.bodies.length);
    this.head = Logic.generateRandomCoordinate({
      width: this.config.dimensions.width,
      height: this.config.dimensions.height,
    });
    this.addLength(this.config.startingLength);
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
