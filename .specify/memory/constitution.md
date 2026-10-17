# circuitos-sim Constitution

## Core Principles

### I. Correção dos cálculos e validação analítica

O motor DEVE produzir resultados coerentes com as leis de circuitos aplicáveis ao escopo
suportado. Cada capacidade de cálculo DEVE ter testes automatizados com circuitos cujos
resultados sejam deduzidos analiticamente. Os testes DEVEM registrar entradas, resultados
esperados, fundamentação e tolerâncias numéricas justificadas. Alterações no motor DEVEM
passar por esses testes antes de serem aceitas. Correção tem prioridade sobre novas
funcionalidades e apresentação visual, pois erros comprometem o aprendizado.

### II. Motor de simulação independente da interface

O motor DEVE ser um módulo separado, com contrato explícito de entradas, resultados e erros.
Ele NÃO DEVE depender de componentes visuais, DOM ou estado da interface e DEVE ser executável
em testes sem navegador. A interface DEVE coletar dados e apresentar respostas; as equações
e regras de validação elétrica DEVEM permanecer no motor. Essa separação permite conferir
os cálculos de forma independente.

### III. Clareza didática e interface simples

A aplicação DEVE priorizar as atividades de estudo de Circuitos I. Toda grandeza de entrada
ou resultado DEVE mostrar sua unidade e, quando aplicável, seu prefixo. Tensões DEVEM ter
polaridades de referência explícitas; correntes DEVEM ter sentidos de referência explícitos.
Resultados negativos DEVEM ser interpretáveis em relação a essas referências. A interface
DEVE tornar identificáveis as ações de definir um circuito, simular e consultar resultados,
sem exigir configurações alheias à atividade de estudo.

### IV. Escopo pequeno e limitações explícitas

Cada funcionalidade DEVE declarar componentes, tipos de análise e condições suportadas,
com critérios de aceite verificáveis. Novas capacidades DEVEM atender a uma necessidade de
Circuitos I e justificar o aumento de complexidade. A implementação DEVE usar a solução mais
simples que satisfaça os critérios de aceite. Recursos fora do escopo declarado NÃO DEVEM ser
aceitos silenciosamente nem apresentados como suportados.

### V. Erros compreensíveis e resultados confiáveis

O motor DEVE detectar entradas e circuitos inválidos ou não solucionáveis dentro do escopo
suportado e retornar erros estruturados. A interface DEVE explicar o problema em linguagem
compreensível, identificar o elemento ou condição envolvida quando possível e informar uma
ação de correção quando conhecida. Falhas numéricas NÃO DEVEM aparecer como resultados válidos.
Cada categoria de erro suportada DEVE ter validação automatizada e sua mensagem conferida
na aplicação.

## Escopo e entrega open-source

O projeto DEVE ser entregue como aplicação web utilizável e publicada, com endereço de acesso
documentado. A entrega DEVE incluir instruções reproduzíveis para instalar dependências,
executar localmente, validar o motor, gerar a versão de produção e realizar deploy.
Pré-requisitos e configurações necessárias DEVEM estar documentados sem segredos.

O código-fonte DEVE ser público e acompanhado de licença open-source explícita. A licença
DEVE ser escolhida e registrada antes da publicação; esta constituição não determina uma
licença específica. O repositório DEVE explicar o objetivo educacional, as limitações do
simulador e como contribuir.

## Fluxo de desenvolvimento e critérios de aceite

Antes da implementação, a especificação DEVE registrar o objetivo didático, o escopo elétrico,
os circuitos de referência analítica e os casos inválidos relevantes. O planejamento DEVE
preservar a independência do motor e limitar o trabalho ao escopo definido.

Cada revisão DEVE verificar os cálculos, os testes analíticos com tolerâncias explícitas,
a separação entre motor e interface, as unidades e referências de sinal e as mensagens de erro
afetadas. Mudanças de comportamento DEVEM atualizar a documentação pertinente.

A entrega publicada somente DEVE ser considerada concluída após executar os testes do motor,
gerar a versão de produção e conferir no endereço público um circuito com resultado analítico
conhecido e um caso inválido. As instruções locais e de deploy DEVEM ser conferidas em relação
à versão entregue. A evidência dessas verificações DEVE constar na revisão ou na documentação
da entrega.

## Governance

Esta constituição prevalece sobre decisões técnicas e artefatos de planejamento do projeto.
Especificações, planos, tarefas e revisões DEVEM demonstrar conformidade com seus princípios.
Desvios DEVEM ser resolvidos antes da aceitação; mudanças de princípio exigem emenda explícita.

Emendas DEVEM registrar motivação, princípios afetados, impacto nos artefatos existentes e
ações de adequação. O mantenedor DEVE aprovar a emenda antes de sua adoção. A versão DEVE seguir
versionamento semântico: MAJOR para remoções ou redefinições incompatíveis, MINOR para novos
princípios ou ampliação material de regras, e PATCH para esclarecimentos sem mudança de
obrigação. Cada emenda DEVE atualizar a data de alteração, preservando a ratificação original.
A conformidade DEVE ser revisada em cada mudança e antes de cada publicação.

**Version**: 1.0.0 | **Ratified**: 2026-10-17 | **Last Amended**: 2026-10-17
