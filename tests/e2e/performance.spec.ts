import { test, expect } from "@playwright/test";
import { scaleCircuit } from "../fixtures/scale";
test("20 análises de 50 componentes respeitam a meta de 2 segundos", async ({
  page,
}, testInfo) => {
  const document = scaleCircuit();
  await page.addInitScript((d) => {
    localStorage.setItem(
      "circuitos-sim:draft:v1",
      JSON.stringify({ schemaVersion: 1, document: d }),
    );
  }, document);
  await page.goto("/");
  await expect(
    page.getByText("Rascunho recuperado · analise novamente"),
  ).toBeVisible();
  const durations: number[] = [];
  for (let i = 0; i < 20; i++) {
    const start = Date.now();
    await page.getByRole("button", { name: "Analisar", exact: true }).click();
    await expect(
      page.getByText("Análise válida", { exact: true }),
    ).toBeVisible();
    durations.push(Date.now() - start);
  }
  expect(durations.filter((t) => t <= 2000).length).toBeGreaterThanOrEqual(19);
  await testInfo.attach("performance.json", {
    body: JSON.stringify({
      browser: testInfo.project.name,
      components: 50,
      nodes: 50,
      durations,
    }),
    contentType: "application/json",
  });
  console.info(
    testInfo.project.name,
    "performance ms",
    JSON.stringify(durations),
  );
});
