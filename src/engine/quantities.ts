import type { Quantities } from "./types";
export const quantities = (voltage: number, current: number): Quantities => ({
  voltage,
  current,
  power: voltage * current,
});
