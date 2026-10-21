/* eslint-disable @typescript-eslint/no-explicit-any */
function tg(): any {
  return typeof window !== "undefined" ? (window as any).Telegram?.WebApp : undefined;
}
export function initTelegram() {
  const w = tg();
  if (!w) return;
  w.ready();
  w.expand();
}
export function haptic(kind: "light" | "success" | "error", enabled: boolean) {
  if (!enabled) return;
  const h = tg()?.HapticFeedback;
  if (h) {
    if (kind === "light") h.impactOccurred("light");
    else h.notificationOccurred(kind);
  } else if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(kind === "light" ? 10 : 40);
  }
}
let ctx: AudioContext | null = null;
export function beep(freq: number, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.2);
  } catch {}
}
