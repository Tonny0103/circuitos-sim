# Evidências de implementação — 2026-10-17

## Executado

- Testes escritos antes das implementações correspondentes: primeira execução falhou por
  ausência de topology/analyze/solver; segunda execução de integração falhou por ausência de
  comandos, draft e codec. Implementações fizeram esses testes passar.
- 41 testes unitários/integração passaram no Vitest (motor em Node, UI em jsdom).
- TypeScript strict e ESLint passaram; export estático Next.js gerado com sucesso.
- Chromium: 27 testes E2E passaram no build estático, incluindo os três exemplos, montagem
  manual, arraste, junções, mensagens de erro, recuperação e compartilhamento. Dez sessões
  independentes confirmaram imutabilidade; dez recuperações incluíram reinício do navegador.
- Os testes encontraram e ajudaram a corrigir seleção após captura de ponteiro, reabertura
  por hash na mesma aba e confirmação indevida de substituição em sessão sem rascunho.
- 20 análises com 50 componentes ficaram abaixo de 2 segundos (também conferidas analiticamente).
- Fronteiras de 300 fios/200 junções/8 bends e rejeição sem truncamento passaram no Vitest;
  snapshot de 50 componentes e link v1 histórico passaram, inclusive bloqueio de expansão gzip.
- Inspeção visual da captura do editor em Chromium realizada, incluindo resultados da fonte.
- O fluxo completo de compartilhamento passou no WebKit após as correções (31,5 s no cenário).
  Os cenários básicos de montagem, exemplos, erros e recuperação também passaram nesse engine.
- Implementação local: 58/65 tarefas concluídas. T039/T057 aguardam verificação completa nos
  três navegadores; T061 depende dos estudantes; T062 depende desses gates; T063–T065
  dependem de preparação e publicação reais. A checklist de qualidade não foi alterada.

## Política numérica

As sete fixtures analíticas constam em tests/engine/fixtures/analytical.ts. Assertions de
grandezas usuais usam precisão de 1e-10 SI e verificam KCL e balanço de potência. O solver
tem testes próprios de fronteiras das faixas de incerteza e de matriz nula.

## Pendências de aceite

- Concluir regressão completa nos três navegadores: Firefox falha antes de abrir com
  `browserType.launch: spawn UNKNOWN` neste Windows. Isso não foi registrado como teste aprovado.
- SC-001/002/005: avaliação real com cinco estudantes, com tempos e entendimento registrados.
- SC-008: publicação HTTPS verificada e execução local/deploy conferidos por outra pessoa.
- GitHub Actions remoto, endereço público e rollback real não foram verificados.
- O mantenedor confirmou que reunirá cinco estudantes e ainda precisa conectar a Vercel.

Não há evidências humanas ou de produção fabricadas. Essas etapas permanecem abertas em tasks.md.

## Ferramentas

Ambiente Windows, Node 24.21.0 e versões exatas no lockfile. A execução de Vitest/Next/Playwright
exigiu permissão para processos nativos fora do sandbox. npm audit reportou sete avisos high
em dependências de desenvolvimento ligadas a eslint-config-next/serve; não foi aplicado
audit fix --force com downgrade de framework/ferramentas. Revisar atualizações antes do release.
