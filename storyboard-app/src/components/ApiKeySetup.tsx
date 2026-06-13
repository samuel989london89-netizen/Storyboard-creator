import { useState } from 'react';
import { Key, ExternalLink, CheckCircle2, X } from 'lucide-react';
import { Button } from './ui/Button';
import { getHFToken, setHFToken } from '../utils/imageGen';

interface ApiKeySetupProps {
  onDone: () => void;
  inline?: boolean; // show as banner vs full page
}

export function ApiKeySetup({ onDone, inline = false }: ApiKeySetupProps) {
  const [token, setToken] = useState(getHFToken());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setHFToken(token.trim());
    setSaved(true);
    setTimeout(() => {
      onDone();
    }, 800);
  };

  const handleSkip = () => {
    onDone();
  };

  if (inline) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Set up free image generation
            </p>
            <p className="text-xs text-amber-700 mb-3">
              Add a free Hugging Face API token for reliable image generation. Takes 2 minutes, no credit card needed.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="hf_xxxxxxxxxxxxxxxx"
                className="flex-1 px-3 py-1.5 text-sm border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
              />
              <Button size="sm" onClick={handleSave} loading={saved}>
                {saved ? 'Saved!' : 'Save'}
              </Button>
              <button onClick={handleSkip} className="p-1.5 text-amber-400 hover:text-amber-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              Get a free token at huggingface.co/settings/tokens
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#E8622A]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Key className="w-7 h-7 text-[#E8622A]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Image Generation</h2>
        <p className="text-gray-500">
          To generate sketch illustrations you need a free API token from Hugging Face.
          Takes about 2 minutes. No credit card needed.
        </p>
      </div>

      {/* Step by step */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-4">
        <p className="text-sm font-semibold text-gray-700">How to get your free token:</p>

        {[
          {
            n: 1,
            text: 'Go to',
            link: { href: 'https://huggingface.co/join', label: 'huggingface.co/join' },
            after: 'and create a free account',
          },
          {
            n: 2,
            text: 'Go to',
            link: {
              href: 'https://huggingface.co/settings/tokens',
              label: 'huggingface.co/settings/tokens',
            },
            after: '',
          },
          {
            n: 3,
            text: 'Click "New token", give it any name, select "Read" role, click Create',
            link: null,
            after: '',
          },
          {
            n: 4,
            text: 'Copy the token (starts with hf_) and paste it below',
            link: null,
            after: '',
          },
        ].map(step => (
          <div key={step.n} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8622A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {step.n}
            </div>
            <p className="text-sm text-gray-700">
              {step.text}{' '}
              {step.link && (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#E8622A] underline inline-flex items-center gap-0.5"
                >
                  {step.link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}{' '}
              {step.after}
            </p>
          </div>
        ))}
      </div>

      {/* Token input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Hugging Face API token
        </label>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20 font-mono text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          Stored only in your browser's local storage. Never sent anywhere except Hugging Face.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          icon={saved ? <CheckCircle2 className="w-4 h-4" /> : undefined}
          disabled={!token.trim()}
          onClick={handleSave}
          loading={saved}
          size="lg"
          className="flex-1"
        >
          {saved ? 'Saved!' : 'Save and continue'}
        </Button>
        <Button variant="ghost" onClick={handleSkip} size="lg">
          Skip for now
        </Button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Skipping will use Pollinations.ai which may be unreliable.
      </p>
    </div>
  );
}
