import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { LAYOUT_PRESETS } from '../utils/layouts';
import type { LayoutPreset } from '../types';

interface LayoutPickerProps {
  selected: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function LayoutThumbnail({ layout }: { layout: LayoutPreset }) {
  const cols = layout.columns;
  const colClass = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div
      className={`grid ${colClass} gap-1 w-full h-20 p-1`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '3px',
      }}
    >
      {layout.panels.map(panel => (
        <div
          key={panel.id}
          className="bg-gray-300 rounded-sm"
          style={{
            gridColumn: `span ${panel.colSpan}`,
            gridRow: `span ${panel.rowSpan}`,
          }}
        />
      ))}
    </div>
  );
}

export function LayoutPicker({ selected, onSelect, onBack, onContinue }: LayoutPickerProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E8622A] text-white flex items-center justify-center text-sm font-bold">
            2
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Choose a Layout</h2>
        </div>
        <p className="text-gray-500 ml-11">
          Pick how your storyboard panels will be arranged. You can change this later.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {LAYOUT_PRESETS.map(layout => (
          <button
            key={layout.id}
            onClick={() => onSelect(layout.id)}
            className={`text-left p-3 rounded-2xl border-2 transition-all ${
              selected === layout.id
                ? 'border-[#E8622A] bg-[#E8622A]/5 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-2">
              <LayoutThumbnail layout={layout} />
            </div>
            <p className="text-sm font-semibold text-gray-900">{layout.name}</p>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">{layout.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              {layout.panels.length} panel{layout.panels.length !== 1 ? 's' : ''}
            </p>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" icon={<ChevronLeft className="w-4 h-4" />} onClick={onBack}>
          Back
        </Button>
        <Button icon={<ChevronRight className="w-4 h-4" />} onClick={onContinue}>
          Set Up Panels
        </Button>
      </div>
    </div>
  );
}
