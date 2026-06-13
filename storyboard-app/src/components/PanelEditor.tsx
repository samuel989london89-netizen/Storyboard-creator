import { useState } from 'react';
import { ChevronLeft, Wand2, Info } from 'lucide-react';
import { Button } from './ui/Button';
import type { PanelContent, Character } from '../types';
import { getLayout } from '../utils/layouts';

interface PanelEditorProps {
  layoutId: string;
  character: Character;
  initial: PanelContent[];
  onBack: () => void;
  onGenerate: (panels: PanelContent[]) => void;
}

export function PanelEditor({ layoutId, character, initial, onBack, onGenerate }: PanelEditorProps) {
  const layout = getLayout(layoutId);
  const [panels, setPanels] = useState<PanelContent[]>(
    layout.panels.map((def, i) => ({
      panelDefId: def.id,
      number: i + 1,
      title: initial[i]?.title ?? '',
      description: initial[i]?.description ?? '',
      generationPrompt: initial[i]?.generationPrompt ?? '',
      imageUrl: initial[i]?.imageUrl,
      imageStatus: initial[i]?.imageStatus ?? 'empty',
    }))
  );
  const [active, setActive] = useState(0);

  const update = (i: number, field: 'title' | 'description', value: string) => {
    setPanels(prev => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  const handleGenerate = () => {
    onGenerate(panels);
  };

  const allFilled = panels.every(p => p.description.trim().length > 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E8622A] text-white flex items-center justify-center text-sm font-bold">
            3
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Write Your Panels</h2>
        </div>
        <p className="text-gray-500 ml-11">
          Fill in what happens in each panel. The AI will illustrate each scene in a consistent
          sketch style.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 text-sm text-blue-700">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Character in every panel:</strong> {character.name} — "
          {character.description.slice(0, 80)}
          {character.description.length > 80 ? '…' : ''}"
        </div>
      </div>

      {/* Panel tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {panels.map((p, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              active === i
                ? 'bg-[#E8622A] text-white'
                : p.description.trim()
                ? 'bg-green-50 text-green-700 border border-green-200 hover:border-green-400'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            Panel {p.number}
            {p.description.trim() && active !== i && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* Active panel editor */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: character.accentColor }}
          >
            {panels[active].number}
          </div>
          <span className="text-sm font-medium text-gray-500">
            Panel {panels[active].number} of {panels.length}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Panel title / caption
              <span className="text-gray-400 font-normal ml-1">(shown above illustration)</span>
            </label>
            <input
              type="text"
              value={panels[active].title}
              onChange={e => update(active, 'title', e.target.value)}
              placeholder={`e.g. "Step ${panels[active].number}: User opens the app"`}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Scene description
              <span className="text-gray-400 font-normal ml-1">
                (what the AI will illustrate)
              </span>
            </label>
            <textarea
              value={panels[active].description}
              onChange={e => update(active, 'description', e.target.value)}
              placeholder={`Describe the scene in detail: setting, action, objects, mood, camera angle.&#10;&#10;Example: "Character sits at kitchen table looking at phone with worried expression, storm visible through window, dark dramatic lighting"`}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Navigation inside panels */}
        <div className="flex justify-between mt-5">
          <Button
            variant="ghost"
            size="sm"
            disabled={active === 0}
            onClick={() => setActive(a => a - 1)}
          >
            ← Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={active === panels.length - 1}
            onClick={() => setActive(a => a + 1)}
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>
            {panels.filter(p => p.description.trim()).length} of {panels.length} panels filled
          </span>
          <span>
            {allFilled ? '✓ All panels ready to generate' : 'Fill all panels to generate'}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E8622A] rounded-full transition-all"
            style={{
              width: `${(panels.filter(p => p.description.trim()).length / panels.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" icon={<ChevronLeft className="w-4 h-4" />} onClick={onBack}>
          Back
        </Button>
        <Button
          icon={<Wand2 className="w-4 h-4" />}
          disabled={!allFilled}
          onClick={handleGenerate}
          size="lg"
        >
          Generate Storyboard
        </Button>
      </div>
    </div>
  );
}
