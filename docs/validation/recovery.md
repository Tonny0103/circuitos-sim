# SC-009 — recuperação de rascunho

Execução local em Chromium headless, 2026-10-17: dez recuperações aprovadas, incluindo fechar
e relançar navegador com o mesmo perfil persistente no sexto ciclo. R1 alterado para 2200 Ω
sem nova análise foi recuperado em todos os ciclos, com geometria/fios preservados e estado
Não analisado. Nenhum resultado antigo foi reapresentado como válido.

Roteiro automatizado: tests/e2e/persistence-cycles.spec.ts. Teste separado cobre vírgula decimal
e unidade kΩ. O adaptador tem testes de corrupção/quota; o aplicativo informa falha e mantém
edição em memória. Conflitos e dados corrompidos exigem ação explícita antes de sobrescrever.
