import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  type Accessor,
} from "solid-js";
import { type Chart, type ChartEvent } from "../domain/chart";
import { difficultyDefinitions, type Difficulty } from "../domain/difficulty";
import { JudgmentEngine, type Grade, type Judgment } from "../domain/judgment";
import {
  FlickNote,
  GuideNote,
  SlideNote,
  TraceFlickNote,
  TraceNote,
  type FlickDirection,
} from "../domain/notes";
import { type Song } from "../domain/song";
import "./chart.css";

interface HitBurst {
  x: number;
  y: number;
  createdAt: number;
}

interface ChartRenderer {
  addHitBurst(x: number, y: number): void;
  destroy(): void;
}

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawLane(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number,
) {
  const topY = height * 0.115;
  const judgeY = height * 0.82;
  const topLeft = width * 0.425;
  const topRight = width * 0.575;
  const bottomLeft = width * 0.16;
  const bottomRight = width * 0.84;

  const laneGradient = ctx.createLinearGradient(0, topY, 0, judgeY);
  laneGradient.addColorStop(0, "rgba(26, 83, 142, 0.2)");
  laneGradient.addColorStop(0.7, "rgba(37, 29, 125, 0.35)");
  laneGradient.addColorStop(1, "rgba(66, 31, 177, 0.58)");

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(topLeft, topY);
  ctx.lineTo(topRight, topY);
  ctx.lineTo(bottomRight, judgeY);
  ctx.lineTo(bottomLeft, judgeY);
  ctx.closePath();
  ctx.fillStyle = laneGradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(136, 211, 255, 0.78)";
  ctx.lineWidth = 1.4;
  ctx.shadowColor = "#4faeff";
  ctx.shadowBlur = 7;
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (let lane = 1; lane < 10; lane += 1) {
    const ratio = lane / 10;
    ctx.beginPath();
    ctx.moveTo(lerp(topLeft, topRight, ratio), topY);
    ctx.lineTo(lerp(bottomLeft, bottomRight, ratio), judgeY);
    ctx.strokeStyle = "rgba(90, 157, 229, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let row = 0; row < 13; row += 1) {
    const rawProgress = (row / 13 + phase) % 1;
    const progress = rawProgress * rawProgress;
    const y = lerp(topY, judgeY, progress);
    ctx.beginPath();
    ctx.moveTo(lerp(topLeft, bottomLeft, progress), y);
    ctx.lineTo(lerp(topRight, bottomRight, progress), y);
    ctx.strokeStyle = `rgba(88, 146, 225, ${0.08 + progress * 0.24})`;
    ctx.stroke();
  }

  const judgmentGradient = ctx.createLinearGradient(
    bottomLeft,
    0,
    bottomRight,
    0,
  );
  judgmentGradient.addColorStop(0, "rgba(103, 66, 255, 0.35)");
  judgmentGradient.addColorStop(0.3, "#7f7dff");
  judgmentGradient.addColorStop(0.5, "#e4eaff");
  judgmentGradient.addColorStop(0.7, "#8e70ff");
  judgmentGradient.addColorStop(1, "rgba(103, 66, 255, 0.35)");

  ctx.beginPath();
  ctx.moveTo(bottomLeft - width * 0.07, judgeY);
  ctx.lineTo(bottomRight + width * 0.07, judgeY);
  ctx.strokeStyle = judgmentGradient;
  ctx.lineWidth = 4;
  ctx.shadowColor = "#8f65ff";
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.moveTo(bottomLeft - width * 0.11, judgeY + 9);
  ctx.lineTo(bottomRight + width * 0.11, judgeY + 9);
  ctx.strokeStyle = "rgba(100, 92, 245, 0.42)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function laneGeometry(width: number, height: number, progress: number) {
  const topY = height * 0.115;
  const judgeY = height * 0.82;
  const topLeft = width * 0.425;
  const topRight = width * 0.575;
  const bottomLeft = width * 0.16;
  const bottomRight = width * 0.84;
  return {
    y: lerp(topY, judgeY, progress),
    left: lerp(topLeft, bottomLeft, progress),
    right: lerp(topRight, bottomRight, progress),
  };
}

function drawHoldRibbon(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  head: number,
  tail: number,
  headLane: number,
  tailLane: number,
  headWidth: number,
  tailWidth: number,
  color: string,
) {
  const headProgress = Math.min(1, Math.max(0, head));
  const tailProgress = Math.min(1, Math.max(0, tail));
  const headGeometry = laneGeometry(width, height, headProgress ** 1.55);
  const tailGeometry = laneGeometry(width, height, tailProgress ** 1.55);
  const headCenter = lerp(headGeometry.left, headGeometry.right, headLane);
  const tailCenter = lerp(tailGeometry.left, tailGeometry.right, tailLane);
  const headHalfWidth = lerp(9, width * 0.064, headProgress) * headWidth;
  const tailHalfWidth = lerp(5, width * 0.028, tailProgress) * tailWidth;

  const gradient = ctx.createLinearGradient(
    0,
    tailGeometry.y,
    0,
    headGeometry.y,
  );
  gradient.addColorStop(0, color + "55");
  gradient.addColorStop(1, color + "ee");

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tailCenter - tailHalfWidth, tailGeometry.y);
  ctx.lineTo(tailCenter + tailHalfWidth, tailGeometry.y);
  ctx.lineTo(headCenter + headHalfWidth, headGeometry.y);
  ctx.lineTo(headCenter - headHalfWidth, headGeometry.y);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.restore();
}

function drawSlide(
  ctx: CanvasRenderingContext2D,
  event: ChartEvent,
  width: number,
  height: number,
  currentMs: number,
) {
  const note = event.note as SlideNote;
  const color =
    note instanceof GuideNote
      ? "#a48cff"
      : note.critical
        ? "#ffdf56"
        : "#25e9ed";
  ctx.save();
  if (note instanceof GuideNote) ctx.globalAlpha = 0.36;
  for (let index = 0; index < note.points.length - 1; index++) {
    const start = note.points[index];
    const end = note.points[index + 1];
    const head = 1 - (event.timeMs + start.offsetMs - currentMs) / 1800;
    const tail = 1 - (event.timeMs + end.offsetMs - currentMs) / 1800;
    if (head < 0 || tail > 1) continue;
    drawHoldRibbon(
      ctx,
      width,
      height,
      head,
      tail,
      (start.lane + start.width / 2) / 10,
      (end.lane + end.width / 2) / 10,
      start.width,
      end.width,
      color,
    );
  }
  ctx.restore();
  if (note instanceof GuideNote) return;
  for (let index = 1; index < note.points.length; index++) {
    const point = note.points[index];
    if (
      point.visible === false ||
      (index < note.points.length - 1 && !point.judge)
    )
      continue;
    const rawProgress = 1 - (event.timeMs + point.offsetMs - currentMs) / 1800;
    if (rawProgress < 0 || rawProgress > 1.1) continue;
    const geometry = laneGeometry(
      width,
      height,
      Math.min(1, rawProgress) ** 1.65,
    );
    const center = lerp(
      geometry.left,
      geometry.right,
      (point.lane + point.width / 2) / 10,
    );
    const markerWidth =
      lerp(width * 0.018, width * 0.115, Math.min(1, rawProgress)) *
      point.width;
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    roundedRect(
      ctx,
      center - markerWidth / 2,
      geometry.y - 5,
      markerWidth,
      10,
      5,
    );
    ctx.fill();
    ctx.restore();
    if (index === note.points.length - 1 && note.tail === "flick") {
      drawFlickArrow(ctx, center, geometry.y - 7, 16, note.tailDirection);
    }
  }
}

function drawFlickArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  direction: FlickDirection,
) {
  const angles: Record<FlickDirection, number> = {
    any: 0,
    up: 0,
    "up-left": -Math.PI / 4,
    "up-right": Math.PI / 4,
    down: Math.PI,
    "down-left": (-3 * Math.PI) / 4,
    "down-right": (3 * Math.PI) / 4,
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angles[direction]);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(-size * 0.7, 0);
  ctx.lineTo(size * 0.7, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 236, 99, 0.94)";
  ctx.fill();
  ctx.restore();
}

function drawNote(
  ctx: CanvasRenderingContext2D,
  event: ChartEvent,
  width: number,
  height: number,
  currentMs: number,
  holding: boolean,
) {
  const travelTime = 1800;
  if (event.note instanceof SlideNote)
    drawSlide(ctx, event, width, height, currentMs);
  if (event.note instanceof GuideNote) return;
  const rawProgress = holding ? 1 : 1 - (event.timeMs - currentMs) / travelTime;
  if (rawProgress < 0 || rawProgress > 1.1) return;
  const progress = rawProgress ** 1.65;
  const geometry = laneGeometry(width, height, progress);
  const lane =
    (event.note.getWidthOffset().asNumber() + event.note.getLaneWidth() / 2) /
    10;
  const center = lerp(geometry.left, geometry.right, lane);
  const noteWidth =
    lerp(width * 0.018, width * 0.115, progress) * event.note.getLaneWidth();
  const noteHeight = lerp(4, 15, progress);
  const color = event.note.critical
    ? "#ffdf56"
    : event.note instanceof TraceFlickNote
      ? "#81f7df"
      : event.note instanceof FlickNote
        ? "#f8d853"
        : event.note instanceof SlideNote
          ? "#25e9ed"
          : event.note instanceof TraceNote
            ? "#50eed1"
            : "#64ccff";

  ctx.save();
  ctx.globalAlpha = holding ? 0.75 : Math.min(1, rawProgress * 8);
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  roundedRect(
    ctx,
    center - noteWidth / 2,
    geometry.y - noteHeight / 2,
    noteWidth,
    noteHeight,
    noteHeight / 2,
  );
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(1, noteHeight * 0.18);
  ctx.strokeStyle = "rgba(235, 254, 255, 0.92)";
  ctx.stroke();

  if (
    event.note instanceof FlickNote ||
    (event.note instanceof SlideNote && event.note.head === "flick")
  ) {
    const arrowSize = noteHeight * 1.35;
    drawFlickArrow(
      ctx,
      center,
      geometry.y - noteHeight * 0.9,
      arrowSize,
      event.note instanceof FlickNote
        ? event.note.direction
        : event.note.headDirection,
    );
  }
  ctx.restore();
}

function drawBursts(
  ctx: CanvasRenderingContext2D,
  bursts: HitBurst[],
  now: number,
) {
  for (let index = bursts.length - 1; index >= 0; index -= 1) {
    const burst = bursts[index];
    const age = now - burst.createdAt;
    if (age > 520) {
      bursts.splice(index, 1);
      continue;
    }

    const progress = age / 520;
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.translate(burst.x, burst.y);
    ctx.strokeStyle = "#d8b8ff";
    ctx.shadowColor = "#9b57ff";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;
    for (let ray = 0; ray < 18; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 18;
      const innerRadius = 10 + progress * 24;
      const outerRadius = 28 + progress * 105;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
      ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function createChartRenderer(
  canvas: HTMLCanvasElement,
  chart: Chart,
  paused: Accessor<boolean>,
  getTimeMs: () => number,
  getVisualState: () => ReturnType<JudgmentEngine["getState"]>,
  onTick: (timeMs: number) => void,
): ChartRenderer {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器不支持 Canvas 2D");

  const notes = chart.getEvents();
  const bursts: HitBurst[] = [];
  let frameId = 0;
  let width = 0;
  let height = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function renderFrame(now: number) {
    const currentMs = getTimeMs();
    if (!paused()) onTick(currentMs);
    const state = getVisualState();

    context.clearRect(0, 0, width, height);
    drawLane(context, width, height, (currentMs / 2100) % 0.077);
    notes.forEach((note) => {
      const endMs =
        note.note instanceof SlideNote
          ? note.timeMs + note.note.durationMs
          : note.timeMs;
      if (!state.resolved.has(note.id) && endMs >= currentMs - 200) {
        drawNote(
          context,
          note,
          width,
          height,
          currentMs,
          state.holdingIds.has(note.id),
        );
      }
    });
    drawBursts(context, bursts, now);
    frameId = requestAnimationFrame(renderFrame);
  }

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  frameId = requestAnimationFrame(renderFrame);

  return {
    addHitBurst(x, y) {
      bursts.push({ x, y, createdAt: performance.now() });
    },
    destroy() {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    },
  };
}

export default function PlayChart(props: {
  chart: Chart;
  song: Song;
  difficulty: Difficulty;
  paused: Accessor<boolean>;
  audioTimeMs: () => number;
  audioEnded: Accessor<boolean>;
  togglePaused: () => void;
  exit: () => void;
  onComplete: (cleared: boolean) => void;
}) {
  let canvasRef: HTMLCanvasElement | undefined;
  let renderer: ChartRenderer | undefined;
  let judgmentTimer: number | undefined;
  const pointerStarts = new Map<number, { swipeX: number; swipeY: number }>();
  const engine = new JudgmentEngine(props.chart.getEvents());
  const [score, setScore] = createSignal(0);
  const [combo, setCombo] = createSignal(0);
  const [life, setLife] = createSignal(1000);
  const [judgment, setJudgment] = createSignal<Grade | null>(null);
  const [result, setResult] = createSignal<"cleared" | "failed" | null>(null);
  const formattedScore = createMemo(() => score().toString().padStart(8, "0"));
  const maxScore = engine.getState().maxScore;
  const rankIndex = createMemo(() =>
    Math.min(3, Math.floor((score() / Math.max(1, maxScore)) * 4)),
  );
  const difficultyLabel =
    difficultyDefinitions.find((item) => item.kind === props.difficulty)
      ?.label ?? props.difficulty.toUpperCase();

  function finish(cleared: boolean) {
    if (result()) return;
    setResult(cleared ? "cleared" : "failed");
    props.onComplete(cleared);
  }

  function applyJudgments(results: Judgment[]) {
    if (!results.length) return;
    const state = engine.getState();
    setScore(state.score);
    setCombo(state.combo);
    setLife(state.life);
    setJudgment(results[results.length - 1].grade);
    window.clearTimeout(judgmentTimer);
    judgmentTimer = window.setTimeout(() => setJudgment(null), 360);
    if (state.life === 0) finish(false);
  }

  function laneAt(x: number, width: number) {
    return Math.max(
      0,
      Math.min(9, Math.floor(((x / width - 0.16) / 0.68) * 10)),
    );
  }

  function registerHit(
    inputId: string,
    lane: number,
    kind: "press" | "flick",
    x?: number,
    y?: number,
    direction: FlickDirection = "any",
  ) {
    if (props.paused() || result()) return;
    const results =
      kind === "press"
        ? engine.press(inputId, lane, props.audioTimeMs())
        : engine.flick(inputId, lane, props.audioTimeMs(), direction);
    applyJudgments(results);

    if (results.length && canvasRef && renderer) {
      const rect = canvasRef.getBoundingClientRect();
      renderer.addHitBurst(x ?? rect.width / 2, y ?? rect.height * 0.81);
    }
  }

  function flickDirection(dx: number, dy: number): FlickDirection {
    const vertical = dy > Math.abs(dx) * 0.35 ? "down" : "up";
    if (Math.abs(dx) < Math.abs(dy) * 0.4) return vertical;
    return `${vertical}-${dx < 0 ? "left" : "right"}`;
  }

  createEffect(() => {
    if (!props.audioEnded() || result()) return;
    applyJudgments(engine.update(Infinity));
    const state = engine.getState();
    finish(state.life > 0 && state.judgedCount === state.totalCount);
  });

  onMount(() => {
    if (canvasRef) {
      renderer = createChartRenderer(
        canvasRef,
        props.chart,
        props.paused,
        props.audioTimeMs,
        () => engine.getState(),
        (timeMs) => {
          if (!result()) applyJudgments(engine.update(timeMs));
        },
      );
    }

    const keyLanes: Record<string, number> = {
      Space: 5,
      KeyD: 1,
      KeyF: 3,
      KeyJ: 6,
      KeyK: 8,
    };
    const keyDirections: Record<string, FlickDirection> = {
      Space: "up",
      KeyD: "up-left",
      KeyF: "up-left",
      KeyJ: "up-right",
      KeyK: "up-right",
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code in keyLanes) {
        event.preventDefault();
        if (props.paused() || result()) return;
        if (!event.repeat) {
          if (event.shiftKey) {
            applyJudgments(
              engine.touch(
                event.code,
                keyLanes[event.code],
                props.audioTimeMs(),
              ),
            );
          }
          registerHit(
            event.code,
            keyLanes[event.code],
            event.shiftKey ? "flick" : "press",
            undefined,
            undefined,
            keyDirections[event.code],
          );
        }
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code in keyLanes)
        applyJudgments(engine.release(event.code, props.audioTimeMs()));
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      renderer?.destroy();
      window.clearTimeout(judgmentTimer);
    });
  });

  return (
    <section
      class="play-field"
      style={{ "--song-cover": `url("${props.song.coverUrl}")` }}
    >
      <div class="concert-stage" aria-hidden="true">
        <div class="stage-stars" />
        <div class="stage-cloud cloud-left" />
        <div class="stage-cloud cloud-right" />
        <div class="stage-screen screen-left">
          <img src={props.song.coverUrl} alt="" />
        </div>
        <div class="stage-screen screen-center">
          <img src={props.song.coverUrl} alt="" />
        </div>
        <div class="stage-screen screen-right">
          <img src={props.song.coverUrl} alt="" />
        </div>
        <div class="equalizer equalizer-left" />
        <div class="equalizer equalizer-right" />
      </div>

      <canvas
        ref={canvasRef}
        class="chart-canvas"
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          if (y < rect.height * 0.68 || y > rect.height * 0.96) return;
          const lane = laneAt(x, rect.width);
          pointerStarts.set(event.pointerId, { swipeX: x, swipeY: y });
          event.currentTarget.setPointerCapture(event.pointerId);
          registerHit(`pointer-${event.pointerId}`, lane, "press", x, y);
        }}
        onPointerMove={(event) => {
          const start = pointerStarts.get(event.pointerId);
          if (!start || props.paused() || result()) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const lane = laneAt(x, rect.width);
          applyJudgments(
            engine.move(
              `pointer-${event.pointerId}`,
              lane,
              props.audioTimeMs(),
            ),
          );
          const dx = x - start.swipeX;
          const dy = y - start.swipeY;
          if (Math.hypot(dx, dy) >= 30) {
            registerHit(
              `pointer-${event.pointerId}`,
              lane,
              "flick",
              x,
              y,
              flickDirection(dx, dy),
            );
            start.swipeX = x;
            start.swipeY = y;
          }
        }}
        onPointerUp={(event) => {
          const start = pointerStarts.get(event.pointerId);
          if (!start) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const lane = laneAt(x, rect.width);
          applyJudgments(
            engine.move(
              `pointer-${event.pointerId}`,
              lane,
              props.audioTimeMs(),
            ),
          );
          const dx = x - start.swipeX;
          const dy = y - start.swipeY;
          if (Math.hypot(dx, dy) >= 30) {
            registerHit(
              `pointer-${event.pointerId}`,
              lane,
              "flick",
              x,
              y,
              flickDirection(dx, dy),
            );
          }
          applyJudgments(
            engine.release(`pointer-${event.pointerId}`, props.audioTimeMs()),
          );
          pointerStarts.delete(event.pointerId);
        }}
        onPointerCancel={(event) => {
          applyJudgments(
            engine.release(`pointer-${event.pointerId}`, props.audioTimeMs()),
          );
          pointerStarts.delete(event.pointerId);
        }}
      />

      <header class="game-hud">
        <div class="score-hud">
          <div class="current-rank">{["C", "B", "A", "S"][rankIndex()]}</div>
          <div class="score-copy">
            <div class="score-label">SCORE</div>
            <div class="rank-track" aria-hidden="true">
              <For each={[0, 1, 2, 3]}>
                {(index) => (
                  <span classList={{ reached: rankIndex() >= index }} />
                )}
              </For>
            </div>
            <div class="score-number">{formattedScore()}</div>
          </div>
        </div>

        <div class="song-chip">
          <span>{props.song.title}</span>
          <b>{difficultyLabel}</b>
        </div>

        <div class="life-hud">
          <div class="life-copy">
            <span>LIFE</span>
            <strong>{life()}</strong>
          </div>
          <div class="life-track">
            <i style={{ width: `${life() / 10}%` }} />
          </div>
          <button onClick={props.togglePaused} aria-label="暂停">
            Ⅱ
          </button>
        </div>
      </header>

      <div class="combo-hud" classList={{ visible: combo() > 0 }}>
        <span>COMBO</span>
        <strong>{combo()}</strong>
      </div>

      <div class="judgment" classList={{ visible: judgment() !== null }}>
        {judgment()}
      </div>

      <Show when={result()}>
        {(outcome) => (
          <div class="pause-overlay">
            <div class="pause-dialog">
              <span>RESULT</span>
              <h1>{outcome() === "cleared" ? "通关" : "失败"}</h1>
              <p>分数 {formattedScore()}</p>
              <button class="exit-button" onClick={props.exit}>
                返回选歌
              </button>
            </div>
          </div>
        )}
      </Show>

      <Show when={props.paused() && !result()}>
        <div class="pause-overlay">
          <div class="pause-dialog">
            <span>PAUSED</span>
            <h1>暂停</h1>
            <button class="resume-button" onClick={props.togglePaused}>
              继续游戏
            </button>
            <button class="exit-button" onClick={props.exit}>
              返回选歌
            </button>
          </div>
        </div>
      </Show>
    </section>
  );
}
