// @vitest-environment jsdom
import "../setup-ui";
import { afterEach, it, expect } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ResultsPanel } from "../../src/ui/ResultsPanel";
import { examples } from "../../src/examples/circuits";
import { analyzeDocument } from "../../src/editor/analysis";
afterEach(cleanup);
it("apresenta grandezas do resistor e sentido de referência", () => {
  const d = examples[1].document,
    r = analyzeDocument(d);
  if (!r.ok) throw Error("fixture inválida");
  render(<ResultsPanel document={d} analysis={r} selection="r1" />);
  expect(screen.getByTestId("result-current")).toHaveTextContent("5 mA");
  expect(screen.getByTestId("result-power")).toHaveTextContent("25 mW");
  expect(screen.getByText("Corrente de referência a → b")).toBeVisible();
});
