import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, HelpCircle, Settings as SettingsIcon, ChevronLeft, Lock, Star, Home, LayoutGrid,
  Shuffle, Lightbulb, Volume2, Music, Smartphone, Trash2, Coins, CheckCircle2, Sparkles,
} from "lucide-react";
import { backgroundForScreen } from "@/lib/backgrounds";
import { LEVELS } from "@/data/words";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { initTelegram, haptic, beep } from "@/lib/telegram";
import { scoreForWord, shuffle, HINT_COST, REVEAL_COST } from "@/lib/game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Word Connect — Telegram Mini App" },
      { name: "description", content: "Swipe letters to find hidden words. A single-player word puzzle for Telegram." },
      { property: "og:title", content: "Word Connect — Telegram Mini App" },
      { property: "og:description", content: "Swipe letters to find hidden words across 120 levels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Screen = "home" | "levels" | "game" | "complete" | "settings" | "howto";
type Progress = {
  unlocked: number;
  stars: Record<number, number>;
  coins: number;
  score: number;
  found: Record<number, string[]>;
  revealed: Record<number, string[]>; // "word:index"
};
type Settings = { sound: boolean; music: boolean; vibration: boolean };

const initProgress: Progress = { unlocked: 1, stars: {}, coins: 100, score: 0, found: {}, revealed: {} };
const initSettings: Settings = { sound: true, music: true, vibration: true };

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useLocalStorage<Progress>("wc-progress", initProgress);
  const [settings, setSettings, settingsLoaded] = useLocalStorage<Settings>("wc-settings", initSettings);
  const [lastGain, setLastGain] = useState(0);
  useBackgroundMusic(settingsLoaded && settings.music);

  useEffect(() => initTelegram(), []);

  const totalStars = Object.values(progress.stars).reduce((a, b) => a + b, 0);
  const background = backgroundForScreen(screen, level, progress.unlocked);

  const startLevel = (n: number) => { setLevel(n); setScreen("game"); };

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden">
      <img key={background} src={background} alt="" width={768} height={1344} className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {screen === "home" && <HomeScreen go={setScreen} onPlay={() => startLevel(Math.min(progress.unlocked, LEVELS.length))} />}
        {screen === "levels" && <LevelsScreen progress={progress} totalStars={totalStars} back={() => setScreen("home")} onPick={startLevel} go={setScreen} />}
        {screen === "game" && (
          <GameScreen
            key={level}
            level={level}
            progress={progress}
            setProgress={setProgress}
            settings={settings}
            totalStars={totalStars}
            back={() => setScreen("levels")}
            onComplete={(gain) => { setLastGain(gain); setScreen("complete"); }}
          />
        )}
        {screen === "complete" && (
          <CompleteScreen
            level={level}
            gain={lastGain}
            hasNext={level < LEVELS.length}
            onNext={() => startLevel(level + 1)}
            onHome={() => setScreen("home")}
          />
        )}
        {screen === "settings" && (
          <SettingsScreen settings={settings} setSettings={setSettings} back={() => setScreen("home")} go={setScreen}
            onClear={() => { if (confirm("Reset all game progress?")) setProgress(initProgress); }} />
        )}
        {screen === "howto" && <HowToScreen back={() => setScreen("home")} />}
      </div>
    </div>
  );
}

function HomeScreen({ go, onPlay }: { go: (s: Screen) => void; onPlay: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-between px-6 pb-8 pt-16">
      <div className="text-center">
        <h1 className="title-logo text-6xl leading-none">WORD</h1>
        <h1 className="title-logo text-6xl leading-none">CONNECT</h1>
        <p className="mt-4 font-display text-lg font-semibold text-navy">Find the hidden words</p>
      </div>
      <div className="flex w-full flex-col items-center gap-8">
        <button onClick={onPlay} className="btn-game flex w-64 items-center justify-center gap-3 py-4 text-3xl">
          <Play className="h-8 w-8 fill-current" /> Play
        </button>
        <div className="flex w-full justify-around">
          {[
            { icon: HelpCircle, label: "How to Play", s: "howto" as Screen },
            { icon: LayoutGrid, label: "Levels", s: "levels" as Screen },
            { icon: SettingsIcon, label: "Settings", s: "settings" as Screen },
          ].map(({ icon: I, label, s }) => (
            <button key={label} onClick={() => go(s)} className="flex flex-col items-center gap-1 text-primary-foreground">
              <span className="glass flex h-12 w-12 items-center justify-center rounded-full"><I className="h-6 w-6" /></span>
              <span className="text-xs font-bold drop-shadow">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header({ title, back, children }: { title: React.ReactNode; back: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <button onClick={back} aria-label="Back" className="glass rounded-full p-1.5 text-primary-foreground"><ChevronLeft className="h-5 w-5" /></button>
      <div className="flex-1 font-display text-lg font-semibold text-primary-foreground drop-shadow">{title}</div>
      {children}
    </div>
  );
}

function Pill({ icon, value }: { icon: React.ReactNode; value: number | string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-navy/70 px-3 py-1 text-sm font-bold text-primary-foreground">
      {icon}{value}
    </span>
  );
}

function BottomNav({ active, go }: { active: Screen; go: (s: Screen) => void }) {
  const items = [
    { s: "home" as Screen, icon: Home, label: "Home" },
    { s: "levels" as Screen, icon: LayoutGrid, label: "Levels" },
    { s: "settings" as Screen, icon: SettingsIcon, label: "Settings" },
  ];
  return (
    <nav className="flex justify-around border-t bg-card py-2">
      {items.map(({ s, icon: I, label }) => (
        <button key={s} onClick={() => go(s)} className={`flex flex-col items-center text-xs font-semibold ${active === s ? "text-primary" : "text-muted-foreground"}`}>
          <I className="h-5 w-5" />{label}
        </button>
      ))}
    </nav>
  );
}

function LevelsScreen({ progress, totalStars, back, onPick, go }: {
  progress: Progress; totalStars: number; back: () => void; onPick: (n: number) => void; go: (s: Screen) => void;
}) {
  return (
    <>
      <Header title="Levels" back={back}>
        <Pill icon={<Star className="h-4 w-4 fill-gold text-gold" />} value={`${totalStars}/${LEVELS.length * 3}`} />
      </Header>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="relative flex flex-col items-center gap-5 py-4">
          {LEVELS.map((l, i) => {
            const locked = l.level > progress.unlocked;
            const stars = progress.stars[l.level] ?? 0;
            const offset = Math.sin(i * 1.1) * 80;
            return (
              <button
                key={l.level}
                disabled={locked}
                onClick={() => onPick(l.level)}
                style={{ transform: `translateX(${offset}px)` }}
                className="flex flex-col items-center"
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-full border-4 border-card font-display text-xl font-bold shadow-lg ${
                  locked ? "bg-muted-foreground text-card" : l.level === progress.unlocked ? "tile animate-pulse" : "tile"}`}>
                  {locked ? <Lock className="h-5 w-5" /> : l.level}
                </span>
                {!locked && (
                  <span className="mt-0.5 flex">
                    {[1, 2, 3].map((s) => <Star key={s} className={`h-3.5 w-3.5 ${s <= stars ? "fill-gold text-gold" : "text-card"}`} />)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav active="levels" go={go} />
    </>
  );
}

function GameScreen({ level, progress, setProgress, settings, totalStars, back, onComplete }: {
  level: number; progress: Progress; setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  settings: Settings; totalStars: number; back: () => void; onComplete: (gain: number) => void;
}) {
  const data = LEVELS[level - 1]!;
  const words = useMemo(() => [...data.words].sort((a, b) => a.length - b.length || a.localeCompare(b)), [data]);
  const found = progress.found[level] ?? [];
  const revealed = progress.revealed[level] ?? [];
  const [tiles, setTiles] = useState(() => data.letters.split("").map((ch, id) => ({ id, ch })));
  const [shuffling, setShuffling] = useState(false);
  const [path, setPath] = useState<number[]>([]);
  const [flash, setFlash] = useState<{ text: string; kind: "ok" | "bad" | "dup" } | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const size = 240;
  const r = tiles.length > 5 ? 88 : 78;
  const pos = tiles.map((_, i) => {
    const a = (i / tiles.length) * Math.PI * 2 - Math.PI / 2;
    return { x: size / 2 + r * Math.cos(a), y: size / 2 + r * Math.sin(a) };
  });

  const P = (i: number) => pos[i] ?? { x: 0, y: 0 };
  const current = path.map((i) => tiles[i]!.ch).join("");

  const idxAt = (cx: number, cy: number) => {
    const rect = wheelRef.current!.getBoundingClientRect();
    const x = cx - rect.left, y = cy - rect.top;
    for (let i = 0; i < pos.length; i++) {
      if (Math.hypot(P(i).x - x, P(i).y - y) < 28) return i;
    }
    return -1;
  };

  const onDown = (e: React.PointerEvent) => {
    const i = idxAt(e.clientX, e.clientY);
    if (i < 0) return;
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setPath([i]);
    haptic("light", settings.vibration);
    beep(500, settings.sound);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const rect = wheelRef.current!.getBoundingClientRect();
    setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    const i = idxAt(e.clientX, e.clientY);
    if (i < 0) return;
    setPath((p) => {
      if (p.length > 1 && p[p.length - 2] === i) return p.slice(0, -1);
      if (p.includes(i)) return p;
      haptic("light", settings.vibration);
      beep(500 + p.length * 80, settings.sound);
      return [...p, i];
    });
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setPointer(null);
    submit(current);
    setPath([]);
  };

  const shuffleTiles = () => {
    setTiles((t) => shuffle(t));
    setShuffling(true);
    haptic("light", settings.vibration);
    beep(600, settings.sound);
  };
  useEffect(() => {
    if (!shuffling) return;
    const t = setTimeout(() => setShuffling(false), 500);
    return () => clearTimeout(t);
  }, [shuffling]);


  const submit = (w: string) => {
    if (w.length < 2) return;
    if (found.includes(w)) { setFlash({ text: w, kind: "dup" }); return; }
    if (!words.includes(w)) {
      setFlash({ text: w, kind: "bad" });
      haptic("error", settings.vibration);
      beep(180, settings.sound);
      return;
    }
    const newFound = [...found, w];
    const gain = scoreForWord(w);
    setFlash({ text: `+${gain}`, kind: "ok" });
    haptic("success", settings.vibration);
    beep(880, settings.sound);
    const done = newFound.length === words.length;
    setProgress((p) => {
      const next: Progress = { ...p, found: { ...p.found, [level]: newFound }, score: p.score + gain };
      if (done) {
        const hintsUsed = (p.revealed[level] ?? []).length;
        const stars = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;
        next.stars = { ...p.stars, [level]: Math.max(stars, p.stars[level] ?? 0) };
        next.unlocked = Math.max(p.unlocked, level + 1);
        next.coins = p.coins + 20;
        next.found = { ...next.found, [level]: [] };
        next.revealed = { ...p.revealed, [level]: [] };
      }
      return next;
    });
    if (done) {
      const total = words.reduce((s, x) => s + scoreForWord(x), 0);
      setTimeout(() => onComplete(total), 700);
    }
  };

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 900);
    return () => clearTimeout(t);
  }, [flash]);

  const spend = (cost: number) => {
    if (progress.coins < cost) { setFlash({ text: "Not enough coins", kind: "bad" }); return false; }
    return true;
  };
  const hint = () => {
    if (!spend(HINT_COST)) return;
    const target = words.find((w) => !found.includes(w) && w.split("").some((_, i) => !revealed.includes(`${w}:${i}`)));
    if (!target) return;
    const i = target.split("").findIndex((_, i) => !revealed.includes(`${target}:${i}`));
    setProgress((p) => ({ ...p, coins: p.coins - HINT_COST, revealed: { ...p.revealed, [level]: [...revealed, `${target}:${i}`] } }));
    beep(660, settings.sound);
  };
  const revealWord = () => {
    if (!spend(REVEAL_COST)) return;
    const target = words.find((w) => !found.includes(w));
    if (!target) return;
    setProgress((p) => ({ ...p, coins: p.coins - REVEAL_COST }));
    submit(target);
  };

  return (
    <>
      <Header title={`Level ${level}`} back={back}>
        <Pill icon={<Star className="h-4 w-4 fill-gold text-gold" />} value={totalStars} />
        <Pill icon={<Coins className="h-4 w-4 text-gold" />} value={progress.coins} />
      </Header>

      <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto px-4">
        <div className="glass flex flex-col gap-1.5 rounded-2xl p-3">
          {words.map((w) => {
            const isFound = found.includes(w);
            return (
              <div key={w} className="flex justify-center gap-1.5">
                {w.split("").map((ch, i) => {
                  const show = isFound || revealed.includes(`${w}:${i}`);
                  const cell = words.length > 6 ? "h-8 w-8 text-lg" : "h-11 w-11 text-2xl";
                  return (
                    <span key={i} className={`flex items-center justify-center rounded-lg font-display font-bold ${cell} ${
                      isFound ? "tile animate-pop" : show ? "bg-cream text-navy" : "bg-tile-empty"}`}
                      style={isFound ? { animationDelay: `${i * 50}ms` } : undefined}>
                      {show ? ch : ""}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center pb-6">
        <div className="mb-2 h-10">
          {(current || flash) && (
            <span className={`rounded-xl px-4 py-1.5 font-display text-2xl font-bold tracking-widest ${
              flash?.kind === "bad" ? "animate-shake bg-destructive text-destructive-foreground"
              : flash?.kind === "ok" ? "animate-pop bg-primary text-primary-foreground"
              : "bg-card text-navy"}`}>
              {current || flash?.text}
            </span>
          )}
        </div>
        <div className="flex w-full items-end justify-between px-4">
          <PowerBtn icon={<Lightbulb className="h-6 w-6 text-gold" />} cost={HINT_COST} onClick={hint} label="Hint" />
          <div
            ref={wheelRef}
            className="relative touch-none select-none rounded-full bg-wheel shadow-2xl"
            style={{ width: size, height: size }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          >
            <svg className="pointer-events-none absolute inset-0" width={size} height={size}>
              <polyline
                points={[...path.map((i) => `${P(i).x},${P(i).y}`), ...(pointer && path.length ? [`${pointer.x},${pointer.y}`] : [])].join(" ")}
                fill="none" stroke="var(--gold)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.9}
              />
            </svg>
            <button
              aria-label="Shuffle"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={shuffleTiles}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 text-card/70"
            >
              <Shuffle className="h-7 w-7" />
            </button>
            {tiles.map((t, i) => (
              <span key={t.id}
                className={`tile-motion pointer-events-none absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-3xl font-bold shadow-md transition-colors ${
                  path.includes(i) ? "bg-gold text-navy" : "bg-card text-navy"} ${shuffling ? "animate-tumble" : ""}`}
                style={{ left: P(i).x, top: P(i).y }}>
                {t.ch}
              </span>
            ))}
          </div>
          <PowerBtn icon={<Sparkles className="h-6 w-6 text-gold" />} cost={REVEAL_COST} onClick={revealWord} label="Reveal word" />
        </div>
      </div>
    </>
  );
}

function PowerBtn({ icon, cost, onClick, label }: { icon: React.ReactNode; cost: number; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex flex-col items-center gap-1">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/80 shadow-lg">{icon}</span>
      <span className="flex items-center gap-0.5 rounded-full bg-navy/80 px-2 text-xs font-bold text-primary-foreground">
        <Coins className="h-3 w-3 text-gold" />{cost}
      </span>
    </button>
  );
}

function CompleteScreen({ level, gain, hasNext, onNext, onHome }: { level: number; gain: number; hasNext: boolean; onNext: () => void; onHome: () => void }) {
  const words = LEVELS[level - 1]!.words.length;
  return (
    <div className="flex flex-1 items-center justify-center bg-navy/50 p-6">
      <div className="animate-pop relative w-full max-w-xs rounded-3xl bg-cream p-6 pt-12 text-center shadow-2xl">
        <div className="absolute -top-9 left-1/2 flex -translate-x-1/2 items-end">
          <Star className="h-14 w-14 fill-gold text-gold" />
          <Star className="h-20 w-20 fill-gold text-gold" />
          <Star className="h-14 w-14 fill-gold text-gold" />
        </div>
        <h2 className="text-3xl font-bold text-navy">Level Complete!</h2>
        <div className="mt-4 space-y-2">
          <div className="rounded-xl bg-card p-3"><div className="text-sm text-muted-foreground">Words Found</div><div className="font-display text-2xl font-bold text-navy">{words}/{words}</div></div>
          <div className="rounded-xl bg-card p-3"><div className="text-sm text-muted-foreground">Score</div><div className="font-display text-2xl font-bold text-primary">+{gain} ⭐</div></div>
        </div>
        <div className="mt-5 flex flex-col items-center gap-3">
          {hasNext ? (
            <button onClick={onNext} className="btn-game flex w-full items-center justify-center gap-2 py-3 text-lg"><Play className="h-5 w-5 fill-current" />Next Level</button>
          ) : <p className="font-display font-semibold text-navy">You finished every level! 🎉</p>}
          <button onClick={onHome} className="flex items-center gap-2 rounded-full bg-card px-6 py-2 font-semibold text-navy shadow"><Home className="h-4 w-4" />Home</button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} role="switch" aria-checked={on} className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted-foreground/40"}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function SettingsScreen({ settings, setSettings, back, go, onClear }: {
  settings: Settings; setSettings: React.Dispatch<React.SetStateAction<Settings>>; back: () => void; go: (s: Screen) => void; onClear: () => void;
}) {
  const rows = [
    { k: "sound" as const, icon: Volume2, label: "Sound" },
    { k: "music" as const, icon: Music, label: "Music" },
    { k: "vibration" as const, icon: Smartphone, label: "Vibration" },
  ];
  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="flex items-center px-4 py-3">
        <button onClick={back} aria-label="Back"><ChevronLeft className="h-6 w-6" /></button>
        <h2 className="flex-1 text-center text-xl font-bold">Settings</h2><span className="w-6" />
      </div>
      <div className="flex-1 space-y-4 px-4">
        <div className="divide-y rounded-2xl bg-card shadow-sm">
          {rows.map(({ k, icon: I, label }) => (
            <div key={k} className="flex items-center gap-3 p-4">
              <I className="h-5 w-5" /><span className="flex-1 font-semibold">{label}</span>
              <Toggle on={settings[k]} onChange={() => setSettings((s) => ({ ...s, [k]: !s[k] }))} />
            </div>
          ))}
        </div>
        <button onClick={onClear} className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm">
          <span className="rounded-lg bg-destructive p-2 text-destructive-foreground"><Trash2 className="h-5 w-5" /></span>
          <span className="flex-1"><span className="block font-semibold">Clear Progress</span><span className="text-xs text-muted-foreground">Reset your game data</span></span>
        </button>
      </div>
      <BottomNav active="settings" go={go} />
    </div>
  );
}

function HowToScreen({ back }: { back: () => void }) {
  const steps = [
    ["Find the hidden words", "Use the letters to form words."],
    ["Swipe the letters", "Connect letters in the correct order."],
    ["Complete the level", "Find all words to move to the next level."],
  ];
  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="flex items-center px-4 py-3">
        <button onClick={back} aria-label="Back"><ChevronLeft className="h-6 w-6" /></button>
        <h2 className="flex-1 text-center text-xl font-bold">How to Play</h2><span className="w-6" />
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4">
        {steps.map(([t, d], i) => (
          <div key={t} className="flex gap-3 rounded-2xl bg-card p-4 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
            <div><div className="font-semibold">{t}</div><div className="text-sm text-muted-foreground">{d}</div></div>
          </div>
        ))}
        <div className="flex gap-3 rounded-2xl bg-cream p-4">
          <Lightbulb className="h-6 w-6 shrink-0 text-gold" />
          <div><div className="font-semibold">Tip</div><div className="text-sm text-muted-foreground">Longer words give you more points! Use hints if you get stuck.</div></div>
        </div>
        <div className="flex gap-3 rounded-2xl bg-card p-4 shadow-sm">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
          <div className="text-sm text-muted-foreground">Your progress is saved on this device automatically.</div>
        </div>
      </div>
      <div className="p-4"><button onClick={back} className="btn-game w-full py-3 text-lg">Got it</button></div>
    </div>
  );
}
