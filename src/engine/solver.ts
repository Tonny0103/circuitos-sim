import { Matrix, LuDecomposition, SingularValueDecomposition } from "ml-matrix";
import { fail, type Failure } from "../domain/errors";
export const classifySingularValue = (s: number, tau: number) =>
  s < tau / 10 ? "zero" : s > 10 * tau ? "nonzero" : "uncertain";
export const classifySingularResidual = (r: number) =>
  r < 1e-11 ? "compatible" : r > 1e-9 ? "incompatible" : "uncertain";
const max = (v: number[]) => Math.max(0, ...v.map(Math.abs));
export function residual(a: number[][], b: number[], x: number[]) {
  const error = max(
    a.map((row, i) => row.reduce((s, v, j) => s + v * x[j], 0) - b[i]),
  );
  const denominator =
    Math.max(0, ...a.map((row) => row.reduce((s, v) => s + Math.abs(v), 0))) *
      max(x) +
    max(b);
  return denominator === 0 ? (error === 0 ? 0 : Infinity) : error / denominator;
}
export function solve(
  a: number[][],
  b: number[],
):
  | { ok: true; x: number[]; rank: number; condition: number; residual: number }
  | Failure {
  try {
    const n = b.length;
    if (!n) return { ok: true, x: [], rank: 0, condition: 1, residual: 0 };
    if (
      a.length !== n ||
      a.some((row) => row.length !== n) ||
      [...a.flat(), ...b].some((v) => !Number.isFinite(v))
    )
      return fail("NUMERICAL_FAILURE");
    const rows = a.map((r) => max(r) || 1);
    const ar = a.map((r, i) => r.map((v) => v / rows[i]));
    const cols = Array.from(
      { length: n },
      (_, j) => max(ar.map((r) => r[j])) || 1,
    );
    const scaled = ar.map((r) => r.map((v, j) => v / cols[j]));
    const rhs = b.map((v, i) => v / rows[i]);
    const svd = new SingularValueDecomposition(new Matrix(scaled));
    const singular = svd.diagonal;
    const largest = singular[0];
    if (largest === 0)
      return fail(
        max(rhs) === 0 ? "NON_UNIQUE_SOLUTION" : "INCONSISTENT_CONSTRAINTS",
      );
    const tau = 100 * Number.EPSILON * n * largest;
    const classes = singular.map((s) => classifySingularValue(s, tau));
    if (classes.includes("uncertain")) return fail("NUMERICAL_FAILURE");
    const rank = classes.filter((c) => c === "nonzero").length;
    if (rank < n) {
      // Use only singular vectors confirmed nonzero by the product policy. This is diagnostic,
      // never a physical answer for a circuit without a unique solution.
      const u = svd.leftSingularVectors,
        v = svd.rightSingularVectors;
      const candidate = Array(n).fill(0) as number[];
      for (let k = 0; k < n; k++)
        if (classes[k] === "nonzero") {
          let coeff = 0;
          for (let i = 0; i < n; i++) coeff += u.get(i, k) * rhs[i];
          coeff /= singular[k];
          for (let j = 0; j < n; j++) candidate[j] += v.get(j, k) * coeff;
        }
      const category = classifySingularResidual(
        residual(scaled, rhs, candidate),
      );
      return fail(
        category === "compatible"
          ? "NON_UNIQUE_SOLUTION"
          : category === "incompatible"
            ? "INCONSISTENT_CONSTRAINTS"
            : "NUMERICAL_FAILURE",
      );
    }
    const condition = largest / singular[n - 1];
    if (condition > 1e12) return fail("NUMERICAL_FAILURE");
    const y = new LuDecomposition(new Matrix(scaled))
      .solve(Matrix.columnVector(rhs))
      .to1DArray();
    const x = y.map((v, j) => v / cols[j]);
    const r = residual(a, b, x);
    if (x.some((v) => !Number.isFinite(v)) || !Number.isFinite(r) || r > 1e-10)
      return fail("NUMERICAL_FAILURE");
    return { ok: true, x, rank, condition, residual: r };
  } catch {
    return fail("NUMERICAL_FAILURE");
  }
}
