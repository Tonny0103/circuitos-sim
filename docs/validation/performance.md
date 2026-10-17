# SC-006 — medição local

2026-10-17, Windows, Node 24.21.0, Chromium headless 156 (Playwright 1.64.1), build estático.
Código em árvore de trabalho local baseado em 9c455ab; não se trata de medição de produção.

Fixture: fonte ideal de 10 V e 49 resistores de 1 kΩ em série, 50 componentes e 50 nós.
Referência analítica I=10/49000 A, validada separadamente no Vitest. Latência inclui interação
com Analisar e espera pelo estado de análise válida; não é apenas tempo interno de LU.

Tempos observados, em ms:

```text
685, 276, 220, 174, 197, 172, 185, 170, 167, 171,
166, 151, 151, 166, 177, 155, 165, 162, 168, 161
```

20/20 abaixo de 2000 ms; mínimo 151 ms e máximo 685 ms. Meta de 19/20 atingida nesse ambiente.
O teste reproduzível está em tests/e2e/performance.spec.ts e anexa JSON por navegador.
Resultados não substituem validação de outros ambientes ou de produção.
