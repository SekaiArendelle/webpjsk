import { ChartUnitWidth } from "../../../domain/chart-unit-width";
import { createDemoChart } from "../../../domain/chart";
import { TapNote } from "../../../domain/notes";

export const chart = createDemoChart(
  [[new TapNote(new ChartUnitWidth(0))]],
  202895,
  900,
);
