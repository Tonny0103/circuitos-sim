import { it, expect } from "vitest";
import { encodeShare, decodeShare } from "../../src/sharing/codec";
import { examples } from "../../src/examples/circuits";
it("snapshot preserva circuito e resultados verificados", async () => {
  const d = examples[1].document;
  const url = await encodeShare(d, "https://example.org");
  expect(url).toContain("/#c=v1.");
  const result = await decodeShare(url.split("#")[1]);
  expect(result.document).toEqual({
    ...d,
    components: [...d.components].sort((a, b) => a.id.localeCompare(b.id)),
    wires: [...d.wires].sort((a, b) => a.id.localeCompare(b.id)),
  });
  expect(result.analysis.ok).toBe(true);
});
it("rejeita link truncado, versão desconhecida e expansão excessiva", async () => {
  await expect(decodeShare("c=v99.abc")).rejects.toThrow();
  await expect(decodeShare("c=v1.abc")).rejects.toThrow();
  await expect(decodeShare("c=v1." + "a".repeat(64001))).rejects.toThrow();
});
