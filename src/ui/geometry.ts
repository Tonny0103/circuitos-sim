import {
  type CircuitDocument,
  type Endpoint,
  type Point,
} from "../domain/document";
export function endpointPosition(d: CircuitDocument, e: Endpoint): Point {
  if (e.kind === "terminal") {
    const c = d.components.find((c) => c.id === e.ownerId);
    if (!c) return { x: 0, y: 0 };
    const angle = (c.rotation * Math.PI) / 180;
    const offset = e.terminal === "a" ? -60 : 60;
    return {
      x: c.x + Math.cos(angle) * offset,
      y: c.y + Math.sin(angle) * offset,
    };
  }
  return (
    (e.kind === "ground" ? d.grounds : d.junctions).find(
      (v) => v.id === e.ownerId,
    ) ?? { x: 0, y: 0 }
  );
}
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export function segmentDistance(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1),
    ),
  );
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}
