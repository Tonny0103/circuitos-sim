export function format(value: number, unit: string) {
  if (!Number.isFinite(value)) return "—";
  const v = Math.abs(value) < 1e-12 ? 0 : value;
  const magnitude = Math.abs(v);
  const [scale, prefix] =
    magnitude === 0
      ? [1, ""]
      : magnitude >= 1e6
        ? [1e6, "M"]
        : magnitude >= 1e3
          ? [1e3, "k"]
          : magnitude >= 1
            ? [1, ""]
            : magnitude >= 1e-3
              ? [1e-3, "m"]
              : magnitude >= 1e-6
                ? [1e-6, "µ"]
                : [1e-9, "n"];
  return `${Number((v / Number(scale)).toPrecision(6))} ${prefix}${unit}`;
}
