import type { Netlist } from "./types";
export function stamp(n: Netlist) {
  const nodes = n.nodes.filter((v) => v !== "0").sort();
  const sources = [...n.voltageSources].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const size = nodes.length + sources.length;
  const a = Array.from({ length: size }, () => Array(size).fill(0) as number[]);
  const b = Array(size).fill(0) as number[];
  const at = (id: string) => (id === "0" ? -1 : nodes.indexOf(id));
  const add = (r: number, c: number, v: number) => {
    if (r >= 0 && c >= 0) a[r][c] += v;
  };
  for (const r of n.resistors) {
    const i = at(r.aNode),
      j = at(r.bNode),
      g = 1 / r.value;
    add(i, i, g);
    add(j, j, g);
    add(i, j, -g);
    add(j, i, -g);
  }
  sources.forEach((s, k) => {
    const c = nodes.length + k,
      i = at(s.aNode),
      j = at(s.bNode);
    add(i, c, 1);
    add(j, c, -1);
    add(c, i, 1);
    add(c, j, -1);
    b[c] = s.value;
  });
  return { a, b, nodes, sources };
}
