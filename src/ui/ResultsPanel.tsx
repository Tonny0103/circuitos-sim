import type { AnalysisSuccess } from "../engine/types";
import type { CircuitDocument } from "../domain/document";
import { format } from "./format";
import { buildNetlist } from "../domain/topology";
export function ResultsPanel({
  document,
  analysis,
  selection,
}: {
  document: CircuitDocument;
  analysis: AnalysisSuccess;
  selection: string | null;
}) {
  const c = document.components.find((c) => c.id === selection);
  const result = c ? analysis.componentResults[c.id] : null;
  if (c && result)
    return (
      <section className="results">
        <span className="eyebrow">RESULTADOS · {c.label}</span>
        <dl>
          <div>
            <dt>Tensão a (+) → b (−)</dt>
            <dd data-testid="result-voltage">{format(result.voltage, "V")}</dd>
          </div>
          <div>
            <dt>Corrente de referência a → b</dt>
            <dd data-testid="result-current">{format(result.current, "A")}</dd>
          </div>
          <div>
            <dt>Potência {result.power < 0 ? "fornecida" : "absorvida"}</dt>
            <dd data-testid="result-power">{format(result.power, "W")}</dd>
          </div>
        </dl>
        <p className="hint">
          Corrente negativa: sentido oposto à seta a → b. Potência negativa:
          energia fornecida.
        </p>
      </section>
    );
  const n = buildNetlist(document);
  let node: string | undefined;
  if (n.ok && selection) {
    if (selection.startsWith("node:"))
      node = n.netlist.endpointNodeMap[selection.slice(5)];
    else {
      const w = document.wires.find((w) => w.id === selection);
      if (w) {
        const e = w.from;
        node =
          n.netlist.endpointNodeMap[
            `${e.kind}:${e.ownerId}${e.kind === "terminal" ? ":" + e.terminal : ""}`
          ];
      } else if (document.grounds.some((g) => g.id === selection)) node = "0";
    }
  }
  return (
    <section className="results">
      <span className="eyebrow">TENSÃO NODAL</span>
      {node !== undefined ? (
        <>
          <div className="node-result" data-testid="result-node">
            {format(analysis.nodeVoltages[node], "V")}
          </div>
          <p>Em relação ao terra (0 V).</p>
        </>
      ) : (
        <p>
          Selecione um componente ou um nó no circuito para consultar suas
          grandezas.
        </p>
      )}
    </section>
  );
}
