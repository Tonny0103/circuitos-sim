import { test, expect } from "@playwright/test";
import {examples} from '../../src/examples/circuits';
import {terminal,type CircuitDocument} from '../../src/domain/document';
const cases:[string,(d:CircuitDocument)=>void][]=[
 ['tensões incompatíveis',d=>{d.components.push({...d.components[0],id:'v2',label:'V2',valueSI:5});d.wires.push({id:'extra1',from:terminal('v2','a'),to:terminal('v1','a'),bends:[]},{id:'extra2',from:terminal('v2','b'),to:terminal('v1','b'),bends:[]});}],
 ['não tem solução única',d=>{d.components.push({...d.components[0],id:'v2',label:'V2'});d.wires.push({id:'extra1',from:terminal('v2','a'),to:terminal('v1','a'),bends:[]},{id:'extra2',from:terminal('v2','b'),to:terminal('v1','b'),bends:[]});}],
 ['terminal sem fio',d=>{d.wires=d.wires.filter(w=>w.id!=='w0');}],
 ['precisão confiável',d=>{d.components.find(c=>c.kind==='resistor')!.valueSI=1e-320;}],
 ['parte flutuante',d=>{d.components.push({id:'f1',label:'F1',kind:'resistor',valueSI:1000,x:100,y:100,rotation:0},{id:'f2',label:'F2',kind:'resistor',valueSI:1000,x:100,y:200,rotation:0});d.wires.push({id:'fw1',from:terminal('f1','a'),to:terminal('f2','a'),bends:[]},{id:'fw2',from:terminal('f1','b'),to:terminal('f2','b'),bends:[]});}]
];
for(const [text,mutate] of cases)test(`explica ${text}`,async({page})=>{
 const d=structuredClone(examples[0].document);mutate(d);await page.addInitScript(document=>localStorage.setItem('circuitos-sim:draft:v1',JSON.stringify({schemaVersion:1,document})),d);await page.goto('/');await expect(page.getByText('Rascunho recuperado · analise novamente')).toBeVisible();await page.getByRole('button',{name:'Analisar',exact:true}).click();await expect(page.locator('.feedback [role=alert]')).toContainText(text);await expect(page.getByTestId('result-current')).toHaveCount(0);
});
test("montagem inválida explica o problema sem grandezas antigas", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Analisar", exact: true }).click();
  await expect(page.locator(".feedback [role=alert]")).toContainText("vazio");
  await page
    .getByRole("button", { name: "Divisor de tensão", exact: true })
    .click();
  await page.getByRole("button", { name: "Analisar", exact: true }).click();
  await page.getByRole("button", { name: "Terra", exact: true }).click();
  await page.getByRole("button", { name: "Excluir selecionado" }).click();
  await page.getByRole("button", { name: "Analisar", exact: true }).click();
  await expect(page.locator(".feedback [role=alert]")).toContainText(
    "Falta o terra",
  );
  await expect(page.getByTestId("result-current")).toHaveCount(0);
});
