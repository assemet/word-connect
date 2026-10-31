import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, HelpCircle, Settings as SettingsIcon, ChevronLeft, Lock, Star, Home, LayoutGrid,
  Shuffle, Lightbulb, Volume2, Music, Smartphone, Trash2, Coins, CheckCircle2, Sparkles,
} from "lucide-react";
import { backgroundForScreen, backgroundForLevel } from "@/lib/backgrounds";
import { WORLD_COUNT, worldName, worldOf, worldRange } from "@/lib/worlds";
import { LEVELS } from "@/data/words";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { initTelegram, haptic, beep } from "@/lib/telegram";
import { scoreForWord, shuffle, HINT_COST, REVEAL_COST } from "@/lib/game";
import { MEANING_COST } from "@/lib/dictionary";
import { WordMeaning } from "@/components/WordMeaning";
import { fillJar, isBonusWord, JAR_SIZE, JAR_REWARD } from "@/lib/bonus";
import { claimReward, relicLevels, treasureFor, RELICS_PER_WORLD, RELIC_REWARD } from "@/lib/treasures";

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
  meanings?: string[]; // words whose meaning was unlocked
  bonus?: Record<number, string[]>;
  treasures?: number[];
  jar?: number;
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
  const [lastStars, setLastStars] = useState(3);
  const [world, setWorld] = useState<number | null>(null);
  useBackgroundMusic(settingsLoaded && settings.music);

  useEffect(() => initTelegram(), []);

  const totalStars = Object.values(progress.stars).reduce((a, b) => a + b, 0);
  const background = screen === "levels" && world !== null
    ? backgroundForLevel(world * 20 + 1)
    : backgroundForScreen(screen, level, progress.unlocked);

  const startLevel = (n: number) => { setLevel(n); setWorld(worldOf(n)); setScreen("game"); };

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden">
      <img key={background} src={background} alt="" width={768} height={1344} className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {screen === "home" && <HomeScreen go={(s) => { if (s === "levels") setWorld(null); setScreen(s); }} onPlay={() => startLevel(Math.min(progress.unlocked, LEVELS.length))} />}
        {screen === "levels" && <LevelsScreen progress={progress} totalStars={totalStars} back={() => setScreen("home")} onPick={startLevel} go={setScreen} world={world} setWorld={setWorld} />}
        {screen === "game" && (
          <GameScreen
            key={level}
            level={level}
            progress={progress}
            setProgress={setProgress}
            settings={settings}
            totalStars={totalStars}
            back={() => setScreen("levels")}
            onComplete={(gain, stars) => {
              setLastGain(gain); setLastStars(stars);
              setProgress((p) => ({ ...p, found: { ...p.found, [level]: [] }, revealed: { ...p.revealed, [level]: [] } }));
              setScreen("complete");
            }}
          />
        )}
        {screen === "complete" && (
          <CompleteScreen
            level={level}
            gain={lastGain}
            stars={lastStars}
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

function LevelsScreen({ progress, totalStars, back, onPick, go, world, setWorld }: {
  progress: Progress; totalStars: number; back: () => void; onPick: (n: number) => void; go: (s: Screen) => void;
  world: number | null; setWorld: (w: number | null) => void;
}) {
  const currentWorld = worldOf(Math.min(progress.unlocked, LEVELS.length));
  const currentRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { currentRef.current?.scrollIntoView({ block: "center" }); }, [world]);

  if (world === null) {
    return (
      <>
        <Header title="Worlds" back={back}>
          <Pill icon={<Star className="h-4 w-4 fill-gold text-gold" />} value={`${totalStars}/${LEVELS.length * 3}`} />
        </Header>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="relative mx-auto flex max-w-sm flex-col-reverse items-center py-6">
            <div className="absolute bottom-6 top-6 left-1/2 w-3 -translate-x-1/2 rounded-full bg-gold/40 border-2 border-gold/60" />
            {Array.from({ length: WORLD_COUNT }, (_, w) => {
              const [a, b] = worldRange(w);
              const locked = a > progress.unlocked;
              const isCurrent = w === currentWorld;
              let stars = 0;
              for (let n = a; n <= b; n++) stars += progress.stars[n] ?? 0;
              return (
                <div key={w} className="relative flex w-full flex-col items-center py-4">
                  <span className={`relative z-10 mb-2 rounded-full border-2 px-3 py-0.5 font-display text-xs font-bold ${locked ? "border-card bg-navy text-primary-foreground/70" : "border-gold bg-navy text-gold"}`}>
                    {locked ? <Lock className="inline h-3 w-3" /> : <Star className="inline h-3 w-3 fill-gold" />} Arena {w + 1}
                  </span>
                  <button ref={isCurrent ? currentRef : undefined} disabled={locked} onClick={() => setWorld(w)}
                    className={`relative z-10 h-44 w-full overflow-hidden rounded-3xl border-4 text-left shadow-2xl transition-transform active:scale-95 ${isCurrent ? "border-gold victory-glow scale-105" : "border-card"} ${locked ? "grayscale opacity-80" : ""}`}>
                    <img src={backgroundForLevel(a)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
                    {isCurrent && <span className="absolute right-2 top-2 rounded-full bg-gold px-2 py-0.5 font-display text-xs font-bold text-navy">YOU ARE HERE</span>}
                    <div className="relative flex h-full flex-col items-center justify-end p-3 text-center text-primary-foreground">
                      <span className="title-logo text-2xl leading-tight">{worldName(w)}</span>
                      <span className="text-[11px] font-bold uppercase opacity-90">Levels {a}–{b}</span>
                      <span className="mt-1 flex items-center gap-1 text-sm font-bold">
                        {locked ? <><Lock className="h-4 w-4" /> Locked</> : <><Star className="h-4 w-4 fill-gold text-gold" />{stars}/60</>}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <BottomNav active="levels" go={go} />
      </>
    );
  }

  const [a, b] = worldRange(world);
  return (
    <>
      <Header title={`${world + 1}. ${worldName(world)}`} back={() => setWorld(null)}>
        <Pill icon={<Star className="h-4 w-4 fill-gold text-gold" />} value={`${totalStars}`} />
      </Header>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="relative flex flex-col items-center gap-5 py-4">
          {LEVELS.slice(a - 1, b).map((l, i) => {
            const locked = l.level > progress.unlocked;
            const stars = progress.stars[l.level] ?? 0;
            const offset = Math.sin(i * 1.1) * 80;
            const isCurrent = l.level === progress.unlocked;
            return (
              <button
                key={l.level}
                ref={isCurrent ? currentRef : undefined}
                disabled={locked}
                onClick={() => onPick(l.level)}
                style={{ transform: `translateX(${offset}px)` }}
                className="flex flex-col items-center"
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-full border-4 border-card font-display text-lg font-bold shadow-lg ${
                  locked ? "bg-muted-foreground text-card" : isCurrent ? "tile animate-pulse" : "tile"}`}>
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
  settings: Settings; totalStars: number; back: () => void; onComplete: (gain: number, stars: number) => void;
}) {
  const data = LEVELS[level - 1]!;
  const words = useMemo(() => [...data.words].sort((a, b) => a.length - b.length || a.localeCompare(b)), [data]);
  const found = (progress.found[level] ?? []).filter((w) => words.includes(w));
  const revealed = progress.revealed[level] ?? [];
  const [tiles, setTiles] = useState(() => data.letters.split("").map((ch, id) => ({ id, ch })));
  const [shuffling, setShuffling] = useState(false);
  const [path, setPath] = useState<number[]>([]);
  const [flash, setFlash] = useState<{ text: string; kind: "ok" | "bad" | "dup" } | null>(null);
  const [meaningWord, setMeaningWord] = useState<string | null>(null);
  const bonusFound = progress.bonus?.[level] ?? [];
  const treasure = useMemo(() => treasureFor(level, words), [level, words]);
  const world = worldOf(level);
  const relicsGot = relicLevels(world).filter((l) => (progress.treasures ?? []).includes(l)).length;
  const [jarPulse, setJarPulse] = useState(0);
  const [showJar, setShowJar] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [lang, setLang] = useLocalStorage<string>("wc-lang", "ar");
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
      if (isBonusWord(w, data.letters, words)) {
        if (bonusFound.includes(w)) { setFlash({ text: w, kind: "dup" }); return; }
        const { jar, reward } = fillJar(progress.jar ?? 0);
        setProgress((p) => ({ ...p, jar, coins: p.coins + reward, bonus: { ...(p.bonus ?? {}), [level]: [...(p.bonus?.[level] ?? []), w] } }));
        setFlash({ text: reward ? `Jar full! +${reward} 🪙` : `Bonus! ${w}`, kind: "ok" });
        setJarPulse((k) => k + 1);
        haptic("success", settings.vibration);
        beep(1046, settings.sound);
        if (reward) [784, 988, 1175].forEach((f, k) => setTimeout(() => beep(f, settings.sound), 120 + k * 110));
        return;
      }
      setFlash({ text: w, kind: "bad" });
      haptic("error", settings.vibration);
      beep(180, settings.sound);
      return;
    }
    const newFound = [...found, w];
    const gain = scoreForWord(w);
    const claimed = progress.treasures ?? [];
    const tReward = treasure && treasure.word === w && !claimed.includes(level) ? claimReward(level, treasure, claimed) : -1;
    if (tReward >= 0 && treasure) {
      setFlash({ text: treasure.kind === "gem" ? `${treasure.icon} +${tReward} 🪙` : tReward ? `All relics! +${tReward} 🪙` : `${treasure.icon} Relic found!`, kind: "ok" });
      [988, 1319].forEach((f, k) => setTimeout(() => beep(f, settings.sound), 100 + k * 120));
    } else setFlash({ text: `+${gain}`, kind: "ok" });
    haptic("success", settings.vibration);
    beep(880, settings.sound);
    const done = newFound.length === words.length;
    const hintsUsed = revealed.length;
    const earned = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;
    setProgress((p) => {
      const next: Progress = { ...p, found: { ...p.found, [level]: newFound }, score: p.score + gain };
      if (tReward >= 0) { next.treasures = [...(p.treasures ?? []), level]; next.coins = p.coins + tReward; }
      if (done) {
        next.stars = { ...p.stars, [level]: Math.max(earned, p.stars[level] ?? 0) };
        next.unlocked = Math.max(p.unlocked, level + 1);
        next.coins = (next.coins ?? p.coins) + 20;
      }
      return next;
    });
    if (done) {
      const total = words.reduce((s, x) => s + scoreForWord(x), 0);
      setCelebrating(true);
      haptic("success", settings.vibration);
      [523, 659, 784, 1047].forEach((f, k) => setTimeout(() => beep(f, settings.sound), 150 + k * 140));
      setTimeout(() => onComplete(total, earned), 2000);
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

  const unlockMeaning = (w: string) => {
    if (!spend(MEANING_COST)) return;
    setProgress((p) => ({ ...p, coins: p.coins - MEANING_COST, meanings: [...(p.meanings ?? []), w] }));
    beep(660, settings.sound);
  };

  return (
    <>
      {meaningWord && (
        <WordMeaning word={meaningWord} unlocked={(progress.meanings ?? []).includes(meaningWord)}
          coins={progress.coins} lang={lang} setLang={setLang}
          onUnlock={() => unlockMeaning(meaningWord)} onClose={() => setMeaningWord(null)} />
      )}
      {celebrating && <Confetti />}
      {celebrating && (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-40 flex justify-center">
          <span className="title-logo animate-pop text-5xl">Amazing!</span>
        </div>
      )}
      <Header title={<span>Level {level} <span className="text-sm opacity-80">· {worldName(worldOf(level))}</span></span>} back={back}>
        <Pill icon={<Star className="h-4 w-4 fill-gold text-gold" />} value={totalStars} />
        <Pill icon={<Coins className="h-4 w-4 text-gold" />} value={progress.coins} />
      </Header>

      <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto px-4">
        <div className="glass flex flex-col gap-1.5 rounded-2xl p-3">
          {words.map((w) => {
            const isFound = found.includes(w);
            return (
              <div key={w} className={`flex justify-center gap-1.5 ${isFound ? "cursor-pointer" : ""}`}
                role={isFound ? "button" : undefined} aria-label={isFound ? `Meaning of ${w}` : undefined}
                onClick={isFound ? () => setMeaningWord(w) : undefined}>
                {w.split("").map((ch, i) => {
                  const show = isFound || revealed.includes(`${w}:${i}`);
                  const cell = words.length > 6 ? "h-8 w-8 text-lg" : "h-11 w-11 text-2xl";
                  const hasItem = treasure && treasure.word === w && treasure.cell === i && !isFound && !(progress.treasures ?? []).includes(level);
                  return (
                    <span key={i} className={`relative flex items-center justify-center rounded-lg font-display font-bold ${cell} ${
                      isFound ? `tile animate-pop ${celebrating ? "victory-glow" : ""}` : show ? "bg-cream text-navy" : "bg-tile-empty"}`}
                      style={isFound ? { animationDelay: `${i * 50}ms` } : undefined}>
                      {show ? ch : ""}
                      {hasItem && <span aria-label={treasure.kind === "gem" ? "Hidden gem" : "Hidden relic"}
                        className={`pointer-events-none absolute animate-pulse ${show ? "-right-1 -top-1 text-xs" : "text-base opacity-80"}`}>{treasure.icon}</span>}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="glass mt-3 rounded-full px-4 py-1 font-display text-sm font-bold text-cream" aria-label="World relics">
          Relics {relicsGot}/{RELICS_PER_WORLD} · all → {RELIC_REWARD} 🪙
        </div>
        {showJar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-6" onClick={() => setShowJar(false)}>
            <div className="glass w-full max-w-xs rounded-3xl p-5 text-center font-display text-cream" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold">📖 Bonus Words</h3>
              <p className="mt-1 text-sm opacity-80">Every {JAR_SIZE} bonus words → {JAR_REWARD} 🪙 ({progress.jar ?? 0}/{JAR_SIZE})</p>
              <div className="mt-3 max-h-60 overflow-y-auto">
                {bonusFound.length ? (
                  <ul className="flex flex-wrap justify-center gap-2">
                    {bonusFound.map((w) => <li key={w} className="rounded-lg bg-card px-3 py-1 font-bold tracking-wider text-navy">{w}</li>)}
                  </ul>
                ) : <p className="opacity-80">None yet — keep trying!</p>}
              </div>
              <button type="button" onClick={() => setShowJar(false)} className="mt-4 rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground">Close</button>
            </div>
          </div>
        )}
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
          <div className="flex flex-col items-center gap-3">
            <button key={jarPulse} type="button" aria-label="Bonus words" onClick={() => setShowJar(true)}
              className={`relative flex flex-col items-center gap-1 ${jarPulse ? "animate-pop" : ""}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/80 text-2xl shadow-lg">📖</span>
              <span className="rounded-full bg-navy/80 px-2 text-xs font-bold text-primary-foreground">{progress.jar ?? 0}/{JAR_SIZE}</span>
              {bonusFound.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-xs font-bold text-navy">{bonusFound.length}</span>
              )}
            </button>
            <PowerBtn icon={<Lightbulb className="h-6 w-6 text-gold" />} cost={HINT_COST} onClick={hint} label="Hint" />
          </div>
          <div
            ref={wheelRef}
            className="relative touch-none select-none rounded-full bg-wheel shadow-2xl"
            style={{ width: size, height: size }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          >
            <svg className="pointer-events-none absolute inset-0 overflow-visible" width={size} height={size}>
              {(() => {
                const pts: { x: number; y: number }[] = [...path.map((i) => P(i)), ...(pointer && path.length ? [pointer] : [])];
                if (pts.length < 2) return null;
                // Catmull-Rom spline -> cubic Bezier for a smooth curvy line
                let d = `M${pts[0]!.x},${pts[0]!.y}`;
                for (let k = 0; k < pts.length - 1; k++) {
                  const p1 = pts[k]!, p2 = pts[k + 1]!, p0 = pts[k - 1] ?? p1, p3 = pts[k + 2] ?? p2;
                  const t = 0.2;
                  d += ` C${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
                }
                const tip = pts[pts.length - 1]!;
                return (
                  <>
                    <path d={d} fill="none" stroke="var(--gold)" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" opacity={0.25} />
                    <path d={d} fill="none" stroke="var(--gold)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
                    {pointer && <circle cx={tip.x} cy={tip.y} r={9} fill="var(--gold)" opacity={0.7} />}
                  </>
                );
              })()}
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

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.8, dur: 1.8 + Math.random() * 1.4,
    color: ["var(--gold)", "var(--primary)", "var(--destructive)", "var(--cream)", "var(--accent)"][i % 5],
    size: 6 + Math.random() * 6, rot: Math.random() * 360,
  })), []);
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece absolute top-0 rounded-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.6, background: p.color,
            animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, transform: `rotate(${p.rot}deg)` }} />
      ))}
    </div>
  );
}

function CompleteScreen({ level, gain, stars, hasNext, onNext, onHome }: { level: number; gain: number; stars: number; hasNext: boolean; onNext: () => void; onHome: () => void }) {
  const words = LEVELS[level - 1]!.words.length;
  return (
    <div className="relative flex flex-1 items-center justify-center bg-navy/50 p-6">
      <Confetti />
      <div className="animate-pop relative w-full max-w-xs rounded-3xl bg-cream p-6 pt-12 text-center shadow-2xl">
        <div className="absolute -top-9 left-1/2 flex -translate-x-1/2 items-end">
          {[1, 2, 3].map((s) => (
            <Star key={s} className={`star-in ${s === 2 ? "h-20 w-20" : "h-14 w-14"} ${s <= stars ? "fill-gold text-gold" : "fill-muted text-muted-foreground"}`}
              style={{ animationDelay: `${0.25 + s * 0.3}s` }} />
          ))}
        </div>
        <p className="font-display text-sm font-semibold text-muted-foreground">{worldName(worldOf(level))} · Level {level}</p>
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
