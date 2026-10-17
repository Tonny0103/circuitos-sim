import { test, expect } from "@playwright/test";
test("SC-009: dez recuperações, incluindo reinício do navegador", async ({
  browser,
  baseURL,
}, info) => {
  test.setTimeout(180000);
  const type = browser.browserType();
  const profile = info.outputPath("persistent-profile");
  let context = await type.launchPersistentContext(profile, { headless: true });
  try {
    let page = await context.newPage();
    await page.goto(baseURL!);
    await page
      .getByRole("button", { name: "Divisor de tensão", exact: true })
      .click();
    await page.getByTestId("component-r1").click();
    await page.getByLabel("Valor", { exact: true }).fill("2200");
    await page.getByRole("button", { name: "Aplicar valor" }).click();
    for (let i = 0; i < 10; i++) {
      if (i === 5) {
        await context.close();
        context = await type.launchPersistentContext(profile, {
          headless: true,
        });
        page = await context.newPage();
        await page.goto(baseURL!);
      } else await page.reload();
      await expect(
        page.getByText("Rascunho recuperado · analise novamente"),
      ).toBeVisible();
      await expect(
        page.getByText("Não analisado", { exact: true }),
      ).toBeVisible();
      await expect(page.getByTestId("component-r1")).toHaveAttribute(
        "aria-label",
        /2.2 kΩ/,
      );
    }
  } finally {
    await context.close();
  }
});
