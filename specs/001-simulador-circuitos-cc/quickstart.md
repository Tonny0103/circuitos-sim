# Quickstart e validação da entrega

Este é o roteiro executável previsto para a implementação. O repositório ainda contém apenas
artefatos de especificação; comandos npm abaixo passam a funcionar após criar o aplicativo.
Não interpretar este guia como evidência de testes ou publicação já realizados.

## Pré-requisitos

Node.js 24 LTS e npm, Git, navegador desktop atual. Para publicar: repositório público no GitHub
e conta Vercel com acesso a ele. A aplicação não exige Java, banco ou variáveis secretas.
Implementação deve fornecer os scripts definidos abaixo, lockfile e licença MIT proposta.

## Executar localmente

Na raiz do repositório, depois de obter o código implementado:

```powershell
npm ci
npm run dev
```

Abrir http://localhost:3000. Deve aparecer editor com paleta, exemplos e botão Analisar.
Não acessar localStorage/window no prerender: testar tanto npm run dev quanto produção.

## Validação automatizada

```powershell
npm run typecheck
npm run lint
npm run test
npx playwright install
npm run build
npm run test:e2e
```

Scripts previstos: typecheck executa tsc --noEmit; lint executa ESLint; test executa
vitest run; build executa next build; test:e2e executa playwright test. O webServer do
Playwright serve out/ em http://localhost:4173, com dependência de desenvolvimento `serve`
fixada no lockfile. Em Linux CI, instalar browsers/dependências com playwright install --with-deps.

Para inspecionar manualmente o export:

```powershell
npm run preview
```

preview deve executar serve out -l 4173. Não usar next start para o export estático.

## Roteiro principal: montar, analisar e compartilhar

1. Criar circuito novo. Adicionar fonte de 10 V, dois resistores de 1 kΩ e terra.
2. Conectar terra ao negativo da fonte, positivo ao R1, R1 ao R2 e R2 ao terra.
3. Analisar: nó intermediário=5 V, corrente em cada resistor=5 mA e potência=25 mW.
   Fonte com referência positivo→negativo: -5 mA e -50 mW. Confira polaridades e unidades.
4. Gerar link, abrir nova sessão anônima, selecionar nó, resistor e fonte; conferir valores.
5. Criar cópia, confirmar substituição se houver rascunho, alterar R2 para 2 kΩ. Resultados
   antigos somem; reanalisar: nó intermediário=20/3 V e corrente=10/3 mA.
6. Reabrir link original: continua 5 V e 5 mA. Nenhuma conta é solicitada.
7. Recarregar cópia editável: recuperar R2=2 kΩ, fios e posições; exigir nova análise.

## Topologia e erros

- Criar cruzamento de dois fios: não unir; criar junção explícita e conferir nó único.
- Mover/girar sem criar conexões; excluir um componente e conferir retirada dos fios incidentes.
- Remover terra e analisar: erro de referência. Usar fonte desconectada: terminal aberto.
- Testar fontes iguais em paralelo: corrente indeterminada; diferentes: tensões incompatíveis.
- Testar fonte flutuante entre dois nós com resistores até terra (supernó); conferir ±5 V
  da fixture em plan.md. Circuitos matematicamente válidos não podem ser rejeitados por formato.
- Abrir link inválido e payload com resultados adulterados: mensagem clara, rascunho preservado.
- Simular falha de localStorage e cancelamento da cópia: não perder documento em memória.

## Precisão, escala e usabilidade

Executar todas as fixtures de plan.md, incluindo negativos, valores zero/negativos de fonte
e balanço de potência. Medir SC-006 em 20 análises com ambiente registrado; validar fronteiras
de tamanho e serialização real dos links. Testar os três navegadores, round-trip e tamanho
descomprimido limitado. Não usar somente screenshots para afirmar correção elétrica.

Conduzir SC-001/002/005 com cinco estudantes. Registrar tempos, tarefas completadas e
interpretação das mensagens. Esse teste humano é gate de aceite; E2E não o substitui.

## Deploy concreto

1. Publicar o código no repositório público com LICENSE, README e CONTRIBUTING. Remover o
   relatório temporário de emenda da constituição antes de seu commit, conforme a própria skill.
2. Configurar CI e executar todos os scripts acima, incluindo build e E2E do artefato out/.
3. Na Vercel, importar o repositório; preset Next.js, Node 24, install npm ci, build npm run
   build e export out/. Definir branch principal como produção; nenhuma API dinâmica.
4. Validar preview, aprovar commit com CI verde e publicar. Confirmar que produção abre sem
   autenticação do provedor. Registrar endereço HTTPS público e commit entregue no README.
5. Smoke test público: exemplo divisor, ausência de terra e link direto em janela anônima.
   Testar que fragmento é preservado e copiar link com origem pública, não localhost/preview.
6. Para repetir E2E contra produção, configurar BASE_URL no comando/script de teste para
   dispensar webServer local. Em PowerShell:

```powershell
$env:BASE_URL = 'https://seu-dominio-publicado'
npm run test:e2e
Remove-Item Env:BASE_URL
```

7. Registrar evidências e instruções verificadas. Se houver regressão, promover o deployment
   anterior aprovado na Vercel e conferir links v1. Sem migrações de banco.

Deploy não é executado por este comando de planejamento. Domínio e URL reais serão registrados
quando o aplicativo estiver implementado e publicado.

## Referências

[Plano e fixtures](plan.md), [modelo de dados](data-model.md),
[motor](contracts/engine.md), [links/editor](contracts/sharing-and-editor.md).
