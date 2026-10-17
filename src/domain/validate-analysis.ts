import type { CircuitDocument } from "./document";
import { key, terminal } from "./document";
import { buildNetlist } from "./topology";
import { fail } from "./errors";
import type { TopologyResult } from "../engine/types";
export function validateAnalysis(d: CircuitDocument): TopologyResult {
  const topology = buildNetlist(d);
  if (!topology.ok) return topology;
  if (!d.components.length) return fail("EMPTY_CIRCUIT");
  if (!d.grounds.length) return fail("MISSING_GROUND");
  const attached = new Set(d.wires.flatMap((w) => [key(w.from), key(w.to)]));
  const required = [
    ...d.components.flatMap((c) => [
      key(terminal(c.id, "a")),
      key(terminal(c.id, "b")),
    ]),
    ...d.grounds.map((g) => key({ kind: "ground", ownerId: g.id })),
  ];
  const missing = required.filter((a) => !attached.has(a));
  if (missing.length) return fail("OPEN_TERMINAL", { endpointIds: missing });
  const n = topology.netlist;
  const reached = new Set(["0"]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const b of [...n.resistors, ...n.voltageSources]) {
      if (reached.has(b.aNode) && !reached.has(b.bNode)) {
        reached.add(b.bNode);
        changed = true;
      }
      if (reached.has(b.bNode) && !reached.has(b.aNode)) {
        reached.add(b.aNode);
        changed = true;
      }
    }
  }
  const floating = n.nodes.filter((v) => !reached.has(v));
  if (floating.length) return fail("FLOATING_CIRCUIT", { nodeIds: floating });
  return topology;
}
