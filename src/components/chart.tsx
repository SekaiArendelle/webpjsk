import "./chart.css";
import { TapNote, FlickNote, TouchNote } from "../utils/notes";
import { render } from "solid-js/web";
import { onCleanup } from "solid-js";
import { type ChartProp } from "./chartprop";

const layoutInfo = {
  width: 1000,
};

function draw_note(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  noteWidth: number,
  noteHeight: number,
  canvasWidth: number,
  canvasHeight: number,
) {
  ctx.fillStyle = color;
  ctx.fillRect(
    x,
    y,
    (noteWidth / layoutInfo.width) * canvasWidth,
    (noteHeight / layoutInfo.width) * canvasHeight * canvasWidth,
  );
}

function drawDecisionLine(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) {
  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.moveTo(0, canvas.height - 40);
  ctx.lineTo(canvas.width, canvas.height - 40);
  ctx.stroke();
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dpr: number,
) {
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  drawDecisionLine(ctx, canvas);
  draw_note(
    ctx,
    100,
    100,
    TapNote.get_color(),
    TapNote.get_width(),
    TapNote.get_height(),
    canvas.width / dpr,
    canvas.height / dpr,
  );
  draw_note(
    ctx,
    130,
    100,
    TouchNote.get_color(),
    TouchNote.get_width(),
    TouchNote.get_height(),
    canvas.width / dpr,
    canvas.height / dpr,
  );
  draw_note(
    ctx,
    160,
    100,
    FlickNote.get_color(),
    FlickNote.get_width(),
    FlickNote.get_height(),
    canvas.width / dpr,
    canvas.height / dpr,
  );
}

/**
 * A component that shows an error popup when the browser does not support canvas.
 * @returns A div element that shows the error message.
 */
function ErrorPopup() {
  let popupRef: HTMLDivElement | undefined;

  // animate in
  requestAnimationFrame(() => {
    if (popupRef) {
      popupRef.style.opacity = "1";
      popupRef.style.top = "40px";
    }
  });

  // disappear after 4 seconds
  const timer = setTimeout(() => {
    if (popupRef) {
      popupRef.style.opacity = "0";
      popupRef.style.top = "20px";
      setTimeout(() => popupRef?.remove(), 300);
    }
  }, 4000);

  onCleanup(() => clearTimeout(timer));

  return (
    <div ref={popupRef} class="error-popup">
      Your browser is not supported, please use a modern one.
    </div>
  );
}

export function renderChart(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    render(() => <ErrorPopup />, document.body);
    throw new Error("Failed to get canvas context");
  }

  ctx.scale(dpr, dpr);
  renderFrame(ctx, canvas, dpr);
}

function PlayChart({ chart }: ChartProp) {
  console.assert(chart !== null, "chart prop should not be null");
  let result = (<canvas id="gameCanvas"></canvas>) as HTMLCanvasElement;
  renderChart(result);
  return result;
}

export default PlayChart;
