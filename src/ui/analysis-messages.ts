export const messages: Record<string, string> = {
  INVALID_DOCUMENT:
    "A estrutura do circuito é inválida. Revise os componentes e as conexões.",
  LIMIT_EXCEEDED:
    "O circuito ultrapassa um limite do MVP. Reduza componentes, fios ou junções.",
  INVALID_VALUE:
    "Valor inválido. Use resistência positiva e tensão finita; confira a unidade.",
  EMPTY_CIRCUIT:
    "O circuito está vazio. Adicione componentes ou abra um exemplo.",
  MISSING_GROUND: "Falta o terra. Adicione e conecte um nó de referência.",
  OPEN_TERMINAL:
    "Há um terminal sem fio conectado. Conecte os terminais indicados para analisar.",
  FLOATING_CIRCUIT:
    "Há uma parte flutuante, sem caminho até o terra. Revise suas conexões.",
  INCONSISTENT_CONSTRAINTS:
    "As fontes impõem tensões incompatíveis. Revise fontes, curtos e conexões.",
  NON_UNIQUE_SOLUTION:
    "O circuito não tem solução única: algumas correntes são indeterminadas. Revise fontes em paralelo e laços de fontes.",
  NUMERICAL_FAILURE:
    "Não foi possível calcular com precisão confiável. Revise valores muito diferentes ou restrições quase redundantes.",
  INVALID_SHARE:
    "O link está incompleto ou contém dados inválidos. Solicite um novo link.",
  UNSUPPORTED_VERSION:
    "Este link usa uma versão não suportada. Solicite um link compatível.",
  RESULT_MISMATCH:
    "Os resultados do link não correspondem ao circuito. Solicite um novo link.",
  SHARE_TOO_LARGE:
    "O circuito excede o limite de compartilhamento (64.000 caracteres / 256 KiB). Simplifique o desenho.",
  COMPRESSION_UNAVAILABLE:
    "Este navegador não oferece compressão para os links. Use um navegador desktop atualizado.",
};
export const message = (code: string) =>
  messages[code] ?? "Não foi possível concluir a operação. Tente novamente.";
