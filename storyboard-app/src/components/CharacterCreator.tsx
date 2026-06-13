import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { Wand2, RefreshCw, ChevronRight, Palette } from 'lucide-react';
import { Button } from './ui/Button';
import type { Character } from '../types';
import { buildMasterPrompt, buildImageUrl, MASTER_ANGLES } from '../utils/pollinations';

const ACCENT_COLORS = [
  { hex: '#E8622A', label: 'Coral' },
  { hex: '#2A7BE8', label: 'Blue' },
  { hex: '#2AE862', label: 'Green' },
  { hex: '#E82A7B', label: 'Pink' },
  { hex: '#7B2AE8', label: 'Purple' },
  { hex: '#E8C42A', label: 'Gold' },
];

interface CharacterCreatorProps {
  onDone: (character: Character) => void;
  initial?: Character;
}

export function CharacterCreator({ onDone, initial }: CharacterCreatorProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [accentColor, setAccentColor] = useState(initial?.accentColor ?? '#E8622A');
  const [seed] = useState(initial?.styleSeed ?? Math.floor(Math.random() * 99999));
  const [masterImages, setMasterImages] = useState<string[]>(initial?.masterImages ?? []);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateMasters = useCallback(async () => {
    if (!description.trim()) {
      setError('Please describe your character first.');
      return;
    }
    setError('');
    setGenerating(true);
    setMasterImages([]);

    const urls = MASTER_ANGLES.map(angle =>
      buildImageUrl({
        prompt: buildMasterPrompt(description, angle, accentColor),
        seed,
        width: 400,
        height: 500,
      })
    );

    // Preload all images in parallel
    await Promise.allSettled(
      urls.map(
        url =>
          new Promise<void>(resolve => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          })
      )
    );

    setMasterImages(urls);
    setGenerating(false);
  }, [description, accentColor, seed]);

  const handleContinue = () => {
    if (!name.trim() || !description.trim()) {
      setError('Please fill in both the character name and description.');
      return;
    }
    const character: Character = {
      id: initial?.id ?? uuid(),
      name,
      description,
      accentColor,
      styleSeed: seed,
      masterImages,
      masterStatus: masterImages.length > 0 ? 'done' : 'empty',
    };
    onDone(character);
  };

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
            Character name <span className="text-gray-400 font-normal">(for your reference)</span>
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
            placeholder="Describe the character's appearance: age, build, clothing, hair, notable features. The more detail, the more consistent the AI will render them.&#10;&#10;Example: 'Middle-aged man, casual dark jeans and white t-shirt, short brown hair, medium build, always carries a phone'"
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

        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<Wand2 className="w-4 h-4" />}
            onClick={generateMasters}
            loading={generating}
          >
            {masterImages.length > 0 ? 'Regenerate' : 'Preview character'}
          </Button>
          <Button
            icon={<ChevronRight className="w-4 h-4" />}
            onClick={handleContinue}
          >
            Continue to Layout
          </Button>
        </div>

        {generating && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            Generating 4 reference views via Pollinations.ai… this takes 15–30 seconds.
          </div>
        )}

        {masterImages.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#E8622A]" />
              Character reference sheet
              <span className="text-xs text-gray-400 font-normal">
                — seed #{seed} will be used for all panels
              </span>
            </p>
            <div className="grid grid-cols-4 gap-3">
              {masterImages.map((url, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[4/5]"
                >
                  <img
                    src={url}
                    alt={`Character ${MASTER_ANGLES[i]}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Front · Side · Three-quarter · Portrait
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
