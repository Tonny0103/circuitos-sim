import { test, expect } from "@playwright/test";
import { emptyDocument, terminal } from "../../src/domain/document";
test("cruzamento só vira conexão após ação explícita de junção", async ({
  page,
}) => {
  const d = emptyDocument("crossing");
  d.components = [
    {
      id: "r1",
      kind: "resistor",
      label: "R1",
      valueSI: 1000,
      x: 200,
      y: 160,
      rotation: 0,
    },
    {
      id: "r2",
      kind: "resistor",
      label: "R2",
      valueSI: 1000,
      x: 700,
      y: 440,
      rotation: 0,
    },
  ];
  d.wires = [
    { id: "w1", from: terminal("r1", "a"), to: terminal("r2", "b"), bends: [] },
    { id: "w2", from: terminal("r1", "b"), to: terminal("r2", "a"), bends: [] },
  ];
  await page.addInitScript(
    (document) =>
      localStorage.setItem(
        "circuitos-sim:draft:v1",
        JSON.stringify({ schemaVersion: 1, document }),
      ),
    d,
  );
  await page.goto("/");
  await expect(
    page.getByText("Rascunho recuperado · analise novamente"),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("circuitos-sim:draft:v1")!).document
          .junctions.length,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "● Junção", exact: true }).click();
  const p = await page.locator("svg.circuit-svg").evaluate((el) => {
    const pos = new DOMPoint(450, 300).matrixTransform(
      (el as SVGSVGElement).getScreenCTM()!,
    );
    return { x: pos.x, y: pos.y };
  });
  await page.mouse.click(p.x, p.y);
  const changed = await page.evaluate(
    () => JSON.parse(localStorage.getItem("circuitos-sim:draft:v1")!).document,
  );
  expect(changed.junctions).toHaveLength(1);
  expect(changed.wires).toHaveLength(4);
});
test("arrastar preserva fios e invalida resultados; Esc cancela fio", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Divisor de tensão", exact: true })
    .click();
  await page.getByRole("button", { name: "Analisar", exact: true }).click();
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem("circuitos-sim:draft:v1")!).document,
  );
  const box = await page.getByTestId("component-r1").boundingBox();
  if (!box) throw Error("componente ausente");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 40,
    box.y + box.height / 2 + 40,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(
    page.getByText("Análise invalidada", { exact: true }),
  ).toBeVisible();
  const after = await page.evaluate(
    () => JSON.parse(localStorage.getItem("circuitos-sim:draft:v1")!).document,
  );
  expect(after.wires).toEqual(before.wires);
  expect(
    after.components.find((c: { id: string }) => c.id === "r1").x,
  ).not.toBe(before.components.find((c: { id: string }) => c.id === "r1").x);
  await page.getByRole("button", { name: "⌁ Fio", exact: true }).click();
  await page.getByTestId("terminal-r1-a").click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "↖ Selecionar", exact: true }),
  ).toHaveClass(/active/);
});
