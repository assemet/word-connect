// AdsGram Reward Interstitial Integration
// Block ID: 60615

interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: "load" | "render" | "playing" | "destroy";
  error: boolean;
}

interface AdController {
  show(): Promise<ShowPromiseResult>;
  destroy(): void;
}

declare global {
  interface Window {
    Adsgram?: {
      init(params: {
        blockId: string;
        debug?: boolean;
        debugBannerType?: "FullscreenMedia" | "RewardedVideo";
      }): AdController;
    };
  }
}

const ADSGRAM_BLOCK_ID = "60615";
let adController: AdController | null = null;

export function getAdsgramController(): AdController | null {
  if (typeof window === "undefined" || !window.Adsgram) {
    return null;
  }
  if (!adController) {
    adController = window.Adsgram.init({ blockId: ADSGRAM_BLOCK_ID });
  }
  return adController;
}

export async function showRewardedAd(): Promise<{ done: boolean; error?: string }> {
  const controller = getAdsgramController();
  if (!controller) {
    return { done: false, error: "AdsGram SDK is not loaded yet." };
  }

  try {
    const result = await controller.show();
    return { done: Boolean(result?.done) };
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err !== null && "description" in err
        ? String((err as { description?: unknown }).description)
        : "Ad failed to load or was skipped.";
    return { done: false, error: message };
  }
}
