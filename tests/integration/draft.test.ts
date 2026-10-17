import { it, expect } from "vitest";
import { readDraft, writeDraft } from "../../src/persistence/draft";
import { emptyDocument } from "../../src/domain/document";
it("recupera apenas documento, sem resultados atuais", () => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memory.set(k, v);
    },
  };
  const d = emptyDocument();
  expect(writeDraft(storage, d).ok).toBe(true);
  expect(readDraft(storage)).toEqual({ ok: true, document: d });
  memory.set("circuitos-sim:draft:v1", "invalid");
  expect(readDraft(storage).ok).toBe(false);
});
it("quota não lança exceção nem altera circuito", () => {
  const d = emptyDocument();
  expect(
    writeDraft(
      {
        setItem: () => {
          throw Error("quota");
        },
      },
      d,
    ).ok,
  ).toBe(false);
  expect(d.revision).toBe(0);
});
