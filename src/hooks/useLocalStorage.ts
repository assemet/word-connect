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
        setValue(isObj(initial) && isObj(parsed) ? { ...initial, ...parsed } : parsed);
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
