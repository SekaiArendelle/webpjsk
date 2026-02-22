const NoteType = {
  Tap: "Tap",
  Drag: "Drag",
  Flick: "Flick",
};

type NoteType = (typeof NoteType)[keyof typeof NoteType];

const layoutInfo = {
  width: 1000,
};

const NoteStyles: Record<
  NoteType,
  { color: string; width: number; height: number }
> = {
  [NoteType.Tap]: { color: "#6CB6EF", width: 80, height: 0.01 },
  [NoteType.Drag]: { color: "#F6D046", width: 80, height: 0.01 },
  [NoteType.Flick]: { color: "#EB423E", width: 80, height: 0.01 },
};

function drawNote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  noteType: NoteType,
  canvasInfo: { width: number; height: number },
) {
  ctx.fillStyle = NoteStyles[noteType].color;
  ctx.fillRect(
    x,
    y,
    (NoteStyles[noteType].width / layoutInfo.width) * canvasInfo.width,
    (NoteStyles[noteType].height / layoutInfo.width) *
      canvasInfo.height *
      canvasInfo.width,
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
  drawNote(ctx, 100, 100, NoteType.Tap, {
    width: canvas.width / dpr,
    height: canvas.height / dpr,
  });
  drawNote(ctx, 400, 100, NoteType.Flick, {
    width: canvas.width / dpr,
    height: canvas.height / dpr,
  });
  drawNote(ctx, 700, 100, NoteType.Drag, {
    width: canvas.width / dpr,
    height: canvas.height / dpr,
  });
}

export function render(canvas: HTMLCanvasElement) {
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
