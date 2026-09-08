import { ChartUnitWidth } from "../../../domain/chart-unit-width";
import { Chart } from "../../../domain/chart";
import { FlickNote, TapNote, TouchNote } from "../../../domain/notes";

export const chart = new Chart([
  [new TapNote(new ChartUnitWidth(2)), new FlickNote(new ChartUnitWidth(8))],
  [new TouchNote(new ChartUnitWidth(1)), new TouchNote(new ChartUnitWidth(9))],
  [new FlickNote(new ChartUnitWidth(4)), new TapNote(new ChartUnitWidth(6))],
  [new TouchNote(new ChartUnitWidth(5))],
  [
    new TapNote(new ChartUnitWidth(1)),
    new TapNote(new ChartUnitWidth(5)),
    new FlickNote(new ChartUnitWidth(9)),
  ],
  [new TouchNote(new ChartUnitWidth(3)), new TouchNote(new ChartUnitWidth(7))],
  [new FlickNote(new ChartUnitWidth(2)), new FlickNote(new ChartUnitWidth(8))],
  [new TapNote(new ChartUnitWidth(4)), new TapNote(new ChartUnitWidth(6))],
  [new TouchNote(new ChartUnitWidth(5))],
  [new FlickNote(new ChartUnitWidth(1)), new FlickNote(new ChartUnitWidth(9))],
]);
