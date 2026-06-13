import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  RefreshCw,
  Pencil,
  ImageDown,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
} from 'lucide-react';
import { Button } from './ui/Button';
import type { Storyboard, PanelContent } from '../types';
import { getLayout } from '../utils/layouts';
import { buildPanelPrompt } from '../utils/pollinations';
import { generateImage } from '../utils/imageGen';
import { exportAsPng, exportAsSvg } from '../utils/export';
import { saveStoryboard } from '../utils/storage';

interface StoryboardViewProps {
  storyboard: Storyboard;
  onEdit: () => void;
  onBack: () => void;
  onChange: (updated: Storyboard) => void;
}

function PanelCell({
  panel,
  accentColor,
  colSpan,
  rowSpan,
  errorMsg,
  onRegenerate,
}: {
  panel: PanelContent;
  accentColor: string;
  colSpan: number;
  rowSpan: number;
  errorMsg?: string;
  onRegenerate: (panelDefId: string) => void;
}) {
  const isGenerating = panel.imageStatus === 'generating';
  const isDone = panel.imageStatus === 'done';
  const isError = panel.imageStatus === 'error';

  return (
    <div
      className="flex flex-col"
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
    >
      {/* Caption above panel */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border-2 border-dashed"
          style={{ backgroundColor: accentColor, borderColor: accentColor }}
        >
          {panel.number}
        </div>
        <p className="text-sm font-semibold text-gray-800 leading-tight">
          {panel.title || `Scene ${panel.number}`}
        </p>
      </div>

      {/* Image panel */}
      <div
        className="relative flex-1 rounded-xl overflow-hidden bg-gray-100 panel-shadow group"
        style={{ minHeight: rowSpan > 1 ? '280px' : '180px' }}
      >
        {/* Spinner overlay while generating */}
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 z-10">
            <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: accentColor }} />
            <p className="text-xs text-gray-500">Generating…</p>
          </div>
        )}

        {/* Image — shown as soon as URL exists (generating or done) */}
        {panel.imageUrl && (isDone || isGenerating) && (
          <img
            src={panel.imageUrl}
            alt={panel.title || `Panel ${panel.number}`}
            className="w-full h-full object-cover"
          />
        )}

        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-400 p-3 text-center">
            <XCircle className="w-7 h-7 mb-1 flex-shrink-0" />
            <p className="text-xs font-medium">Generation failed</p>
            {errorMsg && (
              <p className="text-xs mt-1 text-red-400 leading-tight break-all line-clamp-3">
                {errorMsg}
              </p>
            )}
          </div>
        )}
        {panel.imageStatus === 'empty' && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-5xl">
            □
          </div>
        )}

        {/* Regenerate overlay on hover */}
        {(isDone || isError) && (
          <button
            onClick={() => onRegenerate(panel.panelDefId)}
            className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
          >
            <RefreshCw className="w-3 h-3" />
            Redo
          </button>
        )}
      </div>

      {/* Description below panel */}
      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
        {panel.description}
      </p>
    </div>
  );
}

export function StoryboardView({ storyboard, onEdit, onBack, onChange }: StoryboardViewProps) {
  const layout = getLayout(storyboard.layoutId);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<'png' | 'svg' | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [panels, setPanels] = useState<PanelContent[]>(storyboard.panels);
  const [panelErrors, setPanelErrors] = useState<Record<string, string>>({});

  const generatePanel = useCallback(
    async (panelDefId: string, panelList: PanelContent[]): Promise<PanelContent[]> => {
      const idx = panelList.findIndex(p => p.panelDefId === panelDefId);
      if (idx < 0) return panelList;

      const panel = panelList[idx];
      const prompt = buildPanelPrompt(
        panel.description,
        storyboard.character.description,
        storyboard.character.accentColor
      );

      // Mark as generating
      const updating = panelList.map((p, i) =>
        i === idx ? { ...p, imageStatus: 'generating' as const } : p
      );
      setPanels(updating);

      let imageUrl: string | undefined;
      let finalStatus: 'done' | 'error' = 'error';
      try {
        imageUrl = await generateImage(prompt, storyboard.character.styleSeed + idx, 512, 384);
        finalStatus = 'done';
        setPanelErrors(prev => { const n = { ...prev }; delete n[panelDefId]; return n; });
      } catch (err) {
        console.error('Panel generation error:', err);
        finalStatus = 'error';
        setPanelErrors(prev => ({ ...prev, [panelDefId]: String(err) }));
      }

      const final = updating.map((p, i) =>
        i === idx ? { ...p, imageUrl, imageStatus: finalStatus } : p
      );
      setPanels(final);
      return final;
    },
    [storyboard.character]
  );

  // Auto-generate all panels on mount if not already done
  useEffect(() => {
    const toGenerate = panels.filter(
      p => p.imageStatus === 'empty' || p.imageStatus === 'error'
    );
    if (toGenerate.length === 0) return;

    let current = [...panels];
    const run = async () => {
      for (let i = 0; i < toGenerate.length; i++) {
        current = await generatePanel(toGenerate[i].panelDefId, current);
        // Gemini free tier: ~10 req/min — wait 7s between each panel
        if (i < toGenerate.length - 1) {
          await new Promise(r => setTimeout(r, 7000));
        }
      }
      // Auto-save after generation
      const updated = { ...storyboard, panels: current, updatedAt: Date.now() };
      onChange(updated);
      saveStoryboard(updated);
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = async (panelDefId: string) => {
    const current = await generatePanel(panelDefId, panels);
    const updated = { ...storyboard, panels: current, updatedAt: Date.now() };
    onChange(updated);
    saveStoryboard(updated);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    const updated = { ...storyboard, panels, updatedAt: Date.now() };
    saveStoryboard(updated);
    onChange(updated);
    setTimeout(() => setSaveStatus('saved'), 400);
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleExport = async (format: 'png' | 'svg') => {
    if (!canvasRef.current) return;
    setExporting(format);
    try {
      const filename = storyboard.title.replace(/\s+/g, '-').toLowerCase() || 'storyboard';
      if (format === 'png') await exportAsPng(canvasRef.current, filename);
      else await exportAsSvg(canvasRef.current, filename);
    } finally {
      setExporting(null);
    }
  };

  const allDone = panels.every(p => p.imageStatus === 'done');
  const generating = panels.some(p => p.imageStatus === 'generating');
  const doneCount = panels.filter(p => p.imageStatus === 'done').length;
  const totalCount = panels.length;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={<ChevronLeft className="w-4 h-4" />} onClick={onBack}>
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900 truncate max-w-xs">
            {storyboard.title}
          </h1>
          {generating && (
            <span className="flex items-center gap-1.5 text-xs text-[#E8622A] font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating {doneCount + 1}/{totalCount} — ~7s between panels
            </span>
          )}
          {allDone && !generating && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            icon={<Pencil className="w-4 h-4" />}
            onClick={onEdit}
          >
            Edit panels
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={
              saveStatus === 'saving' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveStatus === 'saved' ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
            onClick={handleSave}
          >
            {saveStatus === 'saved' ? 'Saved!' : 'Save'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            loading={exporting === 'svg'}
            onClick={() => handleExport('svg')}
            disabled={!allDone}
          >
            SVG
          </Button>
          <Button
            size="sm"
            icon={<ImageDown className="w-4 h-4" />}
            loading={exporting === 'png'}
            onClick={() => handleExport('png')}
            disabled={!allDone}
          >
            PNG
          </Button>
        </div>
      </div>

      {/* Storyboard canvas */}
      <div
        ref={canvasRef}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h2
            className="text-3xl font-bold"
            style={{ color: storyboard.character.accentColor }}
          >
            {storyboard.title}
          </h2>
          {storyboard.character.name && (
            <p className="text-sm text-gray-400 mt-1">Character: {storyboard.character.name}</p>
          )}
        </div>

        {/* Panel grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
            gap: '24px',
          }}
        >
          {layout.panels.map((def, i) => (
            <PanelCell
              key={def.id}
              panel={panels[i] ?? panels[panels.length - 1]}
              accentColor={storyboard.character.accentColor}
              colSpan={def.colSpan}
              rowSpan={def.rowSpan}
              errorMsg={panelErrors[def.id]}
              onRegenerate={handleRegenerate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
