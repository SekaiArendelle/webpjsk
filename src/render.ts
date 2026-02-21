const NoteType = {
  Tap: "Tap",
  Hold: "Hold",
}

type NoteType = typeof NoteType[keyof typeof NoteType];


// Set a custom unit for layout, assuming the canvas is 1000 * 800
const layoutInfo = {
    width: 1000,
    height: 800,
}


const NoteStyles: Record<NoteType, { color: string; width: number; height: number }> = {
  [NoteType.Tap]: { color: 'yellow', width: 200, height: 20 },
  [NoteType.Hold]: { color: 'blue', width: 200, height: 100 },
};

function drawNote(ctx: CanvasRenderingContext2D, x: number, y: number,  noteType: NoteType, canvasInfo: { width: number; height: number }) {
  ctx.fillStyle = NoteStyles[noteType].color;
  ctx.fillRect(x, y, NoteStyles[noteType].width / layoutInfo.width * canvasInfo.width, NoteStyles[noteType].height / layoutInfo.height * canvasInfo.height);
}

export function render(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNote(ctx, 100, 100, NoteType.Tap, { width: canvas.width, height: canvas.height });
  drawNote(ctx, 400, 100, NoteType.Hold, { width: canvas.width, height: canvas.height });
  drawNote(ctx, 700, 100, NoteType.Tap, { width: canvas.width, height: canvas.height });
}