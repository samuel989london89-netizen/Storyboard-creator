/**
 * Pollinations.ai – completely free, no API key required.
 * Uses the Flux model for sketch/illustration style images.
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
  accentColor?: string;
}

export function buildImageUrl(opts: GenerateOptions): string {
  const { prompt, seed, width = 512, height = 384 } = opts;
  const encoded = encodeURIComponent(prompt);
  return `${BASE_URL}/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux&enhance=false`;
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

/** Preload an image into a browser Image element for later canvas use */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
