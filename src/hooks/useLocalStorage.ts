import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const isObj = (v: unknown) => v !== null && typeof v === "object" && !Array.isArray(v);
        if (isObj(initial)) { if (isObj(parsed)) setValue({ ...initial, ...parsed }); }
        else if (typeof parsed === typeof initial) setValue(parsed);
        // otherwise ignore corrupted value and keep the default
      }
    } catch {}
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, loaded]);
  return [value, setValue, loaded] as const;
}
