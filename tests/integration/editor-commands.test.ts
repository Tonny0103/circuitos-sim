import { it, expect } from "vitest";
import { edit, connect, splitWire } from "../../src/editor/commands";
import { emptyDocument, terminal } from "../../src/domain/document";
it("preserva terminais ao mover/girar e elimina só fios incidentes", () => {
  let d = emptyDocument();
  d = edit(d, { type: "add", kind: "resistor", id: "r" });
  d = edit(d, { type: "add", kind: "ground", id: "g" });
  d = connect(d, terminal("r", "a"), { kind: "ground", ownerId: "g" }, "w");
  const endpoints = JSON.stringify(d.wires);
  d = edit(d, { type: "rotate", id: "r" });
  d = edit(d, { type: "move", id: "r", x: 400, y: 400 });
  expect(JSON.stringify(d.wires)).toBe(endpoints);
  expect(d.components[0].rotation).toBe(90);
  d = edit(d, { type: "delete", id: "r" });
  expect(d.wires).toHaveLength(0);
  expect(d.components).toHaveLength(0);
});
it("junção divide fio explicitamente", () => {
  let d = emptyDocument();
  d = edit(d, { type: "add", kind: "resistor", id: "r" });
  d = edit(d, { type: "add", kind: "ground", id: "g" });
  d = connect(d, terminal("r", "a"), { kind: "ground", ownerId: "g" }, "w");
  d = splitWire(d, "w", { x: 100, y: 100 }, "j");
  expect(d.junctions).toHaveLength(1);
  expect(d.wires).toHaveLength(2);
  expect(
    d.wires.every((w) => w.from.ownerId === "j" || w.to.ownerId === "j"),
  ).toBe(true);
});
