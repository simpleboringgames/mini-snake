import { expect, test } from "vitest";
import { normalizeVelocity } from "./OfflineLogic";

test("normalize velocity fixes the magnitude", () => {
  const speed = 5;
  const originalVelocity = { x: 2, y: 6 };
  const normalizedVelocity = normalizeVelocity(originalVelocity, speed);
  const magnitude = Math.round(
    Math.hypot(normalizedVelocity.x, normalizedVelocity.y)
  );
  expect(magnitude).toBe(speed);
});
