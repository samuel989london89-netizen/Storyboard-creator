/**
 * Unified image generation.
 * Priority: Gemini (Imagen 3) → Hugging Face → Pollinations.ai (fallback, no key)
 */

const HF_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';
const HF_TOKEN_KEY = 'hf_api_token';
const GEMINI_TOKEN_KEY = 'gemini_api_key';
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

// ---- Key storage ----

export function getHFToken(): string {
  return localStorage.getItem(HF_TOKEN_KEY) ?? '';
}
export function setHFToken(token: string): void {
  token.trim()
    ? localStorage.setItem(HF_TOKEN_KEY, token.trim())
    : localStorage.removeItem(HF_TOKEN_KEY);
}

export function getGeminiKey(): string {
  return localStorage.getItem(GEMINI_TOKEN_KEY) ?? '';
}
export function setGeminiKey(key: string): void {
  key.trim()
    ? localStorage.setItem(GEMINI_TOKEN_KEY, key.trim())
    : localStorage.removeItem(GEMINI_TOKEN_KEY);
}

export function hasAnyKey(): boolean {
  return !!(getGeminiKey() || getHFToken());
}

export type ActiveProvider = 'gemini' | 'hf' | 'pollinations';
export function activeProvider(): ActiveProvider {
  if (getGeminiKey()) return 'gemini';
  if (getHFToken()) return 'hf';
  return 'pollinations';
}

// ---- Helpers ----

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ---- Main entry point ----

export async function generateImage(
  prompt: string,
  seed: number,
  width = 512,
  height = 384,
): Promise<string> {
  const geminiKey = getGeminiKey();
  if (geminiKey) return generateWithGemini(prompt, geminiKey);

  const hfToken = getHFToken();
  if (hfToken) return generateWithHF(prompt, hfToken, width, height);

  return loadFromPollinations(prompt, seed, width, height);
}

// ---- Gemini image generation ----
// Uses gemini-2.0-flash-preview-image-generation (free tier, no billing required)

async function generateWithGemini(prompt: string, apiKey: string): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    }),
  });

  if (res.status === 400 || res.status === 401 || res.status === 403) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`INVALID_GEMINI_KEY: ${JSON.stringify(body).slice(0, 120)}`);
  }

  if (res.status === 429) {
    await sleep(10000);
    return generateWithGemini(prompt, apiKey);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini error ${res.status}: ${body.slice(0, 120)}`);
  }

  const data = await res.json();

  // Extract inline image from generateContent response
  const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> =
    data?.candidates?.[0]?.content?.parts ?? [];

  const imagePart = parts.find(p => p.inlineData?.data);
  if (!imagePart?.inlineData) {
    throw new Error('Gemini: no image in response');
  }

  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}

export async function validateGeminiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    return res.ok;
  } catch {
    return false;
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
        'X-Wait-For-Model': 'true',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width, height, num_inference_steps: 25 },
      }),
    });

    if (res.ok) {
      return blobToDataUrl(await res.blob());
    }

    if (res.status === 503) {
      const body = await res.json().catch(() => ({ estimated_time: 30 }));
      const wait = Math.min((body.estimated_time ?? 30) * 1000 + 2000, 90000);
      await sleep(wait);
      continue;
    }

    if (res.status === 429) {
      await sleep(15000);
      continue;
    }

    if (res.status === 401 || res.status === 403) throw new Error('INVALID_TOKEN');

    throw new Error(`HF error ${res.status}`);
  }

  throw new Error('HF: max retries exceeded');
}

// ---- Pollinations.ai fallback ----

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


