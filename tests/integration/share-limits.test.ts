import { it, expect } from "vitest";
import { gzipSync } from "node:zlib";
import { scaleCircuit } from "../fixtures/scale";
import { encodeShare, decodeShare } from "../../src/sharing/codec";
import { analyzeDocument } from "../../src/editor/analysis";
import { sharedV1 } from "../fixtures/shared-v1";
const pack = (raw: string) => "c=v1." + gzipSync(raw).toString("base64url");
it("continua lendo link literal emitido pelo encoder v1 original", async () => {
  const r = await decodeShare(sharedV1);
  expect(r.analysis.componentResults.r1.current).toBeCloseTo(0.005, 10);
});
it("50 componentes: precisão analítica e round-trip dentro do orçamento", async () => {
  const d = scaleCircuit(),
    r = analyzeDocument(d);
  expect(r.ok).toBe(true);
  if (!r.ok) throw Error("scale");
  expect(r.componentResults.r0.current).toBeCloseTo(10 / 49000, 10);
  const link = await encodeShare(d, "https://example.org");
  expect(link.length).toBeLessThan(64000);
  const read = await decodeShare(link.split("#")[1]);
  expect(read.document.components).toHaveLength(50);
  console.info("Scale link characters:", link.length);
});
it("interrompe expansão gzip acima de 256 KiB", async () => {
  await expect(decodeShare(pack(" ".repeat(256 * 1024 + 1)))).rejects.toThrow(
    "SHARE_TOO_LARGE",
  );
});
it("rejeita resultados adulterados e preserva erro de valor importado", async () => {
  const d = scaleCircuit();
  const r = analyzeDocument(d);
  if (!r.ok) throw Error("fixture");
  const snapshot = {
    schemaVersion: 1,
    engineVersion: "1",
    document: d,
    analysis: {
      nodeVoltages: r.nodeVoltages,
      componentResults: r.componentResults,
    },
  };
  snapshot.analysis.componentResults.r0.current = 99;
  await expect(decodeShare(pack(JSON.stringify(snapshot)))).rejects.toThrow(
    "RESULT_MISMATCH",
  );
  snapshot.document.components[0].valueSI = NaN;
  await expect(decodeShare(pack(JSON.stringify(snapshot)))).rejects.toThrow(
    "INVALID_VALUE",
  );
});
