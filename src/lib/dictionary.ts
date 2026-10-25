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

export type Meaning = { partOfSpeech?: string; definition?: string; example?: string };

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
  return { partOfSpeech: m?.partOfSpeech, definition: d?.definition, example: d?.example };
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
