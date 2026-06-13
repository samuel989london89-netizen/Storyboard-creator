/**
 * Pollinations.ai – completely free, no API key required.
 * Free tier allows max 1 request queued per IP — always generate sequentially.
 * https://pollinations.ai/
 */

const BASE_URL = 'https://image.pollinations.ai/prompt';

export const STYLE_TOKENS =
  'UX storyboard sketch illustration, line art, silhouette figures, minimal flat color, white background, clean professional design illustration, no text in image';

export const MASTER_ANGLES = [
  'full body front view, standing neutral pose',
  'full body side profile view, walking pose',
  'three-quarter view, natural pose',
  'upper body portrait, facing camera',
];

export interface GenerateOptions {
  prompt: string;
  seed: number;
  width?: number;
  height?: number;
}

export function buildImageUrl(opts: GenerateOptions): string {
  const { prompt, seed, width = 512, height = 384 } = opts;
  const encoded = encodeURIComponent(prompt);
  // No model= param — let Pollinations pick the free default
  return `${BASE_URL}/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

export function buildPanelPrompt(
  sceneDescription: string,
  characterDescription: string,
  accentColor: string
): string {
  const colorName = hexToColorName(accentColor);
  return `${STYLE_TOKENS}, ${colorName} accent color, scene: ${sceneDescription}, character: ${characterDescription}`;
}

export function buildMasterPrompt(
  characterDescription: string,
  angle: string,
  accentColor: string
): string {
  const colorName = hexToColorName(accentColor);
  return `${STYLE_TOKENS}, character reference sheet, ${colorName} accent color, ${angle}, character: ${characterDescription}`;
}

/** Very simple hex → descriptive name for better prompt results */
function hexToColorName(hex: string): string {
  const map: Record<string, string> = {
    '#E8622A': 'coral orange',
    '#2A7BE8': 'blue',
    '#2AE862': 'green',
    '#E82A7B': 'pink',
    '#7B2AE8': 'purple',
    '#E8C42A': 'golden yellow',
  };
  return map[hex.toUpperCase()] ?? map[hex] ?? 'coral orange';
}

/**
 * Load a single image URL, retrying up to `retries` times with exponential backoff.
 * No crossOrigin to avoid CORS cache poisoning on free CDN hosts.
 */
export function loadImage(url: string, retries = 2): Promise<boolean> {
  return new Promise(resolve => {
    let attempt = 0;

    const tryLoad = () => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => {
        if (attempt < retries) {
          attempt++;
          const delay = attempt * 3000; // 3 s, 6 s
          setTimeout(tryLoad, delay);
        } else {
          resolve(false);
        }
      };
      // Cache-bust on retry so stale 402 responses aren't cached
      img.src = attempt === 0 ? url : `${url}&_r=${attempt}`;
    };

    tryLoad();
  });
}
