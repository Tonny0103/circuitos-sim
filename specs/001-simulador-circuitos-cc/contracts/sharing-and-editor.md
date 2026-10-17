# Contratos de compartilhamento, persistência e UI

## URL pública v1

Formato: `https://<origem>/#c=v1.<payload>`; mesma rota raiz do editor. Não existe endpoint
de criação, consulta, atualização ou exclusão de circuito.

payload = base64url sem padding de gzip de JSON UTF-8 de SharedSnapshot (data-model.md).
Prefixo v1 define formato/codec, schemaVersion define documento e engineVersion define cálculo.
Compressão é transporte, não criptografia. Não incluir nomes pessoais, segredos ou telemetria.
O estudante deve saber que qualquer pessoa com o link consegue ler o circuito.

### Geração

1. Exigir estado valid e revisão da análise igual à revisão do documento.
2. Construir snapshot com resultados completos e IDs estáveis; ordenar arrays por ID.
3. Validar orçamento de 256 KiB descomprimidos, comprimir e montar URL com origem atual.
4. Exigir URL completa <=64000 caracteres; se exceder, explicar limite e sugerir simplificar.
5. Copiar por Clipboard API; se indisponível/negada, exibir URL selecionável para cópia manual.
   Só confirmar cópia automática após a promessa resolver. Não alterar o rascunho.

### Abertura

1. Detectar prefixo, comprimento e alfabeto base64url antes de alocar payload.
2. Descomprimir por stream e cancelar leitura ao superar 256 KiB; erro de gzip é link inválido.
3. Decodificar UTF-8 estrito, parsear JSON e validar schema e todas as referências/limites.
4. Validar versão do motor, derivar topologia, recalcular e comparar resultados conforme SC-003.
5. Exibir circuito e resultados verificados em modo de leitura. Seleção é permitida;
   edição, exclusão, conexões e edição de valores ficam desabilitadas.
6. Qualquer erro apresenta mensagem e ação de começar outro circuito; não sobrescrever rascunho.

Erros de transporte: SHARE_TOO_LARGE, INVALID_SHARE, UNSUPPORTED_VERSION,
RESULT_MISMATCH, CLIPBOARD_UNAVAILABLE e COMPRESSION_UNAVAILABLE. Últimos dois permitem
orientação específica; ausência de compressão não pode gerar link com formato diferente oculto.

Link mutável pelo próprio portador não implica assinatura: se circuito e resultados forem
alterados de forma coerente, é outro snapshot válido. Nenhuma garantia de autoria é oferecida.

## Cópia e substituição

Criar cópia clona dados, gera documentId novo, remove fragmento com history.replaceState
e ativa edição. Se existir rascunho, confirmar substituição antes de escrever localStorage.
Cancelar mantém link aberto e rascunho intacto. O mesmo vale para novo circuito e exemplos.
URLs emitidas não mudam; abrir o mesmo texto de URL novamente repõe o original.

## Rascunho local

Chave `circuitos-sim:draft:v1`; conteúdo LocalDraft. Persistir cada edição concluída; não
persistir prévias de ponteiro. Exibir status salvando/salvo/não salvo quando aplicável.
Restauração retorna documento sem resultados atuais. Reabrir link tem precedência sobre
recuperação visual do rascunho, mas não o apaga. localStorage é separado por origem.

Falha de gravação não desfaz edição em memória. Falha de leitura/parse não impede uso do
editor. Abas concorrentes recebem aviso ao mudar a chave; sobrescrita exige ação explícita.

## Interação do editor

- Modos: selecionar, adicionar componente, criar fio. Esc cancela operação não concluída.
- Fio: escolher âncora inicial e final; clicar trecho existente cria junção explicitamente.
  Cruzar ou encostar sem ação de conexão não é suficiente.
- Arraste de componente e rotação preservam endpoints; botão Girar 90° e Excluir no painel.
- Inspector edita valor e prefixo, identifica a/b, mostra unidades e referências de resultados.
- Analisar desabilita edição enquanto calcula; impedir duplo disparo. A análise só é exibida
  se a revisão capturada ainda for atual. Compartilhar depende de análise válida.
- Junções aparecem como ponto e cruzamentos sem conexão como ponte/interrupção visual;
  mudança de cor sozinha não define semântica. Todos os controles HTML têm nome e foco visível.
- Resultados: selecionar fio/terminal/junção consulta nó; selecionar corpo consulta componente.
