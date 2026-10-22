import { afterEach, expect, it, vi } from "vitest";
import { createMusicPlayer } from "./music";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it("starts one music loop, pauses it, and releases audio on disposal", async () => {
  vi.useFakeTimers();
  const parameter = { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  const gain = { gain: parameter, connect: vi.fn(), disconnect: vi.fn() };
  const oscillator = { frequency: parameter, connect: vi.fn(() => gain), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn() };
  const audio = { currentTime: 0, state: "running", destination: {}, resume: vi.fn().mockResolvedValue(undefined), suspend: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined), createOscillator: vi.fn(() => ({ ...oscillator })), createGain: vi.fn(() => gain) };
  vi.stubGlobal("AudioContext", class { constructor() { return audio; } });
  const player = createMusicPlayer();
  await player.start();
  expect(audio.createOscillator).toHaveBeenCalledTimes(3);
  await player.start();
  expect(vi.getTimerCount()).toBe(1);
  player.stop();
  expect(audio.suspend).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
  await player.start();
  expect(vi.getTimerCount()).toBe(1);
  player.dispose();
  expect(audio.close).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});