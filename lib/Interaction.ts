import type { Coordinate, SnakeBody, Velocity } from "./OfflineLogic";

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

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  [Symbol.dispose](): void {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("keydown", this.onKeyDown);
  }

  private onKeyDown = (keydown: KeyboardEvent) => {
    const keyMap: Record<string, { x: number; y: number }> = {
      w: { x: 0, y: -1 },
      ArrowUp: { x: 0, y: -1 },
      a: { x: -1, y: 0 },
      ArrowLeft: { x: -1, y: 0 },
      s: { x: 0, y: 1 },
      ArrowDown: { x: 0, y: 1 },
      d: { x: 1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    const velocity = keyMap[keydown.key];
    if (velocity) {
      this.onVelocityChange(velocity);
    }
  };

  private onPointerMove = (pointerEvent: PointerEvent) => {
    this.onTargetChange({ x: pointerEvent.x, y: pointerEvent.y });
  };
}
