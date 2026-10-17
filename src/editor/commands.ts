import {
  type CircuitDocument,
  type Endpoint,
  type Point,
  key,
} from "../domain/document";
import { validateDocument } from "../domain/schema";
import { buildNetlist } from "../domain/topology";
export type Command =
  | { type: "add"; kind: "resistor" | "voltageSource" | "ground"; id: string }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "rotate" | "delete"; id: string }
  | { type: "value"; id: string; value: number };
function commit(before: CircuitDocument, after: CircuitDocument) {
  const valid = validateDocument(after);
  if (!valid.ok) throw Error(valid.errors[0].code);
  const topology = buildNetlist(after);
  if (!topology.ok) throw Error(topology.errors[0].code);
  return { ...valid.document, revision: before.revision + 1 };
}
export function edit(before: CircuitDocument, c: Command) {
  const d = structuredClone(before);
  const item = [...d.components, ...d.grounds, ...d.junctions].find(
    (v) => v.id === c.id,
  );
  if (c.type === "add") {
    const index = d.components.length;
    const prefix=c.kind==="resistor"?"R":"V";
    let labelIndex=1;
    while(d.components.some(component=>component.label===prefix+labelIndex))labelIndex++;
    const p = {
      id: c.id,
      x: 220 + (index % 4) * 160,
      y: 180 + Math.floor(index / 4) * 160,
      rotation: 0 as const,
    };
    if (c.kind === "ground") d.grounds.push({ ...p, x: 160, y: 420 });
    else
      d.components.push({
        ...p,
        kind: c.kind,
        label: prefix + labelIndex,
        valueSI: c.kind === "resistor" ? 1000 : 10,
      });
  } else if (c.type === "delete") {
    d.components = d.components.filter((v) => v.id !== c.id);
    d.grounds = d.grounds.filter((v) => v.id !== c.id);
    d.junctions = d.junctions.filter((v) => v.id !== c.id);
    d.wires = d.wires.filter(
      (w) => w.id !== c.id && w.from.ownerId !== c.id && w.to.ownerId !== c.id,
    );
  } else if (c.type === "value") {
    const component = d.components.find((v) => v.id === c.id);
    if (component) component.valueSI = c.value;
  } else if (item) {
    if (c.type === "move") {
      item.x = Math.round(c.x);
      item.y = Math.round(c.y);
    } else if ("rotation" in item && typeof item.rotation === "number")
      item.rotation = ((item.rotation + 90) % 360) as 0 | 90 | 180 | 270;
  }
  return commit(before, d);
}
export function connect(
  before: CircuitDocument,
  from: Endpoint,
  to: Endpoint,
  id: string,
) {
  if (key(from) === key(to)) throw Error("INVALID_DOCUMENT");
  return commit(before, {
    ...before,
    wires: [...before.wires, { id, from, to, bends: [] }],
  });
}
export function splitWire(
  before: CircuitDocument,
  wireId: string,
  point: Point,
  junctionId: string,
) {
  const d = structuredClone(before),
    w = d.wires.find((v) => v.id === wireId);
  if (!w) throw Error("INVALID_DOCUMENT");
  const junction: Endpoint = { kind: "junction", ownerId: junctionId };
  d.junctions.push({
    id: junctionId,
    x: Math.round(point.x),
    y: Math.round(point.y),
  });
  d.wires = d.wires.filter((v) => v.id !== wireId);
  d.wires.push(
    { id: wireId, from: w.from, to: junction, bends: [] },
    { id: junctionId + "-w", from: junction, to: w.to, bends: [] },
  );
  return commit(before, d);
}
