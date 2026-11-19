// AdsGram Reward Interstitial Integration
// Default Block ID: 60615 (override via VITE_ADSGRAM_BLOCK_ID)

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

const DEFAULT_BLOCK_ID = "60615";

function getBlockId(): string {
  const envId = (import.meta.env.VITE_ADSGRAM_BLOCK_ID as string | undefined)?.trim();
  return envId && envId.length > 0 ? envId : DEFAULT_BLOCK_ID;
}

let adController: AdController | null = null;
let initializedBlockId: string | null = null;

export function getAdsgramController(): AdController | null {
  if (typeof window === "undefined" || !window.Adsgram) {
    return null;
  }
  const blockId = getBlockId();
  if (!adController || initializedBlockId !== blockId) {
    adController = window.Adsgram.init({ blockId });
    initializedBlockId = blockId;
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
