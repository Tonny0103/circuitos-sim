import { test, expect } from "@playwright/test";
test("monta divisor a partir de canvas vazio com fios explícitos", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Fonte de tensão Ideal/ }).click();
  await page.getByRole("button", { name: /Resistor Resistência/ }).click();
  await page.getByRole("button", { name: /Resistor Resistência/ }).click();
  await page.getByRole("button", { name: /Terra Referência/ }).click();
  const ids = await page.evaluate(() => {
    const d = JSON.parse(
      localStorage.getItem("circuitos-sim:draft:v1")!,
    ).document;
    return {
      v: d.components[0].id,
      r1: d.components[1].id,
      r2: d.components[2].id,
      g: d.grounds[0].id,
    };
  });
  await page.getByRole("button", { name: "⌁ Fio", exact: true }).click();
  for (const [from, to] of [
    [`${ids.v}-a`, `${ids.r1}-a`],
    [`${ids.r1}-b`, `${ids.r2}-a`],
    [`${ids.r2}-b`, `${ids.g}-g`],
    [`${ids.v}-b`, `${ids.g}-g`],
  ]) {
    await page.getByTestId(`terminal-${from}`).click();
    await page.getByTestId(`terminal-${to}`).click();
  }
  await page.getByRole("button", { name: "↖ Selecionar", exact: true }).click();
  await page.getByRole("button", { name: "Analisar", exact: true }).click();
  await expect(page.getByText("Análise válida", { exact: true })).toBeVisible();
  await page.getByTestId(`component-${ids.r1}`).click();
  await expect(page.getByTestId("result-current")).toContainText("5 mA");
  await page.getByRole("button", { name: "↻ Girar 90°" }).click();
  await expect(
    page.getByText("Análise invalidada", { exact: true }),
  ).toBeVisible();
});
