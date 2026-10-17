import { describe, it, expect } from "vitest";
import { buildNetlist } from "../../src/domain/topology";
import { emptyDocument, terminal } from "../../src/domain/document";
import { examples } from "../../src/examples/circuits";
import { analyzeDocument } from "../../src/editor/analysis";
describe("topologia explícita", () => {
  it("reordenar arrays e mudar apenas geometria preserva a solução", () => {
    const d = structuredClone(examples[1].document),
      changed = structuredClone(d);
    changed.components.reverse();
    changed.wires.reverse();
    changed.components[0].x += 123;
    changed.components[0].rotation = 270;
    const a = buildNetlist(d),
      b = buildNetlist(changed);
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok)
      expect(a.netlist.endpointNodeMap).toEqual(b.netlist.endpointNodeMap);
    expect(analyzeDocument(changed)).toEqual(analyzeDocument(d));
  });
  it("não conecta terminais sobrepostos e não modifica a entrada", () => {
    const d = emptyDocument();
    d.components = [
      {
        id: "r",
        kind: "resistor",
        label: "R1",
        valueSI: 1000,
        x: 0,
        y: 0,
        rotation: 0,
      },
    ];
    const original = JSON.stringify(d);
    const n = buildNetlist(d);
    expect(n.ok).toBe(true);
    if (n.ok)
      expect(n.netlist.endpointNodeMap["terminal:r:a"]).not.toBe(
        n.netlist.endpointNodeMap["terminal:r:b"],
      );
    expect(JSON.stringify(d)).toBe(original);
  });
  it("une fios explícitos e símbolos de terra independentemente da geometria", () => {
    const d = emptyDocument();
    d.grounds = [
      { id: "g1", x: 0, y: 0, rotation: 0 },
      { id: "g2", x: 500, y: 500, rotation: 0 },
    ];
    d.components = [
      {
        id: "r",
        kind: "resistor",
        label: "R1",
        valueSI: 1,
        x: 0,
        y: 0,
        rotation: 0,
      },
    ];
    d.wires = [
      {
        id: "w",
        from: terminal("r", "a"),
        to: { kind: "ground", ownerId: "g1" },
        bends: [],
      },
    ];
    const n = buildNetlist(d);
    expect(n.ok).toBe(true);
    if (n.ok) {
      expect(n.netlist.endpointNodeMap["terminal:r:a"]).toBe("0");
      expect(n.netlist.endpointNodeMap["ground:g2"]).toBe("0");
    }
  });
});
