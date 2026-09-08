import { ChartUnitWidth } from "../../../domain/chart-unit-width";
import { Chart } from "../../../domain/chart";
import { FlickNote, TapNote, TouchNote } from "../../../domain/notes";

export const chart = new Chart([
  [new TapNote(new ChartUnitWidth(1)), new TapNote(new ChartUnitWidth(9))],
  [new TouchNote(new ChartUnitWidth(4)), new TouchNote(new ChartUnitWidth(6))],
  [new FlickNote(new ChartUnitWidth(3))],
  [new TapNote(new ChartUnitWidth(2)), new TapNote(new ChartUnitWidth(8))],
  [new TouchNote(new ChartUnitWidth(5))],
  [new FlickNote(new ChartUnitWidth(4)), new FlickNote(new ChartUnitWidth(7))],
  [new TapNote(new ChartUnitWidth(3)), new TouchNote(new ChartUnitWidth(7))],
  [new FlickNote(new ChartUnitWidth(5))],
]);
