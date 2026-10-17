import { ChartUnitWidth } from "./chart-unit-width";

export type FlickDirection =
  | "any"
  | "up"
  | "up-left"
  | "up-right"
  | "down"
  | "down-left"
  | "down-right";

export interface SlidePoint {
  readonly offsetMs: number;
  readonly lane: number;
  readonly width: number;
  readonly visible?: boolean;
  readonly judge?: boolean;
}

export interface SlideOptions {
  readonly head?: "tap" | "trace" | "flick";
  readonly tail?: "release" | "trace" | "flick";
  readonly headDirection?: FlickDirection;
  readonly tailDirection?: FlickDirection;
  readonly critical?: boolean;
}

export abstract class Note {
  constructor(
    private readonly widthOffset: ChartUnitWidth,
    private readonly laneWidth = 1,
    readonly critical = false,
  ) {}

  getWidthOffset(): ChartUnitWidth {
    return this.widthOffset;
  }

  getLaneWidth(): number {
    return this.laneWidth;
  }
}

export class TapNote extends Note {}

export class FlickNote extends Note {
  constructor(
    widthOffset: ChartUnitWidth,
    laneWidth = 1,
    readonly direction: FlickDirection = "any",
    critical = false,
  ) {
    super(widthOffset, laneWidth, critical);
  }
}

export class TraceNote extends Note {}

export class TraceFlickNote extends FlickNote {}

export class SlideNote extends Note {
  readonly points: readonly SlidePoint[];
  readonly head: "tap" | "trace" | "flick";
  readonly tail: "release" | "trace" | "flick";
  readonly headDirection: FlickDirection;
  readonly tailDirection: FlickDirection;

  constructor(points: readonly SlidePoint[], options: SlideOptions = {}) {
    super(
      new ChartUnitWidth(points[0]?.lane ?? -1),
      points[0]?.width ?? 0,
      options.critical ?? false,
    );
    this.points = [...points];
    this.head = options.head ?? "tap";
    this.tail = options.tail ?? "release";
    this.headDirection = options.headDirection ?? "any";
    this.tailDirection = options.tailDirection ?? "any";
  }

  get durationMs(): number {
    return this.points[this.points.length - 1]?.offsetMs ?? 0;
  }

  getTickPoints(): readonly SlidePoint[] {
    return this.points.slice(1, -1).filter((point) => point.judge);
  }

  pointAt(offsetMs: number): SlidePoint {
    const points = this.points;
    if (offsetMs <= 0) return points[0];
    if (offsetMs >= this.durationMs) return points[points.length - 1];
    const nextIndex = points.findIndex((point) => point.offsetMs >= offsetMs);
    const before = points[nextIndex - 1];
    const after = points[nextIndex];
    const ratio =
      (offsetMs - before.offsetMs) / (after.offsetMs - before.offsetMs);
    return {
      offsetMs,
      lane: before.lane + (after.lane - before.lane) * ratio,
      width: before.width + (after.width - before.width) * ratio,
    };
  }
}

export class GuideNote extends SlideNote {}

export class HoldNote extends SlideNote {
  constructor(
    widthOffset: ChartUnitWidth,
    durationMs: number,
    laneWidth = 1,
    options: SlideOptions = {},
  ) {
    const lane = widthOffset.asNumber();
    super(
      [
        { offsetMs: 0, lane, width: laneWidth },
        { offsetMs: durationMs, lane, width: laneWidth },
      ],
      options,
    );
  }
}
