import { key, terminal, type CircuitDocument } from "./document";
import { validateDocument } from "./schema";
import { LIMITS } from "./limits";
import { fail } from "./errors";
import type { TopologyResult } from "../engine/types";
export function buildNetlist(input: CircuitDocument): TopologyResult {
  const checked = validateDocument(input);
  if (!checked.ok) return checked;
  const d = checked.document;
  const anchors = [
    ...d.components.flatMap((c) => [
      key(terminal(c.id, "a")),
      key(terminal(c.id, "b")),
    ]),
    ...d.grounds.map((g) => key({ kind: "ground", ownerId: g.id })),
    ...d.junctions.map((j) => key({ kind: "junction", ownerId: j.id })),
  ].sort();
  const parents = new Map(anchors.map((a) => [a, a]));
  const root = (a: string): string => {
    let p = parents.get(a)!;
    while (p !== parents.get(p)) {
      p = parents.get(p)!;
    }
    parents.set(a, p);
    return p;
  };
  const join = (a: string, b: string) => {
    const x = root(a),
      y = root(b);
    if (x !== y) parents.set(x < y ? y : x, x < y ? x : y);
  };
  for (const w of d.wires) join(key(w.from), key(w.to));
  for (const g of d.grounds.slice(1))
    join(
      key({ kind: "ground", ownerId: g.id }),
      key({ kind: "ground", ownerId: d.grounds[0].id }),
    );
  const ground = d.grounds[0]
    ? root(key({ kind: "ground", ownerId: d.grounds[0].id }))
    : undefined;
  const endpointNodeMap: Record<string, string> = {};
  for (const a of anchors)
    endpointNodeMap[a] = root(a) === ground ? "0" : root(a);
  const resistor = d.components
    .filter((c) => c.kind === "resistor")
    .map((c) => ({
      id: c.id,
      aNode: endpointNodeMap[key(terminal(c.id, "a"))],
      bNode: endpointNodeMap[key(terminal(c.id, "b"))],
      value: c.valueSI,
    }));
  const source = d.components
    .filter((c) => c.kind === "voltageSource")
    .map((c) => ({
      id: c.id,
      aNode: endpointNodeMap[key(terminal(c.id, "a"))],
      bNode: endpointNodeMap[key(terminal(c.id, "b"))],
      value: c.valueSI,
    }));
  const nodes = [
    ...new Set([
      "0",
      ...resistor.flatMap((c) => [c.aNode, c.bNode]),
      ...source.flatMap((c) => [c.aNode, c.bNode]),
    ]),
  ].sort();
  if (nodes.length > LIMITS.nodes) return fail("LIMIT_EXCEEDED");
  return {
    ok: true,
    netlist: {
      nodes,
      groundNodeId: "0",
      resistors: resistor,
      voltageSources: source,
      endpointNodeMap,
    },
  };
}
