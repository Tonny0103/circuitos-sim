import type { CircuitDocument } from "../domain/document";
import type { AnalysisResult } from "../engine/types";
export type EditorState = {
  document: CircuitDocument;
  mode: "edit" | "readOnly";
  analysis: AnalysisResult | null;
  status: "notAnalyzed" | "analyzing" | "valid" | "invalidated" | "error";
  selection: string | null;
};
export type Action =
  | {
      type: "load";
      document: CircuitDocument;
      mode?: "edit" | "readOnly";
      analysis?: AnalysisResult;
    }
  | { type: "edit"; document: CircuitDocument }
  | { type: "select"; id: string | null }
  | { type: "invalidate" }
  | { type: "analyzing" }
  | { type: "result"; revision: number; analysis: AnalysisResult };
export function reducer(s: EditorState, a: Action): EditorState {
  switch (a.type) {
    case "load":
      return {
        document: a.document,
        mode: a.mode ?? "edit",
        analysis: a.analysis ?? null,
        status: a.analysis?.ok ? "valid" : "notAnalyzed",
        selection: null,
      };
    case "edit":
      return s.mode === "readOnly"
        ? s
        : { ...s, document: a.document, analysis: null, status: "invalidated" };
    case "select":
      return { ...s, selection: a.id };
    case "invalidate":
      return { ...s, analysis: null, status: "invalidated" };
    case "analyzing":
      return { ...s, status: "analyzing", analysis: null };
    case "result":
      return a.revision === s.document.revision
        ? {
            ...s,
            analysis: a.analysis,
            status: a.analysis.ok ? "valid" : "error",
          }
        : s;
  }
}
