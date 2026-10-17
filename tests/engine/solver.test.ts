import { it, expect } from "vitest";
import {
  solve,
  classifySingularValue,
  classifySingularResidual,
} from "../../src/engine/solver";
it("resolve matriz que exige pivô e devolve unidades originais", () => {
  const r = solve(
    [
      [0, 1],
      [1, 1000],
    ],
    [2, 2003],
  );
  expect(r.ok).toBe(true);
  if (r.ok) {
    expect(r.x[0]).toBeCloseTo(3, 10);
    expect(r.x[1]).toBeCloseTo(2, 10);
  }
});
it("faixas fechadas de incerteza são explícitas", () => {
  const tau = 1e-12;
  expect(classifySingularValue(tau / 100, tau)).toBe("zero");
  expect(classifySingularValue(tau / 10, tau)).toBe("uncertain");
  expect(classifySingularValue(tau * 10, tau)).toBe("uncertain");
  expect(classifySingularValue(tau * 100, tau)).toBe("nonzero");
  expect(classifySingularResidual(1e-12)).toBe("compatible");
  expect(classifySingularResidual(1e-11)).toBe("uncertain");
  expect(classifySingularResidual(1e-9)).toBe("uncertain");
  expect(classifySingularResidual(1e-8)).toBe("incompatible");
});
it("matriz nula é tratada sem faixa degenerada", () => {
  const r = solve([[0]], [0]);
  expect(!r.ok && r.errors[0].code).toBe("NON_UNIQUE_SOLUTION");
  const bad = solve([[0]], [1]);
  expect(!bad.ok && bad.errors[0].code).toBe("INCONSISTENT_CONSTRAINTS");
});
