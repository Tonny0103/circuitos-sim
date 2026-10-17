import type { CircuitDocument } from "../domain/document";
import { validateAnalysis } from "../domain/validate-analysis";
import { analyze } from "../engine/analyze";
export function analyzeDocument(d: CircuitDocument) {
  const n = validateAnalysis(d);
  return n.ok ? analyze(n.netlist) : n;
}
