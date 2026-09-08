import { ChartUnitWidth } from "../../../domain/chart-unit-width";
import { Chart } from "../../../domain/chart";
import { TapNote } from "../../../domain/notes";

export const chart = new Chart([
  [new TapNote(new ChartUnitWidth(0))],
  [new TapNote(new ChartUnitWidth(0))],
]);
