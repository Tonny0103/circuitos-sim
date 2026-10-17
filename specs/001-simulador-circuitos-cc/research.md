# Research — Simulador resistivo CC

Data: 2026-10-17. Decisões de arquitetura; não representam benchmarks já executados.

## 1. Aplicação e stack

**Decision**: Next.js com React/TypeScript em exportação estática. Um projeto npm.
**Rationale**: Aproveita a stack pessoal e atende à tela interativa executada no cliente.
**Alternatives considered**: React/Vite tem menos convenções e seria válido, mas não oferece
ganho suficiente para abandonar familiaridade. Next.js + Spring Boot exigiria dois deploys,
API e manutenção de servidor sem requisito que os justifique. Next com handlers dinâmicos
também é desnecessário com snapshots autocontidos.

A documentação confirma saída HTML/CSS/JS via output export e acesso a APIs do browser
apenas no cliente. Fontes: [Next static export](https://nextjs.org/docs/app/guides/static-exports)
e [instalação](https://nextjs.org/docs/app/getting-started/installation).

## 2. Área de montagem

| Opção | Benefício | Custo para este domínio | Decisão |
|---|---|---|---|
| SVG nativo + React | Símbolos, fios e eventos identificáveis no DOM | Implementar arraste e seleção limitados | Escolhida |
| React Flow | Arraste, handles e seleção prontos | Componente visual não é nó elétrico; adaptar junções e terminais | Adiada |
| Konva/Canvas 2D | Biblioteca de cena adequada a muitos objetos | Mais camada de desenho/hit testing e acesso textual separado | Adiada |

**Decision**: SVG; canvas na especificação significa área de desenho, não obrigação de usar
o elemento HTML canvas. **Rationale**: Apenas três tipos de símbolos e até 50 componentes;
nenhuma necessidade de cena pesada, autorroteamento ou editor genérico de fluxos.
**Alternatives considered**: Comparadas acima. Não inferir conectividade do renderer escolhido.
Fontes primárias: [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG),
[React Flow handles](https://reactflow.dev/learn/customization/handles),
[Konva overview](https://konvajs.org/docs/overview.html).

## 3. Compartilhamento

| Opção | Vantagem | Custo/limite | Decisão |
|---|---|---|---|
| JSON comprimido no fragmento | Sem serviço persistente; snapshot imutável por valor | URL longa, validar entrada e limites | Escolhida |
| ID remoto em API Next + banco | Link curto | Persistência, abuso, disponibilidade e política de retenção | Adiada |
| ID remoto em Spring Boot + banco | Familiaridade com backend | Mesmo custo, mais runtime e deploy | Adiada |

**Decision**: JSON UTF-8 → gzip nativo → base64url no fragmento `#c=v1.`. Incluir documento
e resultados, conferidos por recálculo ao abrir. **Rationale**: Cumpre leitura em outra sessão,
imutabilidade e cópia independente sem backend. O fragmento é processado no cliente; isso
não é criptografia nem impede acesso por quem possui o link.
**Alternatives considered**: Query string envia conteúdo ao servidor; não escolhida. lz-string
seria alternativa de compatibilidade, mas gzip nativo evita uma dependência adicional.

Limite de produto: URL completa 64000 caracteres e JSON descomprimido 256 KiB. Leitura em
stream interrompe ao exceder limite. Não assumir que mensageiros preservam URLs desse tamanho;
testar copiar/colar e navegação direta em três engines. Falha deve ser explicada sem perder
trabalho. Canonicalização de arrays/IDs e arredondamento de coordenadas inteiras reduzem tamanho.
Fontes: [fragmento URI](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment),
[CompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream).

## 4. Motor e solução numérica

**Decision**: MNA densa para resistores/fontes, com ml-matrix para LU e SVD; diagnóstico e
checagem física pertencem ao motor. **Rationale**: Menos de 150 incógnitas; não é necessário
solver esparso, SPICE completo ou serviço Java. SVD auxilia diagnóstico de singularidade;
não usar solução de norma mínima para esconder corrente indeterminada.
**Alternatives considered**: Eliminação gaussiana própria reduz dependências, mas aumenta
risco numérico e manutenção. math.js oferece conjunto muito maior de recursos do que o necessário.
Os limiares e a política de recusa estão definidos no plano e serão validados com fixtures.
Fontes: [Qucs MNA](https://qucs.github.io/tech/node14.html),
[ml-matrix](https://github.com/mljs/matrix),
[implementação SVD](https://github.com/mljs/matrix/blob/main/src/dc/svd.js).

## 5. Estado e rascunho

**Decision**: useReducer para comandos; localStorage para um rascunho pequeno, versionado.
**Rationale**: Recupera após fechamento sem login. Persistir edição concluída; não depender
de eventos de saída. Não armazenar resultados como válidos no rascunho restaurado.
**Alternatives considered**: IndexedDB desnecessário para um documento limitado; sincronização
remota ampliaria escopo. Tratar quota, bloqueio, corrupção e conflito entre abas.
Fonte: [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## 6. Validação e publicação

**Decision**: Vitest + Testing Library + Playwright; Vercel servindo export estático.
**Rationale**: Motor testa em Node, UI testa interação e E2E testa artefato publicado.
**Alternatives considered**: Servidor Spring/containers não são necessários. GitHub Pages
serviria os mesmos arquivos, mas exigiria cuidado adicional com basePath em project sites;
Vercel preserva familiaridade com Next e previews.
Fontes: [Vitest](https://vitest.dev/guide/), [Playwright](https://playwright.dev/docs/intro),
[Vercel Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs).

## Resultado

Todas as escolhas bloqueantes resolvidas. Versões patch serão fixadas no lockfile ao
implementar. Performance, limites de serialização e ergonomia são gates de validação do
plano, não fatos presumidos. Pesquisa delegada de canvas/links foi consolidada neste documento.
