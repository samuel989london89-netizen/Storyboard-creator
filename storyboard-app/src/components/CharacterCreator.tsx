import { useState, useCallback, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { Wand2, RefreshCw, ChevronRight, Palette, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import type { Character } from '../types';
import { buildMasterPrompt, MASTER_ANGLES } from '../utils/pollinations';
import { generateImage, getHFToken } from '../utils/imageGen';

const ACCENT_COLORS = [
  { hex: '#E8622A', label: 'Coral' },
  { hex: '#2A7BE8', label: 'Blue' },
  { hex: '#2AE862', label: 'Green' },
  { hex: '#E82A7B', label: 'Pink' },
  { hex: '#7B2AE8', label: 'Purple' },
  { hex: '#E8C42A', label: 'Gold' },
];

type ImgStatus = 'pending' | 'loading' | 'done' | 'error';

interface MasterSlot {
  url: string;
  status: ImgStatus;
}

interface CharacterCreatorProps {
  onDone: (character: Character) => void;
  initial?: Character;
}

export function CharacterCreator({ onDone, initial }: CharacterCreatorProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [accentColor, setAccentColor] = useState(initial?.accentColor ?? '#E8622A');
  const [seed] = useState(initial?.styleSeed ?? Math.floor(Math.random() * 99999));
  const [slots, setSlots] = useState<MasterSlot[]>(
    (initial?.masterImages ?? []).map(url => ({ url, status: 'done' }))
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const cancelRef = useRef(false);

  /** Load a single image — uses HF API if token is set, else Pollinations */
  const loadOne = async (prompt: string, seed: number): Promise<string | null> => {
    try {
      return await generateImage(prompt, seed, 400, 500);
    } catch {
      return null;
    }
  };

  const generateMasters = useCallback(async () => {
    if (!description.trim()) {
      setError('Please describe your character first.');
      return;
    }
    setError('');
    cancelRef.current = false;
    setGenerating(true);

    // Show all 4 slots immediately as "pending"
    setSlots(MASTER_ANGLES.map(() => ({ url: '', status: 'pending' })));

    // Generate one at a time
    for (let i = 0; i < MASTER_ANGLES.length; i++) {
      if (cancelRef.current) break;

      const prompt = buildMasterPrompt(description, MASTER_ANGLES[i], accentColor);

      // Mark this slot as loading
      setSlots(prev => prev.map((s, idx) => (idx === i ? { ...s, status: 'loading' } : s)));

      const resultUrl = await loadOne(prompt, seed + i);

      setSlots(prev =>
        prev.map((s, idx) =>
          idx === i
            ? { url: resultUrl ?? '', status: resultUrl ? 'done' : 'error' }
            : s
        )
      );

      // Small gap between requests when using Pollinations fallback
      if (!getHFToken() && i < MASTER_ANGLES.length - 1 && !cancelRef.current) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setGenerating(false);
  }, [description, accentColor, seed]);

  const stopGenerating = () => {
    cancelRef.current = true;
    setGenerating(false);
  };

  const handleContinue = () => {
    if (!name.trim() || !description.trim()) {
      setError('Please fill in both the character name and description.');
      return;
    }
    if (generating) stopGenerating();
    const character: Character = {
      id: initial?.id ?? uuid(),
      name,
      description,
      accentColor,
      styleSeed: seed,
      masterImages: slots.filter(s => s.status === 'done').map(s => s.url),
      masterStatus: slots.some(s => s.status === 'done') ? 'done' : 'empty',
    };
    onDone(character);
  };

  const anyDone = slots.some(s => s.status === 'done');
  const allFailed = slots.length > 0 && slots.every(s => s.status === 'error');
  const doneCount = slots.filter(s => s.status === 'done').length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E8622A] text-white flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Define Your Character</h2>
        </div>
        <p className="text-gray-500 ml-11">
          Describe the main person in your storyboard. This description will be embedded in every
          panel for visual consistency.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Character name{' '}
            <span className="text-gray-400 font-normal">(for your reference)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. User, Dad, Nurse, Designer…"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20 transition-all bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Visual description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={
              "Describe the character's appearance: age, build, clothing, hair, notable features.\n\nExample: 'Middle-aged man, casual dark jeans and white t-shirt, short brown hair, medium build'"
            }
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20 transition-all bg-white resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Palette className="inline w-4 h-4 mr-1.5 text-gray-400" />
            Accent color
          </label>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => setAccentColor(c.hex)}
                title={c.label}
                className={`w-9 h-9 rounded-full border-2 transition-all ${
                  accentColor === c.hex
                    ? 'border-gray-900 scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 flex-wrap">
          {!generating ? (
            <Button
              variant="secondary"
              icon={<Wand2 className="w-4 h-4" />}
              onClick={generateMasters}
            >
              {slots.length > 0 ? 'Regenerate preview' : 'Preview character'}
            </Button>
          ) : (
            <Button variant="ghost" onClick={stopGenerating}>
              Cancel
            </Button>
          )}
          <Button icon={<ChevronRight className="w-4 h-4" />} onClick={handleContinue}>
            Continue to Layout
          </Button>
        </div>

        {/* Image grid — one slot loads at a time */}
        {slots.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#E8622A]" />
              Character reference sheet
              <span className="text-xs text-gray-400 font-normal">
                — seed #{seed} used for all panels
              </span>
            </p>

            {generating && (
              <p className="text-xs text-amber-600 mb-2 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating {doneCount + 1} of {MASTER_ANGLES.length} — images load one at a
                time (~20–40 s each)
              </p>
            )}

            <div className="grid grid-cols-4 gap-3">
              {slots.map((slot, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[4/5] relative flex items-center justify-center"
                >
                  {slot.status === 'pending' && (
                    <div className="flex flex-col items-center gap-1.5 text-gray-300">
                      <Clock className="w-5 h-5" />
                      <span className="text-xs">Waiting…</span>
                    </div>
                  )}

                  {slot.status === 'loading' && (
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <Loader2
                        className="w-6 h-6 animate-spin"
                        style={{ color: accentColor }}
                      />
                      <span className="text-xs">Generating…</span>
                    </div>
                  )}

                  {slot.status === 'error' && (
                    <div className="flex flex-col items-center justify-center gap-1 text-red-400 p-2 text-center">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-xs leading-tight">Failed</span>
                    </div>
                  )}

                  {slot.status === 'done' && (
                    <img
                      src={slot.url}
                      alt={MASTER_ANGLES[i]}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Front · Side · Three-quarter · Portrait
            </p>

            {allFailed && (
              <p className="text-xs text-red-500 mt-1">
                All images failed. Pollinations.ai may be busy — wait 30 s and try
                regenerating.
              </p>
            )}

            {anyDone && !generating && (
              <p className="text-xs text-green-600 mt-1">
                ✓ {doneCount} of {MASTER_ANGLES.length} reference views ready — you can
                continue.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
