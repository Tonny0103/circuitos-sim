# Compartilhamento e cópia

Chromium: fluxo completo montar/analisar/compartilhar/abrir/copiar/editar/reabrir passou.
Dez testes SC-007 usam contextos independentes e o mesmo link literal v1: em todos, R1 mostra
5 mA, a cópia aceita edição e o original reaberto mantém 5 mA.

Ao copiar sem rascunho local, não há confirmação de substituição indevida. Com rascunho,
a substituição exige confirmação. Navegação por hash na mesma aba carrega novamente o snapshot.
Abrir link não grava por cima do rascunho, e edição invalida resultados imediatamente.

O fluxo completo também passou no WebKit. Validação completa dos três engines continua aberta
porque Firefox não inicia neste Windows.
Os resultados recebidos são sempre conferidos por recálculo; o link não oferece sigilo/autoria.
