/* eslint-disable @typescript-eslint/no-explicit-any */
function tg(): any {
  return typeof window !== "undefined" ? (window as any).Telegram?.WebApp : undefined;
}
export function initTelegram() {
  const w = tg();
  if (!w) return;
  w.ready();
  w.expand();
  try { w.disableVerticalSwipes?.(); } catch {}
  try { w.enableClosingConfirmation?.(); } catch {}
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

// Layered chime: a note with soft harmonics and a bell-like decay.
function chime(freq: number, at: number, dur = 0.5, vol = 0.07) {
  if (!ctx) return;
  [[1, 1, "sine"], [2, 0.35, "triangle"], [3, 0.12, "sine"]].forEach(([m, v, type]) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = type as OscillatorType;
    o.frequency.value = freq * (m as number);
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol * (v as number), at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(ctx!.destination);
    o.start(at);
    o.stop(at + dur + 0.05);
  });
}
const SFX: Record<string, [number, number][]> = {
  word: [[659, 0], [988, 0.08]],
  bonus: [[784, 0], [1175, 0.07], [1568, 0.14]],
  gem: [[1319, 0], [1760, 0.08], [2093, 0.16], [2637, 0.26]],
  relic: [[523, 0], [784, 0.12], [1047, 0.24], [1568, 0.36], [2093, 0.5]],
  hint: [[880, 0], [1319, 0.1]],
  duplicate: [[587, 0], [440, 0.12], [587, 0.24]],
  victory: [[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45], [784, 0.62], [1047, 0.77], [1319, 0.95], [1568, 1.15]],
};
export function sfx(name: keyof typeof SFX | string, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const now = ctx.currentTime;
    const seq = SFX[name] ?? SFX["word"]!;
    seq.forEach(([f, t], i) => chime(f, now + t, name === "victory" && i === seq.length - 1 ? 1.4 : 0.55));
    if (name === "victory") [523, 659, 784].forEach((f) => chime(f / 2, now + 1.15, 1.6, 0.04));
  } catch {}
}
