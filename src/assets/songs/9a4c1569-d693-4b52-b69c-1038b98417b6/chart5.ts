import { ChartUnitWidth } from "../../../domain/chart-unit-width";
import { createDemoChart } from "../../../domain/chart";
import {
  FlickNote,
  GuideNote,
  SlideNote,
  TapNote,
  TraceFlickNote,
  TraceNote,
} from "../../../domain/notes";

export const chart = createDemoChart(
  [
    [
      new FlickNote(new ChartUnitWidth(1)),
      new TapNote(new ChartUnitWidth(9), 1, true),
    ],
    [
      new TraceNote(new ChartUnitWidth(3)),
      new TraceNote(new ChartUnitWidth(7)),
    ],
    [
      new TapNote(new ChartUnitWidth(2)),
      new FlickNote(new ChartUnitWidth(8), 1, "up-right"),
    ],
    [
      new SlideNote(
        [
          { offsetMs: 0, lane: 5, width: 1 },
          { offsetMs: 500, lane: 3, width: 2, judge: true },
          { offsetMs: 1000, lane: 1, width: 1 },
        ],
        { tail: "flick", tailDirection: "up-left" },
      ),
      new GuideNote([
        { offsetMs: 0, lane: 7, width: 1 },
        { offsetMs: 500, lane: 8, width: 1 },
        { offsetMs: 1000, lane: 7, width: 1 },
      ]),
    ],
    [
      new TapNote(new ChartUnitWidth(1)),
      new TapNote(new ChartUnitWidth(5)),
      new TapNote(new ChartUnitWidth(9)),
    ],
    [
      new FlickNote(new ChartUnitWidth(3)),
      new FlickNote(new ChartUnitWidth(7)),
    ],
    [
      new TraceNote(new ChartUnitWidth(2)),
      new TraceNote(new ChartUnitWidth(8)),
    ],
    [new TapNote(new ChartUnitWidth(4)), new FlickNote(new ChartUnitWidth(6))],
    [new TraceFlickNote(new ChartUnitWidth(5))],
    [
      new FlickNote(new ChartUnitWidth(2)),
      new FlickNote(new ChartUnitWidth(8)),
    ],
  ],
  202895,
  400,
);
