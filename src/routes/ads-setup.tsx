export function AdsSetup() {
  return {
    head: () => (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.AdsGram = window.AdsGram || {};
            window.AdsGram.init = function(options) {
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
          `,
        }}
      />
    )
  };
}

export default AdsSetup;