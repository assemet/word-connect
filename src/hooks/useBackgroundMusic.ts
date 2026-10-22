import { useEffect, useRef } from "react";
import { createMusicPlayer } from "@/lib/music";

export function useBackgroundMusic(enabled: boolean) {
  const player = useRef<ReturnType<typeof createMusicPlayer> | null>(null);
  const interacted = useRef(false);

  useEffect(() => {
    const music = createMusicPlayer();
    player.current = music;
    return () => { music.dispose(); player.current = null; };
  }, []);

  useEffect(() => {
    const sync = () => {
      if (enabled && interacted.current && !document.hidden) void player.current?.start();
      else player.current?.stop();
    };
    const unlock = () => { interacted.current = true; sync(); };
    sync();
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [enabled]);
}