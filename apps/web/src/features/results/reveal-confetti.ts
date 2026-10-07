import confetti from 'canvas-confetti';

function readThemeColor(variableName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

/** One subtle burst when an envelope is opened. Skipped for reduced-motion users. */
export function fireRevealConfetti(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['--primary', '--secondary', '--tertiary'].map(readThemeColor);
  void confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors });
}
