---
description: "Tarefas executáveis do MVP educacional de circuitos resistivos CC"
---

# Tasks: Simulador educacional de circuitos resistivos CC

**Input**: Artefatos em `specs/001-simulador-circuitos-cc/`.
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ e quickstart.md;
constituição em `.specify/memory/constitution.md`.
**Tests**: Exigidos por FR-013, constituição e plano. Escrever os testes de cada história
antes da implementação correspondente, observar falha pelo comportamento ausente e depois
fazê-los passar. Testes não dependem de resultados produzidos pelo mesmo algoritmo sob teste.
**Organization**: Uma fase por história; fases comuns antes, validação/publicação ao final.

## Format: `[ID] [P?] [Story] Description`

- Todas as tarefas começam com checkbox, ID sequencial e caminho de arquivo.
- `[P]` indica trabalho em arquivos distintos, após os pré-requisitos da fase e da tarefa;
  não autoriza antecipar dependências nem executar mudanças concorrentes no mesmo arquivo.
- `[US1]`–`[US4]` correspondem às histórias da especificação.
- Checkboxes só são marcados quando a implementação e sua validação forem concluídas.

## Path Conventions

Projeto único: caminhos relativos à raiz em `src/`, `tests/`, `docs/` e `.github/`.
Este documento não cria código nem marca trabalho futuro como realizado.
Git já está inicializado em `main`, com primeiro commit; não reinicializar o repositório.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar um pacote Next.js/TypeScript com export estático e ferramentas de teste.

- [X] T001 Inicializar Next.js 16.x/React 19.x com TypeScript 5.x strict, Node 24 e dependências ml-matrix 6.x/Zod 4.x em `package.json`, `package-lock.json`, `tsconfig.json` e `next-env.d.ts`; fixar versões compatíveis, preservar `.specify/`, `.agents/`, `specs/` e histórico Git, sem backend.
- [X] T002 Configurar `output: 'export'` em `next.config.ts` e casca com rota única `/`, idioma pt-BR e CSS básico em `src/app/layout.tsx`, `src/app/page.tsx` e `src/app/globals.css`; disponibilizar dev/build/preview (`serve out -l 4173`) em `package.json` sem next start para produção.
- [X] T003 Configurar ESLint e fronteiras de imports para impedir React/DOM/storage/rede em `src/domain/` e `src/engine/`, usando `eslint.config.mjs`; disponibilizar typecheck e lint em `package.json` após T002, sem lint depender de build.
- [X] T004 Configurar Vitest Node, ambiente separado de UI com React Testing Library e scripts em `vitest.config.ts`, `tests/setup-ui.ts` e `package.json`; instalar dependências com lockfile e separar testes do motor dos testes de navegador.
- [X] T005 Configurar Chromium/Firefox/WebKit em `playwright.config.ts`, `webServer` servindo `out/` em localhost:4173 e modo `BASE_URL` para endereço público; adicionar script test:e2e em `package.json`, preservando as regras de `.gitignore` para relatórios e artefatos.

**Checkpoint**: Instalação reproduzível, typecheck/lint e build da casca funcionam; ferramentas
de teste configuradas. T003–T005 alteram package.json e devem ser executadas sequencialmente.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contratos compartilhados e derivação elétrica, independentes do SVG.
**CRITICAL**: Concluir esta fase antes das histórias. Ela não inclui editor nem solver pronto.

- [X] T006 Definir tipos/schema estrito em `src/domain/document.ts` e `src/domain/schema.ts`: "schemaVersion=1", "revision inteiro não negativo", "IDs são únicos em cada documento e namespaces são discriminados", "Terminais a/b implícitos; R>0; V finito; rotation em 0/90/180/270", "Uma âncora g; todos equivalem à referência 0", "Âncora explícita; ponto preenchido no desenho", "Referência existente; sem endpoint por coordenada" e "Extremos distintos; bends é lista de até 8 pontos geométricos"; validar enums de kind resistor/voltageSource e terminal/ground/junction, campos de data-model.md, chaves desconhecidas, valores não finitos, referências quebradas e rótulos como texto, permitindo documento vazio para edição. Converter falhas de campos elétricos em INVALID_VALUE, falhas estruturais em INVALID_DOCUMENT e excedentes em LIMIT_EXCEEDED, preservando a precedência do contrato em vez de tratar toda falha de schema como estrutura inválida.
- [X] T007 Implementar limites centralizados em `src/domain/limits.ts` e validação de limites em `src/domain/schema.ts`: 50 componentes, 100 nós derivados, 20 terras, 300 fios, 200 junções, 8 bends/fio, IDs até 64 caracteres, rótulos até 32, coordenadas finitas em ±10000, JSON até 256 KiB e URL completa até 64000 caracteres; rejeitar sem truncamento nem perda do documento.
- [X] T008 [P] Definir tipos Netlist, TopologyResult e AnalysisResult e códigos com precedência de `contracts/engine.md` em `src/engine/types.ts` e `src/domain/errors.ts`; sucesso usa engineVersion='1', valores SI e diagnósticos, falha usa errors estruturados com IDs opcionais, sem mensagens HTML nem dependências do browser (depende de T006–T007). Definir também a conversão de falhas do schema para esses códigos e preservação do código de domínio como causa na importação de links.
- [X] T009 [P] Escrever testes de nós explícitos, cruzamentos sem união, múltiplos terras, IDs determinísticos, entradas imutáveis, referências inválidas e fronteiras de schema em `tests/domain/topology.test.ts` e `tests/domain/schema.test.ts`, a partir de documentos literais sem renderer (depende de T006–T007). Cobrir campos elétricos ausentes/incompletos/de tipo inválido, R<=0 e não finitos como INVALID_VALUE; tipos de componente desconhecidos, IDs duplicados e referências quebradas como INVALID_DOCUMENT; excedentes como LIMIT_EXCEEDED e coexistência com precedência estrutural.
- [X] T010 Implementar union-find e `buildNetlist(document)` em `src/domain/topology.ts`: unir apenas endpoints/fios e todos os terras no nó 0; usar menor chave de âncora para demais IDs, descartar junções soltas da netlist sem apagá-las do documento e retornar erros tipados em vez de lançar exceções não tratadas; fazer T009 passar, usando contratos T008.

**Checkpoint**: Documento e conectividade têm contratos verificáveis. Geometria nunca cria
conexão; componentes não unem a/b. Erros elétricos detalhados serão concluídos em US3.

## Phase 3: User Story 1 - Explorar e analisar um exemplo (Priority: P1)

**Goal**: Abrir exemplos, analisar e consultar tensão nodal, corrente e potência com sinais.
**Independent Test**: Abrir divisor pronto sem edição; analisar e obter nó B=5 V,
resistor=5 mA/25 mW e fonte=-5 mA/-50 mW. Selecionar terra resulta em 0 V.

### Tests for User Story 1

- [X] T011 [P] [US1] Registrar sete fixtures analíticas literais (resistor, divisor, paralelo, duas fontes, supernó, fonte negativa e fonte zero) com deduções/valores em `tests/engine/fixtures/analytical.ts`; testar imutabilidade, cobertura exata dos IDs, KCL e potência em `tests/engine/analyze.test.ts`, com |erro|<=1e-6 SI+1e-4·|esperado| e checagens usuais de 1e-10 SI, conforme plan.md.
- [X] T012 [P] [US1] Escrever testes de stamps e solver em `tests/engine/mna.test.ts` e `tests/engine/solver.test.ts`: fontes a(+)→b(-), terra omitido, resistor em curto, matrizes de posto conhecido, escalonamento/desescalonamento, condição/resíduo e limiares do plano; antecipar erros sem aceitar pseudoinversa como solução única. Testar abaixo, acima e exatamente em τ/10 e 10τ para valores singulares e 1e-11 e 1e-9 para resíduo singular; incluir matriz nula e as faixas fechadas de NUMERICAL_FAILURE.
- [X] T013 [P] [US1] Escrever consulta de exemplos e painel em `tests/integration/examples.test.tsx` e cenário em `tests/e2e/examples.spec.ts`: abrir três exemplos, Analisar, selecionar nó/terra/resistor/fonte, mostrar unidades, sinais, zero e explicação analítica, sem depender da edição ou compartilhamento.

### Implementation for User Story 1

- [X] T014 [US1] Implementar montagem `[G B; Bᵀ 0]` e vetor `[0;e]` em `src/engine/mna.ts`, com condutância 1/R, incidência +1/-1 e ordem determinística das incógnitas; fazer os testes de stamps de T012 passar.
- [X] T015 [US1] Implementar LU/SVD via ml-matrix em `src/engine/solver.ts` com equilíbrio de linhas/colunas, recuperação das unidades, tau=100·eps·dimensão·sigmaMax, rejeição de condição>1e12 e resíduo>1e-10; tratar denominador zero, não finitos e zona de incerteza com NUMERICAL_FAILURE, documentando os limites testados sem gmin/regularização (depende de T014). Aplicar a política do plano: singular value<τ/10 é nulo, >10τ é não nulo e [τ/10,10τ] é incerteza; matriz nula tem posto zero sem faixa degenerada. Em posto deficiente, resíduo<1e-11 indica compatibilidade, >1e-9 incompatibilidade e [1e-11,1e-9] incerteza; manter os gates finais de condição>1e12 e resíduo>1e-10 para solução única.
- [X] T016 [US1] Implementar `analyze(netlist)` em `src/engine/analyze.ts` e grandezas em `src/engine/quantities.ts`: Vab=Va−Vb, I resistor=Vab/R, I fonte=incógnita j, P=Vab·I; incluir terra=0, erros do solver e verificação KCL/balanço conforme plano, fazendo T011–T012 passar (depende de T015).
- [X] T017 [P] [US1] Criar três documentos de exemplo completos, identificadores estáveis e descrições/deduções independentes em `src/examples/circuits.ts`; conferir fonte+resistor, divisor e paralelo com as fixtures T011, incluindo resultados de referência acessíveis após análise.
- [X] T018 [P] [US1] Implementar desenho/seleção SVG em `src/ui/CircuitSvg.tsx` e geometria em `src/ui/geometry.ts`: símbolos de resistor/fonte/terra, terminais a/b, fios, junções e ponte visual sem conexão; selecionar corpo consulta componente, fio/terminal/junção consulta nó; sem modificar o documento.
- [X] T019 [US1] Implementar estado base em `src/editor/reducer.ts` e coordenação em `src/editor/analysis.ts`: mode edit/readOnly, seleção, revisão capturada e estados notAnalyzed/analyzing/valid/invalidated/error; descartar resultado de revisão antiga, bloquear duplo disparo e manter código numérico fora do React (depende de T016).
- [X] T020 [P] [US1] Implementar resultados em `src/ui/ResultsPanel.tsx` e formatação em `src/ui/format.ts`, exibindo V/A/W e prefixos, polaridades, seta a→b, corrente negativa oposta à seta e potência absorvida/fornecida, sem arredondar dados do motor (depende de T019).
- [X] T021 [P] [US1] Implementar seletor e explicação de exemplos em `src/ui/Editor.tsx`, usando T017; preservar dados de referência separados dos resultados obtidos e permitir abrir exemplo sem montagem manual.
- [X] T022 [US1] Integrar exemplos, SVG, Analisar e painel em `src/ui/Editor.tsx` e `src/app/page.tsx`; executar T011–T013 em build estático, verificando ausência de window/localStorage no prerender e registrar resultado em `docs/validation/us1.md` (depende de T018–T021).

**Checkpoint**: Primeiro incremento demonstrável: US1 funciona sem comandos de montagem ou
link. Não é ainda o MVP completo solicitado; continuar com US2, US3 e US4.

## Phase 4: User Story 2 - Montar e modificar um circuito (Priority: P1)

**Goal**: Montar topologia explícita, editar componentes e recuperar trabalho automaticamente.
**Independent Test**: Canvas vazio → montar divisor → analisar; editar invalida resultados;
recarregar restaura o último documento e exige nova análise. Cruzamento sozinho não conecta.

### Tests for User Story 2

- [X] T023 [P] [US2] Escrever contrato de comandos em `tests/integration/editor-commands.test.ts`: criar/mover/girar/excluir, editar valores, unir trecho/cruzamento explicitamente, remover fios incidentes, separar nós, revision+1, invalidar inclusive mudanças visuais e não alterar documento após comando rejeitado.
- [X] T024 [P] [US2] Escrever testes de persistência em `tests/integration/draft.test.ts`: "schemaVersion=1", "Chave circuitos-sim:draft:v1; não contém análise válida", uma gravação/edição concluída, recuperar sem resultados, quota/permissão/corrupção e conflito entre abas sem sobrescrita silenciosa.
- [X] T025 [P] [US2] Escrever fluxo de montagem em `tests/e2e/editor.spec.ts` e recuperação em `tests/e2e/recovery.spec.ts`: mouse, giro 90°, valor com vírgula/ponto e unidade, Esc, terminais sobrepostos, cruzamento/junção, exclusão, reload e reinício do contexto persistente; cobrir confirmação de substituir rascunho por novo/exemplo.

### Implementation for User Story 2

- [X] T026 [US2] Implementar comandos puros de adicionar/mover/girar/excluir componentes/terras e editar valor em `src/editor/commands.ts`; manter IDs a/b, validar limites antes do commit e remover apenas conexões incidentes sem unir nós antes separados; acoplar revisão/invalidação em `src/editor/reducer.ts`.
- [X] T027 [US2] Implementar comandos de fio/junção em `src/editor/commands.ts`: endpoints explícitos, bends só geométricos, dividir fio ao criar junção e ambos ao unir cruzamento; excluir junção remove fios incidentes sem unir pontas e exceder limites rejeita a operação inteira (depende de T026).
- [X] T028 [P] [US2] Implementar parser de valor em `src/editor/values.ts` e formulário em `src/ui/ValueField.tsx`: vírgula ou ponto decimal sem milhar, seletor de unidade/prefixo, SI no documento, resistência finita >0 e fonte finita incluindo zero/negativa; rejeitar valor inválido sem substituir valor anterior.
- [X] T029 [P] [US2] Implementar Pointer Events/captura, transformação inversa SVG e interação transitória em `src/ui/CircuitSvg.tsx`: primeira movimentação invalida, pointerup conclui edição, Esc cancela mas não revalida análise; integrar os comandos T026–T027 sem conexão por proximidade.
- [X] T030 [US2] Estender `src/ui/CircuitSvg.tsx` para arrastar, selecionar endpoints, criar fios/junções explicitamente e mostrar prévias; manter áreas de clique ampliadas, polos e setas estáveis após giro (depende de T029).
- [X] T031 [US2] Implementar paleta, excluir/girar e inspector de edição em `src/ui/Editor.tsx`; distinguir modos selecionar/adicionar/fio e integrar T028, impedindo edição durante análise.
- [X] T032 [P] [US2] Implementar adaptador e schema LocalDraft em `src/persistence/draft.ts`: "schemaVersion=1", "Chave circuitos-sim:draft:v1; não contém análise válida"; ler/gravar só documento versionado no cliente, recuperar em notAnalyzed e capturar falhas sem perder estado em memória.
- [X] T033 [US2] Implementar salvamento após comando concluído, restauração e conflito de evento storage em `src/ui/Editor.tsx`; oferecer carregar outro rascunho ou manter o atual com ação explícita antes de sobrescrever; não salvar prévias nem depender de beforeunload (depende de T032).
- [X] T034 [P] [US2] Implementar aviso de persistência em `src/ui/Editor.tsx` e confirmação de substituição em `src/ui/Editor.tsx`, sem sobrescrever dado corrompido automaticamente; cancelar preserva rascunho e documento aberto.
- [X] T035 [US2] Integrar comandos, persistência, recuperação e confirmações em `src/ui/Editor.tsx`, usando T026–T034; limpar resultados ao editar e exigir Analisar após restauração; não invalidar por seleção/foco/consulta.
- [X] T036 [US2] Completar cenários de geometria e conectividade em `tests/domain/topology.test.ts` após T027/T030: exclusão divide nós, fios sobrepostos não reconectam, junções explícitas unem, múltiplos terras e permutação de arrays/IDs preservam solução; executar T023–T025.
- [X] T037 [US2] Executar dez ciclos de recuperação SC-009 com reload/reabrir navegador e alterações não analisadas, registrar documento/resultado esperado em `docs/validation/recovery.md`; verificar que bloqueio de storage gera aviso honesto e permite continuar em memória.
- [X] T038 [US2] Conferir construção manual do divisor e acessibilidade dos controles em `tests/integration/editor-accessibility.test.tsx`: nomes, foco visível, unidade, polo, sentido, mensagens aria-live e Esc; corrigir os componentes em `src/ui/` afetados, sem ampliar para edição móvel ou idioma inglês.
- [ ] T039 [US2] Rodar build e testes da montagem/edição/restauração nos três browsers e registrar cenário independente de US2 em `docs/validation/us2.md`, incluindo ausência de resultados antigos após toda edição e análise do circuito montado.

**Checkpoint**: Usuário monta circuito próprio; rascunho é recuperável sem login. Em circuito
inválido, não apresentar sucesso arbitrário; o conjunto de diagnósticos é concluído em US3.

## Phase 5: User Story 3 - Entender problemas do circuito (Priority: P1)

**Goal**: Diagnosticar montagem inválida, restrições incompatíveis e falta de solução única.
**Independent Test**: Abrir fixtures preparadas com erros e comparar código/mensagem/correção,
sem precisar montar circuitos nem gerar links.

### Tests for User Story 3

- [X] T040 [P] [US3] Escrever fixtures e contrato de falhas em `tests/engine/invalid-circuits.test.ts`: vazio, sem terra, terminal aberto, flutuante, fontes paralelas iguais/diferentes, curto de fonte, laços redundantes/incompatíveis, valores inválidos e não finitos; exigir precedência de `contracts/engine.md` e nenhum resultado parcial. Exigir o mesmo mapeamento de schema para INVALID_VALUE/INVALID_DOCUMENT/LIMIT_EXCEEDED na análise e na importação de links, cobrindo campos elétricos ausentes/incompletos/de tipo inválido e precedência quando coexistem categorias de erro.
- [X] T041 [P] [US3] Escrever testes da UI de erro em `tests/integration/analysis-errors.test.tsx` e `tests/e2e/errors.spec.ts`: elemento identificado quando possível, orientação compreensível, todos os códigos mapeados e análise válida→edição inválida→erro sem reaparecer valores anteriores.

### Implementation for User Story 3

- [X] T042 [US3] Completar pré-validação em `src/domain/validate-analysis.ts` e integrar em `src/domain/topology.ts`: respeitar ordem schema/limites→valores→vazio→terra→terminal→flutuante; exigir incidência em fio das âncoras componente/terra e identificar partes sem caminho até terra, sem rejeitar supernó válido (depende de T040). Converter falhas do schema em erros de domínio conforme o contrato antes de retornar, mantendo classificação e causa na análise e nos links; estrutura/limites prevalecem sobre erros de valor coexistentes.
- [X] T043 [US3] Completar diagnóstico singular em `src/engine/solver.ts` e `src/engine/analyze.ts`, distinguindo incompatibilidade por resíduo SVD de posto deficiente e não unicidade, recusando condição/resíduo/limiar incertos; concluir casos T040 e limiares T012 sem pseudoinversa como resultado nem regularização (depende de T042). Usar as faixas explícitas do plano (τ/10, 10τ; resíduos 1e-11 e 1e-9), incluindo fronteiras fechadas como NUMERICAL_FAILURE e matriz nula separadamente; comprovar os testes de T012 abaixo, acima e exatamente nas fronteiras.
- [X] T044 [P] [US3] Implementar catálogo pt-BR de todos os códigos e parâmetros em `src/ui/analysis-messages.ts` e painel em `src/ui/Editor.tsx`, exibindo causa, IDs/seleção quando disponíveis e correção conhecida; não expor stack trace nem culpar componente sem evidência.
- [X] T045 [US3] Integrar erros em `src/ui/Editor.tsx`, `src/ui/Editor.tsx` e `src/editor/analysis.ts`: limpar consulta anterior, mostrar estado error, bloquear compartilhamento e permitir corrigir/reanalisar; atender T041 com T043/T044.
- [X] T046 [US3] Rodar regressão analítica e negativa completa e acrescentar testes de resistor em curto, rede sem fonte com solução zero e múltiplos terras em `tests/engine/analyze.test.ts`; corrigir apenas causas observadas sem relaxar tolerâncias para ocultar falha.
- [X] T047 [US3] Executar cenários inválidos no build exportado e registrar código, mensagem e referência ao caso em `docs/validation/us3.md`; conferir um caso corrigido voltando a valid sem resultado obsoleto.

**Checkpoint**: Todos os casos de Edge Cases elétricos têm diagnóstico testado e mensagem
compreensível, sem substituir indeterminação por uma solução numérica arbitrária.

## Phase 6: User Story 4 - Compartilhar e criar uma cópia (Priority: P2)

**Goal**: Compartilhar uma versão analisada imutável e criar cópia editável independente.
**Independent Test**: Partir de exemplo analisado, abrir link em sessão distinta, consultar,
criar cópia e alterar; reabrir o mesmo link e conferir valores originais.

### Tests for User Story 4

- [X] T048 [P] [US4] Escrever contrato em `tests/integration/share-codec.test.ts`: round-trip completo, UTF-8 estrito, base64url/gzip inválido, truncamento, schema/motor desconhecido, conjuntos de IDs divergentes, resultados adulterados e limites de JSON/URL/expansão; não persistir nem exibir dados não verificados.
- [X] T049 [P] [US4] Escrever E2E em `tests/e2e/share.spec.ts`: montar→analisar→compartilhar→abrir nova sessão→selecionar→copiar→editar→reanalisar→reabrir original; cobrir modo leitura, falta de análise, origem do link, Clipboard negada, preservação do rascunho e cancelamento da substituição.

### Implementation for User Story 4

- [X] T050 [US4] Definir SharedSnapshot em `src/sharing/codec.ts`: "schemaVersion=1, engineVersion='1', document e analysis", IDs/conjuntos exatos, valores finitos e arrays ordenados; excluir seleção, estado de persistência, arraste, métricas de desempenho e mensagens da UI; usar limites de T007.
- [X] T051 [US4] Implementar codec v1 em `src/sharing/codec.ts`: JSON UTF-8→gzip nativo→base64url sem padding em `/#c=v1.`; validar comprimento/alfabeto antes de alocar, interromper stream acima de 256 KiB e limitar URL completa a 64000 caracteres; detectar falta de compressão e preservar documento em falha (depende de T050).
- [X] T052 [US4] Implementar `validateSharedSnapshot` em `src/sharing/codec.ts`: schema e referências→topologia→motor→comparação de todos os resultados conforme SC-003; usar resultado recalculado e rejeitar versões desconhecidas, IDs extras/ausentes ou divergência, fazendo T048 passar (depende de T051 e US3).
- [X] T053 [US4] Implementar abertura de fragmento e cópia em `src/ui/Editor.tsx`: prioridade do link sem tocar rascunho, readOnly, clone com novo documentId/revision=0, confirmar substituição, remover hash por history.replaceState e associar análise verificada até primeira edição; persistir apenas documento da cópia (depende de T052 e T035).
- [X] T054 [P] [US4] Implementar `src/ui/Editor.tsx`: gerar só com análise da revisão atual, mostrar acesso por quem possui o link, confirmar Clipboard apenas após sucesso e oferecer campo selecionável quando negada; traduzir códigos de transporte de `contracts/sharing-and-editor.md` sem perda de trabalho (depende de T051).
- [X] T055 [US4] Integrar modo leitura, link e cópia em `src/ui/Editor.tsx`, `src/ui/Editor.tsx` e `src/app/page.tsx`, desabilitando todas as edições no original e mantendo seleção; erro oferece iniciar circuito com confirmação se substituir rascunho; executar T049 (depende de T053–T054).
- [X] T056 [US4] Criar fixtures de escala em `tests/integration/share-limits.test.ts` e validar serialização real com análise dos exemplos e fixture de fronteira; medir bytes/URL, rejeitar excedentes sem truncamento e manter decoder v1 com link literal de regressão, registrando medidas em `docs/validation/share-limits.md`.
- [ ] T057 [US4] Realizar dez verificações entre sessões SC-007 e navegação/cópia de URLs nos três browsers; registrar resultados e imutabilidade em `docs/validation/us4.md`, incluindo falhas de importação que não alteram o rascunho.

**Checkpoint**: Fluxo completo de montar, analisar, compartilhar e copiar passa; snapshots
contêm resultados conferidos e não dependem da sessão original continuar aberta.

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validar os critérios mensuráveis, documentar e publicar a entrega completa.

- [X] T058 [P] Implementar CI em `.github/workflows/ci.yml` com Node 24: npm ci, typecheck, lint, Vitest, build estático, playwright install --with-deps e E2E nos três browsers, guardando relatórios/traces de falhas; commits de produção precisam desse gate aprovado.
- [X] T059 [P] Escrever `README.md`, `CONTRIBUTING.md` e `LICENSE` MIT conforme plano, com objetivo, limitações elétricas, sinais, exemplos, comandos locais/testes/deploy, política de links longos e rascunho por origem; registrar inglês/internacionalização apenas como evolução posterior e nunca inventar URL pública.
- [X] T060 Criar medição de desempenho em `tests/e2e/performance.spec.ts` e registrar 20 execuções SC-006 em `docs/validation/performance.md` com ambiente/commit: circuitos de até 50 componentes/100 nós, resultado ou erro em <=2 s em pelo menos 19 casos; testar também limites máximos de fios/junções e preservar dados quando excedidos.
- [ ] T061 Conduzir avaliação com cinco estudantes e registrar resultados sem dados pessoais em `docs/validation/usability.md`: SC-001 (4/5 em 3 min), SC-002 (4/5 em 10 min) e SC-005 (4/5 compreendem correção de terra/terminal); corrigir falhas observadas antes de aceitar o release e registrar dependência humana se participantes não estiverem disponíveis.
- [ ] T062 Executar instalação, typecheck, lint, testes, build e somente o roteiro local de `specs/001-simulador-circuitos-cc/quickstart.md`; atualizar o guia e registrar evidências pré-deploy em `docs/validation/release.md`, consolidando SC-001–SC-007 e SC-009, fronteiras de imports, precisão, regressões e licença. Registrar SC-008 explicitamente como pendente de publicação/verificação pública; não exigir passos de deploy nesta tarefa (depende de T058–T061).
- [ ] T063 Preparar publicação em `docs/deploy.md`: verificar remoto existente, criar/conectar repositório público se necessário, enviar commit validado e configurar Vercel com Next.js export, Node 24, npm ci/npm run build e out/, branch main e previews, sem API/banco/segredos; registrar URLs reais e commit somente após provisionamento, deixando aprovação externa necessária como pendência concreta (depende de T062).
- [ ] T064 Publicar o commit aprovado, confirmar acesso HTTPS anônimo e executar smoke/E2E via BASE_URL no endereço público em `tests/e2e/deployed.spec.ts`; conferir divisor, ausência de terra, fragmento direto, cópia e recuperação, registrar evidência em `docs/validation/deploy.md` e URL real no `README.md` (depende de T063).
- [ ] T065 Após T064, validar execução local/deploy por outra pessoa seguindo só documentação e documentar rollback para deployment anterior aprovado, manutenção de decoder v1 e efeito da troca de domínio em `docs/deploy.md` e `docs/validation/release.md`; concluir SC-008, consolidar o aceite final de SC-001–SC-009 e revisar a constituição, mantendo pendências reais abertas.

**Checkpoint**: O MVP só está entregue após histórias, testes, avaliação humana, documentação
reproduzível e aplicação pública verificada. Não confundir preview ou build local com produção.

## Dependencies & Execution Order

### Phase Dependencies

```text
Setup T001–T005
  → Foundation T006–T010
    → US1 T011–T022 (análise de exemplos)
      → US2 T023–T039 (montagem + rascunho)
      → US3 T040–T047 (diagnósticos completos)
        US1 + US2 + US3 → US4 T048–T057
          → Release T058–T065
```

### User Story Dependencies

- US1 depende só da fundação; possui cenário independente de montagem/links.
- US2 usa visualização e coordenação de US1; testes de comandos e persistência são isoláveis.
- US3 usa motor e UI de US1, mas aceita documentos de teste prontos; não depende de US2.
- US4 usa US1 para análise, US2 para cópia/persistência e US3 para rejeitar links inválidos.
  Pode ser demonstrada com exemplo pronto sem montar circuito manualmente.
- US2 e US3 são sequenciais por padrão: ambas alteram Editor.tsx. Preparar testes/arquivos
  exclusivos em paralelo é possível; integração nesses arquivos precisa ser serializada.
- T058/T059 podem começar assim que scripts/contratos estiverem estáveis; T062 exige todas
  as histórias e verificações T060/T061. T063–T065 são sequenciais e exigem serviço externo.

### Within Each User Story

Testes de contrato/comportamento primeiro; tipos e comandos antes de UI; implementação antes
de integração e execução do cenário. Seguir pré-requisitos explícitos nas tarefas.
T015 recebe reforço diagnóstico em T043, mas desde US1 não pode devolver singularidade como
sucesso. Arquivos de teste compartilhados (T009/T036, T011/T046) têm alterações sequenciais.

### Parallel Opportunities

- Foundation: T008 e T009 após T006–T007.
- US1: T011/T012/T013; depois T017/T018, T020/T021 com suas dependências satisfeitas.
- US2: T023/T024/T025; T028/T029 e T032/T034 em arquivos distintos após comandos/contratos.
- US3: T040/T041; T044 enquanto T042/T043 evoluem em outros arquivos.
- US4: T048/T049; T054 após T051 enquanto T052/T053 são implementadas.
- Final: T058/T059 e avaliações em ambientes separados; integração e release ficam sequenciais.

## Parallel Example: User Story 1

Após fundação: escrever T011 (referências e contrato), T012 (stamps/solver) e T013 (UI/E2E)
em paralelo. Depois, T017 cria exemplos enquanto T018 constrói SVG; só integrar em T022
quando o motor e painéis estiverem prontos.

## Parallel Example: User Story 2

Após US1: T023 (comandos), T024 (rascunho) e T025 (fluxos E2E) são independentes. Após T027,
T028 cuida de valores e T029 de ponteiro. T032 pode implementar storage sem editar UI.
T030/T031/T035 são integradas sequencialmente para evitar conflito no renderer/editor.

## Parallel Example: User Story 3

T040 prepara circuitos inválidos e T041 prepara testes de mensagens. Com os códigos estáveis,
T044 implementa catálogo/painel enquanto T042 e T043 completam validação/solver; T045 integra.

## Parallel Example: User Story 4

T048 prepara codec/importação e T049 prepara browser. Após T051, T054 faz diálogo/fallback
de Clipboard enquanto T052 faz recálculo/verificação. T055 integra quando sessão T053 estiver pronta.

## Implementation Strategy

### MVP First (User Story 1 Only)

Concluir Setup + Foundation + US1 para um primeiro incremento didático demonstrável e validar
motor/sinais antes de editor completo. Esse recorte não substitui o MVP acordado, que exige
as quatro histórias, recuperação local, erros claros e publicação.

### Incremental Delivery

1. US1: conferir cálculos e leitura de exemplos.
2. US2: montar/editar e recuperar rascunho.
3. US3: concluir diagnósticos e regressão completa.
4. US4: compartilhar versão imutável e criar cópia.
5. Final: avaliação humana, CI, documentação, deploy e verificação pública.

### Parallel Team Strategy

As oportunidades acima descrevem divisão de trabalho possível; não exigem agentes nem execução
concorrente. Usar sequência padrão quando uma pessoa implementa. Toda tarefa marcada [P]
ainda exige as dependências indicadas e contratos estáveis.

## Traceability & Completion

| Requisito/critério | Tarefas principais |
|---|---|
| FR-001, FR-020; SC-001 | T013, T017, T021–T022, T061 |
| FR-002–FR-005; SC-002, SC-004 | T006–T010, T023, T025–T031, T035–T039, T061 |
| FR-006–FR-009, FR-013–FR-014; SC-003 | T008, T011–T020, T040, T043, T046 |
| FR-010–FR-011 | T019, T023, T026, T029, T035, T041, T045 |
| FR-012; SC-005 | T040–T047, T061 |
| FR-015–FR-017; SC-007 | T048–T057 |
| FR-018 e limites de escopo | T001–T002, T006–T007, T038, T059, T062 |
| FR-019; SC-008 | T058–T059, T062–T065 |
| FR-021; SC-009 | T024–T025, T032–T037, T053, T057 |
| SC-006 | T007, T056, T060 |

## Notes

- Internacionalização/inglês é evolução pós-MVP e não gera tarefas nesta entrega.
- T001 não substitui Git existente; nenhum commit, push, instalação ou deploy é executado
  ao gerar esta lista. Para implementar, usar `$speckit-implement` após revisão/análise.
- T061/T065 precisam de participação humana; T063/T064 precisam de GitHub/Vercel. Registrar
  bloqueios sem fabricar evidência nem marcar entrega concluída. Não criar backend como atalho.
- Atualizar os checkboxes por execução comprovada e manter commits semânticos por grupo lógico.

## Registro de execução

- As seções de UI, diálogos e coordenação de persistência foram consolidadas em src/ui/Editor.tsx para manter um único pacote; interação SVG fica em CircuitSvg.tsx e codec/validação de snapshots em sharing/codec.ts. Os caminhos das tarefas refletem os arquivos entregues.
- O mantenedor reunirá cinco estudantes para T061 e ainda precisa conectar a Vercel. T062–T065 continuam abertas até os gates e dependências externos serem cumpridos.
- Firefox não inicia neste Windows (spawn UNKNOWN), impedindo marcar a validação dos três browsers como concluída.
