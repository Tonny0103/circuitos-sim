import { test, expect } from '@playwright/test';
import { sharedV1 } from '../fixtures/shared-v1';
// Each Playwright test receives an independent browser context. A literal historical link
// makes the ten recipient sessions independent of the current encoder implementation.
for (let session=1; session<=10; session++) {
 test(`SC-007: sessão independente ${session} preserva original`,async({page})=>{
  test.setTimeout(60000);
  const route='/#'+sharedV1;
  await page.goto(route);
  await expect(page.getByText('Somente leitura',{exact:true})).toBeVisible();
  await page.getByTestId('component-r1').click();
  await expect(page.getByTestId('result-current')).toContainText('5 mA');
  await page.getByRole('button',{name:'Criar cópia para editar'}).click();
  await page.getByTestId('component-r1').click();
  await page.getByLabel('Valor',{exact:true}).fill('2000');
  await page.getByRole('button',{name:'Aplicar valor'}).click();
  await expect(page.getByText('Análise invalidada',{exact:true})).toBeVisible();
  await page.goto(route);
  await expect(page.getByText('Somente leitura',{exact:true})).toBeVisible();
  await page.getByTestId('component-r1').click();
  await expect(page.getByTestId('result-current')).toContainText('5 mA');
 });
}
