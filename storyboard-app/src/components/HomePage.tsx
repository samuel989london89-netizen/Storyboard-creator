import { useState } from 'react';
import {
  Plus,
  FolderOpen,
  Trash2,
  Download,
  Upload,
  Clock,
  LayoutGrid,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import type { Storyboard } from '../types';
import { deleteStoryboard, exportBackup, importBackup } from '../utils/storage';
import { getLayout } from '../utils/layouts';

interface HomePageProps {
  storyboards: Storyboard[];
  onNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onReload: () => void;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function HomePage({ storyboards, onNew, onOpen, onDelete, onReload }: HomePageProps) {
  const [deleteTarget, setDeleteTarget] = useState<Storyboard | null>(null);
  const [importing, setImporting] = useState(false);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteStoryboard(deleteTarget.id);
    onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importBackup(file);
      onReload();
    } catch {
      alert('Could not import backup — invalid file format.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          Storyboard <span style={{ color: '#E8622A' }}>AI</span>
        </h1>
        <p className="text-gray-500 text-lg">
          Generate sketch-style UX storyboards from text descriptions, for free.
        </p>
      </div>

      {/* Actions row */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <Button
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          onClick={onNew}
        >
          New Storyboard
        </Button>
        <Button
          variant="secondary"
          size="lg"
          icon={<Download className="w-5 h-5" />}
          onClick={exportBackup}
          disabled={storyboards.length === 0}
        >
          Backup all
        </Button>
        <label>
          <Button
            variant="secondary"
            size="lg"
            icon={<Upload className="w-5 h-5" />}
            loading={importing}
            onClick={() => document.getElementById('import-input')?.click()}
          >
            Restore backup
          </Button>
          <input
            id="import-input"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </div>

      {/* Storyboard grid */}
      {storyboards.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No storyboards yet</p>
          <p className="text-sm mt-1">Click "New Storyboard" to create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {storyboards.map(board => {
            const layout = getLayout(board.layoutId);
            const firstImage = board.panels.find(p => p.imageUrl)?.imageUrl;
            const doneCount = board.panels.filter(p => p.imageStatus === 'done').length;

            return (
              <div
                key={board.id}
                className="bg-white rounded-2xl border border-gray-100 panel-shadow overflow-hidden group cursor-pointer hover:panel-shadow-hover transition-all"
                onClick={() => onOpen(board.id)}
              >
                {/* Preview image */}
                <div className="h-40 bg-gray-50 overflow-hidden relative">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={board.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LayoutGrid
                        className="w-10 h-10 opacity-20"
                        style={{ color: board.character.accentColor }}
                      />
                    </div>
                  )}
                  <div
                    className="absolute top-3 left-3 w-3 h-3 rounded-full"
                    style={{ backgroundColor: board.character.accentColor }}
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight">{board.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {layout.name} · {doneCount}/{board.panels.length} panels
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteTarget(board);
                      }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(board.updatedAt)}
                    <span className="mx-1">·</span>
                    <FolderOpen className="w-3.5 h-3.5" />
                    {board.character.name || 'No character'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete storyboard?"
      >
        <p className="text-gray-600 mb-6">
          "{deleteTarget?.title}" will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
