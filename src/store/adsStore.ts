import { create } from 'zustand';

interface AdsState {
  isAdInitialized: boolean;
  setAdInitialized: (initialized: boolean) => void;
  lastAdTime: number;
  setLastAdTime: (time: number) => void;
  canShowAd: (cooldownMs?: number) => boolean;
  rewardAdsWatched: number;
  incrementRewardAdsWatched: () => void;
}

export const useAdsStore = create<AdsState>((set, get) => ({
  isAdInitialized: false,
  setAdInitialized: (initialized) => set({ isAdInitialized: initialized }),
  lastAdTime: 0,
  setLastAdTime: (time) => set({ lastAdTime: time }),
  canShowAd: (cooldownMs = 5 * 60 * 1000) => {
    const { lastAdTime } = get();
    return Date.now() - lastAdTime >= cooldownMs;
  },
  rewardAdsWatched: 0,
  incrementRewardAdsWatched: () => 
    set((state) => ({ rewardAdsWatched: state.rewardAdsWatched + 1 }))
}));