import type { CircuitDocument } from "../domain/document";
import { validateDocument } from "../domain/schema";
import { LIMITS } from "../domain/limits";
export const DRAFT_KEY = "circuitos-sim:draft:v1";
export function readDraft(
  storage: Pick<Storage, "getItem">,
): { ok: true; document: CircuitDocument | null } | { ok: false } {
  try {
    const raw = storage.getItem(DRAFT_KEY);
    if (!raw) return { ok: true, document: null };
    if (new TextEncoder().encode(raw).length > LIMITS.jsonBytes)
      return { ok: false };
    const envelope = JSON.parse(raw);
    if (
      envelope.schemaVersion !== 1 ||
      Object.keys(envelope).some(
        (k) => !["schemaVersion", "document"].includes(k),
      )
    )
      return { ok: false };
    const checked = validateDocument(envelope.document);
    return checked.ok
      ? { ok: true, document: checked.document }
      : { ok: false };
  } catch {
    return { ok: false };
  }
}
export function writeDraft(
  storage: Pick<Storage, "setItem">,
  document: CircuitDocument,
): { ok: boolean } {
  try {
    const checked = validateDocument(document);
    if (!checked.ok) return { ok: false };
    const raw = JSON.stringify({
      schemaVersion: 1,
      document: checked.document,
    });
    if (new TextEncoder().encode(raw).length > LIMITS.jsonBytes)
      return { ok: false };
    storage.setItem(DRAFT_KEY, raw);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
