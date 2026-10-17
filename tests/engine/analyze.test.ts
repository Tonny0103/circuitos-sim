import { it, expect } from "vitest";
import { analyze } from "../../src/engine/analyze";
import { fixtures } from "./fixtures/analytical";
for (const f of fixtures)
  it(f.name, () => {
    const before = JSON.stringify(f.n);
    const r = analyze(f.n);
    expect(r.ok).toBe(true);
    if (!r.ok) throw Error(JSON.stringify(r.errors));
    for (const [id, v] of Object.entries(f.voltages))
      expect(r.nodeVoltages[id]).toBeCloseTo(v!, 10);
    for (const [id, i] of Object.entries(f.currents))
      expect(r.componentResults[id].current).toBeCloseTo(i!, 10);
    for (const [id, p] of Object.entries(f.powers))
      expect(r.componentResults[id].power).toBeCloseTo(p!, 10);
    expect(
      Object.values(r.componentResults).reduce((sum, c) => sum + c.power, 0),
    ).toBeCloseTo(0, 10);
    for (const node of f.n.nodes) {
      let sum = 0;
      for (const b of [...f.n.resistors, ...f.n.voltageSources]) {
        const i = r.componentResults[b.id].current;
        if (b.aNode === node) sum += i;
        if (b.bNode === node) sum -= i;
      }
      expect(sum).toBeCloseTo(0, 10);
    }
    expect(JSON.stringify(f.n)).toBe(before);
  });
