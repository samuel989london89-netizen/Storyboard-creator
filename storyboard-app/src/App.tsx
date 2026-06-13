import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { HomePage } from './components/HomePage';
import { CharacterCreator } from './components/CharacterCreator';
import { LayoutPicker } from './components/LayoutPicker';
import { PanelEditor } from './components/PanelEditor';
import { StoryboardView } from './components/StoryboardView';
import type { Storyboard, Character, PanelContent } from './types';
import { loadStoryboards, saveStoryboard } from './utils/storage';
import { getLayout } from './utils/layouts';
import './index.css';

type Screen =
  | { name: 'home' }
  | { name: 'character'; boardId?: string }
  | { name: 'layout'; boardId?: string }
  | { name: 'panels'; boardId?: string }
  | { name: 'view'; boardId: string };

export default function App() {
  const [storyboards, setStoryboards] = useState<Storyboard[]>(() => loadStoryboards());
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  // Draft state while creating/editing
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCharacter, setDraftCharacter] = useState<Character | null>(null);
  const [draftLayoutId, setDraftLayoutId] = useState('grid-2x3');
  const [draftPanels, setDraftPanels] = useState<PanelContent[]>([]);

  const currentBoard =
    screen.name === 'view'
      ? (storyboards.find(b => b.id === screen.boardId) ?? null)
      : null;

  const reload = () => setStoryboards(loadStoryboards());

  // ---- Navigation helpers ----

  const startNew = () => {
    setDraftTitle('');
    setDraftCharacter(null);
    setDraftLayoutId('grid-2x3');
    setDraftPanels([]);
    setScreen({ name: 'character' });
  };

  const openBoard = (id: string) => {
    const board = storyboards.find(b => b.id === id);
    if (!board) return;
    setDraftTitle(board.title);
    setDraftCharacter(board.character);
    setDraftLayoutId(board.layoutId);
    setDraftPanels(board.panels);
    setScreen({ name: 'view', boardId: id });
  };

  const deleteBoard = (id: string) => {
    setStoryboards(prev => prev.filter(b => b.id !== id));
  };

  // ---- Step 1: Character done ----
  const onCharacterDone = (character: Character) => {
    setDraftCharacter(character);
    setScreen({ name: 'layout' });
  };

  // ---- Step 2: Layout selected → go to panel editor ----
  const onLayoutContinue = () => {
    // Build empty panels based on layout
    const layout = getLayout(draftLayoutId);
    const panels: PanelContent[] = layout.panels.map((def, i) => ({
      panelDefId: def.id,
      number: i + 1,
      title: draftPanels[i]?.title ?? '',
      description: draftPanels[i]?.description ?? '',
      generationPrompt: '',
      imageUrl: undefined,
      imageStatus: 'empty',
    }));
    setDraftPanels(panels);
    setScreen({ name: 'panels' });
  };

  // ---- Step 3: Panels filled → generate ----
  const onGenerateStoryboard = (panels: PanelContent[]) => {
    const title = draftTitle.trim() || 'Untitled Storyboard';
    const id = uuid();
    const board: Storyboard = {
      id,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      layoutId: draftLayoutId,
      character: draftCharacter!,
      panels: panels.map(p => ({ ...p, imageStatus: 'empty' })),
    };
    saveStoryboard(board);
    setStoryboards(loadStoryboards());
    setScreen({ name: 'view', boardId: id });
  };

  // ---- Edit from storyboard view back to panels ----
  const onEditFromView = () => {
    if (screen.name !== 'view') return;
    const board = storyboards.find(b => b.id === screen.boardId);
    if (!board) return;
    setDraftCharacter(board.character);
    setDraftLayoutId(board.layoutId);
    setDraftPanels(board.panels);
    setDraftTitle(board.title);
    setScreen({ name: 'panels', boardId: screen.boardId });
  };

  // Called when StoryboardView updates panels (after generation/regen)
  const onBoardChange = (updated: Storyboard) => {
    setStoryboards(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  };

  // ---- When editing panels from an existing board ----
  const onPanelEditDone = (panels: PanelContent[]) => {
    if (screen.name === 'panels' && screen.boardId) {
      // Update existing board
      const board = storyboards.find(b => b.id === screen.boardId);
      if (board) {
        const updated: Storyboard = {
          ...board,
          panels: panels.map(p => ({ ...p, imageStatus: 'empty' })),
          character: draftCharacter ?? board.character,
          updatedAt: Date.now(),
        };
        saveStoryboard(updated);
        setStoryboards(loadStoryboards());
        setScreen({ name: 'view', boardId: screen.boardId });
        return;
      }
    }
    // New board
    onGenerateStoryboard(panels);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Title prompt modal (for new boards) */}
        {screen.name === 'character' && !screen.boardId && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
              <label className="text-sm font-medium text-gray-700 flex-shrink-0">
                Storyboard title
              </label>
              <input
                type="text"
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
                placeholder="e.g. User onboarding flow, Emergency kit scenario…"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20 transition-all text-sm"
              />
            </div>
          </div>
        )}

        {screen.name === 'home' && (
          <HomePage
            storyboards={storyboards}
            onNew={startNew}
            onOpen={openBoard}
            onDelete={deleteBoard}
            onReload={reload}
          />
        )}

        {screen.name === 'character' && (
          <CharacterCreator
            onDone={onCharacterDone}
            initial={draftCharacter ?? undefined}
          />
        )}

        {screen.name === 'layout' && (
          <LayoutPicker
            selected={draftLayoutId}
            onSelect={setDraftLayoutId}
            onBack={() => setScreen({ name: 'character' })}
            onContinue={onLayoutContinue}
          />
        )}

        {screen.name === 'panels' && draftCharacter && (
          <PanelEditor
            layoutId={draftLayoutId}
            character={draftCharacter}
            initial={draftPanels}
            onBack={() => setScreen({ name: 'layout' })}
            onGenerate={onPanelEditDone}
          />
        )}

        {screen.name === 'view' && currentBoard && (
          <StoryboardView
            storyboard={currentBoard}
            onEdit={onEditFromView}
            onBack={() => setScreen({ name: 'home' })}
            onChange={onBoardChange}
          />
        )}
      </div>
    </div>
  );
}
