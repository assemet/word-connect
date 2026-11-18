import { StartClient } from '@tanstack/react-start';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdsSetup } from './routes/ads-setup';
import './index.css';

// Initialize AdsGram SDK
if (typeof window !== 'undefined') {
  window.AdsGram = window.AdsGram || {};
  window.AdsGram.init = function(options: any) {
    const config = {
      blockId: "60542",
      width: "100%",
      height: "100%",
      ...options
    };
    console.log('AdsGram initialized with blockId:', config.blockId);
    return {
      show: function() {
        return new Promise((resolve, reject) => {
          const adWindow = window.open('', 'adsgram', 'width=800,height=600');
          if (!adWindow) {
            reject({ error: true, description: 'Ad popup blocked' });
            return;
          }
          adWindow.location.href = `https://adsgram.ai/ad/${config.blockId}`;
          
          const timeout = setTimeout(() => {
            adWindow.close();
            reject({ error: false, description: 'Ad timeout' });
          }, 30000);
          
          const checkAd = setInterval(() => {
            if (adWindow.closed) {
              clearInterval(checkAd);
              clearTimeout(timeout);
              resolve({ done: true, description: 'Ad completed', state: 'destroy' });
            }
          }, 1000);
        });
      }
    };
  };
}

const queryClient = new QueryClient();

const startClient = new StartClient({
  router: () => import('./routes/index'),
});

startClient.hydrate();