import { useState } from 'react';
import { Key, ExternalLink, CheckCircle2, Sparkles, Cpu } from 'lucide-react';
import { Button } from './ui/Button';
import {
  getHFToken, setHFToken,
  getGeminiKey, setGeminiKey,
  validateGeminiKey,
  activeProvider,
} from '../utils/imageGen';

interface ApiKeySetupProps {
  onDone: () => void;
}

export function ApiKeySetup({ onDone }: ApiKeySetupProps) {
  const [geminiKey, setGeminiKeyState] = useState(getGeminiKey());
  const [hfToken, setHfTokenState] = useState(getHFToken());
  const [validating, setValidating] = useState(false);
  const [geminiError, setGeminiError] = useState('');
  const [saved, setSaved] = useState(false);

  const provider = activeProvider();

  const handleSave = async () => {
    setGeminiError('');

    if (geminiKey.trim()) {
      setValidating(true);
      const ok = await validateGeminiKey(geminiKey.trim());
      setValidating(false);
      if (!ok) {
        setGeminiError('Invalid Gemini API key. Check it and try again.');
        return;
      }
      setGeminiKey(geminiKey.trim());
    } else {
      setGeminiKey('');
    }

    setHFToken(hfToken.trim());

    setSaved(true);
    setTimeout(() => onDone(), 700);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#E8622A]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Key className="w-7 h-7 text-[#E8622A]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Image Generation Keys</h2>
        <p className="text-gray-500 text-sm">
          Add at least one API key. Gemini is recommended — better quality, faster, free tier.
        </p>
      </div>

      {/* Active provider badge */}
      {(getGeminiKey() || getHFToken()) && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Currently using:{' '}
          <strong>
            {provider === 'gemini' ? 'Gemini Imagen 3' : provider === 'hf' ? 'Hugging Face SDXL' : 'Pollinations.ai'}
          </strong>
        </div>
      )}

      {/* ---- Gemini section ---- */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#E8622A]" />
          <span className="font-semibold text-gray-900">Gemini API Key</span>
          <span className="text-xs bg-[#E8622A] text-white px-2 py-0.5 rounded-full">Recommended</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Uses <strong>Imagen 3</strong> — best quality. Free tier: 100 images/day, no credit card.
        </p>

        <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5 text-xs text-gray-600">
          <p className="font-medium text-gray-700">How to get your key (2 min):</p>
          <p>1. Go to{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer"
              className="text-[#E8622A] underline inline-flex items-center gap-0.5">
              aistudio.google.com/apikey <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
          <p>2. Sign in with your Google account</p>
          <p>3. Click <strong>"Create API key"</strong> → copy it</p>
          <p>4. Paste below and click Save</p>
        </div>

        <input
          type="password"
          value={geminiKey}
          onChange={e => { setGeminiKeyState(e.target.value); setGeminiError(''); }}
          placeholder="AIzaSy…"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20 font-mono text-sm"
        />
        {geminiError && (
          <p className="text-xs text-red-500 mt-1.5">{geminiError}</p>
        )}
        {getGeminiKey() && !geminiKey.trim() && (
          <p className="text-xs text-amber-600 mt-1.5">Leave blank to remove the saved key</p>
        )}
      </div>

      {/* ---- HF section ---- */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900">Hugging Face Token</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Alternative</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Uses <strong>Stable Diffusion XL</strong>. Free tier: ~200 images/day, no credit card.{' '}
          <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer"
            className="text-[#E8622A] underline inline-flex items-center gap-0.5">
            Get token <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </p>
        <input
          type="password"
          value={hfToken}
          onChange={e => setHfTokenState(e.target.value)}
          placeholder="hf_xxxxxxxxxxxxxxxx"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20 font-mono text-sm"
        />
      </div>

      <div className="flex gap-3">
        <Button
          icon={saved ? <CheckCircle2 className="w-4 h-4" /> : undefined}
          disabled={!geminiKey.trim() && !hfToken.trim() && !getGeminiKey() && !getHFToken()}
          onClick={handleSave}
          loading={validating || saved}
          size="lg"
          className="flex-1"
        >
          {saved ? 'Saved!' : validating ? 'Validating…' : 'Save'}
        </Button>
        <Button variant="ghost" onClick={onDone} size="lg">
          Skip
        </Button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        Keys are stored only in your browser. Never shared with anyone.
      </p>
    </div>
  );
}
