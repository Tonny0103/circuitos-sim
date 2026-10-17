# Data Model — Simulador resistivo CC

## Documento editável

`CircuitDocument`: schemaVersion=1, documentId, revision inteiro não negativo, components,
grounds, junctions e wires. IDs são únicos em cada documento e namespaces são discriminados.
Datas opcionais só como metadados; não interferem na solução ou identidade elétrica.

| Entidade | Campos | Regras |
|---|---|---|
| Component | id, kind resistor/voltageSource, label, valueSI, x, y, rotation | Terminais a/b implícitos; R>0; V finito; rotation em 0/90/180/270 |
| Ground | id, x, y, rotation | Uma âncora g; todos equivalem à referência 0 |
| Junction | id, x, y | Âncora explícita; ponto preenchido no desenho |
| Endpoint | kind terminal/ground/junction; ownerId; terminal a/b quando aplicável | Referência existente; sem endpoint por coordenada |
| Wire | id, from, to, bends | Extremos distintos; bends é lista de até 8 pontos geométricos |
| LocalDraft | schemaVersion=1, document | Chave circuitos-sim:draft:v1; não contém análise válida |

Limites de elementos, strings, bytes e coordenadas estão em plan.md. Schemas rejeitam chaves
desconhecidas, IDs duplicados, strings arbitrárias como HTML, números não finitos e referências
quebradas. O documento vazio é válido para edição; não é analisável. Labels não são usados
como identidade e são exibidos como texto. Valores são SI; prefixo/unidade pertencem ao formulário.

## Derivação elétrica

`Netlist`: nodes, groundNodeId, resistors {id,aNode,bNode,ohms}, voltageSources
{id,aNode,bNode,volts}, endpointNodeMap. Só dados elétricos, sem posições, SVG, DOM ou storage.
`ElectricalNode`: id determinístico e conjunto de âncoras; tensão só existe após análise válida.

Derivar nós por union-find: unir from/to de cada fio, depois todas as âncoras ground.
Compartilhar o mesmo endpoint implica união; mesma coordenada não. Componente não une a/b.
Terra é nó 0. Demais nós recebem ID derivado da menor chave de âncora ordenada.
Toda âncora de componente/terra precisa incidir em ao menos um fio para analisar; junções
soltas sem componente são descartadas da netlist, mas continuam no documento visual.
Partes com componentes sem caminho até terra, por fios e elementos, são flutuantes.

Criar junção no interior de fio substitui esse fio por dois fios referenciando a nova âncora.
Unir cruzamento faz isso em ambos. Excluir componente remove seus fios incidentes; excluir
junção remove fios incidentes sem unir pontas. Mover/girar mantém endpoints e recalcula apenas
o desenho dos extremos; geometria nunca é analisada pelo motor.

## Análise e apresentação

`AnalysisResult` é união discriminada de sucesso e falha, conforme contracts/engine.md.
Sucesso: engineVersion, documentRevision (adicionado pelo coordenador), nodeVoltages,
componentResults {voltage,current,power}, endpointNodeMap e métricas numéricas de diagnóstico.
IDs e referências coincidem com o documento analisado. A seleção usa os mapas, não cálculos
elétricos no componente React.

`EditorState`: mode edit/readOnly, document, selection, analysisState, persistenceStatus,
pendingInteraction, pendingReplacement. Estados de análise: notAnalyzed, valid, invalidated,
error. Analyzing é estado transitório para impedir comandos conflitantes/repetidos.

| Evento | Transição |
|---|---|
| Abrir documento novo/exemplo | notAnalyzed; confirmar substituição de rascunho existente |
| Concluir edição aceita | revision+1; valid/error → invalidated; salvar rascunho |
| Primeiro deslocamento de arraste | invalidar antes de qualquer prévia modificada |
| Selecionar, mudar foco, consultar | Não altera documento/revisão/análise |
| Analisar | analisar revisão capturada; sucesso → valid, falha → error |
| Receber resultado de revisão antiga | Descartar; nunca marcar revisão nova como válida |
| Restaurar rascunho | notAnalyzed mesmo se documento já tiver sido analisado antes |
| Abrir link | Validar/recalcular; readOnly valid ou erro; não salvar sobre rascunho |
| Criar cópia de link | Confirmar substituição; novo documentId, revision=0; análise verificada
  pode ser associada à cópia até primeira edição; remover fragmento e persistir só documento |

## Snapshot compartilhado

`SharedSnapshot`: schemaVersion=1, engineVersion='1', document e analysis.
analysis contém tensões nodais e grandezas de todos os componentes com IDs; exclui seleção,
estado de persistência, arraste, métricas de desempenho e mensagens de UI.
Arrays são ordenados por ID para serializar e comparar de maneira determinística.

Ao abrir, conferir documento, netlist e resultados pelo motor; aceitar apenas IDs/conjuntos
exatos, valores finitos e discrepância máxima conforme SC-003. Usar resultados recalculados
na UI. Não tolerar resultado extra, nó ausente ou análise incompatível com o circuito.
Motor/schema desconhecidos não são migrados silenciosamente. Decoder v1 deve permanecer
compatível em releases futuros; novas convenções exigem novo engineVersion/codec.

Não há entidade de usuário nem propriedade remota. Uma pessoa pode construir outro link
alterando os dados: isso cria outro snapshot, não altera o link original e não prova autoria.

## Persistência e falhas

Salvar após cada comando concluído, inclusive nova cópia. Carregar apenas depois da montagem
no cliente. Falha de quota/permissão mantém circuito em memória e mostra que não foi salvo.
Não sobrescrever dado corrompido automaticamente; informar e permitir iniciar outro rascunho.
Evento storage de outra aba sinaliza conflito e oferece carregar o outro rascunho ou manter
o atual; nenhuma mesclagem automática. Sem promessa de recuperar dados apagados pelo navegador.
