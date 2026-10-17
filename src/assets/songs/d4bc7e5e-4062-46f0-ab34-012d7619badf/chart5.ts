import { ChartUnitWidth } from "../../../domain/chart-unit-width";
import { createDemoChart } from "../../../domain/chart";
import {
  FlickNote,
  HoldNote,
  SlideNote,
  TapNote,
  TraceFlickNote,
  TraceNote,
} from "../../../domain/notes";

export const chart = createDemoChart(
  [
    [
      new TapNote(new ChartUnitWidth(2), 1, true),
      new FlickNote(new ChartUnitWidth(8)),
    ],
    [
      new TraceNote(new ChartUnitWidth(1)),
      new TraceNote(new ChartUnitWidth(9)),
    ],
    [new FlickNote(new ChartUnitWidth(4)), new TapNote(new ChartUnitWidth(6))],
    [new HoldNote(new ChartUnitWidth(5), 1000)],
    [
      new TapNote(new ChartUnitWidth(1)),
      new TapNote(new ChartUnitWidth(5)),
      new FlickNote(new ChartUnitWidth(9)),
    ],
    [
      new TraceNote(new ChartUnitWidth(3)),
      new TraceNote(new ChartUnitWidth(7)),
    ],
    [
      new FlickNote(new ChartUnitWidth(2)),
      new FlickNote(new ChartUnitWidth(8)),
    ],
    [new TapNote(new ChartUnitWidth(4)), new TapNote(new ChartUnitWidth(6))],
    [
      new SlideNote(
        [
          { offsetMs: 0, lane: 5, width: 1 },
          { offsetMs: 450, lane: 7, width: 1, judge: true },
          { offsetMs: 900, lane: 8, width: 1 },
        ],
        { tail: "trace", critical: true },
      ),
    ],
    [
      new FlickNote(new ChartUnitWidth(1)),
      new TraceFlickNote(new ChartUnitWidth(9)),
    ],
  ],
  216131,
  400,
);
