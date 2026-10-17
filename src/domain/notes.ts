import { type ChartUnitWidth } from "./chart-unit-width";

export abstract class Note {
  constructor(
    private readonly widthOffset: ChartUnitWidth,
    private readonly laneWidth = 1,
  ) {}

  getWidthOffset(): ChartUnitWidth {
    return this.widthOffset;
  }

  getLaneWidth(): number {
    return this.laneWidth;
  }
}

export class TapNote extends Note {}

export class FlickNote extends Note {}

export class TouchNote extends Note {}

export class HoldNote extends Note {
  constructor(
    widthOffset: ChartUnitWidth,
    readonly durationMs: number,
    laneWidth = 1,
  ) {
    super(widthOffset, laneWidth);
  }
}
