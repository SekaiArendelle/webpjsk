export function playAudio(audioPath: string): HTMLAudioElement {
  const audio = new Audio(audioPath);
  void audio.play().catch(() => {
    // Browsers may block autoplay when chart loading outlives the click gesture.
  });
  return audio;
}
