import { type ChartEvent } from "./chart";
import {
  FlickNote,
  GuideNote,
  SlideNote,
  TraceFlickNote,
  TraceNote,
  type FlickDirection,
  type Note,
  type SlidePoint,
} from "./notes";

export type Grade = "PERFECT" | "GREAT" | "GOOD" | "MISS";
export interface Judgment {
  readonly event: ChartEvent;
  readonly grade: Grade;
  readonly part: "single" | "head" | "tick" | "tail";
}

interface ActiveSlide {
  readonly event: ChartEvent;
  readonly inputId: string;
  nextTick: number;
  offPathSince: number | null;
}

const WINDOWS = [60, 110, 160] as const;

function inLane(note: Note | SlidePoint, lane: number): boolean {
  const start = "lane" in note ? note.lane : note.getWidthOffset().asNumber();
  const width = "width" in note ? note.width : note.getLaneWidth();
  return lane >= start - 1 && lane <= start + width;
}

function laneDistance(note: Note, lane: number): number {
  return Math.abs(
    lane - (note.getWidthOffset().asNumber() + (note.getLaneWidth() - 1) / 2),
  );
}

function directionMatches(
  required: FlickDirection,
  actual: FlickDirection,
): boolean {
  return required === "any" || required === actual;
}

export class JudgmentEngine {
  private readonly resolved = new Set<string>();
  private readonly contacts = new Map<string, number>();
  private readonly active = new Map<string, ActiveSlide>();
  private score = 0;
  private combo = 0;
  private life = 1000;
  private judgedCount = 0;
  private readonly totalCount: number;
  private readonly maxScore: number;

  constructor(private readonly events: readonly ChartEvent[]) {
    this.totalCount = events.reduce((sum, event) => sum + this.parts(event), 0);
    this.maxScore = events.reduce(
      (sum, event) =>
        sum + this.parts(event) * (event.note.critical ? 1200 : 1000),
      0,
    );
  }

  private parts(event: ChartEvent): number {
    if (event.note instanceof GuideNote) return 0;
    return event.note instanceof SlideNote
      ? 2 + event.note.getTickPoints().length
      : 1;
  }

  getState() {
    return {
      score: this.score,
      combo: this.combo,
      life: this.life,
      judgedCount: this.judgedCount,
      totalCount: this.totalCount,
      maxScore: this.maxScore,
      resolved: this.resolved,
      holdingIds: new Set(
        [...this.active.values()].map(({ event }) => event.id),
      ),
    };
  }

  private finish(
    event: ChartEvent,
    grade: Grade,
    part: Judgment["part"],
    final: boolean,
  ): Judgment {
    this.judgedCount++;
    if (final) this.resolved.add(event.id);
    if (grade === "MISS") {
      this.combo = 0;
      this.life = Math.max(0, this.life - 80);
    } else {
      this.combo++;
      const base = grade === "PERFECT" ? 1000 : grade === "GREAT" ? 700 : 400;
      this.score += Math.round(base * (event.note.critical ? 1.2 : 1));
      this.life = Math.min(1000, this.life + 5);
    }
    return { event, grade, part };
  }

  private failSlide(active: ActiveSlide): Judgment[] {
    const note = active.event.note as SlideNote;
    const remainingTicks = note.getTickPoints().length - active.nextTick;
    const results: Judgment[] = [];
    for (let index = 0; index < remainingTicks; index++) {
      results.push(this.finish(active.event, "MISS", "tick", false));
    }
    results.push(this.finish(active.event, "MISS", "tail", true));
    this.active.delete(active.inputId);
    return results;
  }

  private contactAt(note: Note | SlidePoint): string | undefined {
    for (const [inputId, lane] of this.contacts) {
      if (inLane(note, lane) && !this.active.has(inputId)) return inputId;
    }
    return undefined;
  }

  private startSlide(
    event: ChartEvent,
    inputId: string,
    grade: Grade,
  ): Judgment[] {
    this.active.set(inputId, {
      event,
      inputId,
      nextTick: 0,
      offPathSince: null,
    });
    return [this.finish(event, grade, "head", false)];
  }

  private candidate(
    lane: number,
    timeMs: number,
    predicate: (note: Note) => boolean,
  ): ChartEvent | undefined {
    let best: ChartEvent | undefined;
    let bestTime = Infinity;
    let bestLane = Infinity;
    const activeIds = new Set(
      [...this.active.values()].map(({ event }) => event.id),
    );
    for (const event of this.events) {
      if (event.timeMs > timeMs + WINDOWS[2]) break;
      const distance = Math.abs(event.timeMs - timeMs);
      if (
        distance > WINDOWS[2] ||
        this.resolved.has(event.id) ||
        activeIds.has(event.id) ||
        !predicate(event.note) ||
        !inLane(event.note, lane)
      )
        continue;
      const laneGap = laneDistance(event.note, lane);
      if (
        distance < bestTime ||
        (distance === bestTime && laneGap < bestLane)
      ) {
        best = event;
        bestTime = distance;
        bestLane = laneGap;
      }
    }
    return best;
  }

  private gradeFor(distance: number): Grade {
    return distance <= WINDOWS[0]
      ? "PERFECT"
      : distance <= WINDOWS[1]
        ? "GREAT"
        : "GOOD";
  }

  press(inputId: string, lane: number, timeMs: number): Judgment[] {
    this.contacts.set(inputId, lane);
    if (this.active.has(inputId)) return this.update(timeMs);
    const event = this.candidate(lane, timeMs, (note) =>
      note instanceof SlideNote
        ? !(note instanceof GuideNote) && note.head === "tap"
        : !(note instanceof FlickNote) && !(note instanceof TraceNote),
    );
    const results: Judgment[] = [];
    if (event) {
      const grade = this.gradeFor(Math.abs(event.timeMs - timeMs));
      if (event.note instanceof SlideNote)
        results.push(...this.startSlide(event, inputId, grade));
      else results.push(this.finish(event, grade, "single", true));
    }
    return [...results, ...this.update(timeMs)];
  }

  move(inputId: string, lane: number, timeMs: number): Judgment[] {
    if (this.contacts.has(inputId)) this.contacts.set(inputId, lane);
    return this.update(timeMs);
  }

  touch(inputId: string, lane: number, timeMs: number): Judgment[] {
    this.contacts.set(inputId, lane);
    return this.update(timeMs);
  }

  flick(
    inputId: string,
    lane: number,
    timeMs: number,
    direction: FlickDirection = "any",
  ): Judgment[] {
    const wasTouching = this.contacts.has(inputId);
    this.contacts.set(inputId, lane);
    const active = this.active.get(inputId);
    if (active) {
      const note = active.event.note as SlideNote;
      const endMs = active.event.timeMs + note.durationMs;
      if (
        note.tail === "flick" &&
        Math.abs(timeMs - endMs) <= WINDOWS[2] &&
        inLane(note.points[note.points.length - 1], lane) &&
        directionMatches(note.tailDirection, direction)
      ) {
        const results = this.update(timeMs);
        if (!this.active.has(inputId)) return results;
        this.active.delete(inputId);
        results.push(
          this.finish(
            active.event,
            this.gradeFor(Math.abs(timeMs - endMs)),
            "tail",
            true,
          ),
        );
        return results;
      }
      return this.update(timeMs);
    }
    const event = this.candidate(lane, timeMs, (note) =>
      note instanceof SlideNote
        ? !(note instanceof GuideNote) &&
          note.head === "flick" &&
          directionMatches(note.headDirection, direction)
        : note instanceof FlickNote &&
          (!(note instanceof TraceFlickNote) || wasTouching) &&
          directionMatches(note.direction, direction),
    );
    const results: Judgment[] = [];
    if (event) {
      const grade = this.gradeFor(Math.abs(event.timeMs - timeMs));
      if (event.note instanceof SlideNote)
        results.push(...this.startSlide(event, inputId, grade));
      else results.push(this.finish(event, grade, "single", true));
    }
    return [...results, ...this.update(timeMs)];
  }

  input(
    inputId: string,
    lane: number,
    timeMs: number,
    kind: "press" | "flick",
  ): Judgment[] {
    return kind === "press"
      ? this.press(inputId, lane, timeMs)
      : this.flick(inputId, lane, timeMs);
  }

  release(inputId: string, timeMs: number): Judgment[] {
    const results = this.update(timeMs);
    const active = this.active.get(inputId);
    if (active) {
      const note = active.event.note as SlideNote;
      const endMs = active.event.timeMs + note.durationMs;
      if (
        note.tail === "release" &&
        Math.abs(timeMs - endMs) <= WINDOWS[2] &&
        inLane(
          note.points[note.points.length - 1],
          this.contacts.get(inputId) ?? -1,
        )
      ) {
        if (this.active.has(inputId)) {
          this.active.delete(inputId);
          results.push(
            this.finish(
              active.event,
              this.gradeFor(Math.abs(timeMs - endMs)),
              "tail",
              true,
            ),
          );
        }
      } else {
        results.push(...this.failSlide(active));
      }
    }
    this.contacts.delete(inputId);
    return results;
  }

  update(timeMs: number): Judgment[] {
    const results: Judgment[] = [];
    if (!Number.isFinite(timeMs)) {
      for (const active of [...this.active.values()])
        results.push(...this.failSlide(active));
    } else {
      for (const active of [...this.active.values()]) {
        const note = active.event.note as SlideNote;
        const endMs = active.event.timeMs + note.durationMs;
        const contactLane = this.contacts.get(active.inputId);
        const position = note.pointAt(
          Math.max(0, Math.min(note.durationMs, timeMs - active.event.timeMs)),
        );
        if (contactLane === undefined || !inLane(position, contactLane)) {
          active.offPathSince ??= timeMs;
          if (timeMs - active.offPathSince > 160) {
            results.push(...this.failSlide(active));
            continue;
          }
        } else active.offPathSince = null;
        const ticks = note.getTickPoints();
        while (
          active.nextTick < ticks.length &&
          timeMs >= active.event.timeMs + ticks[active.nextTick].offsetMs
        ) {
          const tick = ticks[active.nextTick++];
          results.push(
            this.finish(
              active.event,
              contactLane !== undefined && inLane(tick, contactLane)
                ? "PERFECT"
                : "MISS",
              "tick",
              false,
            ),
          );
        }
        if (timeMs >= endMs && note.tail === "trace") {
          this.active.delete(active.inputId);
          results.push(
            this.finish(
              active.event,
              contactLane !== undefined &&
                inLane(note.points[note.points.length - 1], contactLane)
                ? "PERFECT"
                : "MISS",
              "tail",
              true,
            ),
          );
        } else if (timeMs > endMs + WINDOWS[2]) {
          this.active.delete(active.inputId);
          results.push(this.finish(active.event, "MISS", "tail", true));
        }
      }
    }

    for (const event of this.events) {
      if (event.timeMs > timeMs) break;
      if (this.resolved.has(event.id) || event.note instanceof GuideNote)
        continue;
      if (
        [...this.active.values()].some((active) => active.event.id === event.id)
      )
        continue;
      const note = event.note;
      if (
        Number.isFinite(timeMs) &&
        timeMs <= event.timeMs + WINDOWS[2] &&
        (note instanceof TraceNote ||
          (note instanceof SlideNote && note.head === "trace"))
      ) {
        const contactId = this.contactAt(note);
        if (contactId) {
          if (note instanceof SlideNote)
            results.push(...this.startSlide(event, contactId, "PERFECT"));
          else results.push(this.finish(event, "PERFECT", "single", true));
          continue;
        }
      }
      if (timeMs > event.timeMs + WINDOWS[2]) {
        if (note instanceof SlideNote) {
          results.push(this.finish(event, "MISS", "head", false));
          for (let index = 0; index < note.getTickPoints().length; index++)
            results.push(this.finish(event, "MISS", "tick", false));
          results.push(this.finish(event, "MISS", "tail", true));
        } else results.push(this.finish(event, "MISS", "single", true));
      }
    }
    return results;
  }
}
