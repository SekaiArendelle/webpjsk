import "./chart.css";
import { TapNote, FlickNote, TouchNote } from "./notes";

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
    400,
    100,
    TouchNote.get_color(),
    TouchNote.get_width(),
    TouchNote.get_height(),
    canvas.width / dpr,
    canvas.height / dpr,
  );
  draw_note(
    ctx,
    700,
    100,
    FlickNote.get_color(),
    FlickNote.get_width(),
    FlickNote.get_height(),
    canvas.width / dpr,
    canvas.height / dpr,
  );
}

export function render_chart(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const popup = document.createElement("div");
    popup.innerText = "Your browser is not supported, please use a modern one.";
    Object.assign(popup.style, {
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#fef0f0",
      color: "#f56c6c",
      border: "1px solid #fde2e2",
      padding: "15px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      fontSize: "14px",
      fontFamily: "sans-serif",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity 0.3s ease, top 0.3s ease",
    });
    document.body.appendChild(popup);
    // Due to the browser's rendering mechanism, in order to trigger an animation, you must read this property to force the browser to repaint.
    requestAnimationFrame(() => {
      popup.style.opacity = "1";
      popup.style.top = "40px";
    });

    setTimeout(() => {
      popup.style.opacity = "0";
      popup.style.top = "20px";
      setTimeout(() => {
        if (document.body.contains(popup)) {
          document.body.removeChild(popup);
        }
      }, 300);
    }, 4000);
    throw new Error("Failed to get canvas context");
  }
  ctx.scale(dpr, dpr);

  renderFrame(ctx, canvas, dpr);
}

function Chart() {
  let result = (<canvas id="gameCanvas"></canvas>) as HTMLCanvasElement;
  render_chart(result);
  return result;
}

export default Chart;
