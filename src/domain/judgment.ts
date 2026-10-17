import { type ChartEvent } from "./chart";
import { FlickNote, HoldNote } from "./notes";

export type Grade = "PERFECT" | "GREAT" | "GOOD" | "MISS";
export interface Judgment {
  readonly event: ChartEvent;
  readonly grade: Grade;
}

const WINDOWS = [60, 110, 160] as const;

export class JudgmentEngine {
  private readonly resolved = new Set<string>();
  private readonly holding = new Map<
    string,
    { event: ChartEvent; grade: Grade }
  >();
  private score = 0;
  private combo = 0;
  private life = 1000;
  private judgedCount = 0;

  constructor(private readonly events: readonly ChartEvent[]) {}

  getState() {
    return {
      score: this.score,
      combo: this.combo,
      life: this.life,
      judgedCount: this.judgedCount,
      totalCount: this.events.length,
      resolved: this.resolved,
      holdingIds: new Set(
        [...this.holding.values()].map(({ event }) => event.id),
      ),
    };
  }

  private finish(event: ChartEvent, grade: Grade): Judgment {
    this.resolved.add(event.id);
    this.judgedCount++;
    if (grade === "MISS") {
      this.combo = 0;
      this.life = Math.max(0, this.life - 80);
    } else {
      this.combo++;
      this.score += grade === "PERFECT" ? 1000 : grade === "GREAT" ? 700 : 400;
      this.life = Math.min(1000, this.life + 5);
    }
    return { event, grade };
  }

  update(timeMs: number): Judgment[] {
    const results: Judgment[] = [];
    for (const [inputId, held] of this.holding) {
      if (
        timeMs >=
        held.event.timeMs + (held.event.note as HoldNote).durationMs
      ) {
        this.holding.delete(inputId);
        results.push(this.finish(held.event, held.grade));
      }
    }
    const heldIds = new Set(
      [...this.holding.values()].map(({ event }) => event.id),
    );
    for (const event of this.events) {
      if (event.timeMs + WINDOWS[2] >= timeMs) break;
      if (!this.resolved.has(event.id) && !heldIds.has(event.id)) {
        results.push(this.finish(event, "MISS"));
      }
    }
    return results;
  }

  input(
    inputId: string,
    lane: number,
    timeMs: number,
    kind: "press" | "flick",
  ): Judgment[] {
    if (this.holding.has(inputId)) return [];
    let candidate: ChartEvent | undefined;
    let bestDistance = Infinity;
    let bestLaneDistance = Infinity;
    for (const event of this.events) {
      const distance = Math.abs(event.timeMs - timeMs);
      if (event.timeMs > timeMs + WINDOWS[2]) break;
      if (distance > WINDOWS[2] || this.resolved.has(event.id)) continue;
      if ([...this.holding.values()].some((held) => held.event.id === event.id))
        continue;
      const laneStart = event.note.getWidthOffset().asNumber();
      if (lane < laneStart - 1 || lane > laneStart + event.note.getLaneWidth())
        continue;
      if (event.note instanceof FlickNote !== (kind === "flick")) continue;
      const laneDistance = Math.abs(
        lane - (laneStart + (event.note.getLaneWidth() - 1) / 2),
      );
      if (
        distance < bestDistance ||
        (distance === bestDistance && laneDistance < bestLaneDistance)
      ) {
        candidate = event;
        bestDistance = distance;
        bestLaneDistance = laneDistance;
      }
    }
    if (!candidate) return [];
    const grade: Grade =
      bestDistance <= WINDOWS[0]
        ? "PERFECT"
        : bestDistance <= WINDOWS[1]
          ? "GREAT"
          : "GOOD";
    if (candidate.note instanceof HoldNote) {
      this.holding.set(inputId, { event: candidate, grade });
      return [];
    }
    return [this.finish(candidate, grade)];
  }

  release(inputId: string, timeMs: number): Judgment[] {
    const held = this.holding.get(inputId);
    if (!held) return [];
    this.holding.delete(inputId);
    const endMs = held.event.timeMs + (held.event.note as HoldNote).durationMs;
    return [
      this.finish(
        held.event,
        timeMs >= endMs - WINDOWS[2] ? held.grade : "MISS",
      ),
    ];
  }
}
