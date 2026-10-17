import { it, expect } from "vitest";
import { analyze } from "../../src/engine/analyze";
import { net, branch } from "./fixtures/analytical";
import { examples } from "../../src/examples/circuits";
import { analyzeDocument } from "../../src/editor/analysis";
import { terminal, type CircuitDocument } from "../../src/domain/document";

const mutations: [string, (d: CircuitDocument) => void][] = [
  [
    "EMPTY_CIRCUIT",
    (d) => {
      d.components = [];
      d.wires = [];
    },
  ],
  [
    "MISSING_GROUND",
    (d) => {
      d.grounds = [];
      d.wires = d.wires.filter(
        (w) => w.from.kind !== "ground" && w.to.kind !== "ground",
      );
    },
  ],
  [
    "OPEN_TERMINAL",
    (d) => {
      d.wires = d.wires.filter((w) => w.id !== "w0");
    },
  ],
  [
    "INVALID_VALUE",
    (d) => {
      d.components[1].valueSI = 0;
    },
  ],
  [
    "INVALID_VALUE",
    (d) => {
      d.components[1].valueSI = Infinity;
    },
  ],
  [
    "INVALID_DOCUMENT",
    (d) => {
      d.wires[0].to = terminal("nonexistent", "a");
    },
  ],
  [
    "FLOATING_CIRCUIT",
    (d) => {
      d.components.push(
        {
          id: "f1",
          label: "F1",
          kind: "resistor",
          valueSI: 1000,
          x: 0,
          y: 0,
          rotation: 0,
        },
        {
          id: "f2",
          label: "F2",
          kind: "resistor",
          valueSI: 1000,
          x: 0,
          y: 0,
          rotation: 0,
        },
      );
      d.wires.push(
        {
          id: "fw1",
          from: terminal("f1", "a"),
          to: terminal("f2", "a"),
          bends: [],
        },
        {
          id: "fw2",
          from: terminal("f1", "b"),
          to: terminal("f2", "b"),
          bends: [],
        },
      );
    },
  ],
];
it.each(mutations)("validação do documento: %s", (code, mutate) => {
  const d = structuredClone(examples[1].document);
  mutate(d);
  const r = analyzeDocument(d);
  expect(!r.ok && r.errors[0].code).toBe(code);
});
it.each([
  [
    "NON_UNIQUE_SOLUTION",
    net([], [branch("v1", "a", "0", 10), branch("v2", "a", "0", 10)]),
  ],
  [
    "INCONSISTENT_CONSTRAINTS",
    net([], [branch("v1", "a", "0", 10), branch("v2", "a", "0", 5)]),
  ],
  ["INCONSISTENT_CONSTRAINTS", net([], [branch("v", "0", "0", 10)])],
  ["NON_UNIQUE_SOLUTION", net([], [branch("v", "0", "0", 0)])],
] as const)("diagnóstico %s", (code, n) => {
  const r = analyze(n);
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.errors[0].code).toBe(code);
});
