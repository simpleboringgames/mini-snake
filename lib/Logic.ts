export type Coordinate = { x: number; y: number; };
export type Dimensions = { width: number; height: number };
export type Config = { dimensions: Dimensions; startingLength: number }
export type SnakeBody = Coordinate;
export type Food = Coordinate;
export type Velocity = { x: number; y: number };
export type AlteredPieces = { head: Coordinate, bodyStart: Coordinate | undefined, bodyRemoved: Coordinate | undefined };
export enum Direction { Up, Left, Down, Right, }
enum Input { Target, Velocity, }
enum CollisionResult { Nothing, Snake, Food, }

export class Logic {
  private config: Config;

  head: SnakeBody;
  food: Food;
  exactHead: Coordinate;
  bodies: Array<SnakeBody>;

  lastInput: Input;

  nextVelocity: Velocity | undefined;
  nextNextVelocity: Velocity | undefined;

  target: Coordinate | undefined;

  currentDirection: Direction = Logic.randomDirection();
  velocity: Velocity = Logic.directionToVelocity(this.currentDirection);

  updatesSinceLastTurn: number;

  constructor(config: Config) {
    this.config = config;

    this.head = Logic.generateRandomCoordinate({ width: this.config.dimensions.width, height: this.config.dimensions.height });
    this.exactHead = { x: this.head.x, y: this.head.y }
    this.bodies = Array.from({ length: this.config.startingLength }, () => ({ x: this.head.x, y: this.head.y }));
    this.food = Logic.generateRandomCoordinate({ width: this.config.dimensions.width, height: this.config.dimensions.height }, { snake: [this.head] });
    this.lastInput = Input.Velocity;
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

  private static generateRandomCoordinate(within: Dimensions, avoids?: { food?: Coordinate, snake?: Array<Coordinate> }): Coordinate {
    let randomCoordinate = { x: randInt(within.width), y: randInt(within.height), };

    for (let i = 0; i < 20; i++) {
      if (Logic.checkForCollision(randomCoordinate, avoids?.food, avoids?.snake) === CollisionResult.Nothing) {
        break;
      }

      randomCoordinate = { x: randInt(within.width), y: randInt(within.height), };
    }

    return randomCoordinate;
  }

  set dimensions(dimensions: Dimensions) {
    this.config.dimensions = dimensions;

    if (this.food.x < 0 || this.food.x > this.config.dimensions.width || this.food.y < 0 || this.food.y > this.config.dimensions.height) {
      this.food = Logic.generateRandomCoordinate(this.config.dimensions, { snake: [this.head, ...this.bodies] });
    }
  }
  setWidthAndHeight(this: Logic, width: number, height: number) {
    this.config.dimensions.width = width;
    this.config.dimensions.height = height;
  };

  setDirection(this: Logic, newDirection: Direction) {
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

  setDirectionFromVelocity(this: Logic) {
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

  applyVelocity(this: Logic, velocity: Velocity) {
    if (
      this.velocity.x !== velocity.x ||
      this.velocity.y !== velocity.y
    ) {
      this.exactHead.x = this.head.x;
      this.exactHead.y = this.head.y;

      this.velocity = velocity;
    }
  };

  update(this: Logic) : AlteredPieces {
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

    const bodyStart = { x: this.head.x, y: this.head.y };
    this.bodies.unshift(bodyStart);
    const bodyRemoved = this.bodies.pop();

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
      this.head.x = Math.floor(this.config.dimensions.width);
      wrappedAround = true;
    } else if (this.head.x > this.config.dimensions.width) {
      this.head.x = 0;
      wrappedAround = true;
    }

    if (this.head.y < 0) {
      this.head.y = Math.floor(this.config.dimensions.height);
      wrappedAround = true;
    } else if (this.head.y > this.config.dimensions.height) {
      this.head.y = 0;
      wrappedAround = true;
    }

    if (wrappedAround) {
      this.exactHead.x = this.head.x;
      this.exactHead.y = this.head.y;
    }

    const collision = Logic.checkForCollision(this.head, this.food, this.bodies);
    if (collision === CollisionResult.Food) {
      this.addLength(1);
      this.food = Logic.generateRandomCoordinate({ width: this.config.dimensions.width, height: this.config.dimensions.height }, { food: this.food, snake: [this.head, ...this.bodies] });
    } else if (collision === CollisionResult.Snake) {
      this.reset();
    }

    this.updatesSinceLastTurn += 1;

    return {
      head: {
        x: this.head.x,
        y: this.head.y
      },
      bodyStart,
      bodyRemoved
    }
  };

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
  };

  static directionToVelocity(direction: Direction): Velocity {
    switch (direction) {
      case Direction.Up:
        return { x: 0, y: -1 };
      case Direction.Down:
        return { x: 0, y: 1 };
      case Direction.Left:
        return { x: -1, y: 0 };
      case Direction.Right:
        return { x: 1, y: 0 };
    }
  }

  static randomDirection(): Direction {
    const directions: Direction[] = [
      Direction.Up,
      Direction.Down,
      Direction.Left,
      Direction.Right,
    ];

    const randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex]!;
  }

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

  reset(this: Logic) {
    this.addLength(0 - this.bodies.length);
    this.head = Logic.generateRandomCoordinate({ width: this.config.dimensions.width, height: this.config.dimensions.height });
    this.addLength(this.config.startingLength);
  }
}

export function normalizeVelocity(velocity: Velocity, constant: number) {
  const magnitude = Math.hypot(velocity.x, velocity.y);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: (velocity.x / magnitude) * constant,
    y: (velocity.y / magnitude) * constant,
  };
}

const randInt = (max: number) => {
  return Math.floor(Math.random() * max);
};
