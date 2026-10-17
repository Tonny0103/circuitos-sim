# US2 — montagem e edição

Chromium: montagem manual do divisor a partir de canvas vazio, fios explícitos, giro com
invalidação, alteração por vírgula/unidade e recuperação passaram. Testes adicionais de
cruzamento/junção e arraste preservando extremos dos fios também passaram.

WebKit: montagem e recuperação básicas passaram. Verificação completa nos três engines
permanece pendente enquanto Firefox não puder ser iniciado neste ambiente.

Comandos puros testam exclusão, manutenção de a/b e divisão explícita de fio. Testes do reducer
conferem que selecionar não invalida e que resultado de revisão antiga é descartado.
