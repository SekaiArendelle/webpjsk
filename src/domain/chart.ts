import { HoldNote, type Note } from "./notes";

export interface ChartEvent {
  readonly id: string;
  readonly timeMs: number;
  readonly note: Note;
}

export class Chart {
  private readonly events: readonly ChartEvent[];

  constructor(events: readonly ChartEvent[]) {
    const ids = new Set<string>();
    for (const event of events) {
      const lane = event.note.getWidthOffset().asNumber();
      const laneWidth = event.note.getLaneWidth();
      if (!event.id || ids.has(event.id))
        throw new Error("谱面音符 ID 必须唯一");
      if (!Number.isFinite(event.timeMs) || event.timeMs < 0) {
        throw new Error(`音符 ${event.id} 的时间无效`);
      }
      if (
        !Number.isInteger(lane) ||
        !Number.isInteger(laneWidth) ||
        lane < 0 ||
        laneWidth < 1 ||
        lane + laneWidth > 10
      ) {
        throw new Error(`音符 ${event.id} 的轨道位置无效`);
      }
      if (event.note instanceof HoldNote && event.note.durationMs <= 0) {
        throw new Error(`长按音符 ${event.id} 的时长无效`);
      }
      ids.add(event.id);
    }
    this.events = [...events].sort((a, b) => a.timeMs - b.timeMs);
  }

  getEvents(): readonly ChartEvent[] {
    return this.events;
  }
}

// Bundled charts contain note patterns but no authored beat times yet.
export function createDemoChart(
  groups: readonly (readonly Note[])[],
  musicDurationMs: number,
  intervalMs: number,
): Chart {
  if (!groups.length || !Number.isFinite(intervalMs) || intervalMs <= 0) {
    throw new Error("演示谱面需要音符组和有效间隔");
  }
  const events: ChartEvent[] = [];
  for (
    let groupIndex = 0, timeMs = 1600;
    timeMs < musicDurationMs - 2500;
    groupIndex++, timeMs += intervalMs
  ) {
    const group = groups[groupIndex % groups.length];
    group.forEach((note, noteIndex) => {
      events.push({ id: `${groupIndex}-${noteIndex}`, timeMs, note });
    });
  }
  return new Chart(events);
}
