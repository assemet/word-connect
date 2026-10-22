// A quiet, original music-box loop; no downloads or network access required.
export function createMusicPlayer() {
  let context: AudioContext | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let nextBeat = 0;
  let beat = 0;
  let active = false;
  const melody = [72, 76, 79, 76, 74, 77, 81, 77, 71, 74, 79, 74, 72, 76, 79, 67];
  const roots = [48, 53, 43, 48];
  const frequency = (note: number) => 440 * 2 ** ((note - 69) / 12);

  function note(pitch: number, time: number, duration: number, volume: number) {
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency(pitch);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.05);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  function schedule() {
    if (!context || !active || context.state !== "running") return;
    if (nextBeat < context.currentTime) nextBeat = context.currentTime + 0.04;
    while (nextBeat < context.currentTime + 0.2) {
      note(melody[beat % melody.length] ?? 72, nextBeat, 0.8, 0.035);
      if (beat % 4 === 0) {
        const root = roots[Math.floor(beat / 4) % roots.length] ?? 48;
        note(root, nextBeat, 1.8, 0.025);
        note(root + 7, nextBeat, 1.8, 0.012);
      }
      beat += 1;
      nextBeat += 0.48;
    }
  }

  return {
    async start() {
      try {
        context ??= new AudioContext();
        active = true;
        await context.resume();
        if (!active) { await context.suspend(); return; }
        if (!timer) {
          nextBeat = context.currentTime + 0.04;
          schedule();
          timer = setInterval(schedule, 80);
        }
      } catch { /* Audio may be unavailable or blocked until a user gesture. */ }
    },
    stop() {
      active = false;
      if (timer) clearInterval(timer);
      timer = undefined;
      if (context) void context.suspend().catch(() => {});
    },
    dispose() {
      active = false;
      if (timer) clearInterval(timer);
      timer = undefined;
      if (context) void context.close().catch(() => {});
      context = undefined;
    },
  };
}