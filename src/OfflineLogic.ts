export type Coordinate = { x: number; y: number; };
export type Config = { width: number; height: number; startingLength: number }
export type SnakeBody = Coordinate;
export type Food = Coordinate;
export type Velocity = { x: number; y: number };
export type AlteredPieces = { head: Coordinate; bodyAdded: Array<Coordinate>; bodyRemoved: Array<Coordinate>; };
export enum Direction { Up, Left, Down, Right, }
enum Input { Target, Velocity, }
enum CollisionResult { Nothing, Snake, Food, }

export class OfflineLogic {
  private config: Config;

  head: SnakeBody;
  exactHead: Coordinate;
  bodies: Array<SnakeBody>;
  food: Food;

  lastInput: Input;

  velocity: Velocity | undefined;
  nextVelocity: Velocity | undefined;
  nextNextVelocity: Velocity | undefined;

  target: Coordinate | undefined;

  currentDirection: Direction;

  updatesSinceLastTurn: number;

  constructor(config: Config) {
    this.config = config;

    this.head = OfflineLogic.generateRandomCoordinate({ width: this.config.width, height: this.config.height });
    this.exactHead = { x: this.head.x, y: this.head.y }
    this.bodies = Array.from({ length: this.config.startingLength }, () => ({ x: this.head.x, y: this.head.y }));
    this.food = OfflineLogic.generateRandomCoordinate({ width: this.config.width, height: this.config.height }, { snake: [this.head] });
    this.lastInput = Input.Velocity;
    this.currentDirection = Direction.Up;
    this.updatesSinceLastTurn = 0;
  }

  static checkForCollision(target: Coordinate, food?: Coordinate, snake?: Array<Coordinate>): CollisionResult {
    if (food && target.x === food.x && target.y === food.y) {
      return CollisionResult.Food;
    }

    if (snake && snake.some(snakeBody => snakeBody.x === target.x && snakeBody.y === target.y)) {
      return CollisionResult.Snake;
    }

    return CollisionResult.Nothing;
  };

  static generateRandomCoordinate(upperBounds: { width: number, height: number }, avoids?: { food?: Coordinate, snake?: Array<Coordinate> }): Coordinate {
    let randomCoordinate = { x: randInt(upperBounds.width), y: randInt(upperBounds.height), };

    for (let i = 0; i < 20; i++) {
      if (OfflineLogic.checkForCollision(randomCoordinate, avoids?.food, avoids?.snake) === CollisionResult.Nothing) {
        break;
      }

      randomCoordinate = { x: randInt(upperBounds.width), y: randInt(upperBounds.height), };
    }

    return randomCoordinate;
  }

  setWidthAndHeight(this: OfflineLogic, width: number, height: number) {
    this.config.width = width;
    this.config.height = height;

    if (this.food.x < 0 || this.food.x > this.config.width || this.food.y < 0 || this.food.y > this.config.height) {
      this.food = OfflineLogic.generateRandomCoordinate({ width: this.config.width, height: this.config.height }, { snake: [this.head, ...this.bodies] });
    }
  };

  setDirection(this: OfflineLogic, newDirection: Direction) {
    const oppositeDirections = {
      [Direction.Up]: Direction.Down,
      [Direction.Down]: Direction.Up,
      [Direction.Left]: Direction.Right,
      [Direction.Right]: Direction.Left,
    };

    const isTurn =
      newDirection !== this.currentDirection &&
      newDirection !== oppositeDirections[this.currentDirection];

    if (isTurn) {
      if (this.lastInput === Input.Target && this.updatesSinceLastTurn < 2) {
        return;
      }

      this.currentDirection = newDirection;
      this.updatesSinceLastTurn = 0;
    }
  };

  setDirectionFromVelocity(this: OfflineLogic) {
    const vx = this.exactHead.x - this.head.x;
    const vy = this.exactHead.y - this.head.y;

    if (vx === 0 && vy === 0) return;

    const angle = Math.atan2(vy, vx);

    if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
      this.setDirection(Direction.Right);
    } else if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
      this.setDirection(Direction.Down);
    } else if (angle >= -(3 * Math.PI) / 4 && angle < -Math.PI / 4) {
      this.setDirection(Direction.Up);
    } else {
      this.setDirection(Direction.Left);
    }
  };

  applyVelocity(this: OfflineLogic, velocity: Velocity) {
    if (
      this.velocity === undefined ||
      this.velocity.x !== velocity.x ||
      this.velocity.y !== velocity.y
    ) {
      this.exactHead.x = this.head.x;
      this.exactHead.y = this.head.y;

      this.velocity = velocity;
    }
  };

  update(this: OfflineLogic) {
    if (this.nextVelocity !== undefined) {
      this.lastInput = Input.Velocity;
      this.applyVelocity(this.nextVelocity);
      this.nextVelocity = this.nextNextVelocity;
      this.nextNextVelocity = undefined;
    }

    if (this.lastInput === Input.Velocity && this.velocity !== undefined) {
      this.exactHead.x += this.velocity.x;
      this.exactHead.y += this.velocity.y;
    }

    this.setDirectionFromVelocity();

    this.bodies.unshift({ x: this.head.x, y: this.head.y });
    this.bodies.pop();

    if (this.currentDirection === Direction.Up) {
      this.head.y -= 1;
    } else if (this.currentDirection === Direction.Left) {
      this.head.x -= 1;
    } else if (this.currentDirection === Direction.Down) {
      this.head.y += 1;
    } else if (this.currentDirection === Direction.Right) {
      this.head.x += 1;
    }

    let wrappedAround = false;

    if (this.head.x < 0) {
      this.head.x = Math.floor(this.config.width);
      wrappedAround = true;
    } else if (this.head.x > this.config.width) {
      this.head.x = 0;
      wrappedAround = true;
    }

    if (this.head.y < 0) {
      this.head.y = Math.floor(this.config.height);
      wrappedAround = true;
    } else if (this.head.y > this.config.height) {
      this.head.y = 0;
      wrappedAround = true;
    }

    if (wrappedAround) {
      this.exactHead.x = this.head.x;
      this.exactHead.y = this.head.y;
    }

    const collision = OfflineLogic.checkForCollision(this.head, this.food, this.bodies);
    if (collision === CollisionResult.Food) {
      this.addLength(1);
      this.food = OfflineLogic.generateRandomCoordinate({ width: this.config.width, height: this.config.height }, { food: this.food, snake: [this.head, ...this.bodies] });
    } else if (collision === CollisionResult.Snake) {
      this.reset();
    }

    this.updatesSinceLastTurn += 1;
  };

  public addLength(this: OfflineLogic, amount: number) {
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
  };

  public setVelocity = (velocity: Velocity) => {
    if (velocity.x === 0 && velocity.y === 0) {
      return;
    }

    const normalizedVelocity = normalizeVelocity(velocity, 1);

    if (this.nextVelocity === undefined) {
      this.nextVelocity = normalizedVelocity;
    } else {
      this.nextNextVelocity = normalizedVelocity;
    }
  };

  public setTarget = (target: Coordinate) => {
    this.lastInput = Input.Target;

    this.exactHead.x = target.x;
    this.exactHead.y = target.y;
  };

  reset(this: OfflineLogic) {
    this.addLength(0 - this.bodies.length);
    this.head = OfflineLogic.generateRandomCoordinate({ width: this.config.width, height: this.config.height });
    this.addLength(this.config.startingLength);
  }
}

export function normalizeVelocity(velocity: Velocity, constant: number) {
  const magnitude = Math.hypot(velocity.x, velocity.y);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  const desiredSpeed = constant;
  return {
    x: (velocity.x / magnitude) * desiredSpeed,
    y: (velocity.y / magnitude) * desiredSpeed,
  };
}

const randInt = (max: number) => {
  return Math.floor(Math.random() * max);
};
