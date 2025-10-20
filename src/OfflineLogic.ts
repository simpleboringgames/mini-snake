export const DEFAULT_GRID_SIZE = 20;
export const DEFAULT_STARTING_LENGTH = 10;

export type Coordinate = {
  x: number;
  y: number;
};

export type Config = {
  width: number;
  height: number;
  gridSize: number;
  startingLength: number
}

export type SnakeBody = Coordinate;
export type Food = Coordinate;

export type Velocity = { x: number; y: number };

export type AlteredPieces = {
  head: Coordinate;
  bodyAdded: Array<Coordinate>;
  bodyRemoved: Array<Coordinate>;
};

enum Direction {
  Up,
  Left,
  Down,
  Right,
}

enum Input {
  Target,
  Velocity,
}

enum CollisionResult {
  Nothing,
  Self,
  NormalFood,
  SpecialFood,
  PoisonFood,
}

export class OfflineLogic {
  exactHead: Coordinate;
  head: SnakeBody;
  bodies: Array<SnakeBody>;
  normalfood: Food;

  lastInput: Input = Input.Velocity;

  nextVelocity: Velocity | undefined;
  nextNextVelocity: Velocity | undefined;

  velocity: Velocity | undefined;
  target: Coordinate | undefined;

  currentDirection: Direction = Direction.Right;

  private width: number;
  private height: number;
  private gridSize: number;
  private startingLength: number;

  updatesSinceLastTurn: number = 0;

  constructor(config: Partial<Config>) {
    this.width = config.width ?? window.innerWidth;
    this.height = config.height ?? window.innerHeight;
    this.gridSize = config.gridSize ?? DEFAULT_GRID_SIZE;
    this.startingLength = config.startingLength ?? DEFAULT_STARTING_LENGTH;

    this.velocity = this.generateRandomVelocity();

    this.head = this.generateRandomCoordinate(this.width, this.height);
    this.exactHead = { x: this.head.x, y: this.head.y };
    this.normalfood = this.generateRandomCoordinate(this.width, this.height);

    this.bodies = Array.from({ length: this.startingLength }, () => ({
      x: this.head.x,
      y: this.head.y,
    }));
  }

  public setWidthAndHeight = (width: number, height: number) => {
    this.width = width;
    this.height = height;

    this.normalfood = this.calculateNewFoodPosition(this.normalfood);
  };

  private setDirection = (newDirection: Direction) => {
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

  private setDirectionFromVelocity = () => {
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

  private applyVelocity = (velocity: Velocity) => {
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

  private calculateNewFoodPosition = (value: Coordinate): Coordinate => {
    if (
      value.x < 0 ||
      value.x > this.width ||
      value.y < 0 ||
      value.y > this.height
    ) {
      return this.generateRandomCoordinate(this.width, this.height);
    }

    return value;
  };

  public update = () => {
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
      this.head.y -= this.gridSize;
    } else if (this.currentDirection === Direction.Left) {
      this.head.x -= this.gridSize;
    } else if (this.currentDirection === Direction.Down) {
      this.head.y += this.gridSize;
    } else if (this.currentDirection === Direction.Right) {
      this.head.x += this.gridSize;
    }

    let wrappedAround = false;

    if (this.head.x < 0) {
      this.head.x = this.floorToGrid(this.width);
      wrappedAround = true;
    } else if (this.head.x > this.width) {
      this.head.x = 0;
      wrappedAround = true;
    }

    if (this.head.y < 0) {
      this.head.y = this.floorToGrid(this.height);
      wrappedAround = true;
    } else if (this.head.y > this.height) {
      this.head.y = 0;
      wrappedAround = true;
    }

    if (wrappedAround) {
      this.exactHead.x = this.head.x;
      this.exactHead.y = this.head.y;
    }

    const collision = this.checkForCollision(this.head);
    if (collision === CollisionResult.NormalFood) {
      this.addLength(1);
      this.normalfood = this.generateRandomCoordinate(this.width, this.height);
    } else if (collision === CollisionResult.Self) {
      this.reset();
    }

    this.updatesSinceLastTurn += 1;
  };

  private addLength = (amount: number) => {
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

  private reset = () => {
    this.addLength(0 - this.bodies.length);
    this.head = this.generateRandomCoordinate(this.width, this.height);
    this.addLength(this.startingLength);
  }

  public checkForCollision = (coordinate: Coordinate): CollisionResult => {
    if (this.normalfood && // TODO: is there a way in typescript to avoid calling this function when it can be undefined?
      coordinate.x === this.normalfood.x &&
      coordinate.y === this.normalfood.y
    ) {
      return CollisionResult.NormalFood;
    }

    if (this.bodies?.some(body => body.x === coordinate.x && body.y === coordinate.y)) {
      console.log("self collide");
      return CollisionResult.Self;
    }

    return CollisionResult.Nothing;
  };

  public setTarget = (target: Coordinate) => {
    this.lastInput = Input.Target;

    this.exactHead.x = target.x;
    this.exactHead.y = target.y;
  };

  public setVelocity = (velocity: Velocity) => {
    if (velocity.x === 0 && velocity.y === 0) {
      return;
    }

    const normalizedVelocity = normalizeVelocity(velocity, this.gridSize);

    if (this.nextVelocity === undefined) {
      this.nextVelocity = normalizedVelocity;
    } else {
      this.nextNextVelocity = normalizedVelocity;
    }
  };

  private generateRandomVelocity(): Velocity {
    return normalizeVelocity({ x: 0.0, y: 1.0 }, this.gridSize);
  }

  private floorToGrid = (pixel: number) => {
    return Math.floor(pixel / this.gridSize) * this.gridSize;
  }

  private generateRandomCoordinate(width: number, height: number): Coordinate {
    const randInt = (max: number) => {
      return Math.floor(Math.random() * max);
    };

    const generateUncheckedRandomCoordinate = (): Coordinate => {
      return {
        x: this.floorToGrid(randInt(width)),
        y: this.floorToGrid(randInt(height)),
      }
    }

    let randomCoordinate = generateUncheckedRandomCoordinate();

    for (let i = 0; i < 20; i++) {
      if (this.checkForCollision(randomCoordinate) === CollisionResult.Nothing) {
        break;
      }

      randomCoordinate = generateUncheckedRandomCoordinate();
    }

    return randomCoordinate;
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

// TODO: random coordinate calculate avoid tiles with stuff in it