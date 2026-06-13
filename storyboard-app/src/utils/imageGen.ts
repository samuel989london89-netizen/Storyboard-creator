/**
 * Unified image generation.
 * Primary: Hugging Face Inference API (free account, no credit card).
 * Fallback: Pollinations.ai (no key, but rate-limited and unreliable).
 */

const HF_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';
const HF_TOKEN_KEY = 'hf_api_token';
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

export function getHFToken(): string {
  return localStorage.getItem(HF_TOKEN_KEY) ?? '';
}

export function setHFToken(token: string): void {
  if (token.trim()) {
    localStorage.setItem(HF_TOKEN_KEY, token.trim());
  } else {
    localStorage.removeItem(HF_TOKEN_KEY);
  }
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

/** Convert a blob: URL to a base64 data: URL so it survives page reloads */
export async function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  if (!blobUrl.startsWith('blob:')) return blobUrl;
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Generate an image and return a URL (blob: or data: or https:) */
export async function generateImage(
  prompt: string,
  seed: number,
  width = 512,
  height = 384,
): Promise<string> {
  const token = getHFToken();

  if (token) {
    return generateWithHF(prompt, token, width, height);
  } else {
    return loadFromPollinations(prompt, seed, width, height);
  }
}

async function generateWithHF(
  prompt: string,
  token: string,
  width: number,
  height: number,
): Promise<string> {
  const endpoint = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Wait-For-Model': 'true', // ask HF to wait instead of returning 503
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width, height, num_inference_steps: 25 },
      }),
    });

    if (res.ok) {
      const blob = await res.blob();
      // Convert immediately to data URL so it's persistent
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    if (res.status === 503) {
      // Model warming up
      const body = await res.json().catch(() => ({ estimated_time: 30 }));
      const wait = Math.min((body.estimated_time ?? 30) * 1000 + 2000, 90000);
      await sleep(wait);
      continue;
    }

    if (res.status === 429) {
      await sleep(15000);
      continue;
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error('INVALID_TOKEN');
    }

    throw new Error(`HF error ${res.status}`);
  }

  throw new Error('HF: max retries exceeded');
}

/** Load one image from Pollinations (sequential use assumed by callers) */
function loadFromPollinations(
  prompt: string,
  seed: number,
  width: number,
  height: number,
): Promise<string> {
  const url = `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  return new Promise<string>((resolve, reject) => {
    let attempt = 0;
    const maxAttempts = 3;

    const tryLoad = () => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => {
        if (attempt < maxAttempts - 1) {
          attempt++;
          sleep(10000 * attempt).then(tryLoad);
        } else {
          reject(new Error('Pollinations failed'));
        }
      };
      img.src = attempt === 0 ? url : `${url}&_r=${attempt}`;
    };
    tryLoad();
  });
}
