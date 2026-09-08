import { ChartUnitWidth } from "../../../domain/chart-unit-width";
import { Chart } from "../../../domain/chart";
import { FlickNote, TapNote, TouchNote } from "../../../domain/notes";

export const chart = new Chart([
  [new FlickNote(new ChartUnitWidth(1)), new TapNote(new ChartUnitWidth(9))],
  [new TouchNote(new ChartUnitWidth(3)), new TouchNote(new ChartUnitWidth(7))],
  [new TapNote(new ChartUnitWidth(2)), new FlickNote(new ChartUnitWidth(8))],
  [new TouchNote(new ChartUnitWidth(5))],
  [
    new TapNote(new ChartUnitWidth(1)),
    new TapNote(new ChartUnitWidth(5)),
    new TapNote(new ChartUnitWidth(9)),
  ],
  [new FlickNote(new ChartUnitWidth(3)), new FlickNote(new ChartUnitWidth(7))],
  [new TouchNote(new ChartUnitWidth(2)), new TouchNote(new ChartUnitWidth(8))],
  [new TapNote(new ChartUnitWidth(4)), new FlickNote(new ChartUnitWidth(6))],
  [new TouchNote(new ChartUnitWidth(5))],
  [new FlickNote(new ChartUnitWidth(2)), new FlickNote(new ChartUnitWidth(8))],
]);
