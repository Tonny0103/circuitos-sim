import type { CircuitError, Failure } from "../domain/errors";
export type Branch = {
  id: string;
  aNode: string;
  bNode: string;
  value: number;
};
export type Netlist = {
  nodes: string[];
  groundNodeId: "0";
  resistors: Branch[];
  voltageSources: Branch[];
  endpointNodeMap: Record<string, string>;
};
export type TopologyResult = { ok: true; netlist: Netlist } | Failure;
export type Quantities = { voltage: number; current: number; power: number };
export type AnalysisSuccess = {
  ok: true;
  engineVersion: "1";
  nodeVoltages: Record<string, number>;
  componentResults: Record<string, Quantities>;
  diagnostics: {
    rank: number;
    dimension: number;
    scaledConditionEstimate: number;
    normalizedResidual: number;
  };
};
export type AnalysisResult =
  AnalysisSuccess | { ok: false; errors: CircuitError[] };
