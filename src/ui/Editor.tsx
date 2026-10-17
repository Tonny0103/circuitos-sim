"use client";
import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import {
  emptyDocument,
  key,
  type CircuitDocument,
  type Endpoint,
  type Point,
} from "../domain/document";
import { reducer, type EditorState } from "../editor/reducer";
import { edit, connect, splitWire, type Command } from "../editor/commands";
import { parseValue } from "../editor/values";
import { analyzeDocument } from "../editor/analysis";
import { examples } from "../examples/circuits";
import { readDraft, writeDraft, DRAFT_KEY } from "../persistence/draft";
import { encodeShare, decodeShare } from "../sharing/codec";
import type { AnalysisSuccess } from "../engine/types";
import { CircuitSvg } from "./CircuitSvg";
import { ResultsPanel } from "./ResultsPanel";
import { endpointPosition, segmentDistance } from "./geometry";
import { message } from "./analysis-messages";
const initial: EditorState = {
  document: emptyDocument(),
  mode: "edit",
  analysis: null,
  status: "notAnalyzed",
  selection: null,
};
const statusText = {
  notAnalyzed: "Não analisado",
  analyzing: "Analisando…",
  valid: "Análise válida",
  invalidated: "Análise invalidada",
  error: "Erro de análise",
};
const uid = () => crypto.randomUUID();
type Replacement = {
  document: CircuitDocument;
  analysis?: AnalysisSuccess;
  exampleIndex?: number;
};
export function Editor() {
  const [s, dispatch] = useReducer(reducer, initial);
  const [mode, setMode] = useState<"select" | "wire" | "junction">("select");
  const [pending, setPending] = useState<Endpoint | null>(null);
  const [notice, setNotice] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [ready, setReady] = useState(false);
  const [link, setLink] = useState("");
  const [sharing, setSharing] = useState(false);
  const [replacement, setReplacement] = useState<Replacement | null>(null);
  const [conflict, setConflict] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [example, setExample] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    let generation = 0;
    async function boot() {
      const request = ++generation;
      try {
        const draft = readDraft(localStorage);
        setHasDraft(!draft.ok || !!draft.document);
        if (!draft.ok) setConflict(true);
        if (location.hash) {
          setExample(null);
          const decoded = await decodeShare(location.hash.slice(1));
          if (live && request === generation)
            dispatch({
              type: "load",
              document: decoded.document,
              mode: "readOnly",
              analysis: decoded.analysis,
            });
        } else if (draft.ok && draft.document) {
          dispatch({ type: "load", document: draft.document });
          setDraftStatus("Rascunho recuperado · analise novamente");
        } else if (!draft.ok)
          setNotice(
            "Não foi possível recuperar o rascunho. Você pode iniciar outro circuito.",
          );
      } catch (e) {
        if (live && request === generation) {
          dispatch({ type: "load", document: emptyDocument() });
          setNotice(message(e instanceof Error ? e.message : ""));
        }
      } finally {
        if (live && request === generation) setReady(true);
      }
    }
    void boot();
    const changed = (event: StorageEvent) => {
      if (event.key === DRAFT_KEY) {
        setConflict(true);
        setNotice(
          "O rascunho mudou em outra aba. Escolha qual versão manter antes de salvar.",
        );
      }
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPending(null);
        setMode("select");
      }
    };
    const hashChanged = () => {
      setReady(false);
      dispatch({ type: "invalidate" });
      void boot();
    };
    window.addEventListener("hashchange", hashChanged);
    window.addEventListener("storage", changed);
    window.addEventListener("keydown", escape);
    return () => {
      live = false;
      window.removeEventListener("hashchange", hashChanged);
      window.removeEventListener("storage", changed);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  const persist = (d: CircuitDocument, replaceProtected = false) => {
    if (conflict && !replaceProtected) {
      setDraftStatus("Não salvo · conflito com outra aba");
      return;
    }
    try {
      const saved = writeDraft(localStorage, d);
      setDraftStatus(
        saved.ok
          ? "Rascunho salvo neste navegador"
          : "Não foi possível salvar neste navegador",
      );
      if (saved.ok) setHasDraft(true);
    } catch {
      setDraftStatus("Não foi possível salvar neste navegador");
    }
  };
  const apply = (d: CircuitDocument) => {
    const updated={...d,revision:s.document.revision+1};
    dispatch({ type: "edit", document: updated });
    persist(updated);
    setNotice("");
    setLink("");
    setExample(null);
  };
  const command = (c: Command) => {
    if (s.mode === "readOnly" || s.status === "analyzing") return;
    try {
      apply(edit(s.document, c));
    } catch (e) {
      setNotice(message(e instanceof Error ? e.message : ""));
    }
  };
  const load = (r: Replacement) => {
    const d = {
      ...structuredClone(r.document),
      documentId: uid(),
      revision: 0,
    };
    dispatch({ type: "load", document: d, analysis: r.analysis });
    setExample(r.exampleIndex ?? null);
    persist(d, true);
    setConflict(false);
    history.replaceState(null, "", location.pathname);
    setReplacement(null);
    setPending(null);
    setMode("select");
    setNotice("");
    setLink("");
  };
  const replace = (r: Replacement) => {
    if (hasDraft || (s.mode === "edit" && s.document.components.length)) setReplacement(r);
    else load(r);
  };
  const analyze = () => {
    dispatch({ type: "analyzing" });
    setNotice("");
    const d = s.document;
    setTimeout(
      () =>
        dispatch({
          type: "result",
          revision: d.revision,
          analysis: analyzeDocument(d),
        }),
      0,
    );
  };
  const anchor = (e: Endpoint) => {
    if (mode !== "wire" || s.mode === "readOnly") {
      dispatch({ type: "select", id: "node:" + key(e) });
      return;
    }
    if (!pending) {
      setPending(e);
      return;
    }
    try {
      apply(connect(s.document, pending, e, uid()));
      setPending(null);
    } catch (e) {
      setNotice(message(e instanceof Error ? e.message : ""));
    }
  };
  const wire = (id: string, point: Point) => {
    if (s.mode === "readOnly" || mode === "select") {
      dispatch({ type: "select", id });
      return;
    }
    try {
      const j = uid();
      let d = splitWire(s.document, id, point, j);
      if (mode === "junction") {
        // An explicit junction action joins all wires at this point; plain crossings never do.
        for (const w of s.document.wires.filter((w) => w.id !== id)) {
          const pts = [
            endpointPosition(s.document, w.from),
            ...w.bends,
            endpointPosition(s.document, w.to),
          ];
          if (
            pts.slice(1).some((p, i) => segmentDistance(point, pts[i], p) < 10)
          ) {
            const old = d.wires.find((v) => v.id === w.id)!;
            d = {
              ...d,
              wires: d.wires
                .filter((v) => v.id !== w.id)
                .concat([
                  { ...old, to: { kind: "junction", ownerId: j }, bends: [] },
                  {
                    id: uid(),
                    from: { kind: "junction", ownerId: j },
                    to: old.to,
                    bends: [],
                  },
                ]),
            };
          }
        }
        // Validate the whole operation atomically, including any wires added at a crossing.
        d = edit(d, { type: "move", id: j, x: point.x, y: point.y });
      } else if (pending) {
        d = connect(d, pending, { kind: "junction", ownerId: j }, uid());
        setPending(null);
      } else setPending({ kind: "junction", ownerId: j });
      apply(d);
    } catch (e) {
      setNotice(message(e instanceof Error ? e.message : ""));
    }
  };
  const selected = s.document.components.find((c) => c.id === s.selection);
  const [raw, setRaw] = useState("");
  const [unit, setUnit] = useState("1");
  async function share() {
    if (s.status !== "valid") return;
    setSharing(true);
    try {
      setLink(await encodeShare(s.document, location.origin));
      setNotice("");
    } catch (e) {
      setNotice(message(e instanceof Error ? e.message : ""));
    } finally {
      setSharing(false);
    }
  }
  const disabled = !ready || s.mode === "readOnly" || s.status === "analyzing";
  return (
    <main className="app-shell">
      <header className="app-header">
        <Link href="/" className="brand" aria-label="Circuitos início">
          <span className="brand-mark">⏚</span>
          <span>
            Circuitos<span className="brand-dot">.</span>
          </span>
        </Link>
        <span className="course-tag">
          CIRCUITOS I <span>/</span> LABORATÓRIO CC
        </span>
        <div className="header-right">
          <span className="version">MVP 01</span>
          <span className="status-pill">● Experimente. Entenda.</span>
        </div>
      </header>
      <section className="intro">
        <div>
          <span className="eyebrow">DA TEORIA PARA O CIRCUITO</span>
          <h1>
            Construa a sua <em>próxima descoberta.</em>
          </h1>
          <p>
            Monte circuitos resistivos, explore os resultados e confira cada
            hipótese.
          </p>
        </div>
        <div className="intro-note">
          <span>01 — Corrente contínua</span>
          <span>Resistores · Fontes ideais · Terra</span>
        </div>
      </section>
      <section className="workspace" aria-label="Laboratório de circuitos">
        <aside className="palette">
          <span className="eyebrow">COMPONENTES</span>
          <p className="palette-help">Adicione ao circuito</p>
          <button
            className="component-card"
            disabled={disabled}
            onClick={() =>
              command({ type: "add", kind: "resistor", id: uid() })
            }
          >
            <span className="card-symbol">─/\/\/─</span>
            <strong>Resistor</strong>
            <small>Resistência · Ω</small>
          </button>
          <button
            className="component-card"
            disabled={disabled}
            onClick={() =>
              command({ type: "add", kind: "voltageSource", id: uid() })
            }
          >
            <span className="card-symbol">⊕</span>
            <strong>Fonte de tensão</strong>
            <small>Ideal e independente · V</small>
          </button>
          <button
            className="component-card"
            disabled={disabled}
            onClick={() => command({ type: "add", kind: "ground", id: uid() })}
          >
            <span className="card-symbol">⏚</span>
            <strong>Terra</strong>
            <small>Referência · 0 V</small>
          </button>
          <div className="palette-tip">
            <span>↳ CONEXÕES EXPLÍCITAS</span>
            <p>
              Use Fio e clique nos dois terminais. Cruzamentos só conectam
              quando você cria uma junção.
            </p>
          </div>
        </aside>
        <div className="canvas-panel">
          <div className="canvas-toolbar">
            <div className="tool-group">
              <button
                title="Selecionar e mover"
                className={mode === "select" ? "active" : ""}
                onClick={() => {
                  setMode("select");
                  setPending(null);
                }}
              >
                ↖ <span>Selecionar</span>
              </button>
              <button
                disabled={disabled}
                className={mode === "wire" ? "active" : ""}
                onClick={() => {
                  setMode("wire");
                  setPending(null);
                }}
              >
                ⌁ <span>Fio</span>
              </button>
              <button
                disabled={disabled}
                className={mode === "junction" ? "active" : ""}
                onClick={() => {
                  setMode("junction");
                  setPending(null);
                }}
              >
                ● <span>Junção</span>
              </button>
            </div>
            <button
              disabled={s.status === "analyzing" || !ready}
              aria-label="Analisar"
              className="analyze-button"
              onClick={analyze}
            >
              ▷ Analisar
            </button>
          </div>
          <div className="canvas-wrap">
            <div className="canvas-meta">
              <span>
                {s.mode === "readOnly" ? "Somente leitura" : "SEU CIRCUITO"}
              </span>
              <span>{s.document.components.length} / 50 componentes</span>
            </div>
            <CircuitSvg
              document={s.document}
              selection={s.selection}
              readOnly={disabled}
              mode={mode}
              pending={pending}
              onSelect={(id) => dispatch({ type: "select", id })}
              onAnchor={anchor}
              onWire={wire}
              onMove={(id, p) => command({ type: "move", id, ...p })}
              onInvalidate={() => dispatch({ type: "invalidate" })}
            />
          </div>
          <div className="canvas-footer">
            <span
              className={
                s.status === "valid" ? "analysis-state valid" : "analysis-state"
              }
            >
              {statusText[s.status]}
            </span>
            <span>
              {pending
                ? "Clique no terminal de destino · Esc cancela"
                : mode === "junction"
                  ? "Clique em um fio para criar uma junção explícita"
                  : "Arraste para mover · Selecione para inspecionar"}
            </span>
          </div>
        </div>
        <aside className="inspector">
          <span className="eyebrow">INSPECIONAR</span>
          <h2>{selected ? selected.label : "Veja além do desenho."}</h2>
          {selected ? (
            <>
              <p className="hint">
                {selected.kind === "resistor"
                  ? "Resistor linear"
                  : "Fonte ideal independente"}{" "}
                · referência a (+) → b (−)
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  try {
                    command({
                      type: "value",
                      id: selected.id,
                      value: parseValue(raw, Number(unit)),
                    });
                  } catch {
                    setNotice(message("INVALID_VALUE"));
                  }
                }}
              >
                <label htmlFor="value">Valor</label>
                <div className="value-row">
                  <input
                    id="value"
                    aria-label="Valor"
                    disabled={disabled}
                    placeholder={String(selected.valueSI)}
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                  />
                  <select
                    aria-label="Unidade"
                    value={unit}
                    disabled={disabled}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="1">
                      {selected.kind === "resistor" ? "Ω" : "V"}
                    </option>
                    <option value="1000">
                      {selected.kind === "resistor" ? "kΩ" : "kV"}
                    </option>
                    <option value="0.001">
                      {selected.kind === "resistor" ? "mΩ" : "mV"}
                    </option>
                  </select>
                </div>
                <button
                  disabled={disabled}
                  className="secondary full"
                  type="submit"
                >
                  Aplicar valor
                </button>
              </form>
              <div className="edit-actions">
                <button
                  disabled={disabled}
                  onClick={() => command({ type: "rotate", id: selected.id })}
                >
                  ↻ Girar 90°
                </button>
                <button
                  disabled={disabled}
                  onClick={() => command({ type: "delete", id: selected.id })}
                >
                  Excluir
                </button>
              </div>
            </>
          ) : (
            <p className="hint">
              Selecione um componente para editar seu valor. Após analisar,
              clique em um nó ou componente para explorar os resultados.
            </p>
          )}
          {!selected && s.selection && !s.selection.startsWith("node:") && (
            <button
              disabled={disabled}
              onClick={() => command({ type: "delete", id: s.selection! })}
            >
              Excluir selecionado
            </button>
          )}
          {s.status === "valid" && s.analysis?.ok ? (
            <ResultsPanel
              document={s.document}
              selection={s.selection}
              analysis={s.analysis}
            />
          ) : (
            <div className="results-placeholder">
              <span>V · I · P</span>
              <p>As grandezas aparecem após uma análise válida.</p>
            </div>
          )}
          {s.mode === "readOnly" ? (
            <button
              className="primary full"
              onClick={() =>
                replace({
                  document: s.document,
                  analysis: s.analysis?.ok ? s.analysis : undefined,
                })
              }
            >
              Criar cópia para editar
            </button>
          ) : (
            <button
              className="secondary full"
              disabled={s.status !== "valid" || sharing}
              onClick={() => void share()}
            >
              {sharing ? "Preparando…" : "Compartilhar"}
            </button>
          )}
          <button
            className="text-button"
            disabled={!ready}
            onClick={() => {
              setExample(null);
              replace({ document: emptyDocument(uid()) });
            }}
          >
            Novo circuito
          </button>
        </aside>
      </section>
      <div aria-live="polite" className="feedback">
        <span>{draftStatus || "Rascunho local · sem login"}</span>
        {notice && <p role="alert">{notice}</p>}
        {s.analysis &&
          !s.analysis.ok &&
          s.analysis.errors.map((err, i) => (
            <p key={i} role="alert">
              {message(err.code)} {err.componentIds?.join(", ")}{" "}
              {err.endpointIds?.join(", ")}
            </p>
          ))}
        {conflict && (
          <div>
            <button
              onClick={() => {
                const r = readDraft(localStorage);
                if (r.ok && r.document) {
                  dispatch({ type: "load", document: r.document });
                  setConflict(false);
                  setNotice("");
                }
              }}
            >
              Carregar rascunho da outra aba
            </button>
            <button
              onClick={() => {
                setConflict(false);
                const r = writeDraft(localStorage, s.document);
                setNotice(
                  r.ok ? "Versão atual mantida." : "Não foi possível salvar.",
                );
              }}
            >
              Manter versão atual
            </button>
          </div>
        )}
      </div>
      <section className="examples">
        <div className="section-heading">
          <div>
            <span className="eyebrow">UM PONTO DE PARTIDA</span>
            <h2>Aprenda com o circuito pronto.</h2>
          </div>
          <p>Abra um exemplo. Analise. Faça a sua versão.</p>
        </div>
        <div className="example-grid">
          {examples.map((e, i) => (
            <button
              key={e.title}
              aria-label={e.title}
              className="example-card"
              onClick={() => {
                replace({ document: e.document, exampleIndex: i });
              }}
              disabled={!ready}
            >
              <span className="example-number">0{i + 1}</span>
              <span>
                <strong>{e.title}</strong>
                <small>
                  {
                    [
                      "Uma fonte, uma resistência.",
                      "Duas resistências, uma proporção.",
                      "Mesma tensão, caminhos diferentes.",
                    ][i]
                  }
                </small>
              </span>
              <span className="example-arrow">↗</span>
            </button>
          ))}
        </div>
        {example !== null && s.status === "valid" && (
          <div className="explanation">
            <strong>Conferência analítica</strong>
            <p>{examples[example].explanation}</p>
          </div>
        )}
      </section>
      <footer className="app-footer">
        <span>
          Circuitos. <span>Aprender também é experimentar.</span>
        </span>
        <span>Modelo ideal · CC · Escopo de Circuitos I</span>
      </footer>
      {replacement && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="replace-title"
            className="modal"
          >
            <h2 id="replace-title">Substituir o rascunho?</h2>
            <p>
              O circuito atual salvo neste navegador será substituído. Os links
              já compartilhados continuam iguais.
            </p>
            <div className="modal-actions">
              <button onClick={() => setReplacement(null)}>Cancelar</button>
              <button className="primary" onClick={() => load(replacement)}>
                Substituir rascunho
              </button>
            </div>
          </section>
        </div>
      )}
      {link && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            className="modal"
          >
            <span className="eyebrow">COMPARTILHAR UMA DESCOBERTA</span>
            <h2 id="share-title">O mesmo circuito. Novas ideias.</h2>
            <p>
              Quem possui este link pode ler o circuito e seus resultados e
              criar uma cópia. Ele é uma versão fixa e não é privado.
            </p>
            <label htmlFor="share-link">Link do circuito</label>
            <textarea
              id="share-link"
              readOnly
              value={link}
              onFocus={(e) => e.target.select()}
            />
            <div className="modal-actions">
              <button onClick={() => setLink("")}>Fechar</button>
              <button
                className="primary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    setNotice("Link copiado.");
                  } catch {
                    setNotice("Selecione e copie o link manualmente.");
                  }
                }}
              >
                Copiar link
              </button>
            </div>
            <p className="hint">
              Links extensos podem ser cortados por alguns aplicativos de
              mensagens.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
