import type { Coordinate, SnakeBody, Velocity } from "./Logic";

export class Interaction implements Disposable {
  snakeHead: SnakeBody;
  onVelocityChange: (velocity: Velocity) => unknown;
  onTargetChange: (target: Coordinate) => unknown;

  constructor(
    snakeHead: SnakeBody,
    onVelocityChange: (velocity: Velocity) => unknown,
    onTargetChange: (target: Coordinate) => unknown
  ) {
    this.snakeHead = snakeHead;
    this.onVelocityChange = onVelocityChange;
    this.onTargetChange = onTargetChange;


  }

  [Symbol.dispose](): void {

  }


}
