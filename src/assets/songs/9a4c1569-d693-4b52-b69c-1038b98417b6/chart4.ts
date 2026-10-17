import { ChartUnitWidth } from "../../../domain/chart-unit-width";
import { createDemoChart } from "../../../domain/chart";
import { FlickNote, TapNote, TouchNote } from "../../../domain/notes";

export const chart = createDemoChart(
  [
    [new TapNote(new ChartUnitWidth(2)), new TapNote(new ChartUnitWidth(8))],
    [new TouchNote(new ChartUnitWidth(5))],
    [new TapNote(new ChartUnitWidth(1)), new FlickNote(new ChartUnitWidth(9))],
    [
      new TouchNote(new ChartUnitWidth(4)),
      new TouchNote(new ChartUnitWidth(6)),
    ],
    [new TapNote(new ChartUnitWidth(3)), new TapNote(new ChartUnitWidth(7))],
    [new FlickNote(new ChartUnitWidth(5))],
    [new TapNote(new ChartUnitWidth(2)), new TouchNote(new ChartUnitWidth(8))],
    [
      new FlickNote(new ChartUnitWidth(4)),
      new FlickNote(new ChartUnitWidth(6)),
    ],
  ],
  202895,
  450,
);
