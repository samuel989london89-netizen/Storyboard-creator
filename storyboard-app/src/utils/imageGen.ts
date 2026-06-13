/**
 * Unified image generation.
 * Priority: Gemini → Hugging Face → Pollinations.ai (fallback, no key)
 */

const HF_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';
const HF_TOKEN_KEY = 'hf_api_token';
const GEMINI_TOKEN_KEY = 'gemini_api_key';
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

// Current working Gemini image models (try in order)
const GEMINI_IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-image-preview',
  'gemini-2.0-flash-preview-image-generation',
];

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
// Tries models in order; TEXT must come before IMAGE in responseModalities

async function generateWithGemini(prompt: string, apiKey: string): Promise<string> {
  let lastError = '';

  for (const model of GEMINI_IMAGE_MODELS) {
    try {
      const result = await tryGeminiModel(prompt, apiKey, model);
      if (result) return result;
    } catch (err) {
      lastError = String(err);
      if (lastError.includes('404') || lastError.includes('NOT_FOUND')) continue;
      if (lastError.includes('INVALID_GEMINI_KEY')) throw new Error('INVALID_GEMINI_KEY');
      // For any other error (including 429), try next model
      continue;
    }
  }

  throw new Error(`Gemini: all models failed. Last: ${lastError}`);
}

async function tryGeminiModel(prompt: string, apiKey: string, model: string): Promise<string | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // 45-second hard timeout per attempt
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    });
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === 'AbortError') throw new Error('timeout');
    throw err;
  }
  clearTimeout(timer);

  if (res.status === 404) throw new Error('404 NOT_FOUND');
  if (res.status === 401 || res.status === 403) throw new Error('INVALID_GEMINI_KEY');
  if (res.status === 429) {
    // Wait once then throw so caller can try next model
    await sleep(8000);
    throw new Error('429 rate limit');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> =
    data?.candidates?.[0]?.content?.parts ?? [];

  const imagePart = parts.find(p => p.inlineData?.data);
  if (!imagePart?.inlineData) return null;

  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}

export async function validateGeminiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
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


