export const MEANING_COST = 20;

export const LANGUAGES = [
  { code: "ar", name: "العربية" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "tr", name: "Türkçe" },
] as const;

export type Meaning = { partOfSpeech?: string; definition?: string; example?: string; audio?: string | undefined };

/** Picks a real recorded pronunciation (prefers US), or undefined when none exists. */
export function pickAudio(entries: any[]): string | undefined {
  const urls: string[] = (entries ?? []).flatMap((e: any) => (e?.phonetics ?? []).map((p: any) => p?.audio)).filter((u: any) => typeof u === "string" && u.length > 0);
  const url = urls.find((u) => u.includes("-us")) ?? urls[0];
  return url ? (url.startsWith("//") ? `https:${url}` : url) : undefined;
}

/** Ordered list of real-recording URLs to try: Oxford (Google) first, then the dictionary API's own. */
export function pronunciationUrls(word: string, apiAudio?: string): string[] {
  const w = encodeURIComponent(word.toLowerCase());
  return [
    `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${w}--_us_1.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${w}--_gb_1.mp3`,
    ...(apiAudio ? [apiAudio] : []),
  ];
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const a = new Audio(url);
    a.onended = () => resolve();
    a.onerror = () => reject(new Error("audio"));
    a.play().catch(reject);
  });
}

/** Plays a real recording when reachable; falls back to the device voice. */
export async function speakWord(word: string, apiAudio?: string): Promise<void> {
  for (const u of pronunciationUrls(word, apiAudio)) {
    try { await playUrl(u); return; } catch { /* try next */ }
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    await new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(word.toLowerCase());
      u.lang = "en-US"; u.onend = () => resolve(); u.onerror = () => resolve();
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    });
  }
}

/** True when the player can afford to unlock a meaning. */
export function canUnlockMeaning(coins: number, alreadyUnlocked: boolean) {
  return alreadyUnlocked || coins >= MEANING_COST;
}

export async function fetchMeaning(word: string): Promise<Meaning> {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
  if (!res.ok) return {};
  const json = await res.json();
  const m = json?.[0]?.meanings?.[0];
  const d = m?.definitions?.[0];
  return { partOfSpeech: m?.partOfSpeech, definition: d?.definition, example: d?.example, audio: pickAudio(json) };
}

export async function fetchTranslation(word: string, lang: string): Promise<string> {
  const q = encodeURIComponent(word.toLowerCase());
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${q}`);
    if (res.ok) {
      const text = (await res.json())?.[0]?.[0]?.[0];
      if (text) return text;
    }
  } catch { /* fall back below */ }
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=en|${lang}`);
  if (!res.ok) return "";
  const json = await res.json();
  return String(json?.responseData?.translatedText ?? "").split("/")[0]!;
}
