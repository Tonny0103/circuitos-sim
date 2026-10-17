import { it, expect } from "vitest";
import { validateDocument } from "../../src/domain/schema";
import { emptyDocument } from "../../src/domain/document";
import { terminal } from "../../src/domain/document";
it("aceita fronteiras de fios/junções e rejeita excedentes sem truncar", () => {
  const d = emptyDocument("limits");
  d.components = [
    {
      id: "r",
      kind: "resistor",
      label: "R",
      valueSI: 1000,
      x: 0,
      y: 0,
      rotation: 0,
    },
  ];
  d.junctions = Array.from({ length: 200 }, (_, i) => ({
    id: "j" + i,
    x: i,
    y: i,
  }));
  d.wires = Array.from({ length: 300 }, (_, i) => ({
    id: "w" + i,
    from: terminal("r", "a"),
    to: terminal("r", "b"),
    bends: Array.from({ length: 8 }, (_, k) => ({ x: k, y: k })),
  }));
  const before = JSON.stringify(d);
  expect(validateDocument(d).ok).toBe(true);
  const r = validateDocument({
    ...d,
    wires: [...d.wires, { ...d.wires[0], id: "extra" }],
  });
  expect(!r.ok && r.errors[0].code).toBe("LIMIT_EXCEEDED");
  expect(JSON.stringify(d)).toBe(before);
  expect(
    validateDocument({
      ...d,
      junctions: [...d.junctions, { id: "extra", x: 0, y: 0 }],
    }).ok,
  ).toBe(false);
  expect(
    validateDocument({
      ...d,
      wires: [
        {
          ...d.wires[0],
          bends: Array.from({ length: 9 }, () => ({ x: 0, y: 0 })),
        },
      ],
    }).ok,
  ).toBe(false);
});
it("distingue estrutura, valores e limites", () => {
  const d = emptyDocument();
  expect(validateDocument(d).ok).toBe(true);
  d.components = [
    {
      id: "r",
      kind: "resistor",
      label: "R",
      valueSI: -1,
      x: 0,
      y: 0,
      rotation: 0,
    },
  ];
  let r = validateDocument(d);
  expect(!r.ok && r.errors[0].code).toBe("INVALID_VALUE");
  r = validateDocument({ ...d, unknown: true });
  expect(!r.ok && r.errors[0].code).toBe("INVALID_DOCUMENT");
  r = validateDocument({ ...d, documentId: "x".repeat(65) });
  expect(!r.ok && r.errors[0].code).toBe("LIMIT_EXCEEDED");
});
