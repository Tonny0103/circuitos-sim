import {
  emptyDocument,
  terminal,
  type Endpoint,
  type CircuitDocument,
} from "../../src/domain/document";
// Source + 49 equal resistors in series: I=10/49000 A, each drop=10/49 V.
export function scaleCircuit(): CircuitDocument {
  const d = emptyDocument("scale-50");
  d.grounds = [{ id: "g", x: 100, y: 580, rotation: 0 }];
  d.components = [
    {
      id: "v",
      kind: "voltageSource",
      label: "V1",
      valueSI: 10,
      x: 100,
      y: 100,
      rotation: 90,
    },
    ...Array.from({ length: 49 }, (_, i) => ({
      id: "r" + i,
      kind: "resistor" as const,
      label: "R" + i,
      valueSI: 1000,
      x: 200 + (i % 7) * 100,
      y: 100 + Math.floor(i / 7) * 70,
      rotation: 0 as const,
    })),
  ];
  const add = (from: Endpoint, to: Endpoint) =>
    d.wires.push({ id: "w" + d.wires.length, from, to, bends: [] });
  add(terminal("v", "a"), terminal("r0", "a"));
  for (let i = 0; i < 48; i++)
    add(terminal("r" + i, "b"), terminal("r" + (i + 1), "a"));
  add(terminal("r48", "b"), { kind: "ground", ownerId: "g" });
  add(terminal("v", "b"), { kind: "ground", ownerId: "g" });
  return d;
}
