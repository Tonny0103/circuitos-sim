import {
  emptyDocument,
  terminal,
  type CircuitDocument,
  type Endpoint,
} from "../domain/document";
function make(kind: "single" | "divider" | "parallel"): CircuitDocument {
  const d = emptyDocument("example-" + kind);
  d.components.push({
    id: "v1",
    kind: "voltageSource",
    label: "V1",
    valueSI: kind === "parallel" ? 12 : 10,
    x: 240,
    y: 280,
    rotation: 90,
  });
  d.grounds = [{ id: "g1", x: 240, y: 440, rotation: 0 }];
  d.components.push({
    id: "r1",
    kind: "resistor",
    label: "R1",
    valueSI: 1000,
    x: 500,
    y: 200,
    rotation: 0,
  });
  if (kind !== "single")
    d.components.push({
      id: "r2",
      kind: "resistor",
      label: "R2",
      valueSI: kind === "parallel" ? 2000 : 1000,
      x: 700,
      y: 340,
      rotation: 90,
    });
  const wire = (
    from: Endpoint,
    to: Endpoint,
    bends: { x: number; y: number }[] = [],
  ) => {
    d.wires.push({ id: "w" + d.wires.length, from, to, bends });
  };
  wire(terminal("v1", "a"), terminal("r1", "a"), [{ x: 240, y: 200 }]);
  wire(terminal("v1", "b"), { kind: "ground", ownerId: "g1" });
  if (kind === "single")
    wire(terminal("r1", "b"), { kind: "ground", ownerId: "g1" }, [
      { x: 700, y: 200 },
      { x: 700, y: 440 },
    ]);
  else if (kind === "divider") {
    wire(terminal("r1", "b"), terminal("r2", "a"), [{ x: 700, y: 200 }]);
    wire(terminal("r2", "b"), { kind: "ground", ownerId: "g1" }, [
      { x: 700, y: 440 },
    ]);
  } else {
    wire(terminal("r1", "a"), terminal("r2", "a"), [
      { x: 400, y: 120 },
      { x: 700, y: 120 },
    ]);
    wire(terminal("r1", "b"), { kind: "ground", ownerId: "g1" }, [
      { x: 620, y: 440 },
    ]);
    wire(terminal("r2", "b"), { kind: "ground", ownerId: "g1" }, [
      { x: 700, y: 440 },
    ]);
  }
  return d;
}
export const examples = [
  {
    title: "Lei de Ohm",
    document: make("single"),
    explanation:
      "V = R·I. Com 10 V e 1 kΩ: I = 10 mA, P = V·I = 100 mW. A fonte fornece 100 mW.",
  },
  {
    title: "Divisor de tensão",
    document: make("divider"),
    explanation:
      "I = 10 V / (1 kΩ + 1 kΩ) = 5 mA. Cada resistor tem 5 V e absorve 25 mW. O nó intermediário está em 5 V. A fonte fornece 50 mW.",
  },
  {
    title: "Resistores em paralelo",
    document: make("parallel"),
    explanation:
      "Os dois resistores têm 12 V. I1 = 12 mA e I2 = 6 mA; a fonte fornece 18 mA e 216 mW. P1 = 144 mW e P2 = 72 mW.",
  },
];
