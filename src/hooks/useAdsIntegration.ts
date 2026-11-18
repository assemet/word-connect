import { useState, useEffect, useCallback } from 'react';
import { useAdsgram } from '@/hooks/useAdsgram';

export const useAdsIntegration = () => {
  const [adOpen, setAdOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initAdsgram, showAd, isInitialized } = useAdsgram();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initAdsgram("60542");
  }, [initAdsgram]);

  const triggerAd = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await showAd();
      
      if (result.done) {
        return true;
      } else {
        setError('The user skipped the ad.');
        return false;
      }
    } catch (err) {
      const errorResult = err as any;
      if (errorResult?.error) {
        setError('An error occurred. Please try again.');
      } else {
        setError('You skipped the ad.');
      }
      return false;
    } finally {
      setIsLoading(false);
      setAdOpen(false);
    }
  }, [showAd, isLoading]);

  return {
    adOpen,
    setAdOpen,
    error,
    setError,
    isLoading,
    triggerAd,
    isInitialized
  };
};