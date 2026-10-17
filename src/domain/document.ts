export type Rotation = 0 | 90 | 180 | 270;
export type Point = { x: number; y: number };
export type Component = Point & {
  id: string;
  kind: "resistor" | "voltageSource";
  label: string;
  valueSI: number;
  rotation: Rotation;
};
export type Ground = Point & { id: string; rotation: Rotation };
export type Junction = Point & { id: string };
export type Endpoint =
  | { kind: "terminal"; ownerId: string; terminal: "a" | "b" }
  | { kind: "ground" | "junction"; ownerId: string };
export type Wire = { id: string; from: Endpoint; to: Endpoint; bends: Point[] };
export type CircuitDocument = {
  schemaVersion: 1;
  documentId: string;
  revision: number;
  components: Component[];
  grounds: Ground[];
  junctions: Junction[];
  wires: Wire[];
};
export const key = (e: Endpoint) =>
  `${e.kind}:${e.ownerId}${e.kind === "terminal" ? ":" + e.terminal : ""}`;
export const terminal = (ownerId: string, terminal: "a" | "b"): Endpoint => ({
  kind: "terminal",
  ownerId,
  terminal,
});
export const emptyDocument = (id = "draft"): CircuitDocument => ({
  schemaVersion: 1,
  documentId: id,
  revision: 0,
  components: [],
  grounds: [],
  junctions: [],
  wires: [],
});
