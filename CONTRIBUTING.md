# Contribuir

Use Node.js 24, instale com npm ci e mantenha package-lock.json versionado. Abra uma branch
para a mudança e descreva o problema, o comportamento esperado e a validação no pull request.
Use Conventional Commits: feat, fix, docs, test, refactor ou chore com escopo quando útil.

Mudanças elétricas precisam de circuito de referência com dedução analítica independente,
valores esperados e tolerância justificada. Preserve as convenções a/b e a independência do
motor em relação ao DOM/React. Não relaxe testes para ocultar imprecisão ou singularidade.

Antes de enviar: typecheck, lint, npm test, build e test:e2e. Inclua testes pertinentes ao
comportamento alterado e atualize documentação/contratos. Não versione dados locais, segredos,
node_modules, out, .next ou relatórios gerados. Veja `.specify/memory/constitution.md`.

A interface inicial é pt-BR. Internacionalização e demais ampliações precisam de especificação
própria. Não inclua backend, novos elementos elétricos ou contas sem justificar a necessidade.
