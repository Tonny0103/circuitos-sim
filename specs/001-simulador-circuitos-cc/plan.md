# Implementation Plan: Simulador educacional de circuitos resistivos CC

**Branch**: `001-simulador-circuitos-cc` (identificador informado pelo setup; sem checkout Git)
| **Date**: 2026-10-17 | **Spec**: [spec.md](spec.md)

**Input**: Especificação `specs/001-simulador-circuitos-cc/spec.md` e orientação para TypeScript,
motor independente com análise nodal modificada (MNA), comparação de canvas e links e deploy.

## Summary

Aplicação Next.js/React em TypeScript, exportada como site estático, com editor SVG nativo.
O navegador executa o motor puro de MNA, salva um rascunho local e gera links com snapshots
comprimidos no fragmento da URL. Um único projeto, sem API, banco ou Spring Boot neste MVP.
Next.js aproveita a familiaridade do mantenedor; Spring adicionaria operação sem necessidade
funcional atual. Alternativas e fontes estão em [research.md](research.md).

Separação: interface → comandos do editor → documento → topologia elétrica → MNA → resultados.
SVG só desenha e captura intenções. A conectividade depende de referências explícitas, nunca
de coordenadas ou interseções. Compartilhamento lê um snapshot isolado do rascunho editável.

## Technical Context

**Language/Version**: TypeScript 5.x, strict; Node.js 24 LTS para ferramentas e CI.

**Primary Dependencies**: Next.js 16.x e React 19.x compatíveis entre si; `ml-matrix` 6.x
para decomposições numéricas; Zod 4.x para dados externos. Usar patches estáveis suportados
na implementação e registrar versões exatas no package-lock.json. Sem biblioteca de canvas,
estado global ou compressão: SVG, useReducer e CompressionStream/DecompressionStream gzip.

**Storage**: Um documento versionado em localStorage; snapshots autocontidos na URL.

**Testing**: Vitest em Node para motor/topologia/codec, React Testing Library para interface,
Playwright Chromium/Firefox/WebKit para integração no site estático. Typecheck e ESLint explícitos.

**Target Platform**: Navegadores desktop atuais com SVG, Pointer Events e compressão gzip nativa;
detectar suporte e explicar indisponibilidade. Windows para desenvolvimento; Linux para CI.

**Project Type**: Aplicação web estática, um pacote npm; motor reutilizável por imports locais.

**Performance Goals**: SC-006: 19/20 análises em até 2 s, incluindo diagnóstico; máximo 149
incógnitas (99 tensões não terra e 50 correntes de fontes). Medir no build de produção.

**Constraints**: 50 resistores/fontes, 100 nós elétricos, 20 símbolos de terra, 300 fios,
200 junções, 8 pontos intermediários por fio; IDs até 64 caracteres, rótulos até 32,
coordenadas finitas em ±10000 unidades de desenho. JSON de entrada até 256 KiB e URL completa
até 64000 caracteres. São limites do produto, não garantias de transporte de todos os serviços
de mensagens. Detectar excedentes antes de aplicar comandos/importar; nunca truncar dados.

**Scale/Scope**: Uma tela com editor, paleta, exemplos e painel de propriedades/resultados;
um modo de leitura por link. Rascunho local único; sem contas ou biblioteca pessoal.

## Constitution Check

| Princípio/gate | Antes da pesquisa | Após o design: evidência exigida |
|---|---|---|
| Correção e validação analítica | PASS | MNA com sinais definidos; fixtures e tolerâncias abaixo |
| Motor separado | PASS | domain/ e engine/ sem React, DOM ou storage; teste em Node |
| Clareza didática | PASS | V/A/W, setas e polaridades; fonte com potência negativa |
| Escopo pequeno | PASS | Um frontend estático; limites e exclusões explícitos |
| Erros compreensíveis | PASS | Contrato discriminado; circuitos incompatíveis e indeterminados |
| Publicação e open-source | PASS | Vercel estático, CI, licença MIT proposta e documentação |

PASS significa conformidade do projeto proposto, não implementação validada. A entrega só
passa os gates de execução após os testes e verificações públicas de quickstart.md.

## Project Structure

### Documentation (this feature)

```text
specs/001-simulador-circuitos-cc/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   ├── engine.md
│   └── sharing-and-editor.md
├── quickstart.md
└── checklists/requirements.md
```

tasks.md será gerado posteriormente por `$speckit-tasks`.

### Source Code (repository root)

Estrutura proposta, ainda não criada:

```text
src/
├── app/                    # layout.tsx, page.tsx; casca estática, CSS
├── ui/                     # Editor, CircuitSvg, Inspector, Examples, ShareDialog
├── editor/                 # reducer, comandos, interação e seleção transitória
├── domain/                 # documento, schemas, limites, topologia pura
├── engine/                 # netlist, stamps MNA, solver, diagnóstico, grandezas
├── persistence/            # adaptador localStorage e recuperação
├── sharing/                # codec v1, validação e abertura somente leitura
└── examples/               # circuitos + explicação e referências analíticas
tests/
├── engine/                 # fixtures analíticas e casos inválidos
├── domain/                 # fios, junções, exclusão e limites
├── integration/            # reducer, persistência e compartilhamento
└── e2e/                    # fluxos no build exportado
.github/workflows/ci.yml
next.config.ts
package.json
package-lock.json
README.md
LICENSE
CONTRIBUTING.md
```

**Structure Decision**: Um pacote, fronteiras por responsabilidade; sem monorepo. engine/
depende apenas dos tipos elétricos e biblioteca numérica, nunca de ui/, editor/ ou browser.

## Complexity Tracking

Nenhuma exceção à constituição. A biblioteca numérica evita manter um solver próprio;
SVG evita adaptar um editor de fluxos a terminais elétricos. Backend só seria reconsiderado
se links curtos, revogação ou biblioteca remota se tornassem requisitos.

## Phase 0 — Decisões de pesquisa

[research.md](research.md) resolve escolhas de framework, desenho, links, persistência,
solver e hospedagem. Não há decisões bloqueantes ou marcadores de esclarecimento pendentes.

## Phase 1 — Desenho e contratos

### Editor e topologia

Componentes usam IDs e terminais a/b estáveis. Fios ligam terminais ou junções explícitas.
Conectar a um trecho divide o fio em dois e cria uma junção; conectar um cruzamento exige
ação explícita e divisão de ambos os fios. Pontos intermediários são só geometria.
Union-find agrupa extremos conectados e todos os terras no mesmo nó 0. IDs dos nós derivados
são determinísticos pelo menor ID de âncora; não dependem da ordem dos arrays.

Pointer Events e captura do ponteiro conduzem arraste; transformação inversa do SVG converte
coordenadas. Prévia de arraste é transitória; o primeiro deslocamento invalida a análise,
e pointerup conclui uma edição e salva. Esc cancela fio/arraste; se houve invalidação,
uma nova análise permanece necessária. Terminais e fios têm áreas de clique ampliadas;
cruzamento sem junção usa interrupção/ponte visual e junção usa ponto preenchido.
Botões HTML, foco visível, rótulos e mensagens aria-live; painel textual para resultados.

Reducer controla documento, revisão, seleção e estado de análise. Todo comando de edição
aceito incrementa revisão, invalida resultados e salva o documento; edição rejeitada não
altera o documento. Entrada numérica aceita vírgula ou ponto decimal, sem separador de milhar,
e seletor de unidade/prefixo; o motor recebe SI. Resultados arredondados só para exibição.

### Motor MNA

1. Validar documento, valores finitos, referências, terra e terminais conectados. Conferir
   limites após derivar nós. Buscar componentes sem caminho elétrico até terra.
2. Criar netlist sem coordenadas. Para n nós não terra e m fontes, resolver
   `[G B; Bᵀ 0] [v; j] = [0; e]`. A corrente j da fonte é positiva de a(+) para b(-).
3. Resistor a–b: g=1/R; somar +g nas diagonais presentes e -g nas posições cruzadas;
   omitir linhas/colunas de terra. Terminais no mesmo nó têm contribuição líquida zero.
4. Fonte k: B[a,k]+=1, B[b,k]-=1, e[k]=Vab; incidências em terra são omitidas.
   Correntes dos resistores são (Va−Vb)/R; fontes usam j; potência é Vab·Iab.
5. Usar float64, equilibrar linhas e colunas por seus maiores módulos não nulos antes da
   decomposição; preservar transformações para recuperar x nas unidades originais.
   LU com pivoteamento da biblioteca resolve sistemas de posto completo. SVD informa posto
   e condicionamento; não aceitar pseudoinversa como solução física de sistema singular.
6. No sistema equilibrado, considerar singular value <= 100·eps·dimensão·sigmaMax como zero.
   Para posto deficiente, avaliar resíduo da solução SVD: incompatível se resíduo normalizado
   >1e-10, indeterminado caso contrário. Como limiares numéricos são aproximações, casos
   próximos ao limiar retornam NUMERICAL_FAILURE em vez de afirmar diagnóstico confiável.
7. Mesmo com posto completo, rejeitar condição estimada >1e12, números não finitos ou resíduo
   normalizado >1e-10. Checar KCL e balanço de potência com tolerâncias das fixtures. Não
   adicionar resistências fictícias, gmin nem regularização para forçar solução única.

Normalização de resíduo: ||Ax−b||∞/(||A||∞·||x||∞+||b||∞), com tratamento explícito do
denominador zero. Usar A original para validar solução final e matriz equilibrada para
diagnóstico de posto. Códigos e ordem de erros em [contracts/engine.md](contracts/engine.md).

### Links e recuperação

URL `/#c=v1.<base64url(gzip(JSON))>` contém documento e análise válida, com versões de schema
e motor. Validação limitada por tamanho precede parse; recalcular e comparar resultados
recebidos antes de mostrá-los. Divergência ou versão incompatível gera erro de link.
Resultados recebidos nunca são autoridade. Não há assinatura nem garantia de autoria.

Ler link não toca no rascunho. Criar cópia exige confirmar substituição, gera novo documentId,
remove fragmento e troca para edição; primeira edição invalida análise. Ao restaurar rascunho,
sempre exigir análise. Uma única chamada localStorage.setItem por edição concluída; capturar
exceções e mostrar aviso. Não depender de beforeunload. Abas concorrentes mostram aviso de
rascunho alterado em outra aba; não mesclar nem substituir documento aberto silenciosamente.

## Validation Strategy

### Referências analíticas obrigatórias

Em todas as tabelas, fonte tem corrente a(+)→b(-), potência positiva absorvida. Valores esperados
devem ser literais derivados à mão, nunca gerados pelo mesmo algoritmo sob teste.

| Fixture e dedução | Tensões e correntes | Potências |
|---|---|---|
| 10 V, R=1 kΩ até terra: I=V/R | nó=10 V; R=10 mA; fonte=-10 mA | R=100 mW; fonte=-100 mW |
| Divisor: 10 V, R1=R2=1 kΩ | A=10 V, B=5 V; R1/R2=5 mA | cada R=25 mW; fonte=-50 mW |
| Paralelo: 12 V, 1 kΩ e 2 kΩ | 12 V; correntes 12 e 6 mA; fonte=-18 mA | 144 e 72 mW; fonte=-216 mW |
| Duas fontes: A=10 V, B=5 V; R1 A–C, R2 C–B, R3 C–terra, todos 1 kΩ; (10+5+0)/3 | C=5 V; R1=5 mA; R2=0; R3=5 mA; fontes A=-5 mA, B=0 | 25, 0, 25 mW; fontes -50, 0 mW |
| Supernó: fonte A–B=10 V, R A–terra=1 kΩ, R B–terra=1 kΩ; A+B=0 | A=5 V, B=-5 V; R=5 e -5 mA; fonte=-5 mA | R=25 mW cada; fonte=-50 mW |
| Fonte -10 V, R=1 kΩ | nó=-10 V; R=-10 mA; fonte=10 mA | R=100 mW; fonte=-100 mW |
| Fonte 0 V A–terra, R=1 kΩ A–terra | A=0 V; ambas correntes=0 | ambas potências=0 |

Asserção por grandeza: |obtido−esperado| <= 1e-6 na unidade SI + 1e-4·|esperado|,
conforme SC-003. Esse piso permite comparação perto de zero; fixtures usuais também recebem
checagens mais estritas (1e-10 SI) para evitar que o piso esconda erro de montagem/signo.
Verificar KCL por nó e soma de potências zero, com tolerância acumulada por número de ramos.

Incluir resistor em curto, múltiplos terras, circuitos sem fonte com solução zero e permutação
de IDs/ordem. Negativos: vazio, sem terra, terminal aberto, flutuante, fontes paralelas iguais
e diferentes, laços redundantes e incompatíveis, valor inválido, curto de fonte e falha numérica.
Os limiares do solver precisam de fixtures nos dois lados do limite e erro numérico explícito
na zona de incerteza; testar solver separadamente com matrizes de posto conhecido.

### Fluxos e gates

- Integração: cruzamento não une; junção une; mover/girar preserva terminais; excluir remove
  fios incidentes; todas as edições invalidam. Estados e persistência FR-021, falhas de quota,
  dados corrompidos, substituição confirmada e análise obrigatória após restauração.
- Playwright: montar divisor via UI → analisar → selecionar B/R/fonte → compartilhar → abrir
  nova sessão → consultar → criar cópia → alterar → reanalisar → original intacto.
- Links: round-trip exato, payload truncado/adulterado, versões desconhecidas, resultado
  adulterado, tamanho excessivo e expansão de gzip além do limite; preservar rascunho.
- Limites: fixtures de fronteira 50 componentes/100 nós e máximo de fios/junções. Medir bytes
  e URL após serialização real, incluindo resultados. Se o orçamento de link falhar, bloquear
  emissão com explicação; só aceitar o release se os exemplos e fixture de escala puderem
  ser compartilhados. Não prometer compartilhamento universal para qualquer geometria.
- Build estático sem acesso a window/localStorage no prerender; testar os três navegadores.
- SC-001/002/005: avaliação com cinco estudantes; registrar tempos e compreensão. SC-006:
  20 medições com ambiente descrito. SC-007: 10 verificações entre sessões.
- CI: npm ci → typecheck → lint → testes unitários/integração → build → testes E2E em out/.
  Gate de produção também exige prova manual de SC-008 e revisão de licença/documentação.

## Deployment Plan

1. Na implementação, criar Next.js com `output: 'export'`, uma rota `/`, sem rotas dinâmicas,
   Server Actions ou API. Gerar `out/` com npm run build; servir localmente por HTTP.
2. Criar repositório público, LICENSE MIT (proposta adotada no plano), README, CONTRIBUTING
   e lockfile. Documentar limites, sinais, URL longa e persistência por origem/navegador.
3. Configurar CI em pull requests e branch principal com Node 24; executar gates acima e
   guardar relatórios de testes, traces das falhas e evidência de precisão/latência.
4. Importar repositório na Vercel, preset Next.js, npm ci, npm run build e saída estática out/;
   sem variáveis de ambiente ou credenciais na aplicação. Branch principal será produção;
   previews para revisão. Remover proteção de acesso do deployment de produção, se ativa.
5. Verificar HTTPS e, em navegador anônimo, divisor, erro sem terra e link direto com fragmento.
   Executar E2E contra a URL pública e validar recuperação local. Registrar URL e commit no README.
6. Publicar somente o commit com CI aprovado; rollback promovendo deployment anterior aprovado.
   Manter decoder v1 em futuras versões e testar links antigos. Troca de domínio não migra
   localStorage nem modifica links já enviados: documentar antes de qualquer mudança.

Fase atual termina no design: nenhum código, workflow, repositório remoto ou deploy foi criado.
