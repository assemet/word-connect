import { useEffect, useState, useCallback } from 'react';
import { useAdsStore } from '@/store/adsStore';

interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: 'load' | 'render' | 'playing' | 'destroy';
  error: boolean;
}

export const useAdsgram = () => {
  const [adController, setAdController] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const setAdInitialized = useAdsStore((state) => state.setAdInitialized);
  const setLastAdTime = useAdsStore((state) => state.setLastAdTime);
  const canShowAd = useAdsStore((state) => state.canShowAd);
  
  const initAdsgram = useCallback((blockId: string) => {
    if (typeof window !== 'undefined' && !adController) {
      const controller = (window as any).Adsgram.init({ blockId });
      setAdController(controller);
      setIsInitialized(true);
      setAdInitialized(true);
    }
  }, [adController, setAdInitialized]);
  
  const showAd = useCallback(async () => {
    if (!adController) {
      console.error('AdsGram not initialized');
      throw new Error('AdsGram not initialized');
    }
    
    return adController.show()
      .then((result: ShowPromiseResult) => {
        console.log('Ad result:', result);
        return result;
      })
      .catch((error: ShowPromiseResult) => {
        console.error('Ad error:', error);
        throw error;
      });
  }, [adController]);
  
  return {
    initAdsgram,
    showAd,
    isInitialized,
    adController
  };
};