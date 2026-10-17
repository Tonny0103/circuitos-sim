import { test, expect } from "@playwright/test";
for (const [title, current, power] of [
  ["Lei de Ohm", "10 mA", "100 mW"],
  ["Divisor de tensão", "5 mA", "25 mW"],
  ["Resistores em paralelo", "12 mA", "144 mW"],
]) {
  test(`exemplo pronto: ${title}`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: title, exact: true }).click();
    await page.getByRole("button", { name: "Analisar", exact: true }).click();
    await page.getByTestId("component-r1").click();
    await expect(page.getByTestId("result-current")).toContainText(current);
    await expect(page.getByTestId("result-power")).toContainText(power);
    await page.getByTestId("terminal-g1-g").click();
    await expect(page.getByTestId("result-node")).toContainText("0 V");
    await expect(
      page.getByText("Conferência analítica", { exact: true }),
    ).toBeVisible();
  });
}
test("exemplo analítico, grandezas e sinais", async ({ page, browserName }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Divisor de tensão", exact: true })
    .click();
  await page.getByRole("button", { name: "Analisar", exact: true }).click();
  await expect(page.getByText("Análise válida", { exact: true })).toBeVisible();
  await page.getByTestId("component-r1").click();
  await expect(page.getByTestId("result-voltage")).toContainText("5 V");
  await expect(page.getByTestId("result-current")).toContainText("5 mA");
  await expect(page.getByTestId("result-power")).toContainText("25 mW");
  await page.getByTestId("component-v1").click();
  await expect(page.getByTestId("result-power")).toContainText("-50 mW");
  await page.screenshot({
    path: `test-results/editor-${browserName}.png`,
    fullPage: true,
  });
});
