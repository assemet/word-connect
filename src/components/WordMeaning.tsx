import { useEffect, useState } from "react";
import { Coins, X, BookOpen } from "lucide-react";
import { LANGUAGES, MEANING_COST, fetchMeaning, fetchTranslation, type Meaning } from "@/lib/dictionary";

export function WordMeaning({ word, unlocked, coins, lang, setLang, onUnlock, onClose }: {
  word: string; unlocked: boolean; coins: number; lang: string;
  setLang: (l: string) => void; onUnlock: () => void; onClose: () => void;
}) {
  const [meaning, setMeaning] = useState<Meaning | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!unlocked) return;
    setMeaning(null); setError(false);
    fetchMeaning(word).then(setMeaning).catch(() => setError(true));
  }, [word, unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    setTranslation(null);
    fetchTranslation(word, lang).then(setTranslation).catch(() => setTranslation(""));
  }, [word, lang, unlocked]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-6" onClick={onClose}>
      <div className="animate-pop relative w-full max-w-xs rounded-3xl bg-cream p-5 text-navy shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1 hover:bg-card"><X className="h-5 w-5" /></button>
        <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h2 className="font-display text-3xl font-bold tracking-widest">{word}</h2></div>

        {!unlocked ? (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">See this word's meaning and translation.</p>
            <button onClick={onUnlock} disabled={coins < MEANING_COST}
              className="btn-game mt-4 flex w-full items-center justify-center gap-2 py-3 text-lg disabled:opacity-50">
              Unlock meaning <Coins className="h-5 w-5 text-gold" />{MEANING_COST}
            </button>
            {coins < MEANING_COST && <p className="mt-2 text-sm text-destructive">Not enough coins</p>}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="rounded-xl bg-card p-3">
              {error ? <p className="text-sm">Couldn't load the meaning. Check your connection.</p>
                : !meaning ? <p className="text-sm text-muted-foreground">Loading…</p>
                : meaning.definition ? (
                  <>
                    {meaning.partOfSpeech && <div className="text-xs font-bold uppercase text-primary">{meaning.partOfSpeech}</div>}
                    <p className="text-sm">{meaning.definition}</p>
                    {meaning.example && <p className="mt-1 text-sm italic text-muted-foreground">"{meaning.example}"</p>}
                  </>
                ) : <p className="text-sm text-muted-foreground">No definition found.</p>}
            </div>
            <div className="rounded-xl bg-card p-3">
              <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Translation language"
                className="w-full rounded-lg bg-cream p-1.5 text-sm font-semibold">
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
              <p className="mt-2 text-center font-display text-2xl font-bold" dir="auto">
                {translation === null ? "…" : translation || "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
