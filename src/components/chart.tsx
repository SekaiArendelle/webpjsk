import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  type Accessor,
} from "solid-js";
import { type Chart } from "../domain/chart";
import { difficultyDefinitions, type Difficulty } from "../domain/difficulty";
import { FlickNote, TouchNote, type Note } from "../domain/notes";
import { type Song } from "../domain/song";
import "./chart.css";

type NoteKind = "tap" | "touch" | "flick";

interface VisualNote {
  kind: NoteKind;
  lane: number;
  offset: number;
}

interface HitBurst {
  x: number;
  y: number;
  createdAt: number;
}

interface ChartRenderer {
  addHitBurst(x: number, y: number): void;
  destroy(): void;
}

function noteKind(note: Note): NoteKind {
  if (note instanceof FlickNote) return "flick";
  if (note instanceof TouchNote) return "touch";
  return "tap";
}

function createVisualNotes(chart: Chart): VisualNote[] {
  const source = chart.getGroups().flatMap((group) => group);

  if (source.length === 0) return [];

  const noteCount = Math.max(10, Math.min(14, source.length));
  return Array.from({ length: noteCount }, (_, index) => {
    const note = source[index % source.length];
    const sourceLane = note.getWidthOffset().asNumber();
    return {
      kind: noteKind(note),
      lane: ((sourceLane + index * 3) % 10) / 10,
      offset: index / noteCount,
    };
  });
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
  lane: number,
) {
  const headProgress = Math.min(1, Math.max(0.04, head));
  const tailProgress = Math.max(0, headProgress - 0.48);
  const headGeometry = laneGeometry(width, height, headProgress ** 1.55);
  const tailGeometry = laneGeometry(width, height, tailProgress ** 1.55);
  const headCenter = lerp(headGeometry.left, headGeometry.right, lane);
  const tailCenter = lerp(tailGeometry.left, tailGeometry.right, lane);
  const headHalfWidth = lerp(9, width * 0.064, headProgress);
  const tailHalfWidth = lerp(5, width * 0.028, tailProgress);

  const gradient = ctx.createLinearGradient(
    0,
    tailGeometry.y,
    0,
    headGeometry.y,
  );
  gradient.addColorStop(0, "rgba(57, 242, 226, 0.28)");
  gradient.addColorStop(0.65, "rgba(28, 218, 239, 0.76)");
  gradient.addColorStop(1, "rgba(24, 207, 240, 0.94)");

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tailCenter - tailHalfWidth, tailGeometry.y);
  ctx.lineTo(tailCenter + tailHalfWidth, tailGeometry.y);
  ctx.lineTo(headCenter + headHalfWidth, headGeometry.y);
  ctx.lineTo(headCenter - headHalfWidth, headGeometry.y);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.shadowColor = "#25e9ed";
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.restore();
}

function drawNote(
  ctx: CanvasRenderingContext2D,
  visualNote: VisualNote,
  width: number,
  height: number,
  elapsed: number,
) {
  const travelTime = 4600;
  const rawProgress = (elapsed / travelTime + visualNote.offset) % 1;
  const progress = rawProgress ** 1.65;
  const geometry = laneGeometry(width, height, progress);
  const center = lerp(geometry.left, geometry.right, visualNote.lane);
  const noteWidth = lerp(width * 0.018, width * 0.115, progress);
  const noteHeight = lerp(4, 15, progress);
  const color =
    visualNote.kind === "flick"
      ? "#f8d853"
      : visualNote.kind === "touch"
        ? "#50eed1"
        : "#64ccff";

  ctx.save();
  ctx.globalAlpha = Math.min(1, rawProgress * 8);
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

  if (visualNote.kind === "flick") {
    const arrowSize = noteHeight * 1.35;
    ctx.beginPath();
    ctx.moveTo(center, geometry.y - noteHeight * 0.9 - arrowSize);
    ctx.lineTo(center - arrowSize, geometry.y - noteHeight * 0.9);
    ctx.lineTo(center + arrowSize, geometry.y - noteHeight * 0.9);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 236, 99, 0.88)";
    ctx.fill();
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
): ChartRenderer {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器不支持 Canvas 2D");

  const notes = createVisualNotes(chart);
  const bursts: HitBurst[] = [];
  let frameId = 0;
  let width = 0;
  let height = 0;
  let elapsed = 0;
  let previousTime = performance.now();

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
    const delta = Math.min(40, now - previousTime);
    previousTime = now;
    if (!paused()) elapsed += delta;

    context.clearRect(0, 0, width, height);
    drawLane(context, width, height, (elapsed / 2100) % 0.077);
    drawHoldRibbon(context, width, height, (elapsed / 5200 + 0.55) % 1, 0.48);
    drawHoldRibbon(context, width, height, (elapsed / 6100 + 0.16) % 1, 0.27);
    notes.forEach((note) => drawNote(context, note, width, height, elapsed));
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
  togglePaused: () => void;
  exit: () => void;
}) {
  let canvasRef: HTMLCanvasElement | undefined;
  let renderer: ChartRenderer | undefined;
  let judgmentTimer: number | undefined;
  const [score, setScore] = createSignal(0);
  const [combo, setCombo] = createSignal(0);
  const [showJudgment, setShowJudgment] = createSignal(false);
  const formattedScore = createMemo(() => score().toString().padStart(8, "0"));
  const rankIndex = createMemo(() => Math.min(3, Math.floor(score() / 5000)));
  const difficultyLabel =
    difficultyDefinitions.find((item) => item.kind === props.difficulty)
      ?.label ?? props.difficulty.toUpperCase();

  function registerHit(x?: number, y?: number) {
    if (props.paused()) return;
    setCombo((value) => value + 1);
    setScore((value) => value + 780 + Math.min(combo(), 200) * 4);
    setShowJudgment(true);
    window.clearTimeout(judgmentTimer);
    judgmentTimer = window.setTimeout(() => setShowJudgment(false), 360);

    if (canvasRef && renderer) {
      const rect = canvasRef.getBoundingClientRect();
      renderer.addHitBurst(x ?? rect.width / 2, y ?? rect.height * 0.81);
    }
  }

  onMount(() => {
    if (canvasRef) {
      renderer = createChartRenderer(canvasRef, props.chart, props.paused);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (["Space", "KeyD", "KeyF", "KeyJ", "KeyK"].includes(event.code)) {
        event.preventDefault();
        registerHit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
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
          registerHit(event.clientX - rect.left, event.clientY - rect.top);
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
            <strong>1000</strong>
          </div>
          <div class="life-track">
            <i />
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

      <div class="judgment" classList={{ visible: showJudgment() }}>
        PERFECT
      </div>

      <Show when={props.paused()}>
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
