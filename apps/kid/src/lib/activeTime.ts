/**
 * Counts genuinely active study time: only while the page is visible and the
 * learner interacted within the last `idleMs` (so a paused tablet doesn't inflate stats).
 */
export class ActiveTimer {
  private total = 0;
  private last = performance.now();
  private lastInteraction = performance.now();
  readonly startedAt = Date.now();
  private timer: number;

  constructor(private idleMs = 90_000) {
    this.timer = window.setInterval(() => this.tick(), 1000);
  }

  private tick() {
    const now = performance.now();
    if (document.visibilityState === 'visible' && now - this.lastInteraction < this.idleMs) this.total += now - this.last;
    this.last = now;
  }

  poke() {
    this.lastInteraction = performance.now();
  }

  stop(): number {
    this.tick();
    window.clearInterval(this.timer);
    return Math.round(this.total);
  }
}
