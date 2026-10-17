# Links v1 e limites

Testes em tests/integration/share-limits.test.ts aprovados:

- Documento de 50 componentes (fonte de 10 V + 49 resistores): análise confere 10/49000 A;
  encode/decode preserva os 50 componentes e resultados; URL real emitida fica abaixo de
  64000 caracteres e o encoder verifica os 256 KiB antes de comprimir.
- Link literal emitido pelo encoder v1 anterior continua legível e resulta em 5 mA em R1.
- Gzip que expande além de 256 KiB é interrompido e rejeitado com SHARE_TOO_LARGE.
- Corrente adulterada gera RESULT_MISMATCH; valor elétrico inválido mantém INVALID_VALUE.

O teste adicional de codec rejeita versão desconhecida, truncamento e URL excessiva. O limite
de produto não é garantia de que todo mensageiro preserve URLs longas. Não houve truncamento
silencioso ou envio do documento para serviço de armazenamento.
