"use client";
import { useRef } from "react";
import {
  type CircuitDocument,
  type Endpoint,
  type Point,
  terminal,
  key,
} from "../domain/document";
import { endpointPosition } from "./geometry";
import { format } from "./format";
type Props = {
  document: CircuitDocument;
  selection: string | null;
  readOnly: boolean;
  mode: "select" | "wire" | "junction";
  pending: Endpoint | null;
  onSelect: (id: string | null) => void;
  onAnchor: (e: Endpoint) => void;
  onWire: (id: string, p: Point) => void;
  onMove: (id: string, p: Point) => void;
  onInvalidate: () => void;
};
export function CircuitSvg(p: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    id: string;
    start: Point;
    origin: Point;
    moved: boolean;
  } | null>(null);
  const suppress = useRef(false);
  const local = (e: { clientX: number; clientY: number }): Point => {
    const el = svg.current!;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      el.getScreenCTM()!.inverse(),
    );
    return { x: pt.x, y: pt.y };
  };
  const anchor = (e: Endpoint) => {
    const pt = endpointPosition(p.document, e);
    return (
      <g key={key(e)}>
        <circle
          role="button"
          tabIndex={0}
          aria-label={`Terminal ${e.ownerId} ${e.kind === "terminal" ? e.terminal : "terra"}`}
          data-testid={`terminal-${e.ownerId}-${e.kind === "terminal" ? e.terminal : "g"}`}
          cx={pt.x}
          cy={pt.y}
          r={8}
          className={
            p.pending && key(p.pending) === key(e)
              ? "terminal active"
              : "terminal"
          }
          onPointerDown={(ev) => ev.stopPropagation()}
          onClick={(ev) => {
            ev.stopPropagation();
            p.onAnchor(e);
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") p.onAnchor(e);
          }}
        />
        {e.kind === "terminal" && (
          <text
            x={pt.x - 12}
            y={pt.y - 13}
            className="terminal-label"
            pointerEvents="none"
          >
            {e.terminal === "a" ? "a (+)" : "b (−)"}
          </text>
        )}
      </g>
    );
  };
  return (
    <svg
      ref={svg}
      className="circuit-svg"
      viewBox="0 0 1000 640"
      aria-label="Área de montagem do circuito"
      onClick={() => {
        if (!suppress.current) p.onSelect(null);
        suppress.current = false;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const pt = local(e);
        if (Math.hypot(pt.x - d.start.x, pt.y - d.start.y) > 3) {
          if (!d.moved) p.onInvalidate();
          d.moved = true;
          const el = svg.current?.querySelector(
            `[data-drag-id="${CSS.escape(d.id)}"]`,
          );
          el?.setAttribute(
            "transform",
            `translate(${pt.x - d.start.x} ${pt.y - d.start.y})`,
          );
        }
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        if (!d) return;
        drag.current = null;
        if (d.moved) {
          const pt = local(e);
          svg.current
            ?.querySelector(`[data-drag-id="${CSS.escape(d.id)}"]`)
            ?.removeAttribute("transform");
          p.onMove(d.id, {
            x: d.origin.x + pt.x - d.start.x,
            y: d.origin.y + pt.y - d.start.y,
          });
          suppress.current = true;
        }
      }}
      onPointerCancel={() => {
        const d = drag.current;
        if (d)
          svg.current
            ?.querySelector(`[data-drag-id="${CSS.escape(d.id)}"]`)
            ?.removeAttribute("transform");
        drag.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          const d = drag.current;
          if (d)
            svg.current
              ?.querySelector(`[data-drag-id="${CSS.escape(d.id)}"]`)
              ?.removeAttribute("transform");
          drag.current = null;
        }
      }}
    >
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#dce3dd" />
        </pattern>
      </defs>
      <rect width="1000" height="640" fill="url(#grid)" />
      {p.document.wires.map((w) => {
        const points = [
          endpointPosition(p.document, w.from),
          ...w.bends,
          endpointPosition(p.document, w.to),
        ]
          .map((v) => `${v.x},${v.y}`)
          .join(" ");
        return (
          <g key={w.id}>
            <polyline
              points={points}
              fill="none"
              stroke="#fafbf6"
              strokeWidth={8}
            />
            <polyline
              data-testid={`wire-${w.id}`}
              points={points}
              className={p.selection === w.id ? "wire selected" : "wire"}
              onClick={(e) => {
                e.stopPropagation();
                p.onWire(w.id, local(e));
              }}
            />
          </g>
        );
      })}
      {p.document.components.map((c) => (
        <g
          key={c.id}
          data-drag-id={c.id}
          onClick={(e) => {
            e.stopPropagation();
            if (!suppress.current) p.onSelect(c.id);
            suppress.current = false;
          }}
          onPointerDown={(e) => {
            if (p.readOnly || p.mode !== "select" || e.button !== 0) return;
            const target = e.target as Element;
            if (target.classList.contains("terminal")) return;
            drag.current = {
              id: c.id,
              start: local(e),
              origin: { x: c.x, y: c.y },
              moved: false,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
        >
          <g
            transform={`translate(${c.x} ${c.y}) rotate(${c.rotation})`}
            role="button"
            tabIndex={0}
            aria-label={`${c.label}, ${c.kind === "resistor" ? "resistor" : "fonte"}, ${format(c.valueSI, c.kind === "resistor" ? "Ω" : "V")}`}
            data-testid={`component-${c.id}`}
            className={
              p.selection === c.id ? "component selected" : "component"
            }
            onClick={(e) => {
              e.stopPropagation();
              if (!suppress.current) p.onSelect(c.id);
              suppress.current = false;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") p.onSelect(c.id);
            }}
          >
            <rect
              x={-64}
              y={-38}
              width={128}
              height={76}
              fill="transparent"
              stroke="none"
            />
            <path d="M -60 0 H -36 M 36 0 H 60" />
            {c.kind === "resistor" ? (
              <path d="M -36 0 L -30 -12 L -18 12 L -6 -12 L 6 12 L 18 -12 L 30 12 L 36 0" />
            ) : (
              <>
                <circle r={30} fill="#fafbf6" />
                <text x={-17} y={5} className="symbol">
                  +
                </text>
                <text x={10} y={5} className="symbol">
                  −
                </text>
              </>
            )}
          </g>
          <text
            x={c.x}
            y={c.y - 48}
            className="component-label"
            textAnchor="middle"
          >
            {c.label} · {format(c.valueSI, c.kind === "resistor" ? "Ω" : "V")}
          </text>
        </g>
      ))}
      {p.document.grounds.map((g) => (
        <g
          key={g.id}
          data-drag-id={g.id}
          role="button"
          tabIndex={0}
          aria-label="Terra"
          onClick={(e) => {
            e.stopPropagation();
            p.onSelect(g.id);
          }}
          onPointerDown={(e) => {
            if (!p.readOnly && p.mode === "select") {
              drag.current = {
                id: g.id,
                start: local(e),
                origin: g,
                moved: false,
              };
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }}
        >
          <g
            transform={`translate(${g.x} ${g.y}) rotate(${g.rotation})`}
            className="ground"
          >
            <path d="M 0 0 V 16 M -22 16 H 22 M -14 24 H 14 M -6 32 H 6" />
          </g>
          <text x={g.x + 32} y={g.y + 26} className="ground-label">
            0 V
          </text>
        </g>
      ))}
      {p.document.junctions.map((j) => (
        <circle
          key={j.id}
          cx={j.x}
          cy={j.y}
          r={6}
          className="junction"
          role="button"
          tabIndex={0}
          aria-label={`Junção ${j.id}`}
          onClick={(e) => {
            e.stopPropagation();
            p.onAnchor({ kind: "junction", ownerId: j.id });
          }}
        />
      ))}
      {p.document.components.flatMap((c) => [
        anchor(terminal(c.id, "a")),
        anchor(terminal(c.id, "b")),
      ])}
      {p.document.grounds.map((g) => anchor({ kind: "ground", ownerId: g.id }))}
      {!p.document.components.length && (
        <g>
          <text x="500" y="270" textAnchor="middle" className="empty-title">
            Seu próximo circuito começa aqui.
          </text>
          <text x="500" y="305" textAnchor="middle" className="empty-sub">
            Adicione componentes ou explore um dos exemplos.
          </text>
        </g>
      )}
    </svg>
  );
}
