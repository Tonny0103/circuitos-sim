import type { Netlist, Branch } from "../../../src/engine/types";
export const branch = (
  id: string,
  aNode: string,
  bNode: string,
  value: number,
): Branch => ({ id, aNode, bNode, value });
export const net = (
  resistors: Branch[],
  voltageSources: Branch[],
): Netlist => ({
  nodes: [
    ...new Set([
      "0",
      ...resistors.flatMap((r) => [r.aNode, r.bNode]),
      ...voltageSources.flatMap((s) => [s.aNode, s.bNode]),
    ]),
  ].sort(),
  groundNodeId: "0",
  resistors,
  voltageSources,
  endpointNodeMap: {},
});
export const fixtures = [
  {
    name: "Ohm: 10/1000",
    n: net([branch("r", "a", "0", 1000)], [branch("v", "a", "0", 10)]),
    voltages: { a: 10 },
    currents: { r: 0.01, v: -0.01 },
    powers: { r: 0.1, v: -0.1 },
  },
  {
    name: "Divisor: 10/(1000+1000)",
    n: net(
      [branch("r1", "a", "b", 1000), branch("r2", "b", "0", 1000)],
      [branch("v", "a", "0", 10)],
    ),
    voltages: { a: 10, b: 5 },
    currents: { r1: 0.005, r2: 0.005, v: -0.005 },
    powers: { r1: 0.025, r2: 0.025, v: -0.05 },
  },
  {
    name: "Paralelo: 12/1000 + 12/2000",
    n: net(
      [branch("r1", "a", "0", 1000), branch("r2", "a", "0", 2000)],
      [branch("v", "a", "0", 12)],
    ),
    voltages: { a: 12 },
    currents: { r1: 0.012, r2: 0.006, v: -0.018 },
    powers: { r1: 0.144, r2: 0.072, v: -0.216 },
  },
  {
    name: "Duas fontes: C=(10+5+0)/3",
    n: net(
      [
        branch("r1", "a", "c", 1000),
        branch("r2", "c", "b", 1000),
        branch("r3", "c", "0", 1000),
      ],
      [branch("v1", "a", "0", 10), branch("v2", "b", "0", 5)],
    ),
    voltages: { a: 10, b: 5, c: 5 },
    currents: { r1: 0.005, r2: 0, r3: 0.005, v1: -0.005, v2: 0 },
    powers: { r1: 0.025, r2: 0, r3: 0.025, v1: -0.05, v2: 0 },
  },
  {
    name: "Supernó: A+B=0, A-B=10",
    n: net(
      [branch("r1", "a", "0", 1000), branch("r2", "b", "0", 1000)],
      [branch("v", "a", "b", 10)],
    ),
    voltages: { a: 5, b: -5 },
    currents: { r1: 0.005, r2: -0.005, v: -0.005 },
    powers: { r1: 0.025, r2: 0.025, v: -0.05 },
  },
  {
    name: "Fonte negativa: -10/1000",
    n: net([branch("r", "a", "0", 1000)], [branch("v", "a", "0", -10)]),
    voltages: { a: -10 },
    currents: { r: -0.01, v: 0.01 },
    powers: { r: 0.1, v: -0.1 },
  },
  {
    name: "Fonte zero",
    n: net([branch("r", "a", "0", 1000)], [branch("v", "a", "0", 0)]),
    voltages: { a: 0 },
    currents: { r: 0, v: 0 },
    powers: { r: 0, v: 0 },
  },
];
