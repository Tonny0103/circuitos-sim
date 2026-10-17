import { test, expect } from "@playwright/test";
test("compartilhar snapshot, copiar e manter original", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Divisor de tensão", exact: true })
    .click();
  await page.getByRole("button", { name: "Analisar", exact: true }).click();
  await page.getByRole("button", { name: "Compartilhar", exact: true }).click();
  const url = await page.getByLabel("Link do circuito").inputValue();
  expect(url).toContain("/#c=v1.");
  const second = await context.newPage();
  await second.goto(url);
  await expect(
    second.getByText("Somente leitura", { exact: true }),
  ).toBeVisible();
  await second.getByTestId("component-r1").click();
  await expect(second.getByTestId("result-current")).toContainText("5 mA");
  await second.getByRole("button", { name: "Criar cópia para editar" }).click();
  if (
    await second
      .getByRole("button", { name: "Substituir rascunho" })
      .isVisible()
  )
    await second.getByRole("button", { name: "Substituir rascunho" }).click();
  await second.getByTestId("component-r1").click();
  await second.getByLabel("Valor").fill("2000");
  await second.getByRole("button", { name: "Aplicar valor" }).click();
  await expect(
    second.getByText("Análise invalidada", { exact: true }),
  ).toBeVisible();
  await second.goto(url);
  await expect(
    second.getByText("Somente leitura", { exact: true }),
  ).toBeVisible();
  await second.getByTestId("component-r1").click();
  await expect(second.getByTestId("result-current")).toContainText("5 mA");
});
