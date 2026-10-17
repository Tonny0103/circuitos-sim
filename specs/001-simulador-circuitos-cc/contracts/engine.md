# Contrato do motor e da topologia

Contrato TypeScript conceitual; implementação ainda não criada. Não é API HTTP.

## Entradas e saídas

- `buildNetlist(document): TopologyResult`: função pura, valida relações e deriva nós,
  retornando Netlist ou lista ordenada de erros. Aceita documento independente de renderer.
- `analyze(netlist): AnalysisResult`: função pura síncrona; não muta entrada, acessa DOM,
  rede, storage ou React. Ordenação determinística das incógnitas e dos resultados.
- `validateSharedSnapshot(input): SharedValidationResult`: valida estrutura, constrói netlist,
  recalcula análise e compara; é coordenador externo ao motor.

Sucesso `{ok:true, engineVersion:'1', nodeVoltages, componentResults, diagnostics}`.
nodeVoltages inclui nó 0=0; componentResults usa IDs e valores em SI, sem arredondamento.
diagnostics inclui rank, dimension, scaledConditionEstimate e normalizedResidual; não exige
exposição dessas informações técnicas ao estudante.

Falha `{ok:false, errors:[{code, componentIds?, endpointIds?, nodeIds?, params?}]}`.
Erros são dados sem HTML ou stack traces; UI mapeia code/params para mensagem em português.

## Sinais

Para todo elemento: tensão V(a)−V(b); corrente a→b; potência absorvida = tensão·corrente.
Em fontes a é positivo, b negativo. Fonte de tensão negativa mantém as polaridades e impõe
valor negativo. Mover ou girar não troca a/b. Terra não recebe corrente/potência de componente.
Não apresentar corrente individual de fio: fios são união ideal e sua corrente pode ser ambígua.

## Diagnóstico e precedência

| Ordem | Code | Condição / orientação visível |
|---|---|---|
| 1 | INVALID_DOCUMENT / LIMIT_EXCEEDED | Estrutura, IDs, referências ou limites inválidos; corrigir/importar circuito compatível |
| 2 | INVALID_VALUE | Valores não finitos, R<=0 ou parâmetro incompleto; identificar componente |
| 3 | EMPTY_CIRCUIT | Nenhum resistor/fonte; montar ou abrir exemplo |
| 4 | MISSING_GROUND | Adicionar referência terra |
| 5 | OPEN_TERMINAL | Conectar terminal indicado (restrição didática do MVP) |
| 6 | FLOATING_CIRCUIT | Parte com componente não tem caminho até terra; revisar conexões |
| 7 | INCONSISTENT_CONSTRAINTS | Fontes/curtos impõem tensões incompatíveis; revisar fontes e fios |
| 7 | NON_UNIQUE_SOLUTION | Restrições redundantes, correntes indeterminadas; revisar laços/fontes |
| 7 | NUMERICAL_FAILURE | Condicionamento, limiar incerto, resíduo ou não finitos; revisar valores |

Retornar todos os erros de uma etapa quando identificáveis, sem avançar a etapas dependentes.
Nunca inventar ID de elemento culpado quando o problema for global. Singularidade não gera
sucesso parcial; nenhuma pseudoinversa ou regularização cria resposta artificial.

## Invariantes e teste de contrato

Mesmo documento elétrico, independentemente de geometria/ordem, produz mesmos resultados
dentro das tolerâncias. Inputs permanecem imutáveis. Todos os nós/componentes aparecem uma vez.
As fixtures da seção Validation Strategy de plan.md validam também esse contrato, KCL e potência.
Erros de valor em importação passam pelo mesmo motor que erros produzidos na edição.
