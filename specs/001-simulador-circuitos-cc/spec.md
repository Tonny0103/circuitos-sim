# Feature Specification: Simulador educacional de circuitos resistivos CC

**Feature Branch**: Não criada; não há hook de criação de branch configurado.

**Created**: 2026-10-17

**Status**: Draft

**Input**: User description: "Criar um simulador web educacional de circuitos resistivos em
corrente contínua para Circuitos I, com montagem em canvas, resistores, fontes ideais
independentes de tensão, terra, fios explícitos, análise de tensões, correntes e potências,
compartilhamento por link com cópia editável e exemplos prontos. Sem login, colaboração em
tempo real, capacitores, indutores ou corrente alternada na primeira versão."

## Clarifications

### Session 2026-10-17

- Q: Ao recarregar a página ou fechar e reabrir o navegador, o circuito em edição deve ser
  recuperado automaticamente? → A: Recuperar automaticamente o último circuito neste
  navegador, incluindo alterações ainda não analisadas, sem login.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar e analisar um exemplo (Priority: P1)

Como estudante, quero abrir um exemplo e consultar suas grandezas para comparar a análise
com o que aprendi em Circuitos I.

**Why this priority**: Entrega valor didático mesmo antes da montagem de circuitos próprios.

**Independent Test**: Abrir o divisor de tensão pronto, analisar e conferir os valores abaixo,
sem montar ou compartilhar um circuito.

**Acceptance Scenarios**:

1. **Given** a página inicial, **When** escolho um exemplo, **Then** vejo seu circuito completo,
   valores, terra e uma descrição do que ele demonstra, pronto para acionar Analisar.
2. **Given** uma fonte de 10 V entre terra e nó A, R1 de 1 kΩ entre A e B e R2 de 1 kΩ
   entre B e terra, **When** aciono Analisar e seleciono B, **Then** vejo 5 V em relação ao
   terra; selecionar terra mostra 0 V.
3. **Given** o divisor analisado, **When** seleciono R1 com referência A→B, **Then** vejo
   tensão de 5 V, corrente de 5 mA e potência absorvida de 25 mW, com polaridade e seta.
4. **Given** o divisor analisado, **When** seleciono a fonte com referência do terminal
   positivo para o negativo, **Then** vejo 10 V, corrente de -5 mA e potência de -50 mW,
   com explicação de que ela fornece energia.

---

### User Story 2 - Montar e modificar um circuito (Priority: P1)

Como estudante, quero montar meu próprio circuito e controlar suas conexões para estudar
exatamente a topologia desejada.

**Why this priority**: A montagem explícita é o fluxo central para exercícios próprios.

**Independent Test**: Partir de canvas vazio e montar o divisor da história 1; conferir
componentes e conexões antes de qualquer análise.

**Acceptance Scenarios**:

1. **Given** canvas vazio, **When** adiciono resistores, fontes e terra, movo, giro em passos
   de 90° e edito valores, **Then** vejo identificadores, valores com unidades e terminais
   distinguíveis nas posições escolhidas.
2. **Given** dois terminais separados, **When** concluo um fio explicitamente entre eles,
   **Then** pertencem ao mesmo nó; aproximá-los ou sobrepô-los visualmente não os conecta.
3. **Given** dois fios que se cruzam, **When** nenhum ponto de junção foi criado explicitamente,
   **Then** continuam eletricamente separados; criar uma junção explícita no cruzamento os une
   e mostra um marcador de junção.
4. **Given** um fio existente, **When** conecto explicitamente outro terminal a um ponto dele,
   **Then** vejo a junção e os três trechos pertencem ao mesmo nó.
5. **Given** componente conectado, **When** o movo ou giro, **Then** suas conexões continuam
   ligadas aos mesmos terminais, sem criar conexões por cruzamento.
6. **Given** componente ou fio selecionado, **When** o excluo, **Then** ele desaparece e a
   conectividade é atualizada; excluir um componente remove os fios incidentes nele e
   nunca une automaticamente os nós antes separados por esse componente.
7. **Given** análise concluída, **When** altero valor, posição, orientação, componente, terra,
   fio ou junção, **Then** os resultados anteriores deixam de ser apresentados como válidos
   e surge a indicação de que é necessário analisar novamente.
8. **Given** circuito editado com salvamento local disponível, **When** recarrego a página
   ou fecho e reabro o navegador, **Then** recupero automaticamente o último circuito,
   incluindo alterações ainda não analisadas, e preciso analisar antes de consultar resultados.
9. **Given** rascunho local existente, **When** abro um link compartilhado para leitura,
   **Then** o rascunho permanece preservado; criar uma cópia, abrir um exemplo ou iniciar
   circuito novo exige confirmar sua substituição.

---

### User Story 3 - Entender problemas do circuito (Priority: P1)

Como estudante, quero compreender por que uma análise não pode produzir um resultado confiável
para corrigir meu circuito.

**Why this priority**: Diagnósticos claros evitam aprendizado baseado em respostas inválidas.

**Independent Test**: Usar circuitos preparados com cada erro listado em Edge Cases e comparar
a mensagem à causa, sem depender da criação de links.

**Acceptance Scenarios**:

1. **Given** circuito sem terra, **When** aciono Analisar, **Then** vejo que falta um nó de
   referência e uma orientação para adicioná-lo, sem resultados numéricos válidos.
2. **Given** circuito com parte flutuante, **When** aciono Analisar, **Then** vejo que não há
   referência suficiente para determinar todas as grandezas, identificando a parte afetada
   quando possível.
3. **Given** fontes ideais impondo tensões incompatíveis ao mesmo par de nós, **When** analiso,
   **Then** vejo que as restrições são contraditórias e devo revisar fontes e conexões.
4. **Given** fontes ideais redundantes com correntes indeterminadas, **When** analiso,
   **Then** vejo que não existe solução única para todas as grandezas, mesmo que algumas
   tensões possam ser determinadas.
5. **Given** valor vazio, não numérico, infinito ou resistência menor ou igual a zero,
   **When** tento confirmá-lo, **Then** vejo o motivo da rejeição e o valor inválido não
   substitui o anterior; um componente ainda sem valor válido impede a análise.
6. **Given** análise válida anterior e uma alteração que torna o circuito inválido,
   **When** analiso novamente, **Then** vejo o erro atual sem reapresentar o resultado antigo.

---

### User Story 4 - Compartilhar e criar uma cópia (Priority: P2)

Como estudante, quero enviar um exercício resolvido e permitir que outra pessoa explore uma
cópia sem alterar minha versão compartilhada.

**Why this priority**: Permite troca de exercícios após o fluxo de análise estar disponível.

**Independent Test**: Abrir um link em outra sessão sem login, conferir o circuito e os
resultados, criar uma cópia, editá-la e reabrir o link original.

**Acceptance Scenarios**:

1. **Given** circuito com análise válida atual, **When** escolho compartilhar, **Then** obtenho
   um link para essa versão do circuito, incluindo valores, posições, orientações, conexões,
   referências de sinais e resultados correspondentes.
2. **Given** link compartilhado, **When** outra pessoa o abre sem login, **Then** vê o circuito
   em modo de leitura e pode selecionar nós e componentes para consultar seus resultados.
3. **Given** versão compartilhada aberta, **When** escolho Criar cópia para editar, **Then**
   obtenho um circuito independente e editável; qualquer alteração invalida seus resultados
   e não altera o original.
4. **Given** link já emitido, **When** o autor modifica seu circuito de trabalho ou gera outro
   link, **Then** o primeiro link continua representando a versão anterior.
5. **Given** circuito não analisado, alterado ou com erro, **When** tento compartilhar,
   **Then** recebo orientação para obter uma análise válida antes de gerar o link.
6. **Given** link inválido, incompleto, incompatível ou indisponível, **When** o abro,
   **Then** vejo mensagem compreensível e acesso à opção de iniciar outro circuito.

### Edge Cases

- Canvas vazio: Analisar informa que é necessário montar ou abrir um circuito.
- Terminal sem conexão explícita: análise bloqueada com identificação do terminal; isso é
  uma regra didática de montagem da primeira versão, não uma afirmação de insolubilidade física.
- Parte desconectada do nó de referência: análise bloqueada como circuito flutuante.
- Vários símbolos de terra: todos representam o mesmo nó de 0 V, de maneira visível.
- Fio ideal curto-circuitando resistor: permitido se o restante tiver solução única; o resistor
  apresenta tensão, corrente e potência iguais a zero.
- Fonte não nula curto-circuitada: restrições incompatíveis; fonte de 0 V em laço ideal
  redundante: corrente indeterminada. Nenhum caso deve retornar sucesso com solução arbitrária.
- Fontes iguais em paralelo: correntes individuais indeterminadas; fontes diferentes em
  paralelo: tensões incompatíveis. Laços de fontes devem seguir os mesmos critérios.
- Fonte de 0 V ou tensão negativa: valores permitidos; o sinal é interpretado conforme a
  polaridade fixa dos terminais. Resistência zero não substitui um fio.
- Nó ligado por vários fios e junções: selecionar qualquer trecho do nó consulta a mesma tensão.
- Remoção de fio pode dividir um nó; sobreposição visual restante não restabelece a conexão.
- Falha numérica ou valores fora da capacidade de cálculo confiável: erro compreensível,
  sem resultados infinitos, indefinidos ou falsamente válidos.
- Falha ao compartilhar: preservar circuito de trabalho e permitir nova tentativa.
- Recuperação local indisponível, sem espaço ou com dados corrompidos: informar que o rascunho
  não pôde ser salvo ou recuperado; permitir continuar usando a aplicação, sem apresentar
  confirmação falsa de salvamento ou resultados antigos como válidos.
- Abrir um link compartilhado para leitura não substitui o rascunho local. Antes de substituí-lo
  por uma cópia, exemplo ou circuito novo, solicitar confirmação caso exista trabalho local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE oferecer canvas vazio e pelo menos três exemplos: fonte com
  resistor, divisor resistivo em série e resistores em paralelo, com descrição didática.
- **FR-002**: O usuário DEVE poder adicionar, selecionar, mover, girar em passos de 90° e
  excluir resistores, fontes ideais independentes de tensão e símbolos de terra.
- **FR-003**: Resistores e fontes DEVEM ter identificadores únicos no circuito, terminais
  distinguíveis e valores editáveis com unidades; resistências DEVEM ser finitas e positivas,
  e tensões DEVEM ser finitas, admitindo zero e sinais positivos ou negativos.
- **FR-004**: O sistema DEVE permitir criar e excluir fios entre terminais e criar junções
  explícitas com fios existentes; terminais sobrepostos e cruzamentos sem junção NÃO DEVEM
  criar conexão elétrica. Junções DEVEM ter marcador visual distinto de cruzamentos.
- **FR-005**: Mover ou girar DEVE preservar a identidade dos terminais e conexões existentes.
  Excluir fio ou componente DEVE atualizar a conectividade conforme a história 2.
- **FR-006**: O botão Analisar DEVE calcular o estado CC de circuitos suportados com solução
  única, incluindo redes série, paralelo e mistas com múltiplas fontes de tensão.
- **FR-007**: Selecionar um nó após análise válida DEVE mostrar sua tensão em relação ao terra
  em volts; todos os símbolos de terra DEVEM corresponder ao mesmo nó de referência.
- **FR-008**: Selecionar resistor ou fonte após análise válida DEVE mostrar tensão entre seus
  terminais, corrente e potência em V, A e W ou prefixos explicitados, inclusive resultados zero.
- **FR-009**: Cada componente de dois terminais DEVE ter referências estáveis a e b: tensão
  V(a)-V(b), corrente a→b e potência p=v·i. Na fonte, a é o terminal positivo. A interface DEVE
  mostrar polaridade e seta, explicar corrente negativa como oposta à seta e potência positiva
  como absorvida e negativa como fornecida. Girar não pode inverter essas identidades.
- **FR-010**: Toda alteração do circuito descrita na história 2 DEVE invalidar imediatamente
  a análise anterior. Apenas selecionar ou consultar resultados NÃO DEVE invalidá-la.
- **FR-011**: O sistema DEVE distinguir os estados não analisado, análise válida, análise
  invalidada e análise com erro; somente análise válida permite consultar resultados atuais.
- **FR-012**: O sistema DEVE rejeitar os casos inválidos e sem solução única de Edge Cases,
  com causa compreensível, elemento afetado quando identificável e orientação quando conhecida.
- **FR-013**: Resultados DEVEM ser conferidos com referências analíticas em validação
  automatizada, com entradas, dedução, valores esperados e tolerâncias justificadas registradas.
  Nenhuma falha numérica pode ser exibida como análise válida.
- **FR-014**: O cálculo e a validação elétrica DEVEM poder ser verificados independentemente
  da interface, conforme a constituição; a seleção visual não pode alterar a solução elétrica.
- **FR-015**: O usuário DEVE poder gerar um link de versão imutável somente com análise válida
  atual e receber confirmação ou mensagem de falha, sem perder o circuito de trabalho.
- **FR-016**: Quem abrir o link DEVE consultar circuito e resultados em modo de leitura sem
  login e criar uma cópia editável independente. Nenhuma edição pode modificar links emitidos.
- **FR-017**: Links com problemas DEVEM produzir a mensagem e a alternativa da história 4;
  dados de compartilhamento inválidos NÃO DEVEM ser apresentados como circuito analisado.
- **FR-018**: A versão inicial NÃO DEVE incluir login, colaboração em tempo real, capacitores,
  indutores, análise CA ou componentes além de resistores, fontes de tensão e terra.
- **FR-019**: A entrega DEVE estar publicada em endereço documentado, com código público,
  licença open-source explícita e instruções verificadas de execução local, validação e deploy.
- **FR-020**: Cada exemplo DEVE incluir seus resultados de referência e explicação analítica
  acessível ao estudante para comparação após a análise.
- **FR-021**: O sistema DEVE salvar automaticamente o último circuito de trabalho neste
  navegador após cada edição concluída, sem login ou ação manual de salvar, incluindo alterações
  ainda não analisadas. Ao recarregar ou reabrir a aplicação sem link compartilhado, DEVE
  recuperar componentes, valores, posições, orientações, fios e junções. A recuperação DEVE
  exigir nova análise antes de mostrar resultados atuais. Falhas de salvamento ou recuperação
  DEVEM ser comunicadas conforme Edge Cases.

### Key Entities *(include if feature involves data)*

- **Circuito de trabalho**: Conjunto editável de componentes, fios, junções, disposição visual
  e estado de análise; tem uma versão corrente à qual os resultados se referem.
- **Rascunho local**: Último circuito de trabalho salvo automaticamente neste navegador;
  não é uma biblioteca de circuitos e não altera versões compartilhadas.
- **Componente**: Resistor ou fonte com identificador, valor, posição, orientação e dois
  terminais identificados; terra é o marcador da referência comum.
- **Terminal**: Ponto de conexão de identidade estável, pertencente a um componente.
- **Fio e junção**: Conexões explícitas; a geometria isolada não define continuidade elétrica.
- **Nó elétrico**: Conjunto de terminais e fios explicitamente unidos, com uma tensão comum;
  pode ser selecionado visualmente pelos elementos condutores que o representam.
- **Análise**: Estado vinculado à versão do circuito, com tensões nodais e grandezas por
  componente, ou diagnóstico de erro.
- **Versão compartilhada**: Retrato imutável de circuito e análise válida, acessível por link
  para leitura e origem de cópias independentes.
- **Exemplo didático**: Circuito pronto, objetivo de estudo, dedução e resultados de referência.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 4 de 5 estudantes de Circuitos I em avaliação de primeiro uso conseguem
  abrir um exemplo, analisar e consultar tensão de nó e corrente de componente em até 3 minutos,
  sem orientação externa.
- **SC-002**: Pelo menos 4 de 5 estudantes conseguem montar e analisar o divisor da história 1
  a partir do canvas vazio em até 10 minutos, consultando apenas as instruções da aplicação.
- **SC-003**: Todas as grandezas dos três exemplos e de um circuito misto com duas fontes
  independentes coincidem com a referência analítica dentro de erro absoluto de 1 µV, 1 µA
  e 1 µW, respectivamente, acrescido de 0,01% do módulo do valor esperado.
- **SC-004**: Em 100% dos cenários de edição, cruzamento e junção das histórias 2 e Edge Cases,
  a conectividade corresponde apenas às ações explícitas e resultados antigos ficam indisponíveis
  após qualquer alteração, antes de nova análise.
- **SC-005**: Todos os casos inválidos de Edge Cases retornam diagnóstico compreensível sem
  resultados válidos; 4 de 5 estudantes identificam a correção de ausência de terra e terminal
  aberto a partir apenas da mensagem.
- **SC-006**: Em 20 verificações com circuitos de até 50 componentes de dois terminais e 100
  nós elétricos, pelo menos 19 apresentam resultado ou diagnóstico em até 2 segundos após
  Analisar, em computador pessoal com navegador desktop e ambiente de avaliação registrados.
- **SC-007**: Em 10 verificações em sessões distintas, os links reproduzem integralmente o
  circuito e resultados compartilhados, e editar cópias ou o circuito de origem não altera
  nenhuma das versões previamente compartilhadas.
- **SC-008**: Uma pessoa seguindo somente a documentação consegue executar localmente e
  publicar a aplicação; no endereço entregue, confere um exemplo analítico e um caso inválido.
  O repositório público contém licença e instruções de contribuição.
- **SC-009**: Em 10 verificações com salvamento local disponível, incluindo recarregar a página
  e fechar e reabrir o navegador após uma edição concluída, o último circuito é recuperado
  integralmente em todos os casos, inclusive alterações não analisadas. Nenhum resultado é
  mostrado como atual antes de nova análise. Abrir um link para leitura preserva esse rascunho.

## Assumptions

- A primeira versão prioriza navegador desktop com mouse e teclado; edição por toque em telas
  pequenas e uso offline não são critérios de aceite desta entrega. A interface será em português.
- Fios e fontes são ideais; resistores são lineares, com parâmetros constantes. A análise é
  estática em corrente contínua. Terra é referência, não componente com potência própria.
- Terminais de componentes precisam ter conexão explícita para permitir análise nesta versão.
  Conexões em aberto ainda podem ser representadas durante a montagem.
- Girar altera a orientação visual sem trocar os terminais. Toda edição, mesmo apenas visual,
  invalida resultados, adotando literalmente a regra solicitada de analisar novamente após alteração.
- O link representa uma versão analisada imutável. A primeira versão não oferece atualização,
  revogação ou expiração configurável de links, nem lista pessoal de circuitos salvos. Links são
  acessíveis a quem os possui e não há promessa de sigilo; isso deve ser informado ao compartilhar.
- O meio de armazenamento ou transporte dos links será decidido no planejamento. Um link não
  depende da sessão original continuar aberta; copiar um circuito não requer identidade do autor.
- A meta de avaliação considera até 50 componentes e 100 nós. Limites efetivos de edição e de
  compartilhamento serão justificados no planejamento e informados antes de impedir uma ação;
  atingir um limite deve preservar o circuito e explicar como reduzi-lo, sem truncamento silencioso.
- Há um único rascunho automático por navegador, sem sincronização entre dispositivos. A
  recuperação depende de o navegador permitir e preservar os dados locais; limpar esses dados
  remove o rascunho. O salvamento automático não implica uso offline.
- Edição com recuperação local e consulta da versão compartilhada são os modos exigidos;
  histórico, biblioteca de circuitos, desfazer/refazer, exportação de arquivos e fontes de
  corrente ficam fora desta primeira versão.
- A entrega depende de ambiente de publicação acessível publicamente e da escolha de licença
  open-source antes da publicação. Não há dependência de autenticação ou serviço pré-existente.

## Evolução após o MVP

- Após a entrega do MVP, internacionalizar a interface para oferecer português e inglês.
  Essa evolução será detalhada em uma especificação própria, incluindo seleção de idioma,
  tradução de controles, mensagens de erro, exemplos e explicações, além da formatação de
  números e unidades. Ela não é requisito nem critério de aceite desta primeira versão.
  A tradução da documentação é uma decisão separada; não é exigida por esta intenção.
