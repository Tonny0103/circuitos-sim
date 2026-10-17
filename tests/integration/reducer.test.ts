import { it, expect } from "vitest";
import { reducer, type EditorState } from "../../src/editor/reducer";
import { emptyDocument } from "../../src/domain/document";
import { analyzeDocument } from "../../src/editor/analysis";
import { examples } from "../../src/examples/circuits";
it("seleção não invalida; edição e resultado obsoleto não revalidam", () => {
  const d = examples[1].document;
  const analysis = analyzeDocument(d);
  let s: EditorState = {
    document: d,
    analysis,
    status: "valid",
    selection: null,
    mode: "edit",
  };
  s = reducer(s, { type: "select", id: "r1" });
  expect(s.status).toBe("valid");
  s = reducer(s, { type: "edit", document: { ...d, revision: 1 } });
  expect(s.status).toBe("invalidated");
  expect(s.analysis).toBeNull();
  s = reducer(s, { type: "result", revision: 0, analysis });
  expect(s.status).toBe("invalidated");
  s = reducer(s, { type: "load", document: emptyDocument() });
  expect(s.status).toBe("notAnalyzed");
});
