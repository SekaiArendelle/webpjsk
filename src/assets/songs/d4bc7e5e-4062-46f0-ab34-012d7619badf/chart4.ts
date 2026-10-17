import { ChartUnitWidth } from "../../../domain/chart-unit-width";
import { createDemoChart } from "../../../domain/chart";
import { FlickNote, TapNote, TraceNote } from "../../../domain/notes";

export const chart = createDemoChart(
  [
    [new TapNote(new ChartUnitWidth(1)), new TapNote(new ChartUnitWidth(9))],
    [
      new TraceNote(new ChartUnitWidth(4)),
      new TraceNote(new ChartUnitWidth(6)),
    ],
    [new FlickNote(new ChartUnitWidth(3))],
    [new TapNote(new ChartUnitWidth(2)), new TapNote(new ChartUnitWidth(8))],
    [new TraceNote(new ChartUnitWidth(5))],
    [
      new FlickNote(new ChartUnitWidth(4)),
      new FlickNote(new ChartUnitWidth(7)),
    ],
    [new TapNote(new ChartUnitWidth(3)), new TraceNote(new ChartUnitWidth(7))],
    [new FlickNote(new ChartUnitWidth(5))],
  ],
  216131,
  450,
);
