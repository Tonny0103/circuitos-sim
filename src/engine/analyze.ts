import type { Netlist, AnalysisResult, Quantities } from "./types";
import { stamp } from "./mna";
import { solve } from "./solver";
import { quantities } from "./quantities";
import { fail } from "../domain/errors";
export function analyze(n: Netlist): AnalysisResult {
  if (
    n.resistors.some((r) => !Number.isFinite(r.value) || r.value <= 0) ||
    n.voltageSources.some((s) => !Number.isFinite(s.value))
  )
    return fail("INVALID_VALUE");
  const system = stamp(n),
    solution = solve(system.a, system.b);
  if (!solution.ok) return solution;
  const nodeVoltages: Record<string, number> = { "0": 0 };
  system.nodes.forEach((v, i) => {
    nodeVoltages[v] = solution.x[i];
  });
  const componentResults: Record<string, Quantities> = Object.create(null);
  for (const r of n.resistors) {
    const v = nodeVoltages[r.aNode] - nodeVoltages[r.bNode];
    componentResults[r.id] = quantities(v, v / r.value);
  }
  system.sources.forEach((s, k) => {
    componentResults[s.id] = quantities(
      nodeVoltages[s.aNode] - nodeVoltages[s.bNode],
      solution.x[system.nodes.length + k],
    );
  });
  if (
    Object.values(componentResults).some((c) =>
      Object.values(c).some((v) => !Number.isFinite(v)),
    )
  )
    return fail("NUMERICAL_FAILURE");
  const count = n.resistors.length + n.voltageSources.length;
  for (const node of n.nodes) {
    let sum = 0,
      scale = 0;
    for (const b of [...n.resistors, ...n.voltageSources]) {
      const i = componentResults[b.id].current;
      if (b.aNode === node) {
        sum += i;
        scale += Math.abs(i);
      }
      if (b.bNode === node) {
        sum -= i;
        scale += Math.abs(i);
      }
    }
    if (Math.abs(sum) > 1e-6 * count + 1e-4 * scale)
      return fail("NUMERICAL_FAILURE");
  }
  const powers = Object.values(componentResults).map((c) => c.power);
  if (
    Math.abs(powers.reduce((s, p) => s + p, 0)) >
    1e-6 * count + 1e-4 * powers.reduce((s, p) => s + Math.abs(p), 0)
  )
    return fail("NUMERICAL_FAILURE");
  return {
    ok: true,
    engineVersion: "1",
    nodeVoltages,
    componentResults,
    diagnostics: {
      rank: solution.rank,
      dimension: system.b.length,
      scaledConditionEstimate: solution.condition,
      normalizedResidual: solution.residual,
    },
  };
}
