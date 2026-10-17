// @vitest-environment jsdom
import "../setup-ui";
import { afterEach, it, expect } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { Editor } from "../../src/ui/Editor";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
it("oferece controles nomeados, unidades e referências sem depender de cor", async () => {
  render(<Editor />);
  const analyze = screen.getByRole("button", { name: "Analisar" });
  await waitFor(() => expect(analyze).toBeEnabled());
  fireEvent.click(
    screen.getByRole("button", { name: "Divisor de tensão" }),
  );
  fireEvent.click(screen.getByTestId("component-r1"));
  expect(screen.getByLabelText("Valor", { exact: true })).toBeVisible();
  expect(screen.getByLabelText("Unidade")).toBeVisible();
  expect(screen.getByText(/referência a \(\+\) → b \(−\)/)).toBeVisible();
  expect(screen.getByRole("button", { name: "↻ Girar 90°" })).toBeEnabled();
  expect(
    screen.getByRole("button", { name: "Excluir" }),
  ).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "⌁ Fio" }));
  fireEvent.keyDown(window, { key: "Escape" });
  expect(
    screen.getByRole("button", { name: "↖ Selecionar" }),
  ).toHaveClass("active");
});
