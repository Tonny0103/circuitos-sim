import { it, expect } from "vitest";
import { stamp } from "../../src/engine/mna";
import { net, branch } from "./fixtures/analytical";
it("stamps preservam sinais e eliminam terra", () => {
  const s = stamp(
    net([branch("r", "a", "0", 1000)], [branch("v", "a", "0", 10)]),
  );
  expect(s.a).toEqual([
    [0.001, 1],
    [1, 0],
  ]);
  expect(s.b).toEqual([0, 10]);
});
it("resistor curto não acrescenta condutância", () => {
  const s = stamp(
    net([branch("r", "a", "a", 1000)], [branch("v", "a", "0", 10)]),
  );
  expect(s.a).toEqual([
    [0, 1],
    [1, 0],
  ]);
});
