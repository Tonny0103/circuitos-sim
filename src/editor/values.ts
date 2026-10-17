export function parseValue(raw: string, multiplier = 1) {
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(raw.trim()))
    throw Error("INVALID_VALUE");
  const value = Number(raw.replace(",", ".")) * multiplier;
  if (!Number.isFinite(value)) throw Error("INVALID_VALUE");
  return value;
}
