import { test, expect } from "@playwright/test";
test("rascunho restaura geometria e valores mas exige análise", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Divisor de tensão", exact: true })
    .click();
  await page.getByRole("button", { name: "Analisar", exact: true }).click();
  await page.getByTestId("component-r1").click();
  await page.getByLabel("Valor", { exact: true }).fill("2,2");
  await page.getByLabel("Unidade").selectOption("1000");
  await page.getByRole("button", { name: "Aplicar valor" }).click();
  await expect(
    page.getByText("Análise invalidada", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Rascunho recuperado · analise novamente"),
  ).toBeVisible();
  await expect(page.getByText("Não analisado", { exact: true })).toBeVisible();
  await expect(page.getByTestId("component-r1")).toHaveAttribute(
    "aria-label",
    /2.2 kΩ/,
  );
});
