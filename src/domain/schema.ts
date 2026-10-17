import { z } from "zod";
import { LIMITS as L } from "./limits";
import { key, type CircuitDocument } from "./document";
import { fail, type Failure } from "./errors";
const id = z.string().min(1).max(L.id);
const coordinate = z.number().finite().min(-L.coordinate).max(L.coordinate);
const point = { x: coordinate, y: coordinate };
const rotation = z.union([
  z.literal(0),
  z.literal(90),
  z.literal(180),
  z.literal(270),
]);
const endpoint = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("terminal"),
    ownerId: id,
    terminal: z.enum(["a", "b"]),
  }),
  z.strictObject({ kind: z.literal("ground"), ownerId: id }),
  z.strictObject({ kind: z.literal("junction"), ownerId: id }),
]);
export const documentSchema = z.strictObject({
  schemaVersion: z.literal(1),
  documentId: id,
  revision: z.number().int().nonnegative(),
  components: z
    .array(
      z.strictObject({
        id,
        kind: z.enum(["resistor", "voltageSource"]),
        label: z.string().max(L.label),
        valueSI: z.number().finite(),
        ...point,
        rotation,
      }),
    )
    .max(L.components),
  grounds: z.array(z.strictObject({ id, ...point, rotation })).max(L.grounds),
  junctions: z.array(z.strictObject({ id, ...point })).max(L.junctions),
  wires: z
    .array(
      z.strictObject({
        id,
        from: endpoint,
        to: endpoint,
        bends: z.array(z.strictObject(point)).max(L.bends),
      }),
    )
    .max(L.wires),
});
export function validateDocument(
  input: unknown,
): { ok: true; document: CircuitDocument } | Failure {
  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues;
    const structural = issues.filter(
      (i) => !(i.path[0] === "components" && i.path[2] === "valueSI"),
    );
    if (structural.length)
      return fail(
        structural.some((i) => i.code === "too_big")
          ? "LIMIT_EXCEEDED"
          : "INVALID_DOCUMENT",
      );
    const components = (input as { components?: { id?: string }[] })
      ?.components;
    return fail("INVALID_VALUE", {
      componentIds: issues.flatMap((i) => {
        const v = components?.[Number(i.path[1])]?.id;
        return typeof v === "string" ? [v] : [];
      }),
    });
  }
  const d = parsed.data;
  const all = [...d.components, ...d.grounds, ...d.junctions, ...d.wires].map(
    (v) => v.id,
  );
  if (new Set(all).size !== all.length) return fail("INVALID_DOCUMENT");
  const anchors = new Set([
    ...d.components.flatMap((c) => [
      key({ kind: "terminal", ownerId: c.id, terminal: "a" }),
      key({ kind: "terminal", ownerId: c.id, terminal: "b" }),
    ]),
    ...d.grounds.map((g) => key({ kind: "ground", ownerId: g.id })),
    ...d.junctions.map((j) => key({ kind: "junction", ownerId: j.id })),
  ]);
  if (
    d.wires.some(
      (w) =>
        !anchors.has(key(w.from)) ||
        !anchors.has(key(w.to)) ||
        key(w.from) === key(w.to),
    )
  )
    return fail("INVALID_DOCUMENT");
  const invalid = d.components.filter(
    (c) => c.kind === "resistor" && c.valueSI <= 0,
  );
  if (invalid.length)
    return fail("INVALID_VALUE", { componentIds: invalid.map((c) => c.id) });
  return { ok: true, document: d };
}
