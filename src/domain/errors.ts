export type ErrorCode =
  | "INVALID_DOCUMENT"
  | "LIMIT_EXCEEDED"
  | "INVALID_VALUE"
  | "EMPTY_CIRCUIT"
  | "MISSING_GROUND"
  | "OPEN_TERMINAL"
  | "FLOATING_CIRCUIT"
  | "INCONSISTENT_CONSTRAINTS"
  | "NON_UNIQUE_SOLUTION"
  | "NUMERICAL_FAILURE";
export type CircuitError = {
  code: ErrorCode;
  componentIds?: string[];
  endpointIds?: string[];
  nodeIds?: string[];
};
export type Failure = { ok: false; errors: CircuitError[] };
export const fail = (
  code: ErrorCode,
  detail: Omit<CircuitError, "code"> = {},
): Failure => ({ ok: false, errors: [{ code, ...detail }] });
