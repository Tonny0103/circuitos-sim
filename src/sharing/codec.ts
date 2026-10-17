import { z } from "zod";
import type { CircuitDocument } from "../domain/document";
import { documentSchema, validateDocument } from "../domain/schema";
import { LIMITS as L } from "../domain/limits";
import { analyzeDocument } from "../editor/analysis";
const quantity = z.strictObject({
  voltage: z.number().finite(),
  current: z.number().finite(),
  power: z.number().finite(),
});
const schema = z.strictObject({
  schemaVersion: z.literal(1),
  engineVersion: z.literal("1"),
  document: documentSchema,
  analysis: z.strictObject({
    nodeVoltages: z.record(z.string(), z.number().finite()),
    componentResults: z.record(z.string(), quantity),
  }),
});
async function collect(stream: ReadableStream<Uint8Array>, limit: number) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const r = await reader.read();
      if (r.done) break;
      size += r.value.length;
      if (size > limit) {
        await reader.cancel();
        throw Error("SHARE_TOO_LARGE");
      }
      chunks.push(r.value);
    }
  } finally {
    reader.releaseLock();
  }
  const all = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    all.set(c, at);
    at += c.length;
  }
  return all;
}
export async function encodeShare(document: CircuitDocument, origin: string) {
  const analysis = analyzeDocument(document);
  if (!analysis.ok) throw Error(analysis.errors[0].code);
  if (typeof CompressionStream === "undefined")
    throw Error("COMPRESSION_UNAVAILABLE");
  const snapshot = {
    schemaVersion: 1,
    engineVersion: "1",
    document: {
      ...document,
      components: [...document.components].sort((a, b) =>
        a.id.localeCompare(b.id),
      ),
      grounds: [...document.grounds].sort((a, b) => a.id.localeCompare(b.id)),
      junctions: [...document.junctions].sort((a, b) =>
        a.id.localeCompare(b.id),
      ),
      wires: [...document.wires].sort((a, b) => a.id.localeCompare(b.id)),
    },
    analysis: {
      nodeVoltages: analysis.nodeVoltages,
      componentResults: analysis.componentResults,
    },
  };
  const bytes = new TextEncoder().encode(JSON.stringify(snapshot));
  if (bytes.length > L.jsonBytes) throw Error("SHARE_TOO_LARGE");
  const packed = await collect(
    new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip")),
    L.urlLength,
  );
  const payload = btoa(
    Array.from(packed, (b) => String.fromCharCode(b)).join(""),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  const url = origin.replace(/\/$/, "") + "/#c=v1." + payload;
  if (url.length > L.urlLength) throw Error("SHARE_TOO_LARGE");
  return url;
}
export async function decodeShare(fragment: string) {
  if (fragment.length > L.urlLength) throw Error("SHARE_TOO_LARGE");
  if (!fragment.startsWith("c=v1.")) throw Error("UNSUPPORTED_VERSION");
  const payload = fragment.slice(5);
  if (!/^[A-Za-z0-9_-]+$/.test(payload)) throw Error("INVALID_SHARE");
  if (typeof DecompressionStream === "undefined")
    throw Error("COMPRESSION_UNAVAILABLE");
  let raw: unknown;
  try {
    const binary = atob(payload.replaceAll("-", "+").replaceAll("_", "/"));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const unpacked = await collect(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")),
      L.jsonBytes,
    );
    raw = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(unpacked),
    );
  } catch (e) {
    if (e instanceof Error && e.message === "SHARE_TOO_LARGE") throw e;
    throw Error("INVALID_SHARE");
  }
  if (
    raw &&
    typeof raw === "object" &&
    ("schemaVersion" in raw || "engineVersion" in raw)
  ) {
    const versioned = raw as {
      schemaVersion?: unknown;
      engineVersion?: unknown;
    };
    if (versioned.schemaVersion !== 1 || versioned.engineVersion !== "1")
      throw Error("UNSUPPORTED_VERSION");
  }
  const outer = schema.safeParse(raw);
  if (!outer.success) {
    const d = validateDocument((raw as { document?: unknown })?.document);
    throw Error(d.ok ? "INVALID_SHARE" : d.errors[0].code);
  }
  const d = validateDocument(outer.data.document);
  if (!d.ok) throw Error(d.errors[0].code);
  const analysis = analyzeDocument(d.document);
  if (!analysis.ok) throw Error(analysis.errors[0].code);
  const same = (a: unknown, b: unknown): boolean => {
    if (typeof a === "number" && typeof b === "number")
      return Math.abs(a - b) <= 1e-6 + 1e-4 * Math.abs(b);
    if (!a || !b || typeof a !== "object" || typeof b !== "object")
      return a === b;
    const x = a as Record<string, unknown>,
      y = b as Record<string, unknown>;
    return (
      Object.keys(x).length === Object.keys(y).length &&
      Object.keys(x).every((k) => Object.hasOwn(y, k) && same(x[k], y[k]))
    );
  };
  if (
    !same(outer.data.analysis.nodeVoltages, analysis.nodeVoltages) ||
    !same(outer.data.analysis.componentResults, analysis.componentResults)
  )
    throw Error("RESULT_MISMATCH");
  return { document: d.document, analysis };
}
